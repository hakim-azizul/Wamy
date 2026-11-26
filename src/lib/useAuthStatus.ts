"use client";

import { useEffect, useState } from "react";
import {
  apiFetch,
  getToken,
  type UserResponse,
} from "@/lib/api/api-client";
import type { UserRole } from "@/lib/types/users";

/** Lightweight auth status for public pages (navbar/footer). */
export function useAuthStatus() {
  const [checking, setChecking] = useState(true);
  const [role, setRole] = useState<UserRole | null>(null);

  useEffect(() => {
    let active = true;
    if (!getToken()) {
      setRole(null);
      setChecking(false);
      return () => {
        active = false;
      };
    }

    apiFetch<UserResponse>("/api/auth/me")
      .then((data) => {
        if (active) setRole(data.user.role);
      })
      .catch(() => {
        if (active) setRole(null);
      })
      .finally(() => {
        if (active) setChecking(false);
      });

    return () => {
      active = false;
    };
  }, []);

  return { checking, isAuthenticated: Boolean(role), role };
}
