/* eslint-disable @typescript-eslint/no-explicit-any */

import { useCallback, useContext, useMemo } from "react";
import { useFetch, QueryType, BodyType, RequestType, ParamType } from "@thalesrc/react-utils/hooks/fetch/fetch.hook";
import { tryCatch } from "@thalesrc/js-utils/promise/try-catch";
import { AuthFetchContext } from "@thalesrc/react-utils/hooks/auth-fetch/AuthFetch.context";

/**
 * A custom hook for making HTTP requests with bearer token. It automatically refreshes the token if it is expired.
 *
 * @param path The URL to which the request is sent.
 * @param requestOptions The request configuration object.
 * @param deps The dependency array
 * @returns A function that makes the HTTP request when called.
 */
export function useAuthFetch<
  Res,
  ReqBody extends BodyType = undefined,
  ReqParams extends ParamType = undefined,
  ReqQuery extends QueryType = undefined
>(
  path: string,
  requestOptions: RequestType<Res, ReqBody, ReqParams, ReqQuery> = {},
  deps: any[] = []
) {
  const { token, refreshTokens, isTokenExpiredError } = useContext(AuthFetchContext);
  const headers = useMemo(() => {
    const _headers = new Headers(requestOptions?.headers ?? {});

    _headers.append('Authorization', `Bearer ${token}`);

    return _headers;
  }, [requestOptions?.headers, token]);
  const fetcher = useFetch<Res, ReqBody, ReqParams, ReqQuery>(path, { ...requestOptions, headers }, [headers, ...deps]);

  return useCallback(async (req: RequestType<Res, ReqBody, ReqParams, ReqQuery>) => {
    const [err, result] = await tryCatch<Res, Response>(fetcher(req));

    if (err) {
      if (!refreshTokens) throw err;

      if (!isTokenExpiredError(err)) throw err;

      const [refreshTokenErr, newToken] = await tryCatch(refreshTokens());

      if (refreshTokenErr) throw err.json();

      const newHeaders = new Headers(req.headers);
      newHeaders.set('Authorization', `Bearer ${newToken}`);

      const [refreshedErr, refreshedResult] = await tryCatch<Res, Response>(fetcher({ ...req, headers: newHeaders }));

      if (refreshedErr) throw refreshedErr.json();

      return refreshedResult!;
    }

    return result!;
  }, [fetcher, refreshTokens, isTokenExpiredError]);
}
