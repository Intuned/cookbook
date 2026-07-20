import { BrowserContext, Page } from "playwright";
import { goToUrl, validateDataUsingSchema } from "@intuned/browser";
import { extendTimeout } from "@intuned/runtime";
import { ClientError, withErrorEnvelope } from "../helpers/errors";

/**
 * get-available-slots — read-only availability lookup for the OpenEMR demo.
 *
 * Lists free appointment slots per provider between start_date and end_date,
 * optionally filtered by location (facility) and provider name.
 *
 * Read-only: only GETs the booking form (to read the facility / provider /
 * category option lists dynamically) and the server-rendered availability
 * popup (find_appt_popup.php). Never navigates to login.php.
 */
interface Params {
  /** MM/DD/YYYY inclusive range start */
  start_date: string;
  /** MM/DD/YYYY inclusive range end */
  end_date: string;
  /** Optional facility name filter (e.g. "Great Clinic") */
  location?: string;
  /** Optional provider name filter (e.g. "Smith, Billy") */
  provider?: string;
  /** Slot length in minutes (default 15) */
  duration_minutes?: number;
}

const BASE_URL = "https://demo.openemr.io/openemr";
const MAX_SPAN_DAYS = 14;
const DEFAULT_DURATION_MINUTES = 15;
const DEFAULT_CATEGORY = "Office Visit";

const DATA_SCHEMA: any = {
  type: "array",
  items: {
    type: "object",
    properties: {
      date: { type: "string" },
      day_of_week: { type: "string" },
      start_time: { type: "string" },
      end_time: { type: "string" },
      provider: { type: "string" },
      location: { type: "string" },
    },
    required: [
      "date",
      "day_of_week",
      "start_time",
      "end_time",
      "provider",
      "location",
    ],
  },
};

type SlotsErrorCode = "INVALID_INPUT" | "LOCATION_NOT_FOUND" | "PROVIDER_NOT_FOUND";
const ERROR_STATUS: Record<SlotsErrorCode, number> = {
  INVALID_INPUT: 400,
  LOCATION_NOT_FOUND: 404,
  PROVIDER_NOT_FOUND: 404,
};

/**
 * Raise a business-outcome error. Throws a shared ClientError so the handler's
 * withErrorEnvelope wrapper turns it into a `{ success: false, ... }` envelope
 * (the run still SUCCEEDS). Returns `never`; existing `return errorEnvelope(...)`
 * call sites keep working unchanged.
 */
function errorEnvelope(
  code: SlotsErrorCode,
  message: string,
  details?: Record<string, any>
): never {
  throw new ClientError(ERROR_STATUS[code], code, message, details);
}

interface SelectOption {
  value: string;
  label: string;
}

/** Collapse whitespace and lowercase for tolerant name matching. */
function normalizeName(name: string): string {
  return name.trim().replace(/\s+/g, " ").toLowerCase();
}

/** Parse an MM/DD/YYYY string into a local Date, or null if invalid. */
function parseMdyDate(value: string): Date | null {
  const m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(value.trim());
  if (!m) return null;
  const month = parseInt(m[1], 10);
  const day = parseInt(m[2], 10);
  const year = parseInt(m[3], 10);
  const date = new Date(year, month - 1, day);
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null; // e.g. 02/30/2026
  }
  return date;
}

function formatMdy(date: Date): string {
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${mm}/${dd}/${date.getFullYear()}`;
}

function formatYmd(date: Date): string {
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${mm}-${dd}`;
}

function format12Hour(hour24: number, minute: number): string {
  const period = hour24 >= 12 ? "PM" : "AM";
  let hour = hour24 % 12;
  if (hour === 0) hour = 12;
  return `${hour}:${String(minute).padStart(2, "0")} ${period}`;
}

function dayOfWeekName(date: Date): string {
  return date.toLocaleDateString("en-US", { weekday: "long" });
}

/**
 * Read the option list (value + visible label) of a <select> on the current
 * page. Returns [] if the select is not present.
 */
async function readSelectOptions(
  page: Page,
  selectName: string
): Promise<SelectOption[]> {
  return page.$$eval(
    `select[name="${selectName}"] option`,
    (options) =>
      options.map((o) => ({
        value: (o as HTMLOptionElement).value,
        label: (o.textContent || "").trim().replace(/\s+/g, " "),
      })),
    undefined
  );
}

/**
 * Open the booking form and read the facility, provider and category option
 * lists dynamically (no hardcoded ids).
 */
async function loadBookingFormOptions(
  page: Page,
  startDate: Date
): Promise<{
  facilities: SelectOption[];
  providers: SelectOption[];
  categories: SelectOption[];
}> {
  const ymdCompact = formatYmd(startDate).replace(/-/g, "");
  await goToUrl({
    page,
    url: `${BASE_URL}/interface/main/calendar/add_edit_event.php?date=${ymdCompact}`,
  });
  const facilities = await readSelectOptions(page, "facility");
  // The provider select is named "form_provider" normally, but becomes
  // "form_provider[]" when the demo has multi-provider mode enabled.
  let providers = await readSelectOptions(page, "form_provider");
  if (providers.length === 0) {
    providers = await readSelectOptions(page, "form_provider[]");
  }
  const categories = await readSelectOptions(page, "form_category");
  return { facilities, providers, categories };
}

/**
 * Fetch the availability popup for one provider and parse the free-slot
 * anchors (`setappt(year, month, day, hour24, minute)`) into raw slot tuples.
 */
async function fetchProviderSlots(
  page: Page,
  args: {
    providerId: string;
    categoryId: string;
    facilityId: string;
    startDate: Date;
    searchDays: number;
    durationMinutes: number;
  }
): Promise<{ year: number; month: number; day: number; hour: number; minute: number }[]> {
  const query = new URLSearchParams({
    providerid: args.providerId,
    catid: args.categoryId,
    facility: args.facilityId,
    startdate: formatYmd(args.startDate),
    searchdays: String(args.searchDays),
    evdur: String(args.durationMinutes),
    eid: "0",
  });
  await goToUrl({
    page,
    url: `${BASE_URL}/interface/main/calendar/find_appt_popup.php?${query.toString()}`,
  });

  // Each free slot is an anchor like:
  //   <a onclick="return setappt(2026,7,19,9,0)" title="Choose 09:00 am">9:00</a>
  // Parse the setappt(...) args, not the link text.
  const onclicks = await page.$$eval(
    'a[onclick*="setappt("]',
    (anchors) => anchors.map((a) => a.getAttribute("onclick") || ""),
    undefined
  );

  const slots: { year: number; month: number; day: number; hour: number; minute: number }[] = [];
  for (const onclick of onclicks) {
    const m = /setappt\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)/.exec(
      onclick
    );
    if (!m) continue;
    slots.push({
      year: parseInt(m[1], 10),
      month: parseInt(m[2], 10),
      day: parseInt(m[3], 10),
      hour: parseInt(m[4], 10),
      minute: parseInt(m[5], 10),
    });
  }
  return slots;
}

export default async function handler(
  params: Params,
  page: Page,
  context: BrowserContext
): Promise<Record<string, any>> {
  // Read-only API: no dry_run / ai_fallback meta. A ClientError becomes a
  // `{ success: false, ... }` envelope (run succeeds); anything else fails.
  return withErrorEnvelope({}, () => run(params, page, context));
}

async function run(
  params: Params,
  page: Page,
  context: BrowserContext
): Promise<Record<string, any>> {
  // ---- Input validation -------------------------------------------------
  if (!params.start_date || !params.end_date) {
    return errorEnvelope(
      "INVALID_INPUT",
      "Both start_date and end_date are required (MM/DD/YYYY)."
    );
  }
  const startDate = parseMdyDate(params.start_date);
  if (!startDate) {
    return errorEnvelope(
      "INVALID_INPUT",
      `start_date "${params.start_date}" is not a valid MM/DD/YYYY date.`
    );
  }
  const endDate = parseMdyDate(params.end_date);
  if (!endDate) {
    return errorEnvelope(
      "INVALID_INPUT",
      `end_date "${params.end_date}" is not a valid MM/DD/YYYY date.`
    );
  }
  if (endDate.getTime() < startDate.getTime()) {
    return errorEnvelope(
      "INVALID_INPUT",
      `end_date (${params.end_date}) must be on or after start_date (${params.start_date}).`
    );
  }
  const spanDays =
    Math.round((endDate.getTime() - startDate.getTime()) / 86400000) + 1;
  if (spanDays > MAX_SPAN_DAYS) {
    return errorEnvelope(
      "INVALID_INPUT",
      `Date range spans ${spanDays} days; the maximum is ${MAX_SPAN_DAYS} days.`,
      { max_span_days: MAX_SPAN_DAYS }
    );
  }
  const durationMinutes = params.duration_minutes ?? DEFAULT_DURATION_MINUTES;
  if (
    !Number.isInteger(durationMinutes) ||
    durationMinutes < 5 ||
    durationMinutes > 480
  ) {
    return errorEnvelope(
      "INVALID_INPUT",
      `duration_minutes must be an integer between 5 and 480 (got ${params.duration_minutes}).`
    );
  }

  // ---- Read facility / provider / category lists from the booking form --
  const { facilities, providers, categories } = await loadBookingFormOptions(
    page,
    startDate
  );
  if (providers.length === 0 || facilities.length === 0) {
    throw new Error(
      "Could not read provider/facility lists from the booking form — the session may not be authenticated."
    );
  }

  // Facility: optional filter, validated against the form's facility list.
  let facility: SelectOption;
  if (params.location) {
    const wanted = normalizeName(params.location);
    const match = facilities.find((f) => normalizeName(f.label) === wanted);
    if (!match) {
      return errorEnvelope(
        "LOCATION_NOT_FOUND",
        `Location "${params.location}" was not found.`,
        { available_locations: facilities.map((f) => f.label) }
      );
    }
    facility = match;
  } else {
    facility = facilities[0];
  }

  // Provider: optional filter; default is all providers from the dropdown.
  let targetProviders: SelectOption[];
  if (params.provider) {
    const wanted = normalizeName(params.provider);
    const match = providers.find((p) => normalizeName(p.label) === wanted);
    if (!match) {
      return errorEnvelope(
        "PROVIDER_NOT_FOUND",
        `Provider "${params.provider}" was not found.`,
        { available_providers: providers.map((p) => p.label) }
      );
    }
    targetProviders = [match];
  } else {
    targetProviders = providers;
  }

  // Category id needed by the availability search; "Office Visit" is the
  // default, falling back to the first category option.
  const category =
    categories.find(
      (c) => normalizeName(c.label) === normalizeName(DEFAULT_CATEGORY)
    ) ?? categories[0];
  if (!category) {
    throw new Error("Could not read the category list from the booking form.");
  }

  // ---- Fetch + parse availability per provider --------------------------
  const startMs = startDate.getTime();
  const endMs = endDate.getTime();
  const items: Record<string, string>[] = [];

  for (const provider of targetProviders) {
    extendTimeout();
    const rawSlots = await fetchProviderSlots(page, {
      providerId: provider.value,
      categoryId: category.value,
      facilityId: facility.value,
      startDate,
      searchDays: spanDays,
      durationMinutes,
    });

    for (const slot of rawSlots) {
      const slotDate = new Date(slot.year, slot.month - 1, slot.day);
      const slotMs = slotDate.getTime();
      if (slotMs < startMs || slotMs > endMs) continue; // outside requested range

      const startTotal = slot.hour * 60 + slot.minute;
      const endTotal = startTotal + durationMinutes;
      items.push({
        date: formatMdy(slotDate),
        day_of_week: dayOfWeekName(slotDate),
        start_time: format12Hour(slot.hour, slot.minute),
        end_time: format12Hour(Math.floor(endTotal / 60) % 24, endTotal % 60),
        provider: provider.label,
        location: facility.label,
      });
    }
  }

  // Sort by date, then provider, then start time.
  const sortKey = (item: Record<string, string>): string => {
    const d = parseMdyDate(item.date)!;
    const [time, period] = item.start_time.split(" ");
    const [h, m] = time.split(":").map((n) => parseInt(n, 10));
    const hour24 = (h % 12) + (period === "PM" ? 12 : 0);
    return `${formatYmd(d)}|${item.provider}|${String(hour24).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
  };
  items.sort((a, b) => (sortKey(a) < sortKey(b) ? -1 : sortKey(a) > sortKey(b) ? 1 : 0));

  validateDataUsingSchema({ data: items, schema: DATA_SCHEMA });
  return { items, totalItems: items.length };
}
