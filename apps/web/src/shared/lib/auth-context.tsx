import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { ApiError } from "@/shared/api/client";
import { getMe, login as apiLogin, logout as apiLogout, register as apiRegister, type AuthUser } from "@/shared/api/auth";

type AuthState =
  | { status: "loading"; user: null }
  | { status: "anon"; user: null }
  | { status: "authed"; user: AuthUser };

type AuthValue = AuthState & {
  login: (email: string, password: string) => Promise<AuthUser>;
  register: (name: string, email: string, password: string) => Promise<AuthUser>;
  logout: () => Promise<void>;
};

const Ctx = createContext<AuthValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({ status: "loading", user: null });

  useEffect(() => {
    let cancelled = false;
    getMe()
      .then((user) => {
        if (!cancelled) setState({ status: "authed", user });
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        if (err instanceof ApiError && err.status === 401) {
          setState({ status: "anon", user: null });
        } else {
          // network down / api off — treat as anonymous, don't crash
          setState({ status: "anon", user: null });
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const { user } = await apiLogin({ email, password });
    setState({ status: "authed", user });
    return user;
  }, []);

  const register = useCallback(async (name: string, email: string, password: string) => {
    const { user } = await apiRegister({ name, email, password });
    setState({ status: "authed", user });
    return user;
  }, []);

  const logout = useCallback(async () => {
    await apiLogout();
    setState({ status: "anon", user: null });
  }, []);

  const value: AuthValue = { ...state, login, register, logout };
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useAuth must be used inside AuthProvider");
  return v;
}
