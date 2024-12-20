/* eslint-disable @typescript-eslint/no-explicit-any */

import { useCallback, useEffect, useMemo, useState } from "react";
import { BodyType, ParamType, QueryType, RequestType, useFetch } from "@thalesrc/react-utils/hooks/fetch/fetch.hook";

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
