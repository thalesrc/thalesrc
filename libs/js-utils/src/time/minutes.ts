import { seconds } from "@thalesrc/js-utils/time/seconds";

export function minutes(value: number): number {
  return seconds(value) * 60;
}
