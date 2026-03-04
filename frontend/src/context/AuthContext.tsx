import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import type { LoginCredentials, RegisterCredentials, User } from "@/types";

// ─── Context shape ─────────────────────────────────────────────────────────── 

interface AuthContextValue {
  /** Currently authenticated user, or null if not signed in. */
  user: User | null;
  /** True while the initial session rehydration is in progress. */
  isLoading: boolean;
  /** Sign in with email + password. Throws on invalid credentials. */
  login: (credentials: LoginCredentials) => Promise<void>;
  /** Register a new account. Throws on validation error. */
  register: (credentials: RegisterCredentials) => Promise<void>;
  /** Sign out and clear the local session. */
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

// ─── Storage key ───────────────────────────────────────────────────────────── 

/**
 * Key used to persist the simulated session in localStorage.
 *
 * In production this is replaced by a Better Auth HTTP-only session cookie
 * that is set / cleared by the server — the client never touches it directly.
 * The localStorage fallback is used here because there is no backend yet.
 */
const SESSION_KEY = "plateplan_session";

// ─── Provider ─────────────────────────────────────────────────────────────── 

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Rehydrate session on first mount
  // TODO: Replace with: GET /api/auth/get-session
  //       Better Auth returns the session user from the HTTP-only cookie.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(SESSION_KEY);
      if (raw) {
        const { user } = JSON.parse(raw) as { user: User };
        setUser(user);
      }
    } catch {
      localStorage.removeItem(SESSION_KEY);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Sign in.
   *
   * TODO: Replace body with a Better Auth client call:
   *   import { authClient } from "@/lib/authClient";
   *   await authClient.signIn.email({ email, password });
   *   Better Auth sets an HTTP-only session cookie and returns the user object.
   */
  const login = async ({ email, password }: LoginCredentials) => {
    // Simulate network latency
    await new Promise((r) => setTimeout(r, 600));

    // Client-side validation (mirrors server-side rules)
    if (!email.includes("@")) throw new Error("Please enter a valid email address.");
    if (password.length < 8)
      throw new Error("Password must be at least 8 characters.");

    // Simulate a successful authentication response
    const signedInUser: User = {
      id: `u-${btoa(email).replace(/=/g, "")}`,
      email,
      name: email.split("@")[0],
      createdAt: new Date().toISOString(),
    };

    localStorage.setItem(SESSION_KEY, JSON.stringify({ user: signedInUser }));
    setUser(signedInUser);
  };

  /**
   * Register a new account.
   *
   * TODO: Replace body with a Better Auth client call:
   *   await authClient.signUp.email({ email, name, password });
   *   Better Auth creates the user, starts a session, sets the cookie.
   */
  const register = async ({ email, name, password }: RegisterCredentials) => {
    await new Promise((r) => setTimeout(r, 700));

    if (!email.includes("@")) throw new Error("Please enter a valid email address.");
    if (!name.trim()) throw new Error("Name is required.");
    if (password.length < 8)
      throw new Error("Password must be at least 8 characters.");

    const newUser: User = {
      id: `u-${btoa(email).replace(/=/g, "")}`,
      email,
      name: name.trim(),
      createdAt: new Date().toISOString(),
    };

    localStorage.setItem(SESSION_KEY, JSON.stringify({ user: newUser }));
    setUser(newUser);
  };

  /**
   * Sign out.
   *
   * TODO: Replace body with a Better Auth client call:
   *   await authClient.signOut();
   *   Better Auth clears the HTTP-only cookie server-side.
   */
  const logout = () => {
    localStorage.removeItem(SESSION_KEY);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// ─── Hook ──────────────────────────────────────────────────────────────────── 

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
