import { useCallback, useEffect, useMemo, useState } from "react";
import { tokenStore } from "../utils/storage";
import * as authApi from "../api/auth";
import { AuthContext } from "./auth-context";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [booting, setBooting] = useState(true);

  const hydrateUser = useCallback(async () => {
    const token = tokenStore.get();
    if (!token) {
      setUser(null);
      setBooting(false);
      return;
    }

    try {
      setBooting(true);
      const me = await authApi.me();
      setUser(me);
    } catch {
      tokenStore.clear();
      setUser(null);
    } finally {
      setBooting(false);
    }
  }, []);

  useEffect(() => {
    hydrateUser();
  }, [hydrateUser]);

  const doLogin = useCallback(async (email, password) => {
    const data = await authApi.login({ email, password });
    if (data?.token) tokenStore.set(data.token);
    const me = await authApi.me();
    setUser(me);
  }, []);

  const doRegister = useCallback(async (payload) => {
    await authApi.register(payload);
  }, []);

  const doLogout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch {
      
    }
    tokenStore.clear();
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      booting,
      isAuthed: !!user,
      doLogin,
      doRegister,
      hydrateUser,
      doLogout,
    }),
    [user, booting, doLogin, doRegister, hydrateUser, doLogout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
