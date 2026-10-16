
import { createContext, useContext, useState } from "react";

import {
  loginUser,
  registerUser,
} from "../services/authService";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  // Restore the session when the page refreshes
  const [session, setSession] = useState(() => {
    try {
      const savedSession = sessionStorage.getItem("findback_session");

      return savedSession ? JSON.parse(savedSession) : null;
    } catch {
      return null;
    }
  });

  // Log in an existing user
  async function login(credentials) {
    const result = await loginUser(credentials);

    const newSession = {
      user: result.user,
      token: result.token,
    };

    setSession(newSession);

    sessionStorage.setItem(
      "findback_session",
      JSON.stringify(newSession)
    );

    return result;
  }

  // Register a new user
  async function register(data) {
    const result = await registerUser(data);

    const newSession = {
      user: result.user,
      token: result.token,
    };

    setSession(newSession);

    sessionStorage.setItem(
      "findback_session",
      JSON.stringify(newSession)
    );

    return result;
  }

  // Log out the current user
  function logout() {
    setSession(null);
    sessionStorage.removeItem("findback_session");
  }

  return (
    <AuthContext.Provider
      value={{
        user: session?.user ?? null,
        token: session?.token ?? null,
        isAuthenticated: Boolean(session?.token),
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// Access authentication from other React components
export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used inside AuthProvider"
    );
  }

  return context;
}
