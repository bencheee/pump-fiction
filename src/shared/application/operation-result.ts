export type FieldErrors = Readonly<Record<string, readonly string[]>>;

export type OperationErrorCode =
  "validation" | "not_found" | "conflict" | "persistence";

export type OperationFailure = Readonly<{
  code: OperationErrorCode;
  message: string;
  retryable: boolean;
  fieldErrors?: FieldErrors;
}>;

export type OperationResult<T> =
  | Readonly<{ ok: true; value: T }>
  | Readonly<{ ok: false; error: OperationFailure }>;

export function operationSuccess<T>(value: T): OperationResult<T> {
  return { ok: true, value };
}

export function operationFailure(
  error: OperationFailure,
): OperationResult<never> {
  return { ok: false, error };
}
