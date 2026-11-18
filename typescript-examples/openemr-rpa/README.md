# OpenEMR Appointments Automation

Automates the OpenEMR demo scheduling flow: querying free slots, booking
appointments (find-or-create patient), and cancelling/deleting booked
appointments — all logged in via a managed auth session.

**Target**: `https://demo.openemr.io/openemr`

⚠️ The demo is **public and resets daily** — never enter real personal data, and
never rely on patients or appointments created on a previous day.

## Error model (all APIs)

There are two error paths, mirroring the shared `helpers/errors.ts`:

1. **Business outcomes** (`ClientError`) — outcomes the caller can read and act
   on: bad input, a value that matches no site option, patient/appointment not
   found. Each carries a machine-readable JSON envelope
   (`{"error":{code,message,details}}`) and a `status`. Status conventions:
   **400** malformed input · **404** referenced thing doesn't exist · **409**
   conflict/ambiguity · **500** automation failure.
2. **Real failures** (plain `Error`) — an actual break: a selector broke, a
   popup never opened, a Playwright `TimeoutError`, a save that didn't confirm.
   These are the ONLY errors the AI fallback (below) will try to rescue.

`schedule-appointment` and `cancel-appointment` **throw** their `ClientError`
(the run fails with the JSON envelope as the message). `get-available-slots`
**returns** its errors inline as `{ "error": { code, message, details } }`
instead of throwing. The shared `okEnvelope` / `errorEnvelope` /
`withErrorEnvelope` helpers are available in `helpers/errors.ts` for wrapping an
API boundary when a `{ success, status, result }` envelope is wanted.

## AI fallback (`helpers/ai-fallback.ts`)

A risky deterministic step can be wrapped in an AI computer-use fallback: when
the step fails with a REAL error (broken selector, timeout, overlay
interception — never a business `ClientError`), a
[Stagehand](https://github.com/browserbase/stagehand) agent performs the same
step on the live page over CDP, then an independent check re-verifies the result
(code does the asserting, never the agent's own word) before the run continues.

**Current coverage**: the helper and its full test suite are in place; it is
**not yet wired into the scheduling APIs' steps**. Its behavior is proven end to
end by the sandbox test suite (`api/ai-fallback-test`, see below).

Every invocation is recorded in the attempt's `ai_fallback` meta so a caller can
see whether/where/why the AI was needed:

```jsonc
"ai_fallback": {
  "used": false,             // true when at least one fallback invocation ran
  "invocations": [           // one entry PER invocation, in order
    {
      "step": "fill_booking_form",                 // machine name of the wrapped step
      "where": "fillBookingForm (add_edit_event.php)",
      "trigger_error": {                            // the error that triggered the fallback
        "name": "TimeoutError",
        "message": "page.fill: Timeout 3000ms exceeded. ..." // 500-char cap
      },
      "instruction": "Type 'Doe' into the 'Last Name' field.", // what the agent was told to do
      "outcome": "success",                         // "success" | "failed"
      "agent_summary": "Filled the Last Name field ...",       // the agent's own report (informational)
      "duration_ms": 4213,
      "dry_run_safe": true,   // the prompt forbade the flow's committing buttons
      "verified": "deterministic" // "deterministic" | "ai_extract" | false — how success was confirmed
    }
  ]
}
```

Semantics:

- `used: false, invocations: []` — the AI was never needed (the normal case).
- `used: true` — one or more steps were rescued by the AI;
  `invocations[i].trigger_error` says which selector/step broke (a signal to fix
  it).
- The AI is never allowed to "fix" business outcomes (missing patient, taken
  slot), never chooses WHAT to act on, and on dry runs is prompt-forbidden from
  clicking the flow's final committing buttons (Save / Confirm / Delete / Create
  New Patient). Verification never trusts the agent's own success report.
- If a fallback itself fails, the ORIGINAL error is rethrown and the run FAILS;
  the invocation entries are in the run logs (`[ai-fallback] FAILED {...}` warn
  lines).

The fallback uses the Intuned AI gateway (`getAiGatewayConfig`) and attaches to
the attempt's own authenticated browser via `hooks/setupContext.ts` (which
stores the CDP URL). Platform AI is not available in local CLI runs, so the AI
tiers only run when deployed (or with a workspace BYOK key).

---

## get-available-slots

Read-only. Lists free appointment slots per provider between two dates, using
the site's own "Find Available" feature so results match what staff see.

| Parameter        | Type   | Required | Description                                                         |
| ---------------- | ------ | -------- | ------------------------------------------------------------------- |
| start_date       | string | yes      | Range start, MM/DD/YYYY                                             |
| end_date         | string | yes      | Range end, MM/DD/YYYY — **at most 14 days** after start (inclusive) |
| location         | string | no       | Facility name (e.g. "Great Clinic"); omit for all facilities        |
| provider         | string | no       | Provider name ("Last, First"); omit for all providers               |
| duration_minutes | number | no       | Slot length, default 15                                             |

**`result` shape:**

```jsonc
{
  "items": [
    {
      "date": "07/20/2026",
      "day_of_week": "Monday",
      "start_time": "9:00 AM",
      "end_time": "9:15 AM",
      "provider": "Lee, Donna",
      "location": "Great Clinic",
    },
  ],
  "totalItems": 1,
}
```

**Errors** (returned inline as `{ "error": { code, message, details } }`):

| status | code                 | when                                                                                                    |
| ------ | -------------------- | ------------------------------------------------------------------------------------------------------- |
| 400    | `INVALID_INPUT`      | date not MM/DD/YYYY, not a real date, end before start, or range over 14 days (`details.max_span_days`) |
| 404    | `LOCATION_NOT_FOUND` | named facility doesn't exist (`details.available` lists all)                                            |
| 404    | `PROVIDER_NOT_FOUND` | named provider doesn't exist (`details.available` lists all)                                            |

---

## schedule-appointment

Books an appointment: find-or-create the patient, fill the booking form, save,
and verify the appointment on the patient's dashboard. Can also book a
**provider (non-patient) event** — see [Provider events](#provider-events) below.

| Parameter                 | Type    | Required                            | Description                                                                                                                                                                                                                                              |
| ------------------------- | ------- | ----------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| event_type                | string  | no (default **"patient"**)          | `"patient"` books a patient appointment. `"provider"` books a provider event on the Provider tab (In Office / Out Of Office / Vacation / Lunch / Reserved) — `patient` is then ignored. See [Provider events](#provider-events).                         |
| dry_run                   | boolean | no (default **false**)              | false = real booking. true = fill everything but STOP before Save and return the would-be submission.                                                                                                                                                    |
| date                      | string  | yes                                 | MM/DD/YYYY (e.g. "07/20/2026")                                                                                                                                                                                                                           |
| start_time                | string  | yes                                 | e.g. "10:00 AM"                                                                                                                                                                                                                                          |
| patient                   | object  | yes for patient events              | `first_name`, `last_name`, `dob` (MM/DD/YYYY) — matched by name + DOB. OpenEMR displays names "Last, First". Ignored for `event_type: "provider"`.                                                                                                       |
| provider                  | string  | no                                  | Default: the form's default provider (the logged-in physician)                                                                                                                                                                                           |
| location                  | string  | no                                  | Facility name, validated                                                                                                                                                                                                                                 |
| category                  | string  | no                                  | Patient events: visit category, default "Office Visit". Provider events: event category (In Office / Lunch / …), default = the form's pre-selected one.                                                                                                  |
| title                     | string  | no                                  | Provider events only — event title, defaults to the category label (e.g. "In Office").                                                                                                                                                                   |
| duration_minutes          | number  | no                                  | Default 15                                                                                                                                                                                                                                               |
| comments                  | string  | no                                  | Free text                                                                                                                                                                                                                                                |
| create_patient_if_missing | boolean | no (default **true**)               | Patient events only. When the patient must be created, `new_patient.sex` is required (`new_patient` also takes phone/email/address/…). `false` makes a missing patient a `PATIENT_NOT_FOUND`.                                                            |
| allow_duplicate           | boolean | no (default **false** = idempotent) | Patient events only. Before saving, checks the patient's dashboard for an appointment at the same date/time (and provider, when given). If one exists, returns `already_booked` with that `eid` and does NOT create a second. `true` bypasses the check. |

**`result` shape:**

```jsonc
{
  "status": "booked", // "booked" | "already_booked" | "dry_run"
  "patient": {
    "pid": "190",
    "name": "Vale, Nora",
    "dob": "1990-04-11",
    "created": false, // true when this run created the patient
  },
  "appointment": {
    "date": "07/20/2026",
    "start_time": "10:00 AM",
    "end_time": "10:15 AM",
    "provider": "Lee, Donna",
    "location": "Great Clinic",
    "category": "Office Visit",
    "duration_minutes": 15,
    "comments": "",
    "verified": true, // "booked" runs — confirmed on the dashboard
    "eid": "190", // "already_booked" runs — the existing event id
  },
}
```

Re-running an identical call is safe: the second run returns `already_booked`
(carrying the existing `eid`) instead of double-booking. This demo does **not**
enforce double-booking itself — saving into a taken slot just overlaps silently
— so `allow_duplicate` is the only guard.

### Provider events

With `event_type: "provider"` the API books a **non-patient** event on the
calendar's Provider tab (`add_edit_event.php?prov=true`). It's the simpler path:
no patient, no find-or-create, and no idempotency guard — it resolves the
category/facility/provider, fills the tab, and saves. The provider-event
categories (In Office / Out Of Office / Vacation / Lunch / Reserved) are read
live from the form and differ from the patient visit categories.

`verified: true` means the save posted (the server returned its close-window
page, which it only does after writing the event row). The `result` has an
`event` object instead of `patient` + `appointment`:

```jsonc
{
  "status": "booked", // "booked" | "dry_run"
  "event": {
    "type": "provider",
    "title": "Lunch",
    "date": "07/20/2026",
    "start_time": "12:00 PM",
    "end_time": "12:30 PM",
    "provider": "Lee, Donna",
    "location": "Great Clinic",
    "category": "Lunch",
    "duration_minutes": 30,
    "comments": "Lunch break",
    "verified": true, // "booked" runs — the save posted
  },
}
```

Sample params: `provider-event.json` (dry-run In Office) and
`provider-event-real.json` (real Lunch). Provider events can't be removed by
`cancel-appointment` (that API is patient-keyed); rely on the demo's daily reset.

**Error codes** (thrown as `ClientError`):

| status | code                    | when                                                                                     |
| ------ | ----------------------- | ---------------------------------------------------------------------------------------- |
| 400    | `INVALID_INPUT`         | bad date/time format, DOB not in the past, bad duration, or a missing booking-form field |
| 404    | `LOCATION_NOT_FOUND`    | facility not on the booking form (`details.available`)                                   |
| 404    | `PROVIDER_NOT_FOUND`    | provider not on the booking form (`details.available`)                                   |
| 404    | `CATEGORY_NOT_FOUND`    | visit category not offered (`details.available`)                                         |
| 404    | `PATIENT_NOT_FOUND`     | no name+DOB match and `create_patient_if_missing: false`                                 |
| 500    | `PATIENT_CREATE_FAILED` | patient creation didn't produce a searchable patient                                     |
| 500    | `SAVE_NOT_CONFIRMED`    | Save didn't complete (button missing or form never posted)                               |

---

## cancel-appointment

Cancels or hard-deletes an appointment. Finds it via the patient's dashboard,
acts on it, then re-opens the event to verify.

| Parameter  | Type    | Required               | Description                                                                                  |
| ---------- | ------- | ---------------------- | -------------------------------------------------------------------------------------------- |
| dry_run    | boolean | no (default **false**) | false = real mutation. true = locate + identify only, stop before acting.                    |
| date       | string  | yes                    | MM/DD/YYYY                                                                                   |
| start_time | string  | yes                    | e.g. "10:00 AM"                                                                              |
| patient    | object  | yes                    | `first_name`, `last_name`, `dob` — matched by name + DOB                                     |
| provider   | string  | no                     | Disambiguate when several appointments share the slot                                        |
| mode       | string  | no                     | `"cancel"` (default) → status **x Canceled**, keeps history; `"delete"` → remove permanently |

**`result` shape:**

```jsonc
{
  "status": "cancelled", // "cancelled" | "deleted" | "dry_run" | "already_cancelled"
  "patient": { "pid": "25", "name": "Winters, Maya" },
  "appointment": { "eid": "90", "previous_status": "- None" },
  "matched_count": 1, // how many appointments matched the slot
  "verified": true, // re-opened the event to confirm the change
}
```

`cancel-appointment` is idempotent: a second run returns `already_cancelled`, or
`APPOINTMENT_NOT_FOUND` after a delete.

**Error codes** (thrown as `ClientError`):

| status | code                    | when                                             |
| ------ | ----------------------- | ------------------------------------------------ |
| 400    | `INVALID_INPUT`         | missing/badly-formatted date/time/patient        |
| 404    | `PATIENT_NOT_FOUND`     | no name+DOB match                                |
| 404    | `APPOINTMENT_NOT_FOUND` | no appointment at that date/time for the patient |
| 500    | `ACTION_FAILED`         | the cancel/delete didn't verify                  |

Note: the event dialog (`add_edit_event.php`) is built to run inside OpenEMR's
tabs frameset. Opened standalone, its inline script never binds the Save/Delete
handlers and raises an OS `confirm()` on delete. The API prepares the page before
load (auto-approving `confirm`, shimming the `top.*` frame helpers), then submits
the event form directly (`form_action=save`/`delete`). `recurr_affect` is left
empty — OpenEMR renders `form_repeat="1"` even on non-recurring events, so keying
off it would misroute a delete into the recurrence-exclusion branch.

---

## ai-fallback-test (internal)

Runs the ai-fallback scenario suite (T1–T12) against the Intuned sandbox
(`sandbox.intuned.dev/steps-form/ShippingAddress`) — **never** the OpenEMR demo.
Proves the helper's behavior with a real browser + real AI agent: business
outcomes pass through untouched, real failures trigger the AI, dry-run commit
guards hold, verification stays deterministic, and the helper fails open.

| Parameter | Type   | Required | Description                                                            |
| --------- | ------ | -------- | ---------------------------------------------------------------------- |
| which     | string | no       | A single test id ("T3"), a tier ("tier0".."tier3"), or "all" (default) |

Tier 0 (T1, T2) invokes no AI; tiers 1–3 drive a Stagehand agent (real gateway
tokens, so they only run deployed or with a BYOK key).

---

## Running locally

```bash
export MODE=generate_code

intunedctl dev attempt api get-available-slots  .parameters/api/get-available-slots/default.json  --auth-session default
intunedctl dev attempt api schedule-appointment .parameters/api/schedule-appointment/default.json --auth-session default
intunedctl dev attempt api cancel-appointment   .parameters/api/cancel-appointment/default.json   --auth-session default
intunedctl dev attempt api ai-fallback-test     .parameters/api/ai-fallback-test/tier0.json       --auth-session default
```

> Any params file **without** `"dry_run": true` performs a real mutation on the
> site. Files ending in `-real.json` always do. See `USAGE.md` for every sample
> params file and its expected result.

## Authentication

Login is fully parameterized (`username` / `password`) — any OpenEMR role works.
Credential files live at `.parameters/auth-sessions/create/{default,staff,receptionist}.json`
(fill them yourself; never committed or echoed). `auth-sessions/create.ts` logs
in; `auth-sessions/check.ts` validates via the Message Center page (`main.php`
can't be used — it needs a one-time token). The local session expires (~1 day);
refresh with:

```bash
intunedctl dev attempt authsession create .parameters/auth-sessions/create/default.json --id default
```
