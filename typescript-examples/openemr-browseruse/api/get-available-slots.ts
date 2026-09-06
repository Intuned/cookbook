import { z } from "zod";
import type { BrowserContext, Page } from "playwright";
import { goToUrl, validateDataUsingSchema } from "@intuned/browser";
import { extendTimeout } from "@intuned/runtime";
import { ClientError, withErrorEnvelope } from "../helpers/errors";
import { initGateway, runAgent } from "../helpers/browseruse";

interface Params {
  start_date: string;
  end_date: string;
  location?: string;
  provider?: string;
  duration_minutes?: number;
}

const BASE_URL =
  process.env.OPENEMR_BASE_URL ?? "https://demo.openemr.io/openemr";
const MAX_SPAN_DAYS = 14;

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

type SlotsErrorCode =
  | "INVALID_INPUT"
  | "LOCATION_NOT_FOUND"
  | "PROVIDER_NOT_FOUND";
const ERROR_STATUS: Record<SlotsErrorCode, number> = {
  INVALID_INPUT: 400,
  LOCATION_NOT_FOUND: 404,
  PROVIDER_NOT_FOUND: 404,
};

function errorEnvelope(
  code: SlotsErrorCode,
  message: string,
  details?: Record<string, any>,
): never {
  throw new ClientError(ERROR_STATUS[code], code, message, details);
}

const searchResultSchema = z.object({
  provider_found: z.boolean(),
  facility_found: z.boolean(),
  facility_label: z.string(),
  days: z.array(
    z.object({
      date: z.string(),
      times: z.array(z.string()),
    }),
  ),
});

const providerListSchema = z.object({
  providers: z.array(z.string()),
});

function parseMdy(value: string): Date | null {
  const m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec((value || "").trim());
  if (!m) return null;
  const d = new Date(parseInt(m[3]), parseInt(m[1]) - 1, parseInt(m[2]));
  if (
    d.getFullYear() !== parseInt(m[3]) ||
    d.getMonth() !== parseInt(m[1]) - 1 ||
    d.getDate() !== parseInt(m[2])
  ) {
    return null;
  }
  return d;
}

function parseAgentDate(value: string): Date | null {
  let m = /(\d{1,2})\/(\d{1,2})\/(\d{4})/.exec(value || "");
  if (m) return new Date(parseInt(m[3]), parseInt(m[1]) - 1, parseInt(m[2]));
  m = /(\d{4})-(\d{1,2})-(\d{1,2})/.exec(value || "");
  if (m) return new Date(parseInt(m[1]), parseInt(m[2]) - 1, parseInt(m[3]));
  return null;
}

function parseTimeMinutes(value: string): number | null {
  const m = /(\d{1,2}):(\d{2})\s*(am|pm)?/i.exec((value || "").trim());
  if (!m) return null;
  let hour = parseInt(m[1]);
  const minute = parseInt(m[2]);
  const period = m[3]?.toLowerCase();
  if (period === "pm" && hour !== 12) hour += 12;
  if (period === "am" && hour === 12) hour = 0;
  if (hour > 23 || minute > 59) return null;
  return hour * 60 + minute;
}

function fmtMdy(d: Date): string {
  return `${String(d.getMonth() + 1).padStart(2, "0")}/${String(
    d.getDate(),
  ).padStart(2, "0")}/${d.getFullYear()}`;
}

function fmt12h(totalMinutes: number): string {
  const hour24 = Math.floor(totalMinutes / 60) % 24;
  const minute = totalMinutes % 60;
  const period = hour24 >= 12 ? "PM" : "AM";
  const hour = hour24 % 12 || 12;
  return `${hour}:${String(minute).padStart(2, "0")} ${period}`;
}

function dayName(d: Date): string {
  return d.toLocaleDateString("en-US", { weekday: "long" });
}

function bookingFormUrl(d: Date): string {
  const compact = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(
    2,
    "0",
  )}${String(d.getDate()).padStart(2, "0")}`;
  return `${BASE_URL}/interface/main/calendar/add_edit_event.php?date=${compact}`;
}

async function listProviders(page: Page, start: Date): Promise<string[]> {
  await goToUrl({ page, url: bookingFormUrl(start) });
  const [, result] = await runAgent(
    "Report all option labels of the Provider dropdown on this form. Do not change anything on the page.",
    { page, maxSteps: 10, outputModel: providerListSchema },
  );
  if (!result || result.providers.length === 0) {
    throw new Error(
      "Could not read the provider list — the session may not be authenticated.",
    );
  }
  return [...new Set(result.providers.map((p) => p.trim()).filter(Boolean))];
}

async function searchProvider(
  page: Page,
  args: {
    provider: string;
    location?: string;
    durationMinutes?: number;
    start: Date;
  },
): Promise<z.infer<typeof searchResultSchema>> {
  await goToUrl({ page, url: bookingFormUrl(args.start) });
  const [history, result] = await runAgent(
    `Select provider "${args.provider}" from the Provider dropdown` +
      (args.location
        ? `, and facility "${args.location}" from the Facility dropdown`
        : "") +
      (args.durationMinutes
        ? `, and set the duration field to ${args.durationMinutes}`
        : "") +
      '. Then click "Find Available". A window opens already showing available times per ' +
      "day — do not edit anything or click Search in it, just report every listed day and " +
      "its free start times (empty list if it says no openings), plus the selected " +
      "facility label. " +
      "Never book, save, or click a time slot.",
    { page, maxSteps: 40, outputModel: searchResultSchema },
  );
  if (!result) {
    throw new Error(
      `Availability search failed for provider "${
        args.provider
      }": ${history.final_result?.()}`,
    );
  }
  return result;
}

export default async function handler(
  params: Params,
  page: Page,
  context: BrowserContext,
): Promise<Record<string, any>> {
  return withErrorEnvelope({}, () => run(params, page));
}

async function run(params: Params, page: Page): Promise<Record<string, any>> {
  if (!params.start_date || !params.end_date) {
    errorEnvelope(
      "INVALID_INPUT",
      "Both start_date and end_date are required (MM/DD/YYYY).",
    );
  }
  const start = parseMdy(params.start_date);
  if (!start) {
    errorEnvelope(
      "INVALID_INPUT",
      `start_date "${params.start_date}" is not a valid MM/DD/YYYY date.`,
    );
  }
  const end = parseMdy(params.end_date);
  if (!end) {
    errorEnvelope(
      "INVALID_INPUT",
      `end_date "${params.end_date}" is not a valid MM/DD/YYYY date.`,
    );
  }
  if (end.getTime() < start.getTime()) {
    errorEnvelope(
      "INVALID_INPUT",
      `end_date (${params.end_date}) must be on or after start_date (${params.start_date}).`,
    );
  }
  const spanDays = Math.round((end.getTime() - start.getTime()) / 86400000) + 1;
  if (spanDays > MAX_SPAN_DAYS) {
    errorEnvelope(
      "INVALID_INPUT",
      `Date range spans ${spanDays} days; the maximum is ${MAX_SPAN_DAYS} days.`,
      { max_span_days: MAX_SPAN_DAYS },
    );
  }
  const duration = params.duration_minutes ?? 15;
  if (!Number.isInteger(duration) || duration < 5 || duration > 480) {
    errorEnvelope(
      "INVALID_INPUT",
      `duration_minutes must be an integer between 5 and 480 (got ${params.duration_minutes}).`,
    );
  }

  await initGateway();
  await page.setViewportSize({ width: 1280, height: 1600 });

  const targetProviders = params.provider
    ? [params.provider]
    : await listProviders(page, start);

  const items: Record<string, string>[] = [];
  for (const provider of targetProviders) {
    extendTimeout();
    const result = await searchProvider(page, {
      provider,
      location: params.location,
      durationMinutes: params.duration_minutes,
      start,
    });

    if (!result.provider_found) {
      errorEnvelope(
        "PROVIDER_NOT_FOUND",
        `Provider "${provider}" was not found.`,
      );
    }
    if (params.location && !result.facility_found) {
      errorEnvelope(
        "LOCATION_NOT_FOUND",
        `Location "${params.location}" was not found.`,
      );
    }

    for (const day of result.days) {
      const slotDate = parseAgentDate(day.date);
      if (!slotDate || slotDate < start || slotDate > end) continue;
      for (const t of day.times) {
        const startTotal = parseTimeMinutes(t);
        if (startTotal === null) continue;
        items.push({
          date: fmtMdy(slotDate),
          day_of_week: dayName(slotDate),
          start_time: fmt12h(startTotal),
          end_time: fmt12h(startTotal + duration),
          provider,
          location: params.location ?? result.facility_label ?? "",
        });
      }
    }
  }

  items.sort((a, b) => {
    const ka = `${parseMdy(a.date)!.toISOString()}|${a.provider}|${String(
      parseTimeMinutes(a.start_time),
    ).padStart(4, "0")}`;
    const kb = `${parseMdy(b.date)!.toISOString()}|${b.provider}|${String(
      parseTimeMinutes(b.start_time),
    ).padStart(4, "0")}`;
    return ka < kb ? -1 : ka > kb ? 1 : 0;
  });

  validateDataUsingSchema({ data: items, schema: DATA_SCHEMA });
  return { items, totalItems: items.length };
}
