export const localDateTime = (date?: Date|null): { date: string; time: string } => {
  if (!date) {
    return { date: "", time: "" };
  }
  const localDate = date.toLocaleString(undefined, {
    year: "2-digit",
    month: "2-digit",
    day: "2-digit"
  });
  const localTime = date.toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true
  });
  return { date: localDate, time: localTime };
};
