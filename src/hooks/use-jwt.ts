import { useCallback } from 'react';
import { ApiClient } from '@/lib/api';

export const useJWT = () => {
  const getToken = useCallback((): string | null => {
    return localStorage.getItem('auth_token');
  }, []);

  const getRefreshToken = useCallback((): string | null => {
    return localStorage.getItem('refresh_token');
  }, []);

  const isTokenValid = useCallback((token?: string): boolean => {
    const tokenToCheck = token || getToken();
    if (!tokenToCheck) return false;
    return !ApiClient.isTokenExpired(tokenToCheck);
  }, [getToken]);

  const getTokenExpiration = useCallback((token?: string): Date | null => {
    const tokenToCheck = token || getToken();
    if (!tokenToCheck) return null;
    return ApiClient.getTokenExpirationTime(tokenToCheck);
  }, [getToken]);

  const getTokenPayload = useCallback((token?: string) => {
    const tokenToCheck = token || getToken();
    if (!tokenToCheck) return null;
    return ApiClient.decodeToken(tokenToCheck);
  }, [getToken]);

  const clearTokens = useCallback(() => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('refresh_token');
  }, []);

  const setTokens = useCallback((accessToken: string, refreshToken?: string) => {
    localStorage.setItem('auth_token', accessToken);
    if (refreshToken) {
      localStorage.setItem('refresh_token', refreshToken);
    }
  }, []);

  return {
    getToken,
    getRefreshToken,
    isTokenValid,
    getTokenExpiration,
    getTokenPayload,
    clearTokens,
    setTokens,
  };
};
