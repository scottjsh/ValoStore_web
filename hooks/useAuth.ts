import { AuthTokensResponse } from "pages/api/getAuthTokens";
import { useEffect, useState } from "react";
import { basePath } from "next.config"

const __store_LocalStorageKey = "__store_RiotAuthBundle";

export type RiotAuthBundle = AuthTokensResponse & { expires: Date };

export const useAuth = () => {
  const [authBundle, setAuthBundle] = useState<RiotAuthBundle | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const createAuthBundle = async (username: string, password: string, region: string) => {
    setLoading(true);
    const getAuthTokensResponse = await fetch(basePath+"/api/getAuthTokens", {
      body: JSON.stringify({ username, password, region }),
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });
    if (getAuthTokensResponse.status != 200) {
      setError(await getAuthTokensResponse.text());
      return;
    }

    const getAuthTokens: AuthTokensResponse =
      await getAuthTokensResponse.json();

    const now = new Date();
    // now + 55 minutes (well within the 60 minute riot key expiration time)
    const expires = new Date(now.getTime() + 55 * 60 * 1000);

    const finalBundle = { ...getAuthTokens, expires };
    setAuthBundle(finalBundle);
    localStorage.setItem(__store_LocalStorageKey, JSON.stringify(finalBundle));
    setLoading(false);
  };

  const clearAuthBundle = () => {
    setLoading(true);
    setAuthBundle(null);
    if (localStorage.getItem(__store_LocalStorageKey) !== null) {
      localStorage.removeItem(__store_LocalStorageKey);
    }
    setLoading(false);
  };

  useEffect(() => {
    const authBundleStorage = localStorage.getItem(__store_LocalStorageKey);
    if (authBundleStorage) {
      const authBundle = JSON.parse(authBundleStorage) as RiotAuthBundle;
      const expiration = new Date(authBundle.expires);
      console.log(expiration);

      if (authBundle !== null && expiration > new Date()) {
        // Convert LocalStorage date string to Date for state
        authBundle.expires = expiration;
        setAuthBundle(authBundle);
      }
    }
    setLoading(false);
  }, []);

  return { loading, authBundle, createAuthBundle, clearAuthBundle, error };
};
