import { useEffect, useState } from "react";
import { usePrevious } from "@thalesrc/react-utils/hooks/previous.hook";

/**
 * Hook that memoizes an object.
 *
 * @param object - The object to memoize.
 * @returns The memoized object.
 */
export function useObjectMemo<T extends object>(object: T): T {
  const [value, setValue] = useState(object);
  const prev = usePrevious(object);

  useEffect(() => {
    if (JSON.stringify(object) !== JSON.stringify(prev)) {
      setValue(object);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [object]);

  return value;
}
