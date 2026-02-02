import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { tokenStore } from "../utils/storage";
import * as authApi from "../api/auth";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [booting, setBooting] = useState(true);

  useEffect(() => {
  setUser(null);
  setBooting(false);
}, []);


  const value = useMemo(
    () => ({
      user,
      booting,
      isAuthed: !!user,

      async doLogin(email, password) {
        const data = await authApi.login({ email, password });
        if (data?.token) tokenStore.set(data.token);
        if (data?.user) setUser(data.user);
        else setUser(await authApi.me());
      },

      async doRegister(payload) {
        const data = await authApi.register(payload);
        if (data?.token) tokenStore.set(data.token);
        if (data?.user) setUser(data.user);
      },

      async doLogout() {
        try {
          await authApi.logout();
        } catch {}
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
