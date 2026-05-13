import {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
} from 'react';
import { User, UserRole, LoginCredentials } from '../types';
import { login as loginRequest } from '../services/authService';

// ── Storage keys ───────────────────────────────────────────────────────────
const TOKEN_KEY = 'token';
const ROLE_KEY  = 'role';

// ── Context shape ──────────────────────────────────────────────────────────

interface AuthContextType {
  /** Decoded public user from the last login response. */
  user: User | null;
  /** Raw JWT string stored in localStorage. */
  token: string | null;
  /** Role persisted independently for quick access. */
  role: UserRole | null;
  /** True while the login request is in-flight. */
  isLoading: boolean;
  /** Call this to log in. Throws on failure so the caller can show an error. */
  login: (credentials: LoginCredentials) => Promise<void>;
  /** Clears all auth state and localStorage entries. */
  logout: () => void;
}

// ── Context ────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ── Provider ───────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: ReactNode }) {
  // Initialise from localStorage so a page refresh keeps the user logged in.
  const [token, setTokenState] = useState<string | null>(
    localStorage.getItem(TOKEN_KEY)
  );
  const [role, setRoleState] = useState<UserRole | null>(
    localStorage.getItem(ROLE_KEY) as UserRole | null
  );
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // ── login ────────────────────────────────────────────────────────────────
  const login = useCallback(async (credentials: LoginCredentials) => {
    setIsLoading(true);
    try {
      const data = await loginRequest(credentials);

      // Persist to localStorage
      localStorage.setItem(TOKEN_KEY, data.token);
      localStorage.setItem(ROLE_KEY, data.role);

      // Update React state
      setTokenState(data.token);
      setRoleState(data.role);
      setUser(data.user);
    } finally {
      setIsLoading(false);
    }
    // Note: errors are intentionally re-thrown so LoginPage can catch them.
  }, []);

  // ── logout ───────────────────────────────────────────────────────────────
  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(ROLE_KEY);
    setTokenState(null);
    setRoleState(null);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, role, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// ── Hook ───────────────────────────────────────────────────────────────────

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
