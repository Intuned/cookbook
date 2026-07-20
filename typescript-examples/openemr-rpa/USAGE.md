# OpenEMR Appointments — Usage

Browser automation for the OpenEMR demo (`demo.openemr.io`). You log in once
(creates an auth session), then run the APIs against that session.

- The demo **resets every day** — patients and appointments from yesterday are gone.
- Replace `<name>` below with the auth-session name you created (examples use `default`).
- Any params file with `"dry_run": true` only previews — it changes nothing on the site.
  Files with `"dry_run": false` (and the `-real` files) **make real changes**.

---

## Step 1 — Create an auth session (log in)

```bash
intunedctl dev attempt authsession create .parameters/auth-sessions/create/default.json --id default
```
> **Expected:** `✔ Auth session created`. You now have a logged-in session named `default`.
> Run this again any time an API says the session is invalid (the demo resets daily).

Other login files you can use instead of `default.json`:
```bash
intunedctl dev attempt authsession create .parameters/auth-sessions/create/staff.json        --id staff
intunedctl dev attempt authsession create .parameters/auth-sessions/create/receptionist.json --id receptionist
```
> **Expected:** same — a logged-in session under the `--id` name you gave it.

---

## Step 2 — Run the APIs

### get-available-slots  (read-only — never changes anything)

Lists free appointment slots between two dates.

```bash
intunedctl dev attempt api get-available-slots .parameters/api/get-available-slots/default.json --auth-session default
```
> **Expected:** a list of free slots for 07/19–07/21 across all providers (`{ items, totalItems }`).

```bash
intunedctl dev attempt api get-available-slots .parameters/api/get-available-slots/single-day.json --auth-session default
```
> **Expected:** free slots for a single day (07/19 only).

```bash
intunedctl dev attempt api get-available-slots .parameters/api/get-available-slots/long-duration.json --auth-session default
```
> **Expected:** free slots sized for 30-minute appointments instead of the default 15.

```bash
intunedctl dev attempt api get-available-slots .parameters/api/get-available-slots/with-location.json --auth-session default
```
> **Expected:** free slots at the "Great Clinic" facility only.

```bash
intunedctl dev attempt api get-available-slots .parameters/api/get-available-slots/with-provider.json --auth-session default
```
> **Expected:** free slots for provider "Smith, Billy" only.

```bash
intunedctl dev attempt api get-available-slots .parameters/api/get-available-slots/unknown-location.json --auth-session default
```
> **Expected:** error `LOCATION_NOT_FOUND` — the facility name doesn't exist (the error lists the real ones).

```bash
intunedctl dev attempt api get-available-slots .parameters/api/get-available-slots/invalid-range.json --auth-session default
```
> **Expected:** error `INVALID_INPUT` — the end date is before the start date.

---

### schedule-appointment  (books an appointment)

Finds the patient (or creates them), then books the slot. The `case*` files below
demonstrate the find-or-create logic — **run `case2` first** on a fresh demo, because
it creates the patient "Nora Vale" that the other cases then find.

```bash
intunedctl dev attempt api schedule-appointment .parameters/api/schedule-appointment/case2-new-create.json --auth-session default
```
> **Expected:** patient not found → **creates** "Nora Vale", then books 9:30 AM. Result `booked`, `patient.created: true`.

```bash
intunedctl dev attempt api schedule-appointment .parameters/api/schedule-appointment/case1-existing-create.json --auth-session default
```
> **Expected:** patient found (created by case2) → books 9:00 AM. Result `booked`, `patient.created: false`. No new patient created.

```bash
intunedctl dev attempt api schedule-appointment .parameters/api/schedule-appointment/case3-existing-nocreate.json --auth-session default
```
> **Expected:** patient found → books 10:00 AM. `create_patient_if_missing` is false but the patient already exists, so it just books.

```bash
intunedctl dev attempt api schedule-appointment .parameters/api/schedule-appointment/case5-missing-nocreate.json --auth-session default
```
> **Expected:** error `PATIENT_NOT_FOUND` — the patient doesn't exist and creating is turned off, so it books nothing.

```bash
intunedctl dev attempt api schedule-appointment .parameters/api/schedule-appointment/default.json --auth-session default
```
> **Expected:** dry run — fills the form for an existing patient and previews it. Result `dry_run`, nothing booked.

```bash
intunedctl dev attempt api schedule-appointment .parameters/api/schedule-appointment/new-patient.json --auth-session default
```
> **Expected:** dry run for a brand-new patient (fills patient + booking form, previews only). Result `dry_run`.

```bash
intunedctl dev attempt api schedule-appointment .parameters/api/schedule-appointment/custom-category.json --auth-session default
```
> **Expected:** dry run using the "New Patient" visit category and a 30-minute slot. Result `dry_run`.

```bash
intunedctl dev attempt api schedule-appointment .parameters/api/schedule-appointment/existing-patient-real.json --auth-session default
```
> **Expected:** ⚠ REAL booking for an existing patient at 10:00 AM. Result `booked` (or `already_booked` if you run it twice).

```bash
intunedctl dev attempt api schedule-appointment .parameters/api/schedule-appointment/new-patient-real.json --auth-session default
```
> **Expected:** ⚠ REAL — creates patient "Maya Winters" and books 9:15 AM. Result `booked`, `patient.created: true`.

#### Provider (non-patient) events

Pass `"event_type": "provider"` to book a provider event on the calendar's
**Provider** tab (In Office / Out Of Office / Vacation / Lunch / Reserved) — no
patient, no find-or-create. The result has an `event` object instead of
`patient` + `appointment`.

```bash
intunedctl dev attempt api schedule-appointment .parameters/api/schedule-appointment/provider-event.json --auth-session default
```
> **Expected:** dry run — previews an "In Office" block for provider "Smith, Billy" (8:00 AM, 480 min). Result `dry_run`, nothing saved.

```bash
intunedctl dev attempt api schedule-appointment .parameters/api/schedule-appointment/provider-event-real.json --auth-session default
```
> **Expected:** ⚠ REAL — saves a "Lunch" event for provider "Lee, Donna" at 12:00 PM (30 min). Result `booked`, `event.verified: true`.

---

### cancel-appointment  (cancels or deletes an appointment)

Finds the appointment on the patient's chart, then cancels or deletes it.

```bash
intunedctl dev attempt api cancel-appointment .parameters/api/cancel-appointment/default.json --auth-session default
```
> **Expected:** dry run — finds the 10:00 AM appointment and previews the cancel. Result `dry_run`, nothing changed.

```bash
intunedctl dev attempt api cancel-appointment .parameters/api/cancel-appointment/delete.json --auth-session default
```
> **Expected:** dry run — finds the 9:15 AM appointment and previews a permanent delete. Result `dry_run`.

```bash
intunedctl dev attempt api cancel-appointment .parameters/api/cancel-appointment/not-found.json --auth-session default
```
> **Expected:** error `APPOINTMENT_NOT_FOUND` — no appointment exists at that date/time for the patient.

```bash
intunedctl dev attempt api cancel-appointment .parameters/api/cancel-appointment/cancel-real.json --auth-session default
```
> **Expected:** ⚠ REAL — cancels the 10:00 AM appointment (status → Canceled, kept in history). Result `cancelled`.

```bash
intunedctl dev attempt api cancel-appointment .parameters/api/cancel-appointment/delete-real.json --auth-session default
```
> **Expected:** ⚠ REAL — permanently deletes the 9:15 AM appointment. Result `deleted`.

---

## Notes

- `--auth-session default` must match the `--id` you used in Step 1.
- If any run says the session is invalid, re-run Step 1 (the demo logs you out on its daily reset).
- `schedule-appointment` is **idempotent**: booking the exact same patient + slot twice
  returns `already_booked` (with the existing appointment id) instead of double-booking.
- **Provider events** (`event_type: "provider"`) have no idempotency guard and can't be
  removed by `cancel-appointment` (that API is keyed on a patient); they clear on the
  demo's daily reset.
