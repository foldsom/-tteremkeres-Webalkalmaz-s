/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { tokenStore } from "../utils/storage";
import * as authApi from "../api/auth";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [booting, setBooting] = useState(true);

  useEffect(() => {
    async function bootstrap() {
      const token = tokenStore.get();
      if (!token) {
        setBooting(false);
        return;
      }

      try {
        setUser(await authApi.me());
      } catch {
        tokenStore.clear();
        setUser(null);
      } finally {
        setBooting(false);
      }
    }

    bootstrap();
  }, []);

  const value = useMemo(
    () => ({
      user,
      booting,
      isAuthed: !!user,

      async doLogin(email, password) {
        const data = await authApi.login({ email, password });
        if (data?.token) tokenStore.set(data.token);
        setUser(await authApi.me());
      },

      async doRegister(payload) {
        await authApi.register(payload);
      },

      async doLogout() {
        try {
          await authApi.logout();
        } catch {
          // no-op
        }
        tokenStore.clear();
        setUser(null);
      },
    }),
    [user, booting]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
