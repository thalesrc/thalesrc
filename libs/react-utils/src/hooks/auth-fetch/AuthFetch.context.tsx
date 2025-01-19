import { createContext, PropsWithChildren, useMemo } from "react";
import { PartialSome } from "@thalesrc/extra-ts-types";
import { useExistingPromiseCall } from "@thalesrc/react-utils/hooks/existing-promise-call.hook";

/**
 * The context type of the auth fetch provider.
 */
export interface AuthFetchContextType {
  token: string;
  refreshTokens?: () => Promise<string>;
  isTokenExpiredError(error: Response): boolean | Promise<boolean>;
}

/**
 * The props of the auth fetch provider.
 */
export type AuthFetchProviderProps = PartialSome<AuthFetchContextType, 'refreshTokens' | 'isTokenExpiredError'>;

/**
 * The context that provides the token and the refreshTokens function to the auth fetch hook.
 */
export const AuthFetchContext = createContext<AuthFetchContextType>(null!);

/**
 * The default function that returns an empty string.
 */
const REFRESH_TOKENS_DEFAULT = () => Promise.resolve('');

/**
 * The default function that checks if the error is a token expired error.
 */
export function defaultIsTokenExpiredError(error: Response) {
  return [401, 403].includes(error.status);
}

/**
 * A provider that provides the token and the refreshTokens function to the auth fetch hook.
 */
export default function AuthFetchProvider({
  token,
  refreshTokens,
  isTokenExpiredError = defaultIsTokenExpiredError,
  children
}: PropsWithChildren<AuthFetchProviderProps>) {
  const refreshTokensSingled = useExistingPromiseCall(refreshTokens ?? REFRESH_TOKENS_DEFAULT);
  const context = useMemo<AuthFetchContextType>(() => ({
    token,
    refreshTokens: refreshTokens ? refreshTokensSingled : undefined,
    isTokenExpiredError
  }), [token, refreshTokensSingled, refreshTokens, isTokenExpiredError]);

  return <AuthFetchContext.Provider value={context}>{children}</AuthFetchContext.Provider>;
}
