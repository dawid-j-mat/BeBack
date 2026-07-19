// Local calendar date as yyyy-mm-dd (an ISO string from toISOString() would
// shift the day around midnight, being UTC-based).
export function todayLocal(): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}
