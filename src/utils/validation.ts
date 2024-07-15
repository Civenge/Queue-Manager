export function validateEmail(email: string): boolean {
  const trimmedEmail = email.trim();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@.]+$/;
  return emailRegex.test(trimmedEmail);
}
