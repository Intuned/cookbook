import { BrowserContext, Dialog, Page } from "playwright";
import { goToUrl, validateDataUsingSchema } from "@intuned/browser";
import { extendTimeout } from "@intuned/runtime";
import { ClientError, ErrorCode, withErrorEnvelope } from "../helpers/errors";
import { initAiFallbackMeta, withAiFallback } from "../helpers/ai-fallback";

/**
 * schedule-appointment — books a patient appointment on the OpenEMR demo.
 *
 * dry_run behavior: when `dry_run` is true, the API resolves the patient
 * (find-or-create) and fills the entire booking form, but STOPS before the
 * final Save. It returns everything it would have submitted, marked
 * `status: "dry_run"`. When false (the DEFAULT), the appointment is really
 * booked.
 *
 * Note: this OpenEMR demo does not enforce double-booking at all — saving into
 * an already-taken slot just creates an overlapping appointment with no warning
 * or prompt. So there is no conflict handling here; overlaps are the site's
 * behavior. The one guard this API adds is idempotency (below).
 *
 * Idempotency: OpenEMR itself will happily create a second identical
 * appointment on a repeated call, so this API guards against it. Before
 * saving, it looks up the patient's existing appointments and, if one already
 * matches the requested date/time (and provider, when given), returns
 * `status: "already_booked"` with the existing event id instead of booking
 * again. `allow_duplicate: true` opts out of the guard.
 *
 * Provider events: pass `event_type: "provider"` to book a NON-patient provider
 * event on the calendar's Provider tab (In Office / Out Of Office / Vacation /
 * Lunch / Reserved). This path has no patient, no find-or-create, and no
 * idempotency guard — it just fills the Provider tab and saves. The `patient`
 * field is ignored for provider events. Everything else (date/time, provider,
 * facility, duration, comments, dry_run) works the same.
 */
interface PatientRef {
  first_name: string;
  last_name: string;
  /** MM/DD/YYYY (must be a past date) */
  dob: string;
}

interface NewPatientDetails {
  /** Required when a patient must be created */
  sex?: string;
  phone?: string;
  email?: string;
  address?: string;
  city?: string;
  state?: string;
  postal_code?: string;
}

interface Params {
  /** MM/DD/YYYY appointment date */
  date: string;
  /** e.g. "9:00 AM" */
  start_time: string;
  /** Provider name (default: the logged-in user's provider entry) */
  provider?: string;
  /** Facility name (default: the form's default facility) */
  location?: string;
  /** Visit category (default "Office Visit") */
  category?: string;
  /** Default 15 */
  duration_minutes?: number;
  comments?: string;
  patient: PatientRef;
  /** Create the patient when no match is found (default true) */
  create_patient_if_missing?: boolean;
  new_patient?: NewPatientDetails;
  /**
   * Idempotency guard. Default false: before booking, the API checks whether
   * this patient already has an appointment at the same date/time (and provider,
   * when one is given) and, if so, returns `status: "already_booked"` without
   * creating a second one. Pass true to bypass the check and always book.
   */
  allow_duplicate?: boolean;
  /**
   * "patient" (default) books a patient appointment on the Patient tab.
   * "provider" books a non-patient provider event on the Provider tab
   * (In Office / Out Of Office / Vacation / Lunch / Reserved); `patient` is then
   * ignored and no patient is created.
   */
  event_type?: "patient" | "provider";
  /**
   * Provider-event title. Only used for provider events; defaults to the
   * category label (e.g. "In Office").
   */
  title?: string;
  /** Default false — a real booking. Pass true to preview. */
  dry_run?: boolean;
}

// ---------------------------------------------------------------------------
// Structured error envelope
// ---------------------------------------------------------------------------

/** HTTP-ish status per error code (400 bad input · 404 not found · 500 failure). */
const ERROR_STATUS: Record<string, number> = {
  INVALID_INPUT: 400,
  LOCATION_NOT_FOUND: 404,
  PROVIDER_NOT_FOUND: 404,
  CATEGORY_NOT_FOUND: 404,
  PATIENT_NOT_FOUND: 404,
  PATIENT_CREATE_FAILED: 500,
  SAVE_NOT_CONFIRMED: 500,
};

/**
 * Business-outcome error for this API. Extends the shared ClientError so it is
 * recognized as a caller-facing outcome (and passes through the ai-fallback
 * untouched); its `.message` stays a machine-readable JSON envelope
 * (`{"error":{code,message,details}}`) as before. Call sites are unchanged:
 * `new ScheduleError(code, message, details)`.
 */
class ScheduleError extends ClientError {
  constructor(code: ErrorCode, message: string, details?: Record<string, any>) {
    super(ERROR_STATUS[code] ?? 500, code, message, details);
    this.name = "ScheduleError";
  }
}

// ---------------------------------------------------------------------------
// Constants / schema
// ---------------------------------------------------------------------------

const BASE = "https://demo.openemr.io/openemr/interface";
const BOOKING_URL = (yyyymmdd: string) =>
  `${BASE}/main/calendar/add_edit_event.php?date=${yyyymmdd}`;
// Provider tab of the same event form (?prov=true) — a non-patient event.
const PROVIDER_EVENT_URL = (yyyymmdd: string) =>
  `${BASE}/main/calendar/add_edit_event.php?prov=true&date=${yyyymmdd}`;
const PATIENT_SEARCH_URL = `${BASE}/main/calendar/find_patient_popup.php`;
const NEW_PATIENT_URL = `${BASE}/new/new.php`;

const DATA_SCHEMA: any = {
  type: "object",
  properties: {
    status: { type: "string" },
    patient: {
      type: "object",
      properties: {
        pid: { type: "string" },
        name: { type: "string" },
        dob: { type: "string" },
        created: { type: "boolean" },
      },
      required: ["pid", "name", "dob", "created"],
    },
    appointment: {
      type: "object",
      properties: {
        date: { type: "string" },
        start_time: { type: "string" },
        end_time: { type: "string" },
        provider: { type: "string" },
        location: { type: "string" },
        category: { type: "string" },
        duration_minutes: { type: "integer" },
        comments: { type: "string" },
      },
      required: [
        "date",
        "start_time",
        "end_time",
        "provider",
        "location",
        "category",
        "duration_minutes",
      ],
    },
  },
  required: ["status", "patient", "appointment"],
};

/** Result schema for a provider (non-patient) event — no patient, an `event`. */
const PROVIDER_DATA_SCHEMA: any = {
  type: "object",
  properties: {
    status: { type: "string" },
    event: {
      type: "object",
      properties: {
        type: { type: "string" },
        title: { type: "string" },
        date: { type: "string" },
        start_time: { type: "string" },
        end_time: { type: "string" },
        provider: { type: "string" },
        location: { type: "string" },
        category: { type: "string" },
        duration_minutes: { type: "integer" },
        comments: { type: "string" },
      },
      required: [
        "type",
        "title",
        "date",
        "start_time",
        "end_time",
        "provider",
        "location",
        "category",
        "duration_minutes",
      ],
    },
  },
  required: ["status", "event"],
};

// ---------------------------------------------------------------------------
// Input parsing / validation
// ---------------------------------------------------------------------------

interface ParsedDate {
  year: number;
  month: number; // 1-12
  day: number; // 1-31
  iso: string; // YYYY-MM-DD
  compact: string; // YYYYMMDD
}

function parseUsDate(value: string, field: string): ParsedDate {
  const m = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec((value ?? "").trim());
  if (!m) {
    throw new ScheduleError(
      "INVALID_INPUT",
      `${field} must be in MM/DD/YYYY format, got "${value}"`,
      { field, value },
    );
  }
  const month = parseInt(m[1], 10);
  const day = parseInt(m[2], 10);
  const year = parseInt(m[3], 10);
  const dt = new Date(Date.UTC(year, month - 1, day));
  if (
    dt.getUTCFullYear() !== year ||
    dt.getUTCMonth() !== month - 1 ||
    dt.getUTCDate() !== day
  ) {
    throw new ScheduleError(
      "INVALID_INPUT",
      `${field} is not a valid calendar date: "${value}"`,
      {
        field,
        value,
      },
    );
  }
  const mm = String(month).padStart(2, "0");
  const dd = String(day).padStart(2, "0");
  return {
    year,
    month,
    day,
    iso: `${year}-${mm}-${dd}`,
    compact: `${year}${mm}${dd}`,
  };
}

interface ParsedTime {
  hour24: number;
  minute: number;
}

function parseTime12(value: string): ParsedTime {
  const m = /^(\d{1,2}):(\d{2})\s*(AM|PM)$/i.exec((value ?? "").trim());
  if (!m) {
    throw new ScheduleError(
      "INVALID_INPUT",
      `start_time must look like "9:00 AM", got "${value}"`,
      { field: "start_time", value },
    );
  }
  let hour = parseInt(m[1], 10);
  const minute = parseInt(m[2], 10);
  const pm = m[3].toUpperCase() === "PM";
  if (hour < 1 || hour > 12 || minute > 59) {
    throw new ScheduleError(
      "INVALID_INPUT",
      `start_time is out of range: "${value}"`,
      {
        field: "start_time",
        value,
      },
    );
  }
  if (pm && hour !== 12) hour += 12;
  if (!pm && hour === 12) hour = 0;
  return { hour24: hour, minute };
}

function formatTime12(hour24: number, minute: number): string {
  const suffix = hour24 >= 12 ? "PM" : "AM";
  let h = hour24 % 12;
  if (h === 0) h = 12;
  return `${h}:${String(minute).padStart(2, "0")} ${suffix}`;
}

interface ValidatedParams {
  raw: Params;
  date: ParsedDate;
  time: ParsedTime;
  endTime: ParsedTime;
  category: string;
  durationMinutes: number;
  comments: string;
  createIfMissing: boolean;
  allowDuplicate: boolean;
  dryRun: boolean;
  patientDob: ParsedDate;
  eventType: "patient" | "provider";
  /** Provider-event title (provider events only). */
  title?: string;
}

function validateParams(params: Params): ValidatedParams {
  if (!params || typeof params !== "object") {
    throw new ScheduleError("INVALID_INPUT", "params object is required");
  }
  const eventType = params.event_type ?? "patient";
  if (eventType !== "patient" && eventType !== "provider") {
    throw new ScheduleError(
      "INVALID_INPUT",
      `event_type must be "patient" or "provider", got "${params.event_type}"`,
      { field: "event_type", value: params.event_type },
    );
  }

  const date = parseUsDate(params.date, "date");
  const time = parseTime12(params.start_time);
  const durationMinutes = params.duration_minutes ?? 15;
  if (
    !Number.isInteger(durationMinutes) ||
    durationMinutes <= 0 ||
    durationMinutes > 24 * 60
  ) {
    throw new ScheduleError(
      "INVALID_INPUT",
      "duration_minutes must be a positive integer",
      {
        field: "duration_minutes",
        value: params.duration_minutes,
      },
    );
  }
  const endTotal = time.hour24 * 60 + time.minute + durationMinutes;
  const endTime: ParsedTime = {
    hour24: Math.floor(endTotal / 60) % 24,
    minute: endTotal % 60,
  };

  // Patient is required only for patient appointments. Provider events have no
  // patient, so patientDob is unused there and defaults to the event date (a
  // harmless placeholder — the provider path never reads it).
  let patientDob: ParsedDate = date;
  if (eventType === "patient") {
    if (!params.patient || typeof params.patient !== "object") {
      throw new ScheduleError(
        "INVALID_INPUT",
        "patient {first_name, last_name, dob} is required",
        {
          field: "patient",
        },
      );
    }
    for (const f of ["first_name", "last_name", "dob"] as const) {
      if (!params.patient[f] || typeof params.patient[f] !== "string") {
        throw new ScheduleError("INVALID_INPUT", `patient.${f} is required`, {
          field: `patient.${f}`,
        });
      }
    }
    patientDob = parseUsDate(params.patient.dob, "patient.dob");
    const now = new Date();
    if (new Date(patientDob.iso + "T00:00:00Z").getTime() >= now.getTime()) {
      throw new ScheduleError(
        "INVALID_INPUT",
        "patient.dob must be a past date",
        {
          field: "patient.dob",
          value: params.patient.dob,
        },
      );
    }
  }

  return {
    raw: params,
    date,
    time,
    endTime,
    // Patient visits default to "Office Visit"; provider events default to the
    // form's own pre-selected category (resolved live, empty string here).
    category:
      params.category ?? (eventType === "patient" ? "Office Visit" : ""),
    durationMinutes,
    comments: params.comments ?? "",
    createIfMissing: params.create_patient_if_missing ?? true,
    allowDuplicate: params.allow_duplicate ?? false,
    dryRun: params.dry_run ?? false,
    patientDob,
    eventType,
    title: params.title,
  };
}

// ---------------------------------------------------------------------------
// Booking-form option resolution
// ---------------------------------------------------------------------------

interface SelectOption {
  value: string;
  label: string;
  selected: boolean;
}

async function readSelectOptions(
  page: Page,
  selector: string,
): Promise<SelectOption[]> {
  const el = await page.$(selector);
  if (!el) return [];
  return el.$$eval("option", (opts) =>
    opts.map((o) => ({
      value: (o as HTMLOptionElement).value,
      label: (o.textContent || "").trim(),
      selected: (o as HTMLOptionElement).selected,
    })),
  );
}

function matchOption(
  options: SelectOption[],
  wanted: string,
): SelectOption | null {
  const w = wanted.trim().toLowerCase();
  return (
    options.find((o) => o.label.toLowerCase() === w) ??
    options.find((o) => o.label.toLowerCase().includes(w)) ??
    null
  );
}

interface ResolvedForm {
  category: SelectOption;
  facility: SelectOption;
  provider: SelectOption;
}

/**
 * Opens the booking form and resolves category / facility / provider names to
 * their option values. Nothing is hardcoded — all ids come from the live form.
 */
async function openBookingFormAndResolve(
  page: Page,
  v: ValidatedParams,
): Promise<ResolvedForm> {
  extendTimeout();
  await goToUrl({ page, url: BOOKING_URL(v.date.compact) });
  await page.waitForSelector('select[name="form_category"]', {
    timeout: 30000,
  });

  const categoryOptions = await readSelectOptions(
    page,
    'select[name="form_category"]',
  );
  const facilityOptions = await readSelectOptions(
    page,
    'select[name="facility"]',
  );
  // Provider select is "form_provider" normally, "form_provider[]" when the
  // site runs in multi-provider mode — support both.
  let providerOptions = await readSelectOptions(
    page,
    'select[name="form_provider"]',
  );
  if (providerOptions.length === 0) {
    providerOptions = await readSelectOptions(
      page,
      'select[name="form_provider[]"]',
    );
  }

  const category = matchOption(categoryOptions, v.category);
  if (!category) {
    throw new ScheduleError(
      "CATEGORY_NOT_FOUND",
      `Category "${v.category}" is not offered`,
      {
        requested: v.category,
        available: categoryOptions.map((o) => o.label).filter(Boolean),
      },
    );
  }

  let facility: SelectOption | null;
  if (v.raw.location) {
    facility = matchOption(facilityOptions, v.raw.location);
    if (!facility) {
      throw new ScheduleError(
        "LOCATION_NOT_FOUND",
        `Facility "${v.raw.location}" not found`,
        {
          requested: v.raw.location,
          available: facilityOptions.map((o) => o.label).filter(Boolean),
        },
      );
    }
  } else {
    facility =
      facilityOptions.find((o) => o.selected) ?? facilityOptions[0] ?? null;
    if (!facility) {
      throw new ScheduleError(
        "LOCATION_NOT_FOUND",
        "No facilities available on the booking form",
      );
    }
  }

  let provider: SelectOption | null;
  if (v.raw.provider) {
    provider = matchOption(providerOptions, v.raw.provider);
    if (!provider) {
      throw new ScheduleError(
        "PROVIDER_NOT_FOUND",
        `Provider "${v.raw.provider}" not found`,
        {
          requested: v.raw.provider,
          available: providerOptions.map((o) => o.label).filter(Boolean),
        },
      );
    }
  } else {
    // Default: the logged-in user's provider entry (pre-selected by OpenEMR);
    // fall back to the first real option.
    provider =
      providerOptions.find((o) => o.selected && o.value) ??
      providerOptions.find((o) => o.value) ??
      null;
    if (!provider) {
      throw new ScheduleError(
        "PROVIDER_NOT_FOUND",
        "No providers available on the booking form",
      );
    }
  }

  return { category, facility, provider };
}

// ---------------------------------------------------------------------------
// Patient resolution (find via search popup, create via new-patient page)
// ---------------------------------------------------------------------------

interface ResolvedPatient {
  pid: string;
  name: string; // "Last, First" as OpenEMR displays it
  dob: string; // YYYY-MM-DD
  created: boolean;
}

/**
 * Searches for the patient by last name on the standalone patient-search page
 * and matches first+last+DOB exactly (case-insensitive). Row ids have the
 * shape "<pid>~<First>~<Last>~<YYYY-MM-DD>", which is unambiguous.
 */
async function findPatient(
  page: Page,
  v: ValidatedParams,
): Promise<ResolvedPatient | null> {
  extendTimeout();
  console.log(
    `[patient] searching by last name "${v.raw.patient.last_name}" for ${v.raw.patient.first_name} ${v.raw.patient.last_name} (DOB ${v.patientDob.iso})`,
  );
  await goToUrl({ page, url: PATIENT_SEARCH_URL });
  await page.waitForSelector('select[name="searchby"]', { timeout: 30000 });

  const searchByOptions = await readSelectOptions(
    page,
    'select[name="searchby"]',
  );
  const byName =
    searchByOptions.find((o) => o.value.toLowerCase() === "last") ??
    searchByOptions.find((o) => /name/i.test(o.label)) ??
    searchByOptions[0];
  if (byName) {
    await page.selectOption('select[name="searchby"]', byName.value);
  }
  await page.fill('input[name="searchparm"]', v.raw.patient.last_name);

  const submit = await page.$('form [type="submit"], form button');
  if (submit) {
    await Promise.all([
      page
        .waitForNavigation({ waitUntil: "domcontentloaded", timeout: 30000 })
        .catch(() => null),
      submit.click(),
    ]);
  } else {
    await Promise.all([
      page
        .waitForNavigation({ waitUntil: "domcontentloaded", timeout: 30000 })
        .catch(() => null),
      page.press('input[name="searchparm"]', "Enter"),
    ]);
  }

  const rows = await page.$$eval("tr.oneresult", (trs) =>
    trs.map((tr) => tr.id || ""),
  );
  console.log(
    `[patient] search returned ${rows.length} row(s) for last name "${v.raw.patient.last_name}"`,
  );
  const wantFirst = v.raw.patient.first_name.trim().toLowerCase();
  const wantLast = v.raw.patient.last_name.trim().toLowerCase();
  for (const id of rows) {
    const parts = id.split("~");
    if (parts.length < 4) continue;
    // Row id format is pid ~ LASTNAME ~ FIRSTNAME ~ dob (see find_patient_popup)
    const [pid, last, first, dob] = parts;
    if (
      first.trim().toLowerCase() === wantFirst &&
      last.trim().toLowerCase() === wantLast &&
      dob.trim() === v.patientDob.iso
    ) {
      console.log(
        `[patient] MATCH → found existing patient pid=${pid} name="${last}, ${first}" dob=${dob.trim()}`,
      );
      return {
        pid,
        name: `${last}, ${first}`,
        dob: dob.trim(),
        created: false,
      };
    }
  }
  console.log(
    `[patient] no row matched first+last+DOB exactly (wanted ${wantFirst} / ${wantLast} / ${v.patientDob.iso})`,
  );
  return null;
}

/** Fills the first matching form field; returns true if one was found. */
async function fillFirstMatching(
  page: Page,
  names: string[],
  value: string,
): Promise<boolean> {
  for (const name of names) {
    const el = await page.$(`[name="${name}"]`);
    if (!el) continue;
    const tag = await el.evaluate((n) => n.tagName.toLowerCase());
    if (tag === "select") {
      // Try by exact value, then by label (case-insensitive).
      const options = await el.$$eval("option", (opts) =>
        opts.map((o) => ({
          value: (o as HTMLOptionElement).value,
          label: (o.textContent || "").trim(),
        })),
      );
      const w = value.trim().toLowerCase();
      const match =
        options.find((o) => o.value.toLowerCase() === w) ??
        options.find((o) => o.label.toLowerCase() === w) ??
        options.find((o) => o.label.toLowerCase().includes(w));
      if (!match) continue;
      await page
        .selectOption(`[name="${name}"]`, match.value, { timeout: 5000 })
        .catch(async () => {
          // Hidden selects (custom widgets) — set the value directly.
          await el.evaluate((n, val) => {
            (n as HTMLSelectElement).value = val;
            n.dispatchEvent(new Event("change", { bubbles: true }));
          }, match.value);
        });
    } else {
      await el.fill(value, { timeout: 5000 }).catch(async () => {
        // Hidden inputs / datepickers reject fill; set the value directly.
        await el.evaluate((n, val) => {
          (n as HTMLInputElement).value = val;
          n.dispatchEvent(new Event("input", { bubbles: true }));
          n.dispatchEvent(new Event("change", { bubbles: true }));
        }, value);
      });
    }
    return true;
  }
  return false;
}

/**
 * Creates the patient on the "Search or Add Patient" page, drives the
 * duplicate-check step ("Confirm Create New Patient" appears either in an
 * in-page dialog iframe or a popup window), then re-runs the patient search
 * to obtain the assigned pid.
 */
async function createPatient(
  page: Page,
  context: BrowserContext,
  v: ValidatedParams,
): Promise<ResolvedPatient> {
  extendTimeout();
  const np = v.raw.new_patient ?? {};
  if (!np.sex) {
    throw new ScheduleError(
      "INVALID_INPUT",
      "new_patient.sex is required to create a patient (Birth Sex is mandatory on the new-patient form)",
      { field: "new_patient.sex" },
    );
  }
  await goToUrl({ page, url: NEW_PATIENT_URL });
  await page.waitForSelector('[name="form_fname"], [name="form_lname"]', {
    timeout: 30000,
  });
  // Standalone new.php expects to live inside the OpenEMR tabs frame, which
  // provides restoreSession / get_opener / webroot_url. The duplicate-check
  // dialog iframe (new_search_popup.php) resolves its `opener` through
  // top.get_opener(window.name) and its Confirm button fires the
  // srcConfirmSave callback via dlgclose(); shim the frame plumbing so the
  // whole flow works standalone.
  await page.evaluate(() => {
    const w = window as any;
    if (typeof w.restoreSession !== "function") w.restoreSession = () => true;
    w.opener_list = w.opener_list || {};
    if (typeof w.set_opener !== "function") {
      w.set_opener = (name: string, op: any) => {
        w.opener_list[name] = op;
      };
    }
    if (typeof w.get_opener !== "function") {
      w.get_opener = (name: string) => w.opener_list[name] || window;
    }
    if (typeof w.webroot_url === "undefined") w.webroot_url = "/openemr";
  });
  const okFirst = await fillFirstMatching(
    page,
    ["form_fname"],
    v.raw.patient.first_name,
  );
  const okLast = await fillFirstMatching(
    page,
    ["form_lname"],
    v.raw.patient.last_name,
  );
  const okDob = await fillFirstMatching(
    page,
    ["form_DOB", "form_dob"],
    v.patientDob.iso,
  );
  if (!okFirst || !okLast || !okDob) {
    throw new ScheduleError(
      "PATIENT_CREATE_FAILED",
      "Could not locate required name/DOB fields on the new-patient page",
      { first: okFirst, last: okLast, dob: okDob },
    );
  }
  if (np.sex) {
    await fillFirstMatching(page, ["form_sex"], np.sex);
  }
  // Optional demographics — best-effort.
  if (np.phone)
    await fillFirstMatching(
      page,
      ["form_phone_home", "form_phone_cell"],
      np.phone,
    );
  if (np.email) await fillFirstMatching(page, ["form_email"], np.email);
  if (np.address) await fillFirstMatching(page, ["form_street"], np.address);
  if (np.city) await fillFirstMatching(page, ["form_city"], np.city);
  if (np.state) await fillFirstMatching(page, ["form_state"], np.state);
  if (np.postal_code)
    await fillFirstMatching(page, ["form_postal_code"], np.postal_code);

  // The duplicate-check may open as a popup window — listen before clicking.
  let popup: Page | null = null;
  const onPage = (p: Page) => {
    popup = p;
  };
  context.on("page", onPage);
  page.on("dialog", (d) => d.accept().catch(() => {}));

  try {
    const createBtn = page
      .locator(
        'button:has-text("Create New Patient"), input[value="Create New Patient"]',
      )
      .first();
    await createBtn.click({ timeout: 15000 });

    // Wait for the duplicate-check UI (new_search_popup.php dialog iframe or a
    // popup window) — or for the page to have skipped straight to the chart.
    let dupCheckSeen = false;
    let navigatedAway = false;
    const deadline = Date.now() + 30000;
    while (Date.now() < deadline) {
      extendTimeout();
      if (!page.url().includes("new.php")) {
        navigatedAway = true;
        break;
      }
      if (
        popup &&
        /new_search_popup|patientvalidation/i.test((popup as Page).url())
      ) {
        dupCheckSeen = true;
        break;
      }
      const dupFrame = page
        .frames()
        .find(
          (f) =>
            f !== page.mainFrame() &&
            /new_search_popup|patientvalidation/i.test(f.url()),
        );
      if (dupFrame) {
        dupCheckSeen = true;
        break;
      }
      await page.waitForTimeout(500);
    }
    if (!dupCheckSeen && !navigatedAway) {
      throw new ScheduleError(
        "PATIENT_CREATE_FAILED",
        "Duplicate-check step never appeared after Create New Patient",
      );
    }

    if (!navigatedAway) {
      // Best-effort: click "Confirm Create New Patient" so the dialog closes
      // cleanly. Its dlgclose() callback is broken outside the OpenEMR tabs
      // frame, so we do not rely on it actually saving.
      const surfaces: (Page | ReturnType<Page["mainFrame"]>)[] = [];
      if (popup) surfaces.push(popup as Page);
      for (const f of page.frames())
        if (f !== page.mainFrame()) surfaces.push(f);
      for (const s of surfaces) {
        const btn = (s as Page)
          .locator(
            'button:has-text("Confirm Create New Patient"), input[value*="Confirm Create"]',
          )
          .first();
        const visible = await btn.isVisible().catch(() => false);
        if (visible) {
          await btn.click({ timeout: 5000 }).catch(() => {});
          break;
        }
      }

      // Direct submit — replicate srcConfirmSave() (document.forms[0].submit())
      // ourselves, bypassing the broken top.* frame plumbing.
      await Promise.all([
        page
          .waitForNavigation({ waitUntil: "domcontentloaded", timeout: 30000 })
          .catch(() => null),
        page.evaluate(() => {
          (document.forms[0] as HTMLFormElement).submit();
        }),
      ]);
    }
    // Let the post-save page (patient chart) settle.
    await page.waitForTimeout(2000);
  } finally {
    context.off("page", onPage);
  }

  // Re-run the search to fetch the assigned pid in a known format.
  console.log(
    `[patient] create submitted → re-searching to confirm and fetch assigned pid …`,
  );
  const found = await findPatient(page, v);
  if (!found) {
    throw new ScheduleError(
      "PATIENT_CREATE_FAILED",
      "Patient creation appeared to succeed but the patient is not searchable",
      { patient: v.raw.patient },
    );
  }
  console.log(
    `[patient] created new patient pid=${found.pid} name="${found.name}"`,
  );
  return { ...found, created: true };
}

/** find → (optionally) create → resolved patient with pid. */
async function resolvePatient(
  page: Page,
  context: BrowserContext,
  v: ValidatedParams,
): Promise<ResolvedPatient> {
  console.log(
    `[patient] resolving patient (create_patient_if_missing=${v.createIfMissing}) …`,
  );
  const existing = await findPatient(page, v);
  if (existing) {
    console.log(
      `[patient] using existing patient pid=${existing.pid} — no creation needed`,
    );
    return existing;
  }
  if (!v.createIfMissing) {
    console.log(
      `[patient] not found and create_patient_if_missing=false → SKIPPING creation, raising PATIENT_NOT_FOUND`,
    );
    throw new ScheduleError(
      "PATIENT_NOT_FOUND",
      `No patient matches ${v.raw.patient.first_name} ${v.raw.patient.last_name} (DOB ${v.patientDob.iso}) and create_patient_if_missing is false`,
      { patient: v.raw.patient },
    );
  }
  console.log(`[patient] not found → CREATING new patient …`);
  return createPatient(page, context, v);
}

// ---------------------------------------------------------------------------
// Idempotency guard — find an existing appointment in the same slot
// ---------------------------------------------------------------------------

interface ExistingAppointment {
  eid: string;
  date: string; // YYYYMMDD from the dashboard oldEvt link
  minutes: number; // start time as minutes-from-midnight
  provider: string; // "First Last" as displayed
  status: string; // e.g. "- None" / "x Canceled"
}

/** Parses a dashboard time cell ("10:00" 24h or "10:00 AM") to minutes. */
function dashboardTimeToMinutes(value: string): number | null {
  const m = /(\d{1,2}):(\d{2})\s*(AM|PM)?/i.exec((value ?? "").trim());
  if (!m) return null;
  let hour = parseInt(m[1], 10);
  const minute = parseInt(m[2], 10);
  const ampm = m[3]?.toUpperCase();
  if (ampm) {
    if (ampm === "PM" && hour !== 12) hour += 12;
    if (ampm === "AM" && hour === 12) hour = 0;
  }
  if (hour > 23 || minute > 59) return null;
  return hour * 60 + minute;
}

function normalizeName(s: string): string {
  return (s || "").replace(/\s+/g, " ").trim().toLowerCase();
}

/** True when the two provider names refer to the same person (order-insensitive). */
function sameProvider(a: string, b: string): boolean {
  const na = normalizeName(a);
  const nb = normalizeName(b);
  if (!na || !nb) return false;
  if (na === nb) return true;
  const ta = na.replace(/,/g, "").split(" ").filter(Boolean).sort();
  const tb = nb.replace(/,/g, "").split(" ").filter(Boolean).sort();
  return ta.length > 0 && ta.join(" ") === tb.join(" ");
}

/**
 * Reads the patient's dashboard (Appointments card) and returns every entry
 * whose link carries an event id. Mirrors cancel-appointment's reader.
 */
async function listPatientAppointments(
  page: Page,
  pid: string,
): Promise<ExistingAppointment[]> {
  extendTimeout();
  await goToUrl({
    page,
    url: `${BASE}/patient_file/summary/demographics.php?set_pid=${encodeURIComponent(
      pid,
    )}`,
  });
  await page.waitForSelector("body", { timeout: 30000 });
  await page.waitForTimeout(1500);

  const raw = await page.$$eval('a[onclick*="oldEvt("]', (anchors) => {
    const out: any[] = [];
    for (const a of anchors) {
      const onclick = a.getAttribute("onclick") || "";
      const m = /oldEvt\(\s*['"]?(\d{8})['"]?\s*,\s*['"]?(\d+)['"]?\s*\)/.exec(
        onclick,
      );
      if (!m) continue;
      const item = a.closest(".list-group-item");
      if (!item) continue;
      const clean = (s: string | null | undefined) =>
        (s || "").replace(/\s+/g, " ").trim();
      const timeText = clean(item.querySelector("small")?.textContent);
      const spans = item.querySelectorAll("div.text-muted span");
      out.push({
        eid: m[2],
        date: m[1],
        time_text: timeText,
        provider: clean(spans[0]?.textContent),
        status: clean(spans[1]?.textContent),
      });
    }
    return out;
  });

  return raw
    .map((r) => ({
      eid: r.eid,
      date: r.date,
      minutes: dashboardTimeToMinutes(r.time_text) ?? -1,
      provider: r.provider,
      status: r.status,
    }))
    .filter((r) => r.minutes >= 0);
}

/**
 * Returns an existing appointment for this patient at the requested slot, or
 * null. Cancelled entries (status starting "x") are ignored so a slot freed by
 * a cancellation can be re-booked. When a provider was requested, it must match.
 */
async function findExistingAppointment(
  page: Page,
  v: ValidatedParams,
  resolved: ResolvedForm,
  patient: ResolvedPatient,
): Promise<ExistingAppointment | null> {
  const wantMinutes = v.time.hour24 * 60 + v.time.minute;
  const appts = await listPatientAppointments(page, patient.pid);
  // Provider display is "First Last"; the option label is "Last, First".
  const [provLast, provFirst] = resolved.provider.label
    .split(",")
    .map((s) => s.trim());
  const providerDisplay = provFirst
    ? `${provFirst} ${provLast}`
    : resolved.provider.label;
  for (const a of appts) {
    if (a.date !== v.date.compact) continue;
    if (a.minutes !== wantMinutes) continue;
    if (/^x\b/i.test(a.status) || /cancel/i.test(a.status)) continue;
    // Only enforce provider when the caller pinned one; otherwise a same-slot
    // appointment for this patient is a duplicate regardless of provider.
    if (v.raw.provider && !sameProvider(a.provider, providerDisplay)) continue;
    return a;
  }
  return null;
}

// ---------------------------------------------------------------------------
// Booking form fill + save
// ---------------------------------------------------------------------------

/**
 * Fills the booking form. IMPORTANT: category is set first — its onchange
 * (set_category) auto-fills the duration, so duration is written afterwards.
 * The patient is set by writing the hidden form_pid + visible form_patient
 * directly instead of driving the patient popup.
 */
async function fillBookingForm(
  page: Page,
  v: ValidatedParams,
  resolved: ResolvedForm,
  patient: ResolvedPatient,
): Promise<void> {
  extendTimeout();

  // Patient: hidden pid + visible display name. This is set via JS (the pid is
  // bound by the patient-search popup, not typed), so it's not a UI-drivable
  // step and stays OUTSIDE the AI fallback below.
  await page.evaluate(
    ({ pid, name }) => {
      const pidEl = document.querySelector(
        'input[name="form_pid"]',
      ) as HTMLInputElement | null;
      const patEl = document.querySelector(
        'input[name="form_patient"]',
      ) as HTMLInputElement | null;
      if (pidEl) pidEl.value = pid;
      if (patEl) patEl.value = name;
    },
    { pid: patient.pid, name: patient.name },
  );

  const minutePad = String(v.time.minute).padStart(2, "0");

  // Risky block: the visible booking-form fields. These dropdowns/inputs are the
  // most selector-rot-prone part of the flow (form_category / facility /
  // form_provider vs form_provider[] flips across demo resets). Wrap them in the
  // AI fallback — on a REAL failure (broken selector, timeout) an agent fills the
  // same fields on the live form, and `verify` re-reads the key values
  // deterministically (category, provider, date, hour, minute) before continuing.
  await withAiFallback(
    {
      step: "fill_booking_form",
      where: "fillBookingForm (add_edit_event.php visible fields)",
      page,
      dryRun: v.dryRun,
      instruction:
        `On the appointment form, set these fields and DO NOT save:\n` +
        `- Category: "${resolved.category.label}"\n` +
        `- Facility: "${resolved.facility.label}"\n` +
        `- Provider: "${resolved.provider.label}"\n` +
        `- Date: ${v.date.iso} (YYYY-MM-DD)\n` +
        `- Time: hour field = ${v.time.hour24} (24-hour), minute field = ${minutePad}\n` +
        `- Duration: ${v.durationMinutes} minutes\n` +
        `Leave the appointment Status dropdown as-is.`,
      verify: (p) => verifyBookingFormFilled(p, v, resolved),
    },
    () => fillBookingFormFields(page, v, resolved),
  );
}

/** The deterministic booking-form fill (the fast path; the AI mirrors it on failure). */
async function fillBookingFormFields(
  page: Page,
  v: ValidatedParams,
  resolved: ResolvedForm,
): Promise<void> {
  // Category first (fires set_category → default duration), then override.
  // NOTE (demo branch): this selector is intentionally broken ("form_categoryZZZ")
  // to demonstrate the AI fallback recovering a rotted selector. The short
  // timeout just makes the deterministic attempt fail fast before the AI takes
  // over. Real branch uses 'select[name="form_category"]'.
  await page.selectOption(
    'select[name="form_categoryZZZ"]',
    resolved.category.value,
    {
      timeout: 3000,
    },
  );
  await page.selectOption('select[name="facility"]', resolved.facility.value);
  // Keep the billing facility in sync when present.
  const billing = await page.$('select[name="billing_facility"]');
  if (billing) {
    await page
      .selectOption('select[name="billing_facility"]', resolved.facility.value)
      .catch(() => {});
  }
  const providerSelect = (await page.$('select[name="form_provider"]'))
    ? 'select[name="form_provider"]'
    : 'select[name="form_provider[]"]';
  await page.selectOption(providerSelect, resolved.provider.value);

  // Date (YYYY-MM-DD input) — set directly to avoid datepicker interference.
  const okDate = await fillFirstMatching(page, ["form_date"], v.date.iso);
  // Time: separate 24h hour + minute text inputs.
  const okHour = await fillFirstMatching(
    page,
    ["form_hour"],
    String(v.time.hour24),
  );
  const okMin = await fillFirstMatching(
    page,
    ["form_minute"],
    String(v.time.minute).padStart(2, "0"),
  );
  // Duration AFTER category.
  const okDur = await fillFirstMatching(
    page,
    ["form_duration"],
    String(v.durationMinutes),
  );
  if (!okDate || !okHour || !okMin || !okDur) {
    // Missing fields = the form isn't what we expect (selector rot) — throw a
    // PLAIN Error (not ClientError) so the AI fallback treats it as a real
    // failure to rescue, not a business outcome to pass through.
    throw new Error(
      `Booking form fields missing (date=${okDate} hour=${okHour} minute=${okMin} duration=${okDur})`,
    );
  }
  if (v.comments) {
    await fillFirstMatching(page, ["form_comments"], v.comments);
  }
  // Status select is intentionally left at "- None".
}

/** Deterministic post-fill check (used as the fallback's verify): key fields hold. */
async function verifyBookingFormFilled(
  page: Page,
  v: ValidatedParams,
  resolved: ResolvedForm,
): Promise<void> {
  const read = async (selector: string): Promise<string | null> =>
    page
      .$eval(
        selector,
        (el) => (el as HTMLInputElement | HTMLSelectElement).value,
      )
      .catch(() => null);

  const category = await read('select[name="form_category"]');
  const providerSel = (await page.$('select[name="form_provider"]'))
    ? 'select[name="form_provider"]'
    : 'select[name="form_provider[]"]';
  const provider = await read(providerSel);
  const date = await read('[name="form_date"]');
  const hour = await read('[name="form_hour"]');
  const minute = await read('[name="form_minute"]');

  // category/provider are <select> values and date is a string → compare as
  // strings. hour/minute are numeric text inputs the form (or the AI) may
  // zero-pad ("09" vs "9"), so compare them NUMERICALLY, not by exact string.
  const strEq = (a: string | null, b: string): boolean => String(a ?? "") === b;
  const numEq = (a: string | null, b: number): boolean =>
    a != null && a.trim() !== "" && parseInt(a, 10) === b;

  const checks = [
    {
      key: "category",
      got: category,
      want: resolved.category.value,
      ok: strEq(category, resolved.category.value),
    },
    {
      key: "provider",
      got: provider,
      want: resolved.provider.value,
      ok: strEq(provider, resolved.provider.value),
    },
    { key: "date", got: date, want: v.date.iso, ok: strEq(date, v.date.iso) },
    {
      key: "hour",
      got: hour,
      want: String(v.time.hour24),
      ok: numEq(hour, v.time.hour24),
    },
    {
      key: "minute",
      got: minute,
      want: String(v.time.minute),
      ok: numEq(minute, v.time.minute),
    },
  ];
  const mismatches = checks.filter((c) => !c.ok);
  if (mismatches.length) {
    throw new Error(
      `verify: booking form fields not set — ${mismatches
        .map((c) => `${c.key}="${c.got}" (want "${c.want}")`)
        .join(", ")}`,
    );
  }
}

/**
 * Clicks Save and waits for the booking to post. This demo shows no
 * double-booking prompt, so there is no conflict dialog to handle — any stray
 * alert()/confirm() is simply accepted. Save completion is detected by the form
 * leaving the page (it posts to add_edit_event.php; the standalone dlgclose()
 * error is harmless).
 */
async function saveAppointment(
  page: Page,
  context: BrowserContext,
  v: ValidatedParams,
): Promise<void> {
  extendTimeout();

  const onDialog = async (d: Dialog) => {
    await d.accept().catch(() => {});
  };
  const popupPages: Page[] = [];
  const onPage = (p: Page) => {
    popupPages.push(p);
    p.on("dialog", onDialog);
  };

  page.on("dialog", onDialog);
  context.on("page", onPage);

  let saved = false;
  try {
    const saveBtn = await page.$("#form_save");
    if (!saveBtn) {
      throw new ScheduleError(
        "SAVE_NOT_CONFIRMED",
        "Save button (#form_save) not found on the booking form",
      );
    }
    await saveBtn.click();

    const deadline = Date.now() + 45000;
    while (Date.now() < deadline) {
      extendTimeout();
      const stillOnForm = await page
        .$("#form_save")
        .then((el) => el !== null)
        .catch(() => false);
      if (!stillOnForm) {
        saved = true;
        break;
      }
      await page.waitForTimeout(500);
    }
  } finally {
    page.off("dialog", onDialog);
    context.off("page", onPage);
    for (const p of popupPages) {
      if (!p.isClosed()) await p.close().catch(() => {});
    }
  }

  if (!saved) {
    throw new ScheduleError(
      "SAVE_NOT_CONFIRMED",
      "Save did not complete within the expected time (form still present)",
    );
  }
}

/**
 * Verifies the booking via the availability popup: after a successful save the
 * booked start time must no longer appear among the free-slot setappt anchors.
 */
async function verifyAppointment(
  page: Page,
  v: ValidatedParams,
  resolved: ResolvedForm,
  patient: ResolvedPatient,
): Promise<boolean> {
  extendTimeout();

  // Primary (positive) check: the patient's dashboard lists future
  // appointments as e.g. "Office Visit Mon, 2026-07-20 10:00 Donna Lee".
  const hh = String(v.time.hour24).padStart(2, "0");
  const mm = String(v.time.minute).padStart(2, "0");
  const needle = `${v.date.iso} ${hh}:${mm}`;
  // Option label is "Last, First" but the widget prints "First Last".
  const [provLast, provFirst] = resolved.provider.label
    .split(",")
    .map((s) => s.trim());
  const providerDisplay = provFirst
    ? `${provFirst} ${provLast}`
    : resolved.provider.label;
  try {
    await goToUrl({
      page,
      url: `${BASE}/patient_file/summary/demographics.php?set_pid=${encodeURIComponent(
        patient.pid,
      )}`,
    });
    const dashboardText = await page.evaluate(() =>
      document.body ? document.body.innerText.replace(/\s+/g, " ") : "",
    );
    if (dashboardText.includes(needle)) {
      // Require the provider name near the matched date-time when possible.
      const idx = dashboardText.indexOf(needle);
      const windowText = dashboardText.slice(idx, idx + needle.length + 60);
      if (windowText.includes(providerDisplay) || !provFirst) return true;
      // Date+time matched but another provider — keep scanning all occurrences.
      let from = idx + 1;
      let next;
      while ((next = dashboardText.indexOf(needle, from)) !== -1) {
        const w = dashboardText.slice(next, next + needle.length + 60);
        if (w.includes(providerDisplay)) return true;
        from = next + 1;
      }
    }
  } catch {
    // fall through to the slot-absence heuristic
  }

  // Fallback (negative) check: the booked start time no longer appears as a
  // free slot for that provider/day.
  const url =
    `${BASE}/main/calendar/find_appt_popup.php?providerid=${encodeURIComponent(
      resolved.provider.value,
    )}` +
    `&catid=${encodeURIComponent(resolved.category.value)}` +
    `&facility=${encodeURIComponent(resolved.facility.value)}` +
    `&startdate=${v.date.iso}&searchdays=1&evdur=${v.durationMinutes}&eid=0`;
  await goToUrl({ page, url });
  const html = await page.content();
  const re = /setappt\((\d+),\s*(\d+),\s*(\d+),\s*(\d+),\s*(\d+)\)/g;
  let match: RegExpExecArray | null;
  let anySlots = false;
  let bookedStillFree = false;
  while ((match = re.exec(html)) !== null) {
    anySlots = true;
    const [, y, mo, d, h, mi] = match.map(Number) as unknown as number[];
    if (
      y === v.date.year &&
      mo === v.date.month &&
      d === v.date.day &&
      h === v.time.hour24 &&
      mi === v.time.minute
    ) {
      bookedStillFree = true;
    }
  }
  // If the popup lists no slots at all we can't disprove the booking; treat a
  // present slot as "not verified" and an absent one as verified.
  return anySlots ? !bookedStillFree : true;
}

// ---------------------------------------------------------------------------
// Provider (non-patient) events — the calendar's Provider tab (?prov=true)
// ---------------------------------------------------------------------------

/**
 * Installs the frameset shims the standalone event page needs BEFORE it loads,
 * so the later direct form submit works: opened outside the OpenEMR tabs frame,
 * top.restoreSession / dlgclose are missing (SubmitForm() would throw), and any
 * holiday confirm() must auto-accept. Mirrors cancel-appointment's shims.
 */
async function injectProviderShims(page: Page): Promise<void> {
  await page.addInitScript(() => {
    const w = window as any;
    w.confirm = () => true;
    if (typeof w.restoreSession !== "function") w.restoreSession = () => true;
    if (typeof w.dlgclose !== "function") w.dlgclose = () => {};
    if (typeof w.dlgopen !== "function") w.dlgopen = () => {};
    if (typeof w.webroot_url === "undefined") w.webroot_url = "/openemr";
  });
}

/**
 * Opens the Provider-tab event form and resolves category / facility / provider
 * to their option values. The category list here is the provider-event set
 * (In Office / Out Of Office / Vacation / Lunch / Reserved) — distinct from the
 * patient visit categories — so it is read live from this form, nothing
 * hardcoded. When no category / location is given, the form's own pre-selected
 * default is used.
 */
async function openProviderFormAndResolve(
  page: Page,
  v: ValidatedParams,
): Promise<ResolvedForm> {
  extendTimeout();
  await injectProviderShims(page);
  await goToUrl({ page, url: PROVIDER_EVENT_URL(v.date.compact) });
  await page.waitForSelector('select[name="form_category"]', {
    timeout: 30000,
  });

  const categoryOptions = await readSelectOptions(
    page,
    'select[name="form_category"]',
  );
  const facilityOptions = await readSelectOptions(
    page,
    'select[name="facility"]',
  );
  // Provider select is "form_provider" (single) or "form_provider[]" in
  // multi-provider mode — support both, same as the patient form.
  let providerOptions = await readSelectOptions(
    page,
    'select[name="form_provider"]',
  );
  if (providerOptions.length === 0) {
    providerOptions = await readSelectOptions(
      page,
      'select[name="form_provider[]"]',
    );
  }

  let category: SelectOption | null;
  if (v.category) {
    category = matchOption(categoryOptions, v.category);
    if (!category) {
      throw new ScheduleError(
        "CATEGORY_NOT_FOUND",
        `Provider event category "${v.category}" is not offered`,
        {
          requested: v.category,
          available: categoryOptions.map((o) => o.label).filter(Boolean),
        },
      );
    }
  } else {
    category =
      categoryOptions.find((o) => o.selected && o.value) ??
      categoryOptions.find((o) => o.value) ??
      null;
    if (!category) {
      throw new ScheduleError(
        "CATEGORY_NOT_FOUND",
        "No provider event categories available on the form",
      );
    }
  }

  let facility: SelectOption | null;
  if (v.raw.location) {
    facility = matchOption(facilityOptions, v.raw.location);
    if (!facility) {
      throw new ScheduleError(
        "LOCATION_NOT_FOUND",
        `Facility "${v.raw.location}" not found`,
        {
          requested: v.raw.location,
          available: facilityOptions.map((o) => o.label).filter(Boolean),
        },
      );
    }
  } else {
    facility =
      facilityOptions.find((o) => o.selected) ?? facilityOptions[0] ?? null;
    if (!facility) {
      throw new ScheduleError(
        "LOCATION_NOT_FOUND",
        "No facilities available on the form",
      );
    }
  }

  let provider: SelectOption | null;
  if (v.raw.provider) {
    provider = matchOption(providerOptions, v.raw.provider);
    if (!provider) {
      throw new ScheduleError(
        "PROVIDER_NOT_FOUND",
        `Provider "${v.raw.provider}" not found`,
        {
          requested: v.raw.provider,
          available: providerOptions.map((o) => o.label).filter(Boolean),
        },
      );
    }
  } else {
    provider =
      providerOptions.find((o) => o.selected && o.value) ??
      providerOptions.find((o) => o.value) ??
      null;
    if (!provider) {
      throw new ScheduleError(
        "PROVIDER_NOT_FOUND",
        "No providers available on the form",
      );
    }
  }

  return { category, facility, provider };
}

/**
 * Fills the Provider-tab event form. Category is set first (its set_category
 * onchange rewrites Title + a default duration), then Title and Duration are
 * overridden. There are no patient fields on this form.
 */
async function fillProviderEventForm(
  page: Page,
  v: ValidatedParams,
  resolved: ResolvedForm,
): Promise<void> {
  extendTimeout();
  // Category first (fires set_category → rewrites title/duration), then override.
  await page.selectOption(
    'select[name="form_category"]',
    resolved.category.value,
  );

  const title = v.title ?? resolved.category.label;
  await fillFirstMatching(page, ["form_title"], title);

  await page.selectOption('select[name="facility"]', resolved.facility.value);
  const billing = await page.$('select[name="billing_facility"]');
  if (billing) {
    await page
      .selectOption('select[name="billing_facility"]', resolved.facility.value)
      .catch(() => {});
  }
  const providerSelect = (await page.$('select[name="form_provider"]'))
    ? 'select[name="form_provider"]'
    : 'select[name="form_provider[]"]';
  await page.selectOption(providerSelect, resolved.provider.value);

  const okDate = await fillFirstMatching(page, ["form_date"], v.date.iso);
  const okHour = await fillFirstMatching(
    page,
    ["form_hour"],
    String(v.time.hour24),
  );
  const okMin = await fillFirstMatching(
    page,
    ["form_minute"],
    String(v.time.minute).padStart(2, "0"),
  );
  const okDur = await fillFirstMatching(
    page,
    ["form_duration"],
    String(v.durationMinutes),
  );
  if (!okDate || !okHour || !okMin || !okDur) {
    // Missing fields = the form isn't what we expect (selector rot). Throw a
    // plain Error (a real failure), not a caller-facing ClientError.
    throw new Error(
      `Provider event form fields missing (date=${okDate} hour=${okHour} minute=${okMin} duration=${okDur})`,
    );
  }
  if (v.comments) await fillFirstMatching(page, ["form_comments"], v.comments);
}

/**
 * Submits the Provider-tab event form. The standalone page never binds the Save
 * button reliably (its SubmitForm() calls top.restoreSession() then f.submit(),
 * which throws outside the tabs frame), so — like cancel-appointment — we set
 * form_action=save and submit the real form element directly. Completion is the
 * event form leaving the page: the server emits its close-window page only
 * after the event row is written, so this is a server-confirmed save.
 */
async function saveProviderEvent(page: Page): Promise<void> {
  extendTimeout();
  const onDialog = async (d: Dialog) => {
    await d.accept().catch(() => {});
  };
  page.on("dialog", onDialog);
  try {
    await Promise.all([
      page
        .waitForNavigation({ waitUntil: "domcontentloaded", timeout: 45000 })
        .catch(() => null),
      page.evaluate(() => {
        const form = (
          document.getElementById("form_action") as HTMLElement
        )?.closest("form") as HTMLFormElement | null;
        if (!form) throw new Error("provider event form not found");
        const fa = form.querySelector(
          "#form_action",
        ) as HTMLInputElement | null;
        if (fa) fa.value = "save";
        // recurr_affect stays empty — this is a non-recurring event.
        form.submit();
      }),
    ]);

    // Saved once the event form is gone (server returned its close-window page).
    let saved = false;
    const deadline = Date.now() + 15000;
    while (Date.now() < deadline) {
      extendTimeout();
      const stillOnForm = await page
        .$("#form_save")
        .then((el) => el !== null)
        .catch(() => false);
      if (!stillOnForm) {
        saved = true;
        break;
      }
      await page.waitForTimeout(500);
    }
    if (!saved) {
      throw new ScheduleError(
        "SAVE_NOT_CONFIRMED",
        "Provider event save did not complete (form still present)",
      );
    }
  } finally {
    page.off("dialog", onDialog);
  }
}

/** Books a provider (non-patient) event: resolve → fill → (dry_run|save). */
async function runProviderEvent(
  page: Page,
  v: ValidatedParams,
): Promise<Record<string, any>> {
  const resolved = await openProviderFormAndResolve(page, v);

  const event = {
    type: "provider",
    title: v.title ?? resolved.category.label,
    date: v.raw.date,
    start_time: formatTime12(v.time.hour24, v.time.minute),
    end_time: formatTime12(v.endTime.hour24, v.endTime.minute),
    provider: resolved.provider.label,
    location: resolved.facility.label,
    category: resolved.category.label,
    duration_minutes: v.durationMinutes,
    comments: v.comments,
  };

  await fillProviderEventForm(page, v, resolved);

  if (v.dryRun) {
    const result = { status: "dry_run", event };
    validateDataUsingSchema({ data: result, schema: PROVIDER_DATA_SCHEMA });
    return result;
  }

  await saveProviderEvent(page);

  const result = { status: "booked", event: { ...event, verified: true } };
  validateDataUsingSchema({ data: result, schema: PROVIDER_DATA_SCHEMA });
  return result;
}

// ---------------------------------------------------------------------------
// Handler
// ---------------------------------------------------------------------------

export default async function handler(
  params: Params,
  page: Page,
  context: BrowserContext,
): Promise<Record<string, any>> {
  // Envelope boundary: a ClientError (business outcome) becomes a
  // `{ success: false, ... }` response (the run SUCCEEDS); a real failure
  // propagates and the run fails. dry_run + ai_fallback ride as envelope meta.
  const dryRun = params?.dry_run ?? false;
  return withErrorEnvelope(
    { dry_run: dryRun, ai_fallback: initAiFallbackMeta() },
    () => run(params, page, context),
  );
}

async function run(
  params: Params,
  page: Page,
  context: BrowserContext,
): Promise<Record<string, any>> {
  const v = validateParams(params);

  // Provider (non-patient) events take a separate, simpler path: fill the
  // Provider tab and save — no patient resolution or idempotency guard.
  if (v.eventType === "provider") {
    return runProviderEvent(page, v);
  }

  // Resolve form option ids first (validates category/facility/provider early).
  const resolved = await openBookingFormAndResolve(page, v);

  // Find or create the patient (navigates away from the booking form).
  const patient = await resolvePatient(page, context, v);

  const appointment = {
    date: v.raw.date,
    start_time: formatTime12(v.time.hour24, v.time.minute),
    end_time: formatTime12(v.endTime.hour24, v.endTime.minute),
    provider: resolved.provider.label,
    location: resolved.facility.label,
    category: resolved.category.label,
    duration_minutes: v.durationMinutes,
    comments: v.comments,
  };

  // Idempotency guard: skip booking when this patient already holds the slot.
  // Runs for real and dry-run calls alike so a second call is a safe no-op.
  // `allow_duplicate: true` opts out.
  if (!v.allowDuplicate) {
    const existing = await findExistingAppointment(page, v, resolved, patient);
    if (existing) {
      const result = {
        status: "already_booked",
        patient: {
          pid: patient.pid,
          name: patient.name,
          dob: patient.dob,
          created: patient.created,
        },
        appointment: { ...appointment, eid: existing.eid, verified: true },
      };
      validateDataUsingSchema({ data: result, schema: DATA_SCHEMA });
      return result;
    }
  }

  // Re-open the booking form and fill everything.
  await goToUrl({ page, url: BOOKING_URL(v.date.compact) });
  await page.waitForSelector('select[name="form_category"]', {
    timeout: 30000,
  });
  await fillBookingForm(page, v, resolved, patient);

  if (v.dryRun) {
    const result = {
      status: "dry_run",
      patient: {
        pid: patient.pid,
        name: patient.name,
        dob: patient.dob,
        created: patient.created,
      },
      appointment,
    };
    validateDataUsingSchema({ data: result, schema: DATA_SCHEMA });
    return result;
  }

  await saveAppointment(page, context, v);

  const verified = await verifyAppointment(page, v, resolved, patient);

  const result = {
    status: "booked",
    patient: {
      pid: patient.pid,
      name: patient.name,
      dob: patient.dob,
      created: patient.created,
    },
    appointment: { ...appointment, verified },
  };
  validateDataUsingSchema({ data: result, schema: DATA_SCHEMA });
  return result;
}
