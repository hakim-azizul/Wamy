"use client";

import { useCallback, useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  apiFetch,
  type UsersResponse,
} from "@/lib/api/api-client";
import type { IUser } from "@/lib/types/users";
import { useDashboardUser } from "../shared/DashboardShell";
import ConfirmDeleteModal from "../shared/ConfirmDeleteModal";
import { FormMessage } from "../shared/FormFields";
import UsersTable from "../shared/UsersTable";
import { useUserDeletion } from "../shared/useUserDeletion";

const ROLE_OPTIONS = [
  { value: "all", label: "كل الأدوار" },
  { value: "manager", label: "مدير" },
  { value: "supervisor", label: "مشرف" },
  { value: "student", label: "طالب" },
] as const;

type RoleFilter = (typeof ROLE_OPTIONS)[number]["value"];

function isRoleFilter(value: string | null): value is RoleFilter {
  return ROLE_OPTIONS.some((option) => option.value === value);
}

export default function UsersView() {
  const actor = useDashboardUser();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const rawRole = searchParams.get("role");
  const roleFilter: RoleFilter = isRoleFilter(rawRole) ? rawRole : "all";

  const [users, setUsers] = useState<IUser[]>([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const removeRow = useCallback((id: string) => {
    setUsers((current) => current.filter((user) => user._id !== id));
    setSuccess("تم حذف الحساب وجميع السجلات المرتبطة به.");
  }, []);
  const deletion = useUserDeletion(removeRow);

  /** Role sorting is URL-driven and applied by the backend query. */
  const load = useCallback(async () => {
    try {
      const query = roleFilter === "all" ? "" : `?role=${roleFilter}`;
      const data = await apiFetch<UsersResponse>(`/api/users${query}`);
      setUsers(data.users);
    } catch (err) {
      setError(err instanceof Error ? err.message : "تعذر تحميل المستخدمين.");
    }
  }, [roleFilter]);

  useEffect(() => {
    void load();
  }, [load]);

  function changeRole(next: RoleFilter) {
    const params = new URLSearchParams(searchParams.toString());
    if (next === "all") params.delete("role");
    else params.set("role", next);
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold text-[#1E4831] sm:text-3xl">كل المستخدمين</h1>
        <p className="mt-1 text-sm text-[#3E5E4D]">
          عرض المديرين والمشرفين والطلاب مع إمكانية التصفية حسب الدور.
        </p>
      </div>

      {error && <FormMessage text={error} tone="error" />}
      {success && <FormMessage text={success} tone="success" />}

      <section className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-extrabold text-[#1E4831]">
            إجمالي المستخدمين ({users.length})
          </h2>
          <div className="flex items-center gap-2">
            <label htmlFor="users-role" className="text-xs font-bold text-[#657F71]">
              الدور:
            </label>
            <select
              id="users-role"
              value={roleFilter}
              onChange={(event) => changeRole(event.target.value as RoleFilter)}
              className="rounded-lg border border-[#D5C9AE] bg-white px-3 py-1.5 text-xs font-bold text-[#1E4831] outline-none focus:border-[#1E4831]"
            >
              {ROLE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <UsersTable
          users={users}
          showCreatedBy
          actorRole={actor?.role}
          onRequestDelete={deletion.open}
        />
      </section>

      <ConfirmDeleteModal
        user={deletion.target}
        busy={deletion.busy}
        error={deletion.error}
        onCancel={deletion.cancel}
        onConfirm={() => void deletion.confirm()}
      />
    </div>
  );
}
