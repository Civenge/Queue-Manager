export function validateEmail(email: string): boolean {
  const trimmedEmail = email.trim();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@.]+$/;
  return emailRegex.test(trimmedEmail);
}

export function sanitizeInput(input: string): string {
  let sanitizedInput = input.trim();
  sanitizedInput = sanitizedInput.replace(/<\/?[^>]+(>|$)/g, "");
  return sanitizedInput;
}
