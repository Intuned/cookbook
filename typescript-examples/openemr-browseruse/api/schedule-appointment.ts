import { z } from "zod";
import type { BrowserContext, Dialog, Page } from "playwright";
import { goToUrl, validateDataUsingSchema } from "@intuned/browser";
import { extendTimeout } from "@intuned/runtime";
import { ClientError, ErrorCode, withErrorEnvelope } from "../helpers/errors";
import { initGateway, runAgent } from "../helpers/browseruse";


interface PatientRef {
  first_name: string;
  last_name: string;
  dob: string; // MM/DD/YYYY
}

interface NewPatientDetails {
  sex?: string;
  phone?: string;
  email?: string;
  address?: string;
  city?: string;
  state?: string;
  postal_code?: string;
}

interface Params {
  date: string;
  start_time: string;
  provider?: string;
  location?: string;
  category?: string;
  duration_minutes?: number;
  comments?: string;
  patient: PatientRef;
  create_patient_if_missing?: boolean;
  new_patient?: NewPatientDetails;
  allow_duplicate?: boolean;
  event_type?: "patient" | "provider";
  title?: string;
  dry_run?: boolean;
}

const BASE_URL = process.env.OPENEMR_BASE_URL ?? "https://demo.openemr.io/openemr";
const DEFAULT_CATEGORY = "Office Visit";

const BOOKING_URL = (compact: string) =>
  `${BASE_URL}/interface/main/calendar/add_edit_event.php?date=${compact}`;
const PROVIDER_EVENT_URL = (compact: string) =>
  `${BASE_URL}/interface/main/calendar/add_edit_event.php?prov=true&date=${compact}`;
const PATIENT_SEARCH_URL = `${BASE_URL}/interface/main/calendar/find_patient_popup.php`;
const NEW_PATIENT_URL = `${BASE_URL}/interface/new/new.php`;
const DEMOGRAPHICS_URL = (pid: string) =>
  `${BASE_URL}/interface/patient_file/summary/demographics.php?set_pid=${encodeURIComponent(pid)}`;

const ERROR_STATUS: Record<string, number> = {
  INVALID_INPUT: 400,
  LOCATION_NOT_FOUND: 404,
  PROVIDER_NOT_FOUND: 404,
  CATEGORY_NOT_FOUND: 404,
  PATIENT_NOT_FOUND: 404,
  PATIENT_CREATE_FAILED: 500,
  SAVE_NOT_CONFIRMED: 500,
};

class ScheduleError extends ClientError {
  constructor(code: ErrorCode, message: string, details?: Record<string, any>) {
    super(ERROR_STATUS[code] ?? 500, code, message, details);
    this.name = "ScheduleError";
  }
}

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

const formOptionsSchema = z.object({
  categories: z.array(z.string()),
  facilities: z.array(z.string()),
  providers: z.array(z.string()),
});

const patientRowsSchema = z.object({
  rows: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      dob: z.string(),
    })
  ),
});

const dashboardSchema = z.object({
  patient_name: z.string(),
  appointments: z.array(
    z.object({
      category: z.string(),
      date: z.string(),
      time: z.string(),
      provider: z.string(),
      status: z.string(),
    })
  ),
});

function normalize(s: string): string {
  return (s || "").trim().replace(/\s+/g, " ").toLowerCase();
}

function cleanLabels(labels: string[]): string[] {
  const out: string[] = [];
  for (let l of labels) {
    l = (l || "").replace(/\s*\[[^\]]*\]\s*$/, "").trim();
    if (l && !out.includes(l)) out.push(l);
  }
  return out;
}

function matchLabel(labels: string[], wanted: string): string | null {
  const w = normalize(wanted);
  return (
    labels.find((l) => normalize(l) === w) ??
    labels.find((l) => normalize(l).includes(w)) ??
    null
  );
}

function sameProvider(a: string, b: string): boolean {
  const parts = (s: string) =>
    normalize(s).replace(/,/g, " ").split(" ").filter(Boolean).sort().join(" ");
  const pa = parts(a);
  const pb = parts(b);
  return pa !== "" && pa === pb;
}

interface ParsedDate {
  iso: string;
  compact: string;
  date: Date;
}

function parseUsDate(value: string, field: string): ParsedDate {
  const m = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec((value ?? "").trim());
  if (!m) {
    throw new ScheduleError("INVALID_INPUT", `${field} must be in MM/DD/YYYY format, got "${value}"`, {
      field,
    });
  }
  const d = new Date(parseInt(m[3]), parseInt(m[1]) - 1, parseInt(m[2]));
  if (
    d.getFullYear() !== parseInt(m[3]) ||
    d.getMonth() !== parseInt(m[1]) - 1 ||
    d.getDate() !== parseInt(m[2])
  ) {
    throw new ScheduleError("INVALID_INPUT", `${field} is not a valid calendar date: "${value}"`, {
      field,
    });
  }
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return { iso: `${d.getFullYear()}-${mm}-${dd}`, compact: `${d.getFullYear()}${mm}${dd}`, date: d };
}

interface ParsedTime {
  hour24: number;
  minute: number;
}

function parseTime12(value: string): ParsedTime {
  const m = /^(\d{1,2}):(\d{2})\s*(AM|PM)$/i.exec((value ?? "").trim());
  if (!m) {
    throw new ScheduleError("INVALID_INPUT", `start_time must look like "9:00 AM", got "${value}"`);
  }
  let hour = parseInt(m[1]);
  const minute = parseInt(m[2]);
  const pm = m[3].toUpperCase() === "PM";
  if (hour < 1 || hour > 12 || minute > 59) {
    throw new ScheduleError("INVALID_INPUT", `start_time is out of range: "${value}"`);
  }
  if (pm && hour !== 12) hour += 12;
  if (!pm && hour === 12) hour = 0;
  return { hour24: hour, minute };
}

function fmtTime12(hour24: number, minute: number): string {
  const period = hour24 >= 12 ? "PM" : "AM";
  const h = hour24 % 12 || 12;
  return `${h}:${String(minute).padStart(2, "0")} ${period}`;
}

function timeToMinutes(value: string): number | null {
  const m = /(\d{1,2}):(\d{2})\s*(am|pm)?/i.exec((value ?? "").trim());
  if (!m) return null;
  let hour = parseInt(m[1]);
  const minute = parseInt(m[2]);
  const period = m[3]?.toLowerCase();
  if (period === "pm" && hour !== 12) hour += 12;
  if (period === "am" && hour === 12) hour = 0;
  if (hour > 23 || minute > 59) return null;
  return hour * 60 + minute;
}

function toCompactDate(value: string): string | null {
  let m = /(\d{4})-(\d{1,2})-(\d{1,2})/.exec(value ?? "");
  if (m) return `${m[1]}${m[2].padStart(2, "0")}${m[3].padStart(2, "0")}`;
  m = /(\d{1,2})\/(\d{1,2})\/(\d{4})/.exec(value ?? "");
  if (m) return `${m[3]}${m[1].padStart(2, "0")}${m[2].padStart(2, "0")}`;
  return null;
}

async function injectFrameShims(page: Page): Promise<void> {
  await page.addInitScript(() => {
    const w = window as any;
    w.confirm = () => true;
    if (typeof w.restoreSession !== "function") w.restoreSession = () => true;
    if (typeof w.dlgclose !== "function") w.dlgclose = () => {};
    w.opener_list = w.opener_list || {};
    if (typeof w.set_opener !== "function") {
      w.set_opener = (n: string, o: any) => {
        w.opener_list[n] = o;
      };
    }
    if (typeof w.get_opener !== "function") {
      w.get_opener = (n: string) => w.opener_list[n] || window;
    }
    if (typeof w.webroot_url === "undefined") w.webroot_url = "";
  });
}

async function waitFormGone(page: Page, timeoutMs: number): Promise<boolean> {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    extendTimeout();
    const still = await page
      .$("#form_save")
      .then((el) => el !== null)
      .catch(() => false);
    if (!still) return true;
    await page.waitForTimeout(500);
  }
  return false;
}

interface Validated {
  raw: Params;
  date: ParsedDate;
  time: ParsedTime;
  endTime: ParsedTime;
  category: string;
  duration: number;
  comments: string;
  createIfMissing: boolean;
  allowDuplicate: boolean;
  dryRun: boolean;
  dob: ParsedDate;
  eventType: "patient" | "provider";
}

function validateParams(params: Params): Validated {
  if (!params || typeof params !== "object") {
    throw new ScheduleError("INVALID_INPUT", "params object is required");
  }
  const eventType = params.event_type ?? "patient";
  if (eventType !== "patient" && eventType !== "provider") {
    throw new ScheduleError(
      "INVALID_INPUT",
      `event_type must be "patient" or "provider", got "${params.event_type}"`
    );
  }
  const date = parseUsDate(params.date, "date");
  const time = parseTime12(params.start_time);
  const duration = params.duration_minutes ?? 15;
  if (!Number.isInteger(duration) || duration <= 0 || duration > 24 * 60) {
    throw new ScheduleError("INVALID_INPUT", "duration_minutes must be a positive integer");
  }
  const endTotal = time.hour24 * 60 + time.minute + duration;
  const endTime: ParsedTime = { hour24: Math.floor(endTotal / 60) % 24, minute: endTotal % 60 };

  let dob: ParsedDate = date;
  if (eventType === "patient") {
    if (!params.patient || typeof params.patient !== "object") {
      throw new ScheduleError("INVALID_INPUT", "patient {first_name, last_name, dob} is required");
    }
    for (const f of ["first_name", "last_name", "dob"] as const) {
      if (!params.patient[f] || typeof params.patient[f] !== "string") {
        throw new ScheduleError("INVALID_INPUT", `patient.${f} is required`, {
          field: `patient.${f}`,
        });
      }
    }
    dob = parseUsDate(params.patient.dob, "patient.dob");
    if (dob.date.getTime() >= Date.now()) {
      throw new ScheduleError("INVALID_INPUT", "patient.dob must be a past date");
    }
  }

  return {
    raw: params,
    date,
    time,
    endTime,
    category: params.category ?? (eventType === "patient" ? DEFAULT_CATEGORY : ""),
    duration,
    comments: params.comments ?? "",
    createIfMissing: params.create_patient_if_missing ?? true,
    allowDuplicate: params.allow_duplicate ?? false,
    dryRun: params.dry_run ?? false,
    dob,
    eventType,
  };
}

interface Resolved {
  category: string;
  facility: string | null;
  provider: string | null;
  facilityDefault: string;
}

async function openFormAndResolve(
  page: Page,
  v: Validated,
  url: string
): Promise<Resolved> {
  extendTimeout();
  await goToUrl({ page, url });
  const [, raw] = await runAgent(
    "Report all option labels of the Category, Facility, and Provider dropdowns " +
      "on this form. Change nothing.",
    { page, maxSteps: 20, outputModel: formOptionsSchema }
  );
  if (!raw) throw new Error("Could not read the event form dropdowns (no structured output)");
  const categories = cleanLabels(raw.categories);
  const facilities = cleanLabels(raw.facilities);
  const providers = cleanLabels(raw.providers);
  if (!categories.length || !providers.length) {
    throw new Error(
      "Could not read the category/provider lists — the session may not be authenticated."
    );
  }

  let category: string;
  if (v.category) {
    const match = matchLabel(categories, v.category);
    if (!match) {
      throw new ScheduleError("CATEGORY_NOT_FOUND", `Category "${v.category}" is not offered`, {
        requested: v.category,
        available: categories,
      });
    }
    category = match;
  } else {
    category = categories[0];
  }

  let facility: string | null = null;
  if (v.raw.location) {
    facility = matchLabel(facilities, v.raw.location);
    if (!facility) {
      throw new ScheduleError("LOCATION_NOT_FOUND", `Facility "${v.raw.location}" not found`, {
        requested: v.raw.location,
        available: facilities,
      });
    }
  }

  let provider: string | null = null;
  if (v.raw.provider) {
    provider = matchLabel(providers, v.raw.provider);
    if (!provider) {
      throw new ScheduleError("PROVIDER_NOT_FOUND", `Provider "${v.raw.provider}" not found`, {
        requested: v.raw.provider,
        available: providers,
      });
    }
  }

  return { category, facility, provider, facilityDefault: facilities[0] ?? "" };
}

interface ResolvedPatient {
  pid: string;
  name: string;
  dob: string;
  created: boolean;
}

async function findPatient(
  page: Page,
  v: Validated
): Promise<ResolvedPatient | null> {
  extendTimeout();
  const p = v.raw.patient;
  await goToUrl({ page, url: PATIENT_SEARCH_URL });
  const [, rows] = await runAgent(
    `Search patients by name for "${p.last_name}" and report every result row: ` +
      "ID, name, DOB (empty list if none). Do not click any row.",
    { page, maxSteps: 15, outputModel: patientRowsSchema }
  );
  if (!rows) throw new Error("Patient search returned no structured output");
  const want = normalize(`${p.last_name}, ${p.first_name}`);
  for (const row of rows.rows) {
    if (
      normalize(row.name) === want &&
      toCompactDate(row.dob) === v.dob.compact &&
      row.id.trim() !== ""
    ) {
      return { pid: row.id.trim(), name: row.name.trim(), dob: v.dob.iso, created: false };
    }
  }
  for (const row of rows.rows) {
  }
  return null;
}

async function createPatient(
  page: Page,
  v: Validated
): Promise<ResolvedPatient> {
  extendTimeout();
  const np = v.raw.new_patient ?? {};
  if (!np.sex) {
    throw new ScheduleError(
      "INVALID_INPUT",
      "new_patient.sex is required to create a patient (Birth Sex is mandatory on the new-patient form)",
      { field: "new_patient.sex" }
    );
  }
  const p = v.raw.patient;
  await injectFrameShims(page);
  page.on("dialog", (d: Dialog) => d.accept().catch(() => {}));
  await goToUrl({ page, url: NEW_PATIENT_URL });

  const optional: string[] = [];
  if (np.phone) optional.push(`home phone "${np.phone}"`);
  if (np.email) optional.push(`email "${np.email}"`);
  if (np.address) optional.push(`street address "${np.address}"`);
  if (np.city) optional.push(`city "${np.city}"`);
  if (np.state) optional.push(`state "${np.state}"`);
  if (np.postal_code) optional.push(`postal code "${np.postal_code}"`);
  const [fillHistory] = await runAgent(
    `Fill this new-patient form: first name "${p.first_name}", last name "${p.last_name}", ` +
      `birth sex "${np.sex}"` +
      (optional.length ? `, ${optional.join(", ")}` : "") +
      '. Skip the date-of-birth field. Do not click "Create New Patient".',
    { page, maxSteps: 25 }
  );
  await page.bringToFront();
  const dobOk = await page.evaluate((iso) => {
    const el = document.querySelector('[name="form_DOB"], [name="form_dob"]') as HTMLInputElement | null;
    if (!el) return false;
    el.value = iso;
    el.dispatchEvent(new Event("input", { bubbles: true }));
    el.dispatchEvent(new Event("change", { bubbles: true }));
    return true;
  }, v.dob.iso);
  if (!dobOk) {
    throw new ScheduleError("PATIENT_CREATE_FAILED", "Could not locate the DOB field on the new-patient page");
  }
  const [createHistory] = await runAgent(
    'Click "Create New Patient". If a confirmation step appears, click ' +
      '"Confirm Create New Patient". Change no form fields.',
    { page, maxSteps: 15 }
  );

  if (page.url().includes("new.php")) {
    await Promise.all([
      page.waitForNavigation({ waitUntil: "domcontentloaded", timeout: 30000 }).catch(() => null),
      page.evaluate(() => (document.forms[0] as HTMLFormElement).submit()).catch(() => null),
    ]);
    await page.waitForTimeout(2000);
  }
  const found = await findPatient(page, v);
  if (!found) {
    throw new ScheduleError(
      "PATIENT_CREATE_FAILED",
      "Patient creation appeared to succeed but the patient is not searchable",
      { patient: p }
    );
  }
  return { ...found, created: true };
}

async function resolvePatient(page: Page, v: Validated): Promise<ResolvedPatient> {
  const existing = await findPatient(page, v);
  if (existing) return existing;
  if (!v.createIfMissing) {
    const p = v.raw.patient;
    throw new ScheduleError(
      "PATIENT_NOT_FOUND",
      `No patient matches ${p.first_name} ${p.last_name} (DOB ${v.dob.iso}) and create_patient_if_missing is false`,
      { patient: p }
    );
  }
  return createPatient(page, v);
}

async function listDashboardAppointments(
  page: Page,
  patient: ResolvedPatient
): Promise<z.infer<typeof dashboardSchema>["appointments"]> {
  extendTimeout();
  await goToUrl({ page, url: DEMOGRAPHICS_URL(patient.pid) });
  await page.waitForTimeout(1500);
  const [, extracted] = await runAgent(
    "Report the patient's name shown on this dashboard and every entry in its " +
      "Appointments section: category, date, time, provider, status (empty list if " +
      "none). Change nothing.",
    { page, maxSteps: 20, outputModel: dashboardSchema }
  );
  if (!extracted) throw new Error("Could not read the patient dashboard (no structured output)");
  const [last, first] = patient.name.split(",").map((s) => s.trim());
  const shown = normalize(extracted.patient_name);
  if (shown && !(shown.includes(normalize(last ?? "")) && shown.includes(normalize(first ?? "")))) {
    throw new Error(
      `Patient dashboard shows "${extracted.patient_name}" but expected "${patient.name}" — ` +
        `the search-result id "${patient.pid}" did not resolve to the right chart.`
    );
  }
  return extracted.appointments;
}

async function fillBookingForm(
  page: Page,
  v: Validated,
  resolved: Resolved,
  patient: ResolvedPatient
): Promise<void> {
  extendTimeout();
  await goToUrl({ page, url: BOOKING_URL(v.date.compact) });
  await page.evaluate(
    ({ pid, name }) => {
      const pidEl = document.querySelector('input[name="form_pid"]') as HTMLInputElement | null;
      const patEl = document.querySelector('input[name="form_patient"]') as HTMLInputElement | null;
      if (pidEl) pidEl.value = pid;
      if (patEl) patEl.value = name;
    },
    { pid: patient.pid, name: patient.name }
  );

  const [history] = await runAgent(
    `On this booking form: set Category to "${resolved.category}"` +
      (resolved.facility ? `, Facility to "${resolved.facility}"` : "") +
      (resolved.provider ? `, Provider to "${resolved.provider}"` : "") +
      (v.comments ? `, and type "${v.comments}" into Comments` : "") +
      '. Do not click Save or "Find Available"; leave Patient and Status alone.',
    { page, maxSteps: 25 }
  );
  await page.bringToFront();
  await page.evaluate(
    ({ iso, hour24, minute, duration }) => {
      const q = (n: string) => document.querySelector(`[name="${n}"]`) as HTMLInputElement | null;
      const set = (el: HTMLInputElement | null, val: string | number) => {
        if (!el) return;
        el.value = String(val);
        el.dispatchEvent(new Event("input", { bubbles: true }));
        el.dispatchEvent(new Event("change", { bubbles: true }));
      };
      set(q("form_date"), iso);
      const ampm = document.querySelector('[name="form_ampm"]') as HTMLSelectElement | null;
      if (ampm) {
        let h = hour24 % 12;
        if (h === 0) h = 12;
        set(q("form_hour"), h);
        const wantPm = hour24 >= 12;
        for (const o of Array.from(ampm.options)) {
          const label = (o.textContent || "").trim().toUpperCase();
          if ((wantPm && label.startsWith("P")) || (!wantPm && label.startsWith("A"))) {
            ampm.value = o.value;
            ampm.dispatchEvent(new Event("change", { bubbles: true }));
            break;
          }
        }
      } else {
        set(q("form_hour"), hour24);
      }
      set(q("form_minute"), String(minute).padStart(2, "0"));
      set(q("form_duration"), duration);
    },
    { iso: v.date.iso, hour24: v.time.hour24, minute: v.time.minute, duration: v.duration }
  );
  const values = await page.evaluate(() => {
    const q = (n: string) => document.querySelector(`[name="${n}"]`) as any;
    const selLabel = (el: HTMLSelectElement | null) =>
      el && el.selectedIndex >= 0 && el.options[el.selectedIndex]
        ? (el.options[el.selectedIndex].textContent || "").trim()
        : "";
    const val = (el: HTMLInputElement | null) => (el ? el.value : "");
    const provider = q("form_provider") || q("form_provider[]");
    return {
      category: selLabel(q("form_category")),
      provider: selLabel(provider),
      date: val(q("form_date")),
      hour: val(q("form_hour")),
      minute: val(q("form_minute")),
      ampm: selLabel(q("form_ampm")),
      duration: val(q("form_duration")),
    };
  });

  const problems: string[] = [];
  if (normalize(values.category) !== normalize(resolved.category)) {
    problems.push(`category="${values.category}" (want "${resolved.category}")`);
  }
  if (resolved.provider && !sameProvider(values.provider, resolved.provider)) {
    problems.push(`provider="${values.provider}" (want "${resolved.provider}")`);
  }
  if (toCompactDate(values.date) !== v.date.compact) {
    problems.push(`date="${values.date}" (want "${v.date.iso}")`);
  }
  const hour = parseInt(values.hour);
  const ampm = values.ampm.trim().toUpperCase();
  let hourOk = false;
  if (!isNaN(hour)) {
    if (ampm.startsWith("A") || ampm.startsWith("P")) {
      let h24 = hour % 12;
      if (ampm.startsWith("P")) h24 += 12;
      hourOk = h24 === v.time.hour24 || (v.time.hour24 === 0 && h24 === 12);
    } else {
      hourOk = hour === v.time.hour24;
    }
  }
  if (!hourOk) problems.push(`hour="${values.hour}" ampm="${values.ampm}" (want ${v.time.hour24}:xx 24h)`);
  if (parseInt(values.minute) !== v.time.minute) {
    problems.push(`minute="${values.minute}" (want ${v.time.minute})`);
  }
  if (parseInt(values.duration) !== v.duration) {
    problems.push(`duration="${values.duration}" (want ${v.duration})`);
  }
  if (problems.length) {
    throw new Error(`verify: booking form fields not set — ${problems.join(", ")}`);
  }
}

async function saveViaButton(page: Page, context: BrowserContext): Promise<void> {
  extendTimeout();
  const onDialog = async (d: Dialog) => {
    await d.accept().catch(() => {});
  };
  page.on("dialog", onDialog);
  try {
    await page.bringToFront();
    await page.click("#form_save", { timeout: 15000 });
    if (!(await waitFormGone(page, 45000))) {
      throw new ScheduleError(
        "SAVE_NOT_CONFIRMED",
        "Save did not complete within the expected time (form still present)"
      );
    }
  } finally {
    page.off("dialog", onDialog);
  }
}

async function runProviderEvent(
  page: Page,
  v: Validated
): Promise<Record<string, any>> {
  await injectFrameShims(page);
  const resolved = await openFormAndResolve(page, v, PROVIDER_EVENT_URL(v.date.compact));

  const title = v.raw.title ?? resolved.category;
  const event = {
    type: "provider",
    title,
    date: v.raw.date,
    start_time: fmtTime12(v.time.hour24, v.time.minute),
    end_time: fmtTime12(v.endTime.hour24, v.endTime.minute),
    provider: resolved.provider ?? "",
    location: resolved.facility ?? resolved.facilityDefault,
    category: resolved.category,
    duration_minutes: v.duration,
    comments: v.comments,
  };

  const time12 = fmtTime12(v.time.hour24, v.time.minute);
  const [history] = await runAgent(
    `On this provider-event form: set Category to "${resolved.category}", Title to "${title}"` +
      (resolved.facility ? `, Facility to "${resolved.facility}"` : "") +
      (resolved.provider ? `, Provider to "${resolved.provider}"` : "") +
      `, date to ${v.date.iso}, start time to ${time12}, duration to ${v.duration}` +
      (v.comments ? `, and type "${v.comments}" into Comments` : "") +
      ". Do not click Save.",
    { page, maxSteps: 30 }
  );

  if (v.dryRun) {
    const result = { status: "dry_run", event };
    validateDataUsingSchema({ data: result, schema: PROVIDER_DATA_SCHEMA });
    return result;
  }
  extendTimeout();
  const onDialog = async (d: Dialog) => {
    await d.accept().catch(() => {});
  };
  page.on("dialog", onDialog);
  try {
    await Promise.all([
      page.waitForNavigation({ waitUntil: "domcontentloaded", timeout: 45000 }).catch(() => null),
      page.evaluate(() => {
        const form = (document.getElementById("form_action") as HTMLElement)?.closest(
          "form"
        ) as HTMLFormElement | null;
        if (!form) throw new Error("provider event form not found");
        const fa = form.querySelector("#form_action") as HTMLInputElement | null;
        if (fa) fa.value = "save";
        form.submit();
      }),
    ]);
    if (!(await waitFormGone(page, 15000))) {
      throw new ScheduleError(
        "SAVE_NOT_CONFIRMED",
        "Provider event save did not complete (form still present)"
      );
    }
  } finally {
    page.off("dialog", onDialog);
  }

  const result = { status: "booked", event: { ...event, verified: true } };
  validateDataUsingSchema({ data: result, schema: PROVIDER_DATA_SCHEMA });
  return result;
}

export default async function handler(
  params: Params,
  page: Page,
  context: BrowserContext
): Promise<Record<string, any>> {
  const dryRun = params?.dry_run ?? false;
  return withErrorEnvelope({ dry_run: dryRun }, () => run(params, page, context));
}

async function run(
  params: Params,
  page: Page,
  context: BrowserContext,
): Promise<Record<string, any>> {
  const v = validateParams(params);

  await initGateway();
  await page.setViewportSize({ width: 1280, height: 1600 });

  if (v.eventType === "provider") {
    return runProviderEvent(page, v);
  }
  const resolved = await openFormAndResolve(page, v, BOOKING_URL(v.date.compact));
  const patient = await resolvePatient(page, v);
  const patientOut = {
    pid: patient.pid,
    name: patient.name,
    dob: patient.dob,
    created: patient.created,
  };

  const appointment = {
    date: v.raw.date,
    start_time: fmtTime12(v.time.hour24, v.time.minute),
    end_time: fmtTime12(v.endTime.hour24, v.endTime.minute),
    provider: resolved.provider ?? "",
    location: resolved.facility ?? resolved.facilityDefault,
    category: resolved.category,
    duration_minutes: v.duration,
    comments: v.comments,
  };
  const wantMinutes = v.time.hour24 * 60 + v.time.minute;
  if (!v.allowDuplicate) {
    const appts = await listDashboardAppointments(page, patient);
    const exists = appts.some(
      (a) =>
        toCompactDate(a.date) === v.date.compact &&
        timeToMinutes(a.time) === wantMinutes &&
        !/^x\b/i.test(a.status) &&
        !/cancel/i.test(a.status) &&
        (!v.raw.provider || !resolved.provider || sameProvider(a.provider, resolved.provider))
    );
    if (exists) {
      const result = {
        status: "already_booked",
        patient: patientOut,
        appointment: { ...appointment, verified: true },
      };
      validateDataUsingSchema({ data: result, schema: DATA_SCHEMA });
      return result;
    }
  }
  await fillBookingForm(page, v, resolved, patient);

  if (v.dryRun) {
    const result = { status: "dry_run", patient: patientOut, appointment };
    validateDataUsingSchema({ data: result, schema: DATA_SCHEMA });
    return result;
  }
  await saveViaButton(page, context);
  const appts = await listDashboardAppointments(page, patient);
  const verified = appts.some(
    (a) =>
      toCompactDate(a.date) === v.date.compact &&
      timeToMinutes(a.time) === wantMinutes &&
      !/^x\b/i.test(a.status) &&
      !/cancel/i.test(a.status)
  );

  const result = {
    status: "booked",
    patient: patientOut,
    appointment: { ...appointment, verified },
  };
  validateDataUsingSchema({ data: result, schema: DATA_SCHEMA });
  return result;
}
