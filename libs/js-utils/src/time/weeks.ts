import { days } from "@telperion/js-utils/time/days";

export function weeks(value: number): number {
  return days(value) * 7;
}
