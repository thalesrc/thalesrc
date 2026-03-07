import { hours } from "@thalesrc/js-utils/time/hours";

export function days(value: number): number {
  return hours(value) * 24;
}
