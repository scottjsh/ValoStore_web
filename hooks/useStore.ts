import { UserStoreResponse } from "pages/api/getUserStore";
import { useEffect, useState } from "react";
import { RiotAuthBundle } from "hooks/useAuth";

export const useStore = (authBundle: RiotAuthBundle) => {
  const [store, setStore] = useState<UserStoreResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authBundle === null) return;

    if (authBundle.expires < new Date()) {
      setError("Your access token has expired, please reload.");
      return;
    }

    const getStore = async () => {
      const storeResponse = await fetch("/api/getUserStore", {
        body: JSON.stringify(authBundle),
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      const storeObject: UserStoreResponse = await storeResponse.json();
      setStore(storeObject);
      setLoading(false);
    };

    getStore();
  }, [authBundle]);

  return { store, error, loading };
};
