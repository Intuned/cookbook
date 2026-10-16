
export type ErrorCode =
  | "INVALID_INPUT"
  | "LOCATION_NOT_FOUND"
  | "PROVIDER_NOT_FOUND"
  | "CATEGORY_NOT_FOUND"
  | "PATIENT_NOT_FOUND"
  | "PATIENT_CREATE_FAILED"
  | "SAVE_NOT_CONFIRMED"
  | "DATE_RANGE_TOO_LARGE"
  | "NO_SLOTS_AVAILABLE"
  | "APPOINTMENT_NOT_FOUND"
  | "APPOINTMENT_MISMATCH"
  | "ACTION_FAILED"
  | "STATE_NOT_FOUND"
  | "SLOT_UNAVAILABLE";

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
    this.reason = message;
  }

    readonly reason: string;
}

export interface ApiEnvelope<T> {
  success: boolean;
  status: number;
    [meta: string]: unknown;
  result: T | null;
  error?: {
    code: ErrorCode;
    message: string;
    details?: Record<string, unknown>;
  };
}

export function okEnvelope<T>(
  result: T,
  meta: Record<string, unknown> = {}
): ApiEnvelope<T> {
  return { success: true, status: 200, ...meta, result };
}

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

export async function withErrorEnvelope<T>(
  meta: Record<string, unknown>,
  body: () => Promise<T>
): Promise<ApiEnvelope<T | null>> {
  try {
    return okEnvelope(await body(), meta);
  } catch (e) {
    if (e instanceof ClientError) {
      return errorEnvelope(e, meta);
    }
    throw e;
  }
}
