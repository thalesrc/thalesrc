import { createContext, PropsWithChildren, useMemo } from "react";
import { PartialSome } from "@thalesrc/extra-ts-types";
import { useExistingPromiseCall } from "@thalesrc/react-utils/hooks/existing-promise-call.hook";

export interface AuthFetchContextType {
  token: string;
  refreshTokens?: () => Promise<string>;
  isTokenExpiredError(error: Response): boolean | Promise<boolean>;
}

export type AuthFetchProviderProps = PartialSome<AuthFetchContextType, 'refreshTokens' | 'isTokenExpiredError'>;

export const AuthFetchContext = createContext<AuthFetchContextType>(null!);

const REFRESH_TOKENS_DEFAULT = () => Promise.resolve('');

export function defaultIsTokenExpiredError(error: Response) {
  return [401, 403].includes(error.status);
}

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
