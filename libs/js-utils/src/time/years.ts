import { days } from "@thalesrc/js-utils/time/days";

export function years(value: number): number {
  return days(value) * 365;
}
