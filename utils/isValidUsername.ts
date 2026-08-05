export const isValidUsername = (value: string): boolean => {
  const username = value.trim();

  if (!username) return false;
  if (/\s/.test(username)) return false;
  if (!/^[a-zA-Z0-9-]+$/.test(username)) return false;
  if (username.startsWith("-")) return false;
  if (username.endsWith("-")) return false;
  if (username.includes("--")) return false;
  if (username.length > 39) return false;

  return true;
};