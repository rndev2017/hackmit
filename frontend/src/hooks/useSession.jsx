import { useState, useEffect } from "react";
import { useSafeLocalStorage } from "./useSafeLocalStorage";

export function useSession() {
  const [session, setSession] = useSafeLocalStorage("sessionId", null)

  useEffect(() => {
    if (session === null) {
      let queryParams = new URLSearchParams(window.location.search)
      let sess = queryParams.get("sess")
      setSession(sess)
    }
  }, [session]);

  return [session];
};

