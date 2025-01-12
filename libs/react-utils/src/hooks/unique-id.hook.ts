import { uniqueId } from "@thalesrc/js-utils/unique-id";
import { useConstant } from "@thalesrc/react-utils/hooks/constant.hook";

export function useUniqueId(): number;
export function useUniqueId(prefix: string): string;
export function useUniqueId(prefix?: string): string | number {
  return useConstant(() => uniqueId(prefix!));
}
