import { BrowserContext, Page } from "playwright";
import { goToUrl } from "@intuned/browser";
import { extendTimeout } from "@intuned/runtime";
import { ClientError, ErrorCode, withErrorEnvelope } from "../helpers/errors";
import { initAiFallbackMeta } from "../helpers/ai-fallback";

/**
 * cancel-appointment — cancels or hard-deletes an existing appointment on the
 * OpenEMR demo.
 *
 * Two modes (the `mode` parameter):
 * - "cancel" (default, audit-friendly): opens the event and sets its Status to
 *   "x Canceled", then saves. The appointment stays in the system with
 *   status x — this is what clinics normally do.
 * - "delete" (destructive): presses the event dialog's Delete button. The
 *   event row is removed permanently and leaves no trace.
 *
 * dry_run: when true, the appointment is located and fully identified but the
 * API stops before saving/deleting and returns what it would have done.
 * Default is false — a real mutation.
 *
 * The target appointment is identified by patient (name + DOB) plus
 * date + start_time (+ optional provider). If several appointments match
 * (OpenEMR allows exact double-bookings), the first one is acted on and
 * `matched_count` reports how many matched.
 */
interface PatientRef {
  first_name: string;
  last_name: string;
  /** MM/DD/YYYY */
  dob: string;
}

interface Params {
  /** MM/DD/YYYY appointment date */
  date: string;
  /** e.g. "10:00 AM" */
  start_time: string;
  patient: PatientRef;
  /** Optional provider name for disambiguation (e.g. "Lee, Donna") */
  provider?: string;
  /** "cancel" (default) → status x Canceled; "delete" → remove permanently */
  mode?: "cancel" | "delete";
  /** Default false — a real cancel/delete. Pass true to preview. */
  dry_run?: boolean;
}

/** HTTP-ish status per error code (400 bad input · 404 not found · 500 failure). */
const ERROR_STATUS: Record<string, number> = {
  INVALID_INPUT: 400,
  PATIENT_NOT_FOUND: 404,
  APPOINTMENT_NOT_FOUND: 404,
  ACTION_FAILED: 500,
};

/**
 * Business-outcome error for this API. Extends the shared ClientError so it is
 * recognized as a caller-facing outcome (and passes through the ai-fallback
 * untouched); its `.message` stays a machine-readable JSON envelope. Call sites
 * are unchanged: `new CancelError(code, message, details)`.
 */
class CancelError extends ClientError {
  constructor(code: ErrorCode, message: string, details?: Record<string, any>) {
    super(ERROR_STATUS[code] ?? 500, code, message, details);
    this.name = "CancelError";
  }
}

const BASE = "https://demo.openemr.io/openemr/interface";

// ---------------------------------------------------------------------------
// Parsing helpers
// ---------------------------------------------------------------------------

interface ParsedDate {
  iso: string; // YYYY-MM-DD
  compact: string; // YYYYMMDD
}

function parseUsDate(value: string, field: string): ParsedDate {
  const m = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec((value ?? "").trim());
  if (!m) {
    throw new CancelError("INVALID_INPUT", `${field} must be MM/DD/YYYY, got "${value}"`, {
      field,
      value,
    });
  }
  const month = parseInt(m[1], 10);
  const day = parseInt(m[2], 10);
  const year = parseInt(m[3], 10);
  const dt = new Date(Date.UTC(year, month - 1, day));
  if (dt.getUTCFullYear() !== year || dt.getUTCMonth() !== month - 1 || dt.getUTCDate() !== day) {
    throw new CancelError("INVALID_INPUT", `${field} is not a real date: "${value}"`, {
      field,
      value,
    });
  }
  const mm = String(month).padStart(2, "0");
  const dd = String(day).padStart(2, "0");
  return { iso: `${year}-${mm}-${dd}`, compact: `${year}${mm}${dd}` };
}

/** "10:00 AM" → minutes from midnight */
function parseTime12ToMinutes(value: string): number {
  const m = /^(\d{1,2}):(\d{2})\s*(AM|PM)$/i.exec((value ?? "").trim());
  if (!m) {
    throw new CancelError("INVALID_INPUT", `start_time must look like "10:00 AM", got "${value}"`, {
      field: "start_time",
      value,
    });
  }
  let hour = parseInt(m[1], 10);
  const minute = parseInt(m[2], 10);
  const pm = m[3].toUpperCase() === "PM";
  if (hour < 1 || hour > 12 || minute > 59) {
    throw new CancelError("INVALID_INPUT", `start_time out of range: "${value}"`, {
      field: "start_time",
      value,
    });
  }
  if (pm && hour !== 12) hour += 12;
  if (!pm && hour === 12) hour = 0;
  return hour * 60 + minute;
}

/** Dashboard time is "10:00" (24h) or "10:00 AM" — both → minutes, else null */
function parseDashboardTimeToMinutes(value: string): number | null {
  const m = /(\d{1,2}):(\d{2})\s*(AM|PM)?\s*$/i.exec((value ?? "").trim());
  if (!m) return null;
  let hour = parseInt(m[1], 10);
  const minute = parseInt(m[2], 10);
  const meridiem = m[3]?.toUpperCase();
  if (meridiem === "PM" && hour !== 12) hour += 12;
  if (meridiem === "AM" && hour === 12) hour = 0;
  if (hour > 23 || minute > 59) return null;
  return hour * 60 + minute;
}

function normalize(s: string): string {
  return s.trim().replace(/\s+/g, " ").toLowerCase();
}

/**
 * Provider names appear as "Last, First" in form options but "First Last" on
 * the dashboard — compare as an unordered set of name parts.
 */
function sameProvider(a: string, b: string): boolean {
  const parts = (s: string) =>
    normalize(s)
      .replace(/,/g, " ")
      .split(" ")
      .filter(Boolean)
      .sort()
      .join(" ");
  return parts(a) === parts(b);
}

// ---------------------------------------------------------------------------
// Patient lookup (search popup; rows are pid~LAST~FIRST~dob)
// ---------------------------------------------------------------------------

interface FoundPatient {
  pid: string;
  name: string; // "Last, First"
  dob: string; // YYYY-MM-DD
}

async function findPatient(page: Page, p: PatientRef, dobIso: string): Promise<FoundPatient> {
  extendTimeout();
  await goToUrl({ page, url: `${BASE}/main/calendar/find_patient_popup.php` });
  await page.waitForSelector('input[name="searchparm"]', { timeout: 30000 });
  await page.fill('input[name="searchparm"]', p.last_name);
  await Promise.all([
    page.waitForNavigation({ waitUntil: "domcontentloaded", timeout: 30000 }).catch(() => null),
    page.press('input[name="searchparm"]', "Enter"),
  ]);

  const rows = await page.$$eval("tr.oneresult", (trs) => trs.map((tr) => tr.id || ""));
  for (const id of rows) {
    const parts = id.split("~");
    if (parts.length < 4) continue;
    const [pid, last, first, dob] = parts;
    if (
      normalize(first) === normalize(p.first_name) &&
      normalize(last) === normalize(p.last_name) &&
      dob.trim() === dobIso
    ) {
      return { pid, name: `${last}, ${first}`, dob: dob.trim() };
    }
  }
  throw new CancelError(
    "PATIENT_NOT_FOUND",
    `No patient matches ${p.first_name} ${p.last_name} (DOB ${dobIso})`,
    { patient: p }
  );
}

// ---------------------------------------------------------------------------
// Appointment lookup (dashboard appointment cards; links carry the event id)
// ---------------------------------------------------------------------------

interface FoundAppointment {
  eid: string;
  date: string; // YYYYMMDD from the oldEvt link
  category: string;
  time_text: string; // e.g. "10:00 AM"
  provider: string; // "First Last" as displayed
  status: string; // e.g. "- None" / "x Canceled"
}

/**
 * Reads every appointment entry on the patient dashboard. Each card item
 * contains a link `onclick="return oldEvt('YYYYMMDD', 'eid')"`, the category
 * text, a date/time line, the provider and the status.
 */
async function listDashboardAppointments(page: Page, pid: string): Promise<FoundAppointment[]> {
  extendTimeout();
  await goToUrl({
    page,
    url: `${BASE}/patient_file/summary/demographics.php?set_pid=${encodeURIComponent(pid)}`,
  });
  await page.waitForSelector("body", { timeout: 30000 });
  // The appointment cards load with the page; give late widgets a moment.
  await page.waitForTimeout(1500);

  return page.$$eval('a[onclick*="oldEvt("]', (anchors) => {
    const out: any[] = [];
    for (const a of anchors) {
      const onclick = a.getAttribute("onclick") || "";
      const m = /oldEvt\(\s*['"]?(\d{8})['"]?\s*,\s*['"]?(\d+)['"]?\s*\)/.exec(onclick);
      if (!m) continue;
      const item = a.closest(".list-group-item");
      if (!item) continue;
      const timeEl = item.querySelector("small");
      const spans = item.querySelectorAll("div.text-muted span");
      const clean = (s: string | null | undefined) => (s || "").replace(/\s+/g, " ").trim();
      // small text: "Mon, 2026-07-20 10:00" (24h) or "... 10:00 AM" depending
      // on the install's time_display_format.
      const timeText = clean(timeEl?.textContent);
      const tm = /(\d{1,2}:\d{2})\s*(AM|PM)?\s*$/i.exec(timeText);
      out.push({
        eid: m[2],
        date: m[1],
        category: clean(a.textContent),
        time_text: tm ? `${tm[1]}${tm[2] ? " " + tm[2].toUpperCase() : ""}` : timeText,
        provider: clean(spans[0]?.textContent),
        status: clean(spans[1]?.textContent),
      });
    }
    return out;
  });
}

// ---------------------------------------------------------------------------
// Event dialog actions
// ---------------------------------------------------------------------------

/**
 * Prepares the standalone event page so its Save/Delete work reliably. Injected
 * before the page's own scripts run:
 * - `window.confirm` → always true: OpenEMR's delete path raises a native OS
 *   confirm() ("Deleting this event cannot be undone…") that blocks headless/
 *   automated flows; auto-approving it removes the OS dialog entirely.
 * - the tabs-frameset helpers (top.restoreSession / dlgclose / dlgopen): opened
 *   standalone these are missing, and `top === window`, so defining them on
 *   window keeps the page's init from throwing.
 */
async function injectFramesetShims(page: Page): Promise<void> {
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
 * Submits the event form for a Save or Delete. The standalone page never binds
 * the button click handlers (deleteEvent()/SubmitForm() live in a module scope
 * that only initializes inside OpenEMR's frameset), so we set the hidden
 * form_action and submit the real form element directly — the same POST the
 * buttons would make. Completion is the form navigating away.
 */
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
      // Leave recurr_affect empty. It scopes changes to recurring series;
      // form_repeat is "1" even on non-recurring events, so keying off it would
      // wrongly route a delete into OpenEMR's recurrence-exclusion branch (which
      // only adds an exclusion date and never removes the row). Empty means a
      // real delete for a normal appointment.
      form.submit();
    }, action),
  ]);
  // Let the post-action response settle.
  await page.waitForTimeout(1500);
}

/** Sets the appointment status select to "x Canceled" (by option value). */
async function setStatusCancelled(page: Page): Promise<string> {
  const options = await page.$$eval('select[name="form_apptstatus"] option', (els) =>
    els.map((o) => ({
      value: (o as HTMLOptionElement).value,
      label: (o.textContent || "").replace(/\s+/g, " ").trim(),
    }))
  );
  const cancelOpt =
    options.find((o) => o.value === "x") ??
    options.find((o) => /canceled/i.test(o.label) && !/<\s*24/.test(o.label));
  if (!cancelOpt) {
    throw new CancelError("ACTION_FAILED", 'No "x Canceled" option in the status list', {
      available: options,
    });
  }
  await page.selectOption('select[name="form_apptstatus"]', cancelOpt.value);
  return cancelOpt.label;
}

// ---------------------------------------------------------------------------
// Handler
// ---------------------------------------------------------------------------

export default async function handler(
  params: Params,
  page: Page,
  context: BrowserContext
): Promise<Record<string, any>> {
  // Envelope boundary: a ClientError (business outcome) becomes a
  // `{ success: false, ... }` response (the run SUCCEEDS); a real failure
  // propagates and the run fails. dry_run + ai_fallback ride as envelope meta.
  const dryRun = params?.dry_run ?? false;
  return withErrorEnvelope(
    { dry_run: dryRun, ai_fallback: initAiFallbackMeta() },
    () => run(params, page, context)
  );
}

async function run(
  params: Params,
  page: Page,
  context: BrowserContext
): Promise<Record<string, any>> {
  // ---- Validation --------------------------------------------------------
  if (!params?.patient?.first_name || !params.patient.last_name || !params.patient.dob) {
    throw new CancelError("INVALID_INPUT", "patient {first_name, last_name, dob} is required");
  }
  const date = parseUsDate(params.date, "date");
  const dob = parseUsDate(params.patient.dob, "patient.dob");
  const wantMinutes = parseTime12ToMinutes(params.start_time);
  const mode = params.mode ?? "cancel";
  if (mode !== "cancel" && mode !== "delete") {
    throw new CancelError("INVALID_INPUT", `mode must be "cancel" or "delete", got "${params.mode}"`);
  }
  const dryRun = params.dry_run ?? false;

  // ---- Locate the appointment -------------------------------------------
  const patient = await findPatient(page, params.patient, dob.iso);
  const appointments = await listDashboardAppointments(page, patient.pid);

  const matches = appointments.filter((a) => {
    if (a.date !== date.compact) return false;
    const minutes = parseDashboardTimeToMinutes(a.time_text);
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
        listed_appointments: appointments,
      }
    );
  }

  const target = matches[0];
  const alreadyCancelled = /^x\b|canceled/i.test(target.status);

  const base = {
    patient: { pid: patient.pid, name: patient.name, dob: patient.dob },
    appointment: {
      eid: target.eid,
      date: params.date,
      start_time: params.start_time,
      provider: target.provider,
      category: target.category,
      previous_status: target.status,
    },
    matched_count: matches.length,
  };

  if (mode === "cancel" && alreadyCancelled) {
    return { status: "already_cancelled", ...base, verified: true };
  }

  if (dryRun) {
    return { status: "dry_run", mode, ...base };
  }

  // ---- Act ---------------------------------------------------------------
  // Prepare the standalone page (disable the OS confirm, shim the frameset
  // helpers) BEFORE loading it, then submit the event form directly.
  await injectFramesetShims(page);
  await goToUrl({
    page,
    url: `${BASE}/main/calendar/add_edit_event.php?eid=${encodeURIComponent(target.eid)}&date=${date.iso}`,
  });
  await page.waitForSelector("#form_action", { state: "attached", timeout: 30000 });
  await page.waitForTimeout(1000);

  if (mode === "cancel") {
    await setStatusCancelled(page);
    // The standalone page renders form_date's value corrupted (e.g.
    // "2026--0-7-"); submitting it as-is saves pc_eventDate as 0000-00-00,
    // which drops the event from every date-based view. Rewrite it with the
    // known date before the save.
    await page.evaluate((iso) => {
      const el = document.querySelector('input[name="form_date"]') as HTMLInputElement | null;
      if (el) el.value = iso;
    }, date.iso);
    await driveFormAction(page, "save");
  } else {
    await driveFormAction(page, "delete");
  }

  // ---- Verify ------------------------------------------------------------
  // Re-open the event itself for its authoritative status: a canceled event
  // reloads with status "x"; a deleted event no longer exists, so its form
  // reloads as a blank new event (empty patient). For cancel, additionally
  // require the event to still be listed on the dashboard at the requested
  // date — a save that mangles pc_eventDate keeps status "x" but drops the
  // event from every date-based view, which a by-eid check alone misses.
  const reopened = await reopenEvent(page, target.eid, date.iso);
  let verified: boolean;
  if (mode === "cancel") {
    const stillListed = (await listDashboardAppointments(page, patient.pid)).some(
      (a) => a.eid === target.eid && a.date === date.compact
    );
    verified = reopened.exists && reopened.status === "x" && stillListed;
  } else {
    verified = !reopened.exists;
  }

  // Cosmetic: after verifying, leave the browser on the patient's chart (renders
  // cleanly standalone) rather than the bare "An error has occurred." page that
  // add_edit_event.php shows for a just-deleted event. Best-effort only.
  await goToUrl({
    page,
    url: `${BASE}/patient_file/summary/demographics.php?set_pid=${encodeURIComponent(patient.pid)}`,
  }).catch(() => {});

  return {
    status: mode === "cancel" ? "cancelled" : "deleted",
    ...base,
    verified,
  };
}

/**
 * Re-opens an event's form to read its authoritative state. `exists` is false
 * when the eid no longer maps to an appointment (the form loads blank, with no
 * patient bound) — i.e. it was deleted.
 */
async function reopenEvent(
  page: Page,
  eid: string,
  dateIso: string
): Promise<{ exists: boolean; status: string }> {
  extendTimeout();
  await goToUrl({
    page,
    url: `${BASE}/main/calendar/add_edit_event.php?eid=${encodeURIComponent(eid)}&date=${dateIso}`,
  });
  await page.waitForSelector("#form_action", { state: "attached", timeout: 30000 }).catch(() => {});
  return page.evaluate(() => {
    const pid = (document.querySelector('input[name="form_pid"]') as HTMLInputElement | null)?.value ?? "";
    const status =
      (document.querySelector('select[name="form_apptstatus"]') as HTMLSelectElement | null)?.value ?? "";
    return { exists: pid.trim() !== "", status };
  });
}
