import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { api, User } from '@/lib/api';
import { useJWT } from '@/hooks/use-jwt';

interface LoginResponse {
  accessToken: string;
  refreshToken?: string;
  user?: User & { roles?: string[] };
  roles?: string[]; // some APIs may return roles at root
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  register: (userData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
  }) => Promise<void>;
  checkAuth: () => Promise<void>;
  refreshToken: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { isTokenValid, setTokens, clearTokens, getTokenPayload } = useJWT();

  const deriveRolesFromAnywhere = (token?: string, loginResp?: LoginResponse, profile?: User): string[] | undefined => {
    const normalize = (arr?: unknown): string[] | undefined => {
      if (!arr) return undefined;
      const list = Array.isArray(arr) ? arr : [arr];
      const cleaned = list
        .filter(Boolean)
        .map((r) => String(r).toUpperCase().trim());
      return cleaned.length ? cleaned : undefined;
    };

    // Priority 1: explicit roles in login response
    const fromLoginDirect = normalize((loginResp as any)?.roles);
    if (fromLoginDirect) return fromLoginDirect;
    const fromLoginUser = normalize((loginResp as any)?.user?.roles || (loginResp as any)?.user?.authorities);
    if (fromLoginUser) return fromLoginUser;

    // Priority 2: JWT payload
    const payload = getTokenPayload(token);
    const fromPayload = normalize((payload as any)?.roles || (payload as any)?.authorities || (payload as any)?.role);
    if (fromPayload) return fromPayload;

    // Priority 3: user profile
    const fromProfile = normalize((profile as any)?.roles || (profile as any)?.role);
    if (fromProfile) return fromProfile;

    return undefined;
  };

  const checkAuth = async () => {
    try {
      if (isTokenValid()) {
        const userProfile = await api.getUserProfile() as User;
        const token = localStorage.getItem('auth_token') || undefined;
        const roles = deriveRolesFromAnywhere(token, undefined, userProfile);
        if (roles && roles.length) {
          localStorage.setItem('auth_roles', JSON.stringify(roles));
        } else {
          localStorage.removeItem('auth_roles');
        }
        setUser({ ...userProfile, roles: roles || (userProfile as any).roles });
      } else {
        clearTokens();
        setUser(null);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      clearTokens();
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await api.login({ email, password }) as LoginResponse;
      
      if (response && response.accessToken) {
        setTokens(response.accessToken, response.refreshToken);
        const rolesFromLoginOrToken = deriveRolesFromAnywhere(response.accessToken, response);
        if (rolesFromLoginOrToken && rolesFromLoginOrToken.length) {
          localStorage.setItem('auth_roles', JSON.stringify(rolesFromLoginOrToken));
        } else {
          localStorage.removeItem('auth_roles');
        }
        // Fetch user profile after successful login and enrich with roles
        const userProfile = await api.getUserProfile() as User;
        const roles = rolesFromLoginOrToken || deriveRolesFromAnywhere(undefined, response, userProfile);
        setUser({ ...userProfile, roles: roles as ("STUDENT" | "TEACHER" | "ADMIN")[] });
      } else {
        throw new Error('Invalid response from login API');
      }
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  const register = async (userData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
  }) => {
    try {
      await api.register(userData);
      // After successful registration, automatically log in
      await login(userData.email, userData.password);
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await api.logout();
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      clearTokens();
      localStorage.removeItem('auth_roles');
      setUser(null);
    }
  };

  const refreshToken = async () => {
    try {
      const refreshToken = localStorage.getItem('refresh_token');
      if (refreshToken) {
        const response = await api.refreshToken(refreshToken) as LoginResponse;
        if (response && response.accessToken) {
          setTokens(response.accessToken, response.refreshToken);
          await checkAuth();
        } else {
          logout();
        }
      } else {
        logout();
      }
    } catch (error) {
      console.error('Token refresh failed:', error);
      logout();
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  // Set up periodic token validation
  useEffect(() => {
    if (user) {
      const interval = setInterval(() => {
        if (!isTokenValid()) {
          logout();
        }
      }, 60000); // Check every minute

      return () => clearInterval(interval);
    }
  }, [user, isTokenValid]);

  const value: AuthContextType = {
    user,
    loading,
    isAuthenticated: !!user && isTokenValid(),
    login,
    logout,
    register,
    checkAuth,
    refreshToken,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
