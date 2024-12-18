/* eslint-disable @typescript-eslint/no-explicit-any */
import { useCallback } from 'react';

/**
 * The type of the body of a request.
 */
export type BodyType = BodyInit | {} | null | undefined;

/**
 * The type of the parameters of a request.
 */
export type ParamType = {[key: string]: string | number | boolean | null | undefined} | undefined | null;

/**
 * The type of the query parameters of a request.
 */
export type QueryType = {[key: string]: string | number | boolean | null | undefined} | undefined | null;

/**
 * The type of a request configuration object.
 */
export interface RequestType<R, B extends BodyType, P extends ParamType, Q extends QueryType> extends Omit<RequestInit, 'body'> {
  query?: Q;
  body?: B;
  params?: P;
  handleResponse?: (response: Response) => Promise<R>;
}

/**
 * The default response handler for fetch requests.
 * @param res - The response object.
 * @returns The JSON representation of the response.
 */
export function baseHandleResponse(res: Response) {
  if (res.ok) return res.json();

  throw res;
}

/**
 * A custom hook for making HTTP requests with fetch.
 *
 * @param url - The URL to which the request is sent.
 * @param request - The request configuration object.
 * @param deps - The dependency array for the useCallback hook.
 *
 * @returns A function that makes the HTTP request when called.
 *
 * @example
 * const fetchData = useFetch('https://api.example.com/data/{id}', {
 *   method: 'GET',
 *   params: { id: 123 },
 *   query: { search: 'foo' },
 * });
 *
 * fetchData().then(response => {
 *   console.log(response);
 * }).catch(error => {
 *   console.error(error);
 * });
 */
export function useFetch<
  Res = any,
  Body extends BodyType = null,
  Params extends ParamType = null,
  Query extends QueryType = null,
>(
  url: string,
  request: RequestType<Res, Body, Params, Query> = {},
  deps: any[] = [url],
) {

  return useCallback(
    ({
      handleResponse = baseHandleResponse,
      body = request.body,
      params = request.params,
      query = request.query,
      ...overrides
    }: RequestType<Res, Body, Params, Query> = {}) => {
      if (![Blob, ArrayBuffer, FormData, URLSearchParams].some(type => body instanceof type)) {
        body = JSON.stringify(body) as Body;
      }

      const parsedUrl = url.replace(/{(\w+)}/g, (_, key) => {
        const value = params?.[key];

        if (value === undefined) {
          throw new Error(`Missing value for parameter ${key}`);
        }

        return encodeURIComponent(String(value));
      });

      return fetch(
        `${parsedUrl}${query ? '?' : ''}${new URLSearchParams(query).toString()}`,
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
