export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;
  if (typeof Event !== "undefined" && error instanceof Event) {
    return "Unexpected browser event error.";
  }
  return "Unexpected error.";
}
