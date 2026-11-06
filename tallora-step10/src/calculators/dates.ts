/** Робота з календарними датами в UTC (без впливу часових поясів і переходу на літній час). */
export interface YMD {
  y: number;
  m: number;
  d: number;
}

export const isLeap = (y: number): boolean => (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0;

export function daysInMonth(y: number, m: number): number {
  return [31, isLeap(y) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][m - 1]!;
}

/** 'YYYY-MM-DD' -> { y, m, d }. Очікує вже перевірений рядок. */
export function parseDate(s: string): YMD {
  const [y, m, d] = s.split('-').map(Number);
  return { y: y!, m: m!, d: d! };
}

/** Кількість діб від 1970-01-01 (від’ємна для ранніх дат). */
export function dayNumber({ y, m, d }: YMD): number {
  const dt = new Date(0);
  dt.setUTCFullYear(y, m - 1, d); // setUTCFullYear не ламає роки 0–99, на відміну від Date.UTC
  return Math.round(dt.getTime() / 86_400_000);
}

/** День тижня: 0 = неділя ... 6 = субота. 1970-01-01 був четвергом. */
export function weekday(dn: number): number {
  return (((dn + 4) % 7) + 7) % 7;
}

/** Робочі дні (пн–пт) серед n діб, починаючи з доби startDn. */
export function countWorkdays(startDn: number, n: number): number {
  let count = Math.floor(n / 7) * 5;
  const rest = n % 7;
  const first = weekday(startDn);
  for (let i = 0; i < rest; i++) {
    const dow = (first + i) % 7;
    if (dow >= 1 && dow <= 5) count++;
  }
  return count;
}

/** Різниця двох дат у роках, місяцях і днях (from ≤ to). */
export function ymdDiff(from: YMD, to: YMD): { years: number; months: number; days: number } {
  let years = to.y - from.y;
  let months = to.m - from.m;
  let days = to.d - from.d;
  if (days < 0) {
    months--;
    // «позичаємо» дні в місяця, що передує місяцю кінцевої дати
    const prevMonth = to.m === 1 ? 12 : to.m - 1;
    const prevYear = to.m === 1 ? to.y - 1 : to.y;
    days += daysInMonth(prevYear, prevMonth);
  }
  if (months < 0) {
    years--;
    months += 12;
  }
  return { years, months, days };
}
