import { minutes } from "@thalesrc/js-utils/time/minutes";

export function hours(value: number): number {
  return minutes(value) * 60;
}
