/* eslint-disable @typescript-eslint/no-explicit-any */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { BodyType, ParamType, QueryType, RequestType } from "@thalesrc/react-utils/hooks/fetch/fetch.hook";
import { useAuthFetch } from "@thalesrc/react-utils/hooks/auth-fetch/auth-fetch.hook";

/**
 * A custom hook for making HTTP requests with Bearer token and automatically fetching data. It automatically refreshes the token if it is expired.
 *
 * @param path The URL to which the request is sent.
 * @param request The request configuration object.
 * @param initialVal The initial value of the data.
 * @param reloadDeps The dependency array that reloads the data.
 * @param deps The dependency array
 * @returns The data and the function to reload the data.
 */
export function useAuthAutoFetch<
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
  const fetcher = useAuthFetch(path, request, deps);
  const aborterRef = useRef<AbortController | null>(null);
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

  return useMemo(() => [value, load] as const, [value, load]);
}
