"use client";

import { useCallback, useState } from "react";
import { apiFetch, type UserResponse } from "@/lib/api/api-client";
import type { IUser } from "@/lib/types/users";

/** Shared delete flow: modal state + confirmed API call with error feedback. */
export function useUserDeletion(onDeleted: (id: string) => void) {
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
      await apiFetch<UserResponse>(`/api/users/${target._id}`, { method: "DELETE" });
      onDeleted(target._id);
      setTarget(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "تعذر حذف الحساب.");
    } finally {
      setBusy(false);
    }
  }, [target, busy, onDeleted]);

  return { target, busy, error, open, cancel, confirm };
}
