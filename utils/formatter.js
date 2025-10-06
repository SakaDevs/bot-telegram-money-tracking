export function formatDate(date) {
  if (!date) return "";
  return new Date(date).toLocaleString("id-ID", { timeZone: "Asia/Jakarta" });
}
