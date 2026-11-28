"use client";

import { useCallback, useState } from "react";
import { promoteUserToManager } from "@/lib/api/api-client";
import type { IUser } from "@/lib/types/users";

/** Shared promotion flow: confirm modal state, PATCH call, error feedback. */
export function useUserPromotion(onPromoted: (user: IUser) => void) {
  const [target, setTarget] = useState<IUser | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const open = useCallback((user: IUser) => {
    setError("");
    setTarget(user);
  }, []);

  const cancel = useCallback(() => {
    if (busy) return;
    setTarget(null);
    setError("");
  }, [busy]);

  const confirm = useCallback(async () => {
    if (!target || busy) return;
    setBusy(true);
    setError("");
    try {
      const { user } = await promoteUserToManager(target._id);
      onPromoted(user);
      setTarget(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "تعذر ترقية المشرف.");
    } finally {
      setBusy(false);
    }
  }, [target, busy, onPromoted]);

  return { target, busy, error, open, cancel, confirm };
}
