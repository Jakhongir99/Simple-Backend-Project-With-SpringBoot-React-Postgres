import { notifications } from "@mantine/notifications";

export interface FieldErrorItem {
  field: string;
  message: string;
}

/** Map of field name → first validation message from API 422 body. */
export function getFieldErrors(error: unknown): Record<string, string> {
  const data = (error as { response?: { data?: { fieldErrors?: FieldErrorItem[] } } })
    ?.response?.data;
  const list = data?.fieldErrors;
  if (!Array.isArray(list) || list.length === 0) return {};

  const map: Record<string, string> = {};
  for (const item of list) {
    if (item?.field && item?.message && !map[item.field]) {
      map[item.field] = item.message;
    }
  }
  return map;
}

/** Human-readable message: field errors first, then API message. */
export function getApiErrorMessage(
  error: unknown,
  fallback = "Xatolik yuz berdi"
): string {
  const fieldMessages = Object.values(getFieldErrors(error));
  if (fieldMessages.length > 0) {
    return fieldMessages.join("; ");
  }

  const data = (error as { response?: { data?: { message?: string } } })?.response
    ?.data;
  if (data?.message && data.message !== "Validation failed") {
    return data.message;
  }
  if (data?.message) {
    return data.message;
  }

  const msg = (error as { message?: string })?.message;
  return msg || fallback;
}

export function showApiError(
  error: unknown,
  title = "Xatolik",
  fallback?: string
): void {
  notifications.show({
    title,
    message: getApiErrorMessage(error, fallback),
    color: "red",
  });
}

/** Clear one field error when the user edits that input. */
export function clearFieldError(
  errors: Record<string, string>,
  field: string
): Record<string, string> {
  if (!errors[field]) return errors;
  const next = { ...errors };
  delete next[field];
  return next;
}
