const padDatePart = (value: number): string => String(value).padStart(2, "0");

export const getDateKey = (value: Date | string | null = new Date()): string => {
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return value;
  }

  const date = value instanceof Date ? value : value ? new Date(value) : new Date();
  const safeDate = Number.isNaN(date.getTime()) ? new Date() : date;

  return [
    safeDate.getFullYear(),
    padDatePart(safeDate.getMonth() + 1),
    padDatePart(safeDate.getDate()),
  ].join("-");
};
