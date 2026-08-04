import { z } from "zod";
import type { BrowserContext, Page } from "playwright";
import { goToUrl, validateDataUsingSchema } from "@intuned/browser";
import { extendTimeout } from "@intuned/runtime";
import { ClientError, ErrorCode, withErrorEnvelope } from "../helpers/errors";
import { initGateway, runAgent } from "../helpers/browseruse";


interface PatientRef {
  first_name: string;
  last_name: string;
  dob: string;
}

interface Params {
  date: string;
  start_time: string;
  patient: PatientRef;
  provider?: string;
  mode?: "cancel" | "delete";
  dry_run?: boolean;
}

const BASE_URL = process.env.OPENEMR_BASE_URL ?? "https://demo.openemr.io/openemr";
const PATIENT_SEARCH_URL = `${BASE_URL}/interface/main/calendar/find_patient_popup.php`;
const DEMOGRAPHICS_URL = (pid: string) =>
  `${BASE_URL}/interface/patient_file/summary/demographics.php?set_pid=${encodeURIComponent(pid)}`;
const EVENT_URL = (eid: string, dateIso: string) =>
  `${BASE_URL}/interface/main/calendar/add_edit_event.php?eid=${encodeURIComponent(eid)}&date=${dateIso}`;

const ERROR_STATUS: Record<string, number> = {
  INVALID_INPUT: 400,
  PATIENT_NOT_FOUND: 404,
  APPOINTMENT_NOT_FOUND: 404,
  ACTION_FAILED: 500,
};

class CancelError extends ClientError {
  constructor(code: ErrorCode, message: string, details?: Record<string, any>) {
    super(ERROR_STATUS[code] ?? 500, code, message, details);
    this.name = "CancelError";
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
      },
      required: ["pid", "name", "dob"],
    },
    appointment: {
      type: "object",
      properties: {
        date: { type: "string" },
        start_time: { type: "string" },
        provider: { type: "string" },
        category: { type: "string" },
        previous_status: { type: "string" },
      },
      required: ["date", "start_time", "provider", "category", "previous_status"],
    },
    matched_count: { type: "integer" },
  },
  required: ["status", "patient", "appointment", "matched_count"],
};

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
  return (s ?? "").trim().replace(/\s+/g, " ").toLowerCase();
}

function sameProvider(a: string, b: string): boolean {
  const parts = (s: string) =>
    normalize(s).replace(/,/g, " ").split(" ").filter(Boolean).sort().join(" ");
  const pa = parts(a);
  const pb = parts(b);
  return pa !== "" && pa === pb;
}

function parseUsDate(value: string, field: string): { iso: string; compact: string } {
  const m = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec((value ?? "").trim());
  if (!m) {
    throw new CancelError("INVALID_INPUT", `${field} must be MM/DD/YYYY, got "${value}"`, { field });
  }
  const d = new Date(parseInt(m[3]), parseInt(m[1]) - 1, parseInt(m[2]));
  if (
    d.getFullYear() !== parseInt(m[3]) ||
    d.getMonth() !== parseInt(m[1]) - 1 ||
    d.getDate() !== parseInt(m[2])
  ) {
    throw new CancelError("INVALID_INPUT", `${field} is not a real date: "${value}"`, { field });
  }
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return { iso: `${d.getFullYear()}-${mm}-${dd}`, compact: `${d.getFullYear()}${mm}${dd}` };
}

function parseTime12Minutes(value: string): number {
  const m = /^(\d{1,2}):(\d{2})\s*(AM|PM)$/i.exec((value ?? "").trim());
  if (!m) {
    throw new CancelError("INVALID_INPUT", `start_time must look like "10:00 AM", got "${value}"`);
  }
  let hour = parseInt(m[1]);
  const minute = parseInt(m[2]);
  const pm = m[3].toUpperCase() === "PM";
  if (hour < 1 || hour > 12 || minute > 59) {
    throw new CancelError("INVALID_INPUT", `start_time out of range: "${value}"`);
  }
  if (pm && hour !== 12) hour += 12;
  if (!pm && hour === 12) hour = 0;
  return hour * 60 + minute;
}

function timeToMinutes(value: string): number | null {
  const m = /(\d{1,2}):(\d{2})\s*(am|pm)?\s*$/i.exec((value ?? "").trim());
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

function fmtTime12(minutes: number): string {
  const hour24 = Math.floor(minutes / 60);
  const minute = minutes % 60;
  const period = hour24 >= 12 ? "PM" : "AM";
  const hour = hour24 % 12 || 12;
  return `${hour}:${String(minute).padStart(2, "0")} ${period}`;
}

async function applyNavigationDlgopen(page: Page): Promise<void> {
  await page.evaluate(() => {
    const w = window as any;
    w.confirm = () => true;
    if (typeof w.restoreSession !== "function") w.restoreSession = () => true;
    w.dlgopen = (url: string) => {
      window.location.assign(url);
    };
  });
}

async function driveFormAction(page: Page, action: "save" | "delete"): Promise<void> {
  await Promise.all([
    page.waitForNavigation({ waitUntil: "domcontentloaded", timeout: 30000 }).catch(() => null),
    page.evaluate((act) => {
      const form = (document.getElementById("form_action") as HTMLElement)?.closest(
        "form"
      ) as HTMLFormElement | null;
      if (!form) throw new Error("event form not found");
      const fa = form.querySelector("#form_action") as HTMLInputElement | null;
      if (fa) fa.value = act;
      form.submit();
    }, action),
  ]);
  await page.waitForTimeout(1500);
}

async function readEventState(
  page: Page,
  eid: string,
  dateIso: string
): Promise<{ exists: boolean; statusLabel: string }> {
  extendTimeout();
  await goToUrl({ page, url: EVENT_URL(eid, dateIso) });
  await page.waitForTimeout(1000);
  return page.evaluate(() => {
    const pid =
      (document.querySelector('input[name="form_pid"]') as HTMLInputElement | null)?.value ?? "";
    const sel = document.querySelector(
      'select[name="form_apptstatus"]'
    ) as HTMLSelectElement | null;
    const statusLabel =
      sel && sel.selectedIndex >= 0 && sel.options[sel.selectedIndex]
        ? (sel.options[sel.selectedIndex].textContent || "").trim()
        : "";
    return { exists: pid.trim() !== "", statusLabel };
  });
}

interface FoundPatient {
  pid: string;
  name: string;
  dob: string;
}

async function findPatient(
  page: Page,
  p: PatientRef,
  dob: { iso: string; compact: string }
): Promise<FoundPatient> {
  extendTimeout();
  await goToUrl({ page, url: PATIENT_SEARCH_URL });
  const [, rows] = await runAgent(
    `Search patients by name for "${p.last_name}" and report every result row: ` +
      "ID, name, DOB (empty list if none). Do not click any row.",
    { page, maxSteps: 15, outputModel: patientRowsSchema }
  );
  if (!rows) throw new Error("Patient search returned no structured output");
  const want = normalize(`${p.last_name}, ${p.first_name}`);
  for (const row of rows.rows) {
    if (normalize(row.name) === want && toCompactDate(row.dob) === dob.compact && row.id.trim()) {
      return { pid: row.id.trim(), name: row.name.trim(), dob: dob.iso };
    }
  }
  throw new CancelError(
    "PATIENT_NOT_FOUND",
    `No patient matches ${p.first_name} ${p.last_name} (DOB ${dob.iso})`,
    { patient: p }
  );
}

async function listDashboardAppointments(
  page: Page,
  patient: FoundPatient
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
      `Patient dashboard shows "${extracted.patient_name}" but expected "${patient.name}".`
    );
  }
  return extracted.appointments;
}

async function openTargetEvent(
  page: Page,
  patient: FoundPatient,
  args: { dateIso: string; time12: string; provider?: string }
): Promise<string> {
  extendTimeout();
  await goToUrl({ page, url: DEMOGRAPHICS_URL(patient.pid) });
  await page.waitForTimeout(1500);
  await applyNavigationDlgopen(page);

  const [history] = await runAgent(
    `In the Appointments section, click the appointment on ${args.dateIso} at ${args.time12}` +
      (args.provider ? ` with ${args.provider}` : "") +
      " to open it. Change nothing else.",
    { page, maxSteps: 15 }
  );

  const deadline = Date.now() + 15000;
  while (Date.now() < deadline && !page.url().includes("add_edit_event.php")) {
    await page.waitForTimeout(500);
  }
  const m = /[?&]eid=(\d+)/.exec(page.url());
  if (!m) {
    throw new CancelError(
      "ACTION_FAILED",
      `Clicking the appointment did not open its event form (landed on ${page.url()})`
    );
  }
  await page.waitForSelector("#form_action", { state: "attached", timeout: 30000 }).catch(() => {});
  await page.waitForTimeout(1000);
  return m[1];
}

export default async function handler(
  params: Params,
  page: Page,
  context: BrowserContext
): Promise<Record<string, any>> {
  const dryRun = params?.dry_run ?? false;
  return withErrorEnvelope({ dry_run: dryRun }, () => run(params, page));
}

async function run(params: Params, page: Page): Promise<Record<string, any>> {
  const p = params?.patient ?? ({} as PatientRef);
  if (!p.first_name || !p.last_name || !p.dob) {
    throw new CancelError("INVALID_INPUT", "patient {first_name, last_name, dob} is required");
  }
  const date = parseUsDate(params.date, "date");
  const dob = parseUsDate(p.dob, "patient.dob");
  const wantMinutes = parseTime12Minutes(params.start_time);
  const mode = params.mode ?? "cancel";
  if (mode !== "cancel" && mode !== "delete") {
    throw new CancelError("INVALID_INPUT", `mode must be "cancel" or "delete", got "${params.mode}"`);
  }
  const dryRun = params.dry_run ?? false;
  const time12 = fmtTime12(wantMinutes);

  await initGateway();
  await page.setViewportSize({ width: 1280, height: 1600 });
  const patient = await findPatient(page, p, dob);
  const appointments = await listDashboardAppointments(page, patient);

  const matches = appointments.filter((a) => {
    if (toCompactDate(a.date) !== date.compact) return false;
    const minutes = timeToMinutes(a.time);
    if (minutes === null || minutes !== wantMinutes) return false;
    if (params.provider && !sameProvider(a.provider, params.provider)) return false;
    return true;
  });

  if (matches.length === 0) {
    throw new CancelError(
      "APPOINTMENT_NOT_FOUND",
      `No appointment for ${patient.name} on ${params.date} at ${params.start_time}` +
        (params.provider ? ` with ${params.provider}` : ""),
      {
        patient: { pid: patient.pid, name: patient.name },
        listed_appointments: matches.length === 0 ? appointments : undefined,
      }
    );
  }

  const target = matches[0];
  const alreadyCancelled = /^x\b/i.test(target.status) || /cancel/i.test(target.status);

  const base = {
    patient,
    appointment: {
      date: params.date,
      start_time: params.start_time,
      provider: target.provider,
      category: target.category,
      previous_status: target.status,
    },
    matched_count: matches.length,
  };

  if (mode === "cancel" && alreadyCancelled) {
    const result = { status: "already_cancelled", ...base, verified: true };
    validateDataUsingSchema({ data: result, schema: DATA_SCHEMA });
    return result;
  }

  if (dryRun) {
    const result = { status: "dry_run", mode, ...base };
    validateDataUsingSchema({ data: result, schema: DATA_SCHEMA });
    return result;
  }
  const eid = await openTargetEvent(page, patient, {
    dateIso: date.iso,
    time12,
    provider: params.provider,
  });

  if (mode === "cancel") {
    await page.bringToFront();
    const options = await page.$$eval('select[name="form_apptstatus"] option', (els) =>
      els.map((o) => ({
        value: (o as HTMLOptionElement).value,
        label: (o.textContent || "").replace(/\s+/g, " ").trim(),
      }))
    );
    const cancelOpt =
      options.find((o) => o.value === "x") ??
      options.find((o) => /cancel/i.test(o.label) && !/<\s*24/.test(o.label));
    if (!cancelOpt) {
      throw new CancelError("ACTION_FAILED", 'No "x Canceled" option in the status list', {
        available: options,
      });
    }
    await page.selectOption('select[name="form_apptstatus"]', cancelOpt.value);
    await page.evaluate((iso) => {
      const el = document.querySelector('input[name="form_date"]') as HTMLInputElement | null;
      if (el) el.value = iso;
    }, date.iso);
    await driveFormAction(page, "save");
  } else {
    await driveFormAction(page, "delete");
  }
  const reopened = await readEventState(page, eid, date.iso);
  let verified: boolean;
  if (mode === "cancel") {
    const stillListed = (await listDashboardAppointments(page, patient)).some(
      (a) =>
        toCompactDate(a.date) === date.compact &&
        timeToMinutes(a.time) === wantMinutes &&
        /cancel/i.test(a.status)
    );
    verified = reopened.exists && /cancel/i.test(reopened.statusLabel) && stillListed;
  } else {
    verified = !reopened.exists;
  }

  await goToUrl({ page, url: DEMOGRAPHICS_URL(patient.pid) }).catch(() => {});

  const result = {
    status: mode === "cancel" ? "cancelled" : "deleted",
    ...base,
    appointment: { ...base.appointment, eid },
    verified,
  };
  validateDataUsingSchema({ data: result, schema: DATA_SCHEMA });
  return result;
}
