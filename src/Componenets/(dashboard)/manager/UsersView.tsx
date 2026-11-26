"use client";

import { useCallback, useEffect, useState } from "react";
import {
  apiFetch,
  type UserResponse,
  type UsersResponse,
} from "@/lib/api/api-client";
import type { IUser } from "@/lib/types/users";
import { useDashboardUser } from "../shared/DashboardShell";
import ConfirmDeleteModal from "../shared/ConfirmDeleteModal";
import { FormMessage } from "../shared/FormFields";
import UsersTable from "../shared/UsersTable";
import { useUserDeletion } from "../shared/useUserDeletion";

export default function UsersView() {
  const actor = useDashboardUser();
  const [users, setUsers] = useState<IUser[]>([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const removeRow = useCallback((id: string) => {
    setUsers((current) => current.filter((user) => user._id !== id));
    setSuccess("تم حذف الحساب وجميع السجلات المرتبطة به.");
  }, []);
  const deletion = useUserDeletion(removeRow);

  const load = useCallback(async () => {
    try {
      const data = await apiFetch<UsersResponse>("/api/users");
      setUsers(data.users);
    } catch (err) {
      setError(err instanceof Error ? err.message : "تعذر تحميل المستخدمين.");
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function handleScoreChange(userId: string, score: number) {
    setError("");
    setSuccess("");
    try {
      const { user } = await apiFetch<UserResponse>(`/api/users/${userId}/score`, {
        method: "PATCH",
        body: JSON.stringify({ score }),
      });
      setUsers((current) => current.map((item) => (item._id === userId ? user : item)));
      setSuccess(`تم تحديث درجة "${user.name}" إلى ${user.score ?? score}.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "تعذر تحديث الدرجة.");
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold text-[#1E4831] sm:text-3xl">كل المستخدمين</h1>
        <p className="mt-1 text-sm text-[#3E5E4D]">
          عرض المديرين والمشرفين والطلاب، وإدارة درجة المراجعة للطلاب.
        </p>
      </div>

      {error && <FormMessage text={error} tone="error" />}
      {success && <FormMessage text={success} tone="success" />}

      <section className="space-y-4">
        <h2 className="text-lg font-extrabold text-[#1E4831]">إجمالي المستخدمين ({users.length})</h2>
        <UsersTable
          users={users}
          showScore
          showCreatedBy
          onScoreChange={(userId, score) => void handleScoreChange(userId, score)}
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
