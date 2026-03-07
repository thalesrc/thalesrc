import { days } from "@thalesrc/js-utils/time/days";

export function months(value: number): number {
  return days(value) * 30;
}
