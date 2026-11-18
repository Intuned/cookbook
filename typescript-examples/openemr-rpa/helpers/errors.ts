/**
 * Client-readable API errors + the response envelope, shared across APIs.
 *
 * Two error paths (mirrors the ai-fallback trust model):
 *  - `ClientError` — a BUSINESS OUTCOME the caller can read and act on (bad
 *    input, a value that matches no site option, patient/appointment not
 *    found, a slot conflict). The automation worked; the site simply said
 *    "no". These are NEVER shown to the AI fallback — they pass through.
 *  - plain `Error` — an actual FAILURE (a selector broke, a popup never
 *    opened, a Playwright TimeoutError, a save that didn't confirm). These are
 *    what the ai-fallback tries to rescue, and if it can't, they fail the run.
 *
 * So: throw `ClientError` for expected, caller-facing outcomes; throw a plain
 * `Error` for "our automation hit something unexpected" — that second kind is
 * the only kind `withAiFallback` will hand to the recovery agent.
 *
 * Status conventions: 400 malformed input · 404 referenced thing not found ·
 * 409 conflict/ambiguity · 422 well-formed input that matches no site option ·
 * 500 automation failure.
 */

export type ErrorCode =
  // shared / input
  | "INVALID_INPUT"
  // scheduling + slots
  | "LOCATION_NOT_FOUND"
  | "PROVIDER_NOT_FOUND"
  | "CATEGORY_NOT_FOUND"
  | "PATIENT_NOT_FOUND"
  | "PATIENT_CREATE_FAILED"
  | "SAVE_NOT_CONFIRMED"
  | "DATE_RANGE_TOO_LARGE"
  | "NO_SLOTS_AVAILABLE"
  // cancellation
  | "APPOINTMENT_NOT_FOUND"
  | "APPOINTMENT_MISMATCH"
  | "ACTION_FAILED"
  // codes used by the ai-fallback sandbox test suite
  | "STATE_NOT_FOUND"
  | "SLOT_UNAVAILABLE";

/**
 * A business outcome the caller can read. `message` is a machine-readable JSON
 * envelope (`{"error":{code,message,details}}`) so that, even when thrown
 * uncaught, the run's error output stays structured — matching the format the
 * schedule/cancel APIs already emit.
 */
export class ClientError extends Error {
  readonly status: number;
  readonly code: ErrorCode;
  readonly details?: Record<string, unknown>;

  constructor(
    status: number,
    code: ErrorCode,
    message: string,
    details?: Record<string, unknown>
  ) {
    super(JSON.stringify({ error: { code, message, details: details ?? null } }));
    this.name = "ClientError";
    this.status = status;
    this.code = code;
    this.details = details;
    // The human-readable message, separate from the JSON `message` above.
    this.reason = message;
  }

  /** Plain-English message (the JSON envelope lives in `.message`). */
  readonly reason: string;
}

export interface ApiEnvelope<T> {
  success: boolean;
  status: number;
  /** Envelope-level meta (e.g. dry_run, ai_fallback) lives beside result. */
  [meta: string]: unknown;
  result: T | null;
  error?: {
    code: ErrorCode;
    message: string;
    details?: Record<string, unknown>;
  };
}

/** Success envelope: `{ success: true, status: 200, ...meta, result }`. */
export function okEnvelope<T>(
  result: T,
  meta: Record<string, unknown> = {}
): ApiEnvelope<T> {
  return { success: true, status: 200, ...meta, result };
}

/** Error envelope for a ClientError: `{ success: false, status, ...meta, result: null, error }`. */
export function errorEnvelope(
  error: ClientError,
  meta: Record<string, unknown> = {}
): ApiEnvelope<null> {
  return {
    success: false,
    status: error.status,
    ...meta,
    result: null,
    error: {
      code: error.code,
      message: error.reason,
      ...(error.details ? { details: error.details } : {}),
    },
  };
}

/**
 * API boundary: run the body; a ClientError becomes an error envelope (the
 * attempt still SUCCEEDS), anything else rethrows (the attempt FAILS).
 */
export async function withErrorEnvelope<T>(
  meta: Record<string, unknown>,
  body: () => Promise<T>
): Promise<ApiEnvelope<T | null>> {
  try {
    return okEnvelope(await body(), meta);
  } catch (e) {
    if (e instanceof ClientError) {
      console.warn(`Client error ${e.status} ${e.code}: ${e.reason}`);
      return errorEnvelope(e, meta);
    }
    throw e;
  }
}
