import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import {
  apiGetSession,
  apiSignIn,
  apiSignOut,
  apiSignUp,
} from "@/lib/api";
import type { LoginCredentials, RegisterCredentials, User } from "@/types";

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (credentials: RegisterCredentials) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function toErrorMessage(err: unknown, fallback: string): string {
  return err instanceof Error && err.message ? err.message : fallback;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadSession() {
      try {
        const sessionUser = await apiGetSession();
        if (!cancelled) {
          setUser(sessionUser);
        }
      } catch (err) {
        console.error("[Auth] Failed to load session", err);
        if (!cancelled) {
          setUser(null);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    void loadSession();

    return () => {
      cancelled = true;
    };
  }, []);

  const login = async ({ email, password }: LoginCredentials) => {
    await apiSignIn({ email, password });

    const sessionUser = await apiGetSession();
    if (!sessionUser) {
      throw new Error(
        "Signed in but no active session was found. Check cookie/CORS configuration."
      );
    }

    setUser(sessionUser);
  };

  const register = async ({ email, name, password }: RegisterCredentials) => {
    await apiSignUp({ email, name, password });

    const sessionUser = await apiGetSession();
    if (!sessionUser) {
      throw new Error(
        "Account created but no active session was found. Check cookie/CORS configuration."
      );
    }

    setUser(sessionUser);
  };

  const logout = async () => {
    try {
      await apiSignOut();
    } catch (err) {
      console.error("[Auth] Sign out failed", err);
      throw new Error(toErrorMessage(err, "Failed to sign out."));
    } finally {
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
