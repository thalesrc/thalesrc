import { hours } from "@telperion/js-utils/time/hours";

export function days(value: number): number {
  return hours(value) * 24;
}
