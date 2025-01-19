/* eslint-disable @typescript-eslint/no-explicit-any */

import { useCallback, useEffect, useMemo, useState } from "react";
import { BodyType, ParamType, QueryType, RequestType, useFetch } from "@thalesrc/react-utils/hooks/fetch/fetch.hook";

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
  const fetcher = useFetch(path, request, deps);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const load = useCallback(() => fetcher(request).then(value => setValue(value!)), deps);

  useEffect(() => {
    load();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, reloadDeps);

  return useMemo(() => [value, load] as const, [value, load]);
}
