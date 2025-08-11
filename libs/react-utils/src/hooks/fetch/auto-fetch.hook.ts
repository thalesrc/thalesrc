/* eslint-disable @typescript-eslint/no-explicit-any */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { BodyType, ParamType, QueryType, RequestType, useFetch } from "@thalesrc/react-utils/hooks/fetch/fetch.hook";
import { noop } from "@thalesrc/js-utils/function/noop";

/**
 * A custom hook for making HTTP requests with fetch and automatically fetching data.
 *
 * Example:
 * ```tsx
 * const [data, reload] = useAutoFetch('https://api.example.com/data/{id}', {
 *  params: { id: 123 },
 *  query: { search: searchString },
 * }, {items: [], total: 0}, [searchString]);
 * ```
 *
 * @param path The URL to which the request is sent.
 * @param request The request configuration object.
 * @param initialVal The initial value of the data.
 * @param reloadDeps The dependency array that reloads the data.
 * @param deps The dependency array
 * @returns The data and the function to reload the data.
 */
export function useAutoFetch<
  Res,
  ReqBody extends BodyType = undefined,
  ReqParams extends ParamType = undefined,
  ReqQuery extends QueryType = undefined
>(
  path: string,
  request: RequestType<Res, ReqBody, ReqParams, ReqQuery>,
  initialVal: Res,
  reloadDeps: any[] = [],
  deps: any[] = reloadDeps
) {
  const [value, setValue] = useState(initialVal);
  const aborterRef = useRef<AbortController | null>(null);
  const fetcher = useFetch(path, request, deps);
  const load = useCallback(() => {
    if (aborterRef.current) {
      aborterRef.current.abort();
    }

    aborterRef.current = new AbortController();

    return fetcher({ ...request, signal: aborterRef.current.signal })
      .then(value => setValue(value!))
      .finally(() => {
        aborterRef.current = null;
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, reloadDeps);

  return useMemo(() => [value, load, aborterRef.current ?? noop] as const, [value, load]);
}
