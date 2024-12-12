/* eslint-disable @typescript-eslint/no-explicit-any */
import { useCallback } from 'react';

export type BodyType = BodyInit | {} | null | undefined;
export type QueryType = Record<string, string> | undefined;

export interface RequestType<R, B extends BodyType, Q extends QueryType> extends Omit<RequestInit, 'body'> {
  query?: Q;
  body?: B;
  handleResponse?: (response: Response) => Promise<R>;
}

export function baseHandleResponse(res: Response) {
  if (res.ok) return res.json();

  throw res;
}

export function useFetch<
  Res = any,
  Body extends BodyType = undefined,
  Query extends QueryType = undefined,
>(
  url: string,
  request: RequestType<Res, Body, Query> = {},
  deps: any[] = [url],
) {

  return useCallback(
    ({
      query,
      handleResponse = baseHandleResponse,
      body = request.body,
      ...overrides
    }: RequestType<Res, Body, Query> = {}) => {
      if (![Blob, ArrayBuffer, FormData, URLSearchParams].some(type => body instanceof type)) {
        body = JSON.stringify(body) as Body;
      }

      return fetch(
        `${url}${query ? '?' : ''}${new URLSearchParams(query).toString()}`,
        {
          headers: new Headers({ Accept: 'application/json', 'Content-Type': 'application/json' }),
          ...request,
          ...overrides,
          body: body as BodyInit,
        }
      ).then(handleResponse);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    deps
  );
}
