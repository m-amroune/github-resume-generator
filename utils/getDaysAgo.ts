
// Calculates how many days passed since the repo was updated
export const getDaysAgo = (dateString: string): string => {
  const updated = new Date(dateString).getTime();
  const now = Date.now();
  const diff = Math.floor((now - updated) / (1000 * 60 * 60 * 24));

  if (diff === 0) return "Updated today";
  if (diff === 1) return "Updated 1 day ago";

  return `Updated ${diff} days ago`;
};