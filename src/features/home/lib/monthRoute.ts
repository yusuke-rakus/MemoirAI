export const parseMonthRoute = (year?: string, month?: string): Date | null => {
  if (
    !year ||
    !month ||
    !/^[1-9]\d{3}$/.test(year) ||
    !/^(?:[1-9]|1[0-2])$/.test(month)
  )
    return null;
  return new Date(Number(year), Number(month) - 1, 1);
};
