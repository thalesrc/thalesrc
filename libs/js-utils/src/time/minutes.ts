import { seconds } from "@telperion/js-utils/time/seconds";

export function minutes(value: number): number {
  return seconds(value) * 60;
}
