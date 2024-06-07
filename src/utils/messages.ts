import { formatDate } from "./date";

export function createErrorMessage({ message }: { message: string }) {
  return { error: message, time: formatDate(new Date()) };
}

export function createSimpleMessage({ message }: { message: string }) {
  return { message, time: formatDate(new Date()) };
}
