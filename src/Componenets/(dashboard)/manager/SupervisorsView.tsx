"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import { ArrowUpCircle, Trash2 } from "lucide-react";
import {
  apiFetch,
  type UserResponse,
  type UsersResponse,
} from "@/lib/api/api-client";
import { STATUS_BADGE_CLASSES, STATUS_LABELS } from "@/lib/labels";
import type { IUser } from "@/lib/types/users";
import { FormMessage, TextField } from "../shared/FormFields";
import ConfirmDeleteModal from "../shared/ConfirmDeleteModal";
import ConfirmPromoteModal from "../shared/ConfirmPromoteModal";
import { useDashboardUser } from "../shared/DashboardShell";
import { canDeleteUser } from "@/lib/deletePermissions";
import { useUserDeletion } from "../shared/useUserDeletion";
import { useUserPromotion } from "../shared/useUserPromotion";

const EMPTY_FORM = { name: "", email: "", password: "", phone: "" };

export default function SupervisorsView() {
  const actor = useDashboardUser();
  const [supervisors, setSupervisors] = useState<IUser[]>([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const removeRow = useCallback((id: string) => {
    setSupervisors((current) => current.filter((supervisor) => supervisor._id !== id));
    setSuccess("تم حذف المشرف وجميع السجلات المرتبطة به.");
  }, []);
  const deletion = useUserDeletion(removeRow);

  const load = useCallback(async () => {
    try {
      const data = await apiFetch<UsersResponse>("/api/users");
      setSupervisors(data.users.filter((user) => user.role === "supervisor"));
    } catch (err) {
      setError(err instanceof Error ? err.message : "تعذر تحميل المشرفين.");
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const promotion = useUserPromotion((user) => {
    setSuccess(`تمت ترقية "${user.name}" إلى مدير بنجاح.`);
    void load();
  });

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccess("");
    setSubmitting(true);

    try {
      const { user } = await apiFetch<UserResponse>("/api/users/supervisors", {
        method: "POST",
        body: JSON.stringify({
          name: form.name.trim(),
          email: form.email.trim().toLowerCase(),
          password: form.password,
          phone: form.phone.trim() || null,
        }),
      });
      setSuccess(`تم إنشاء المشرف "${user.name}" بنجاح.`);
      setForm(EMPTY_FORM);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "تعذر إنشاء المشرف.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold text-[#1E4831] sm:text-3xl">المشرفون</h1>
        <p className="mt-1 text-sm text-[#3E5E4D]">يمكن للمدير إنشاء حسابات المشرفين فقط.</p>
      </div>

      <section className="rounded-2xl border border-[#D5C9AE] bg-[#F9F5EC] p-6 shadow-sm">
        <h2 className="mb-5 text-lg font-extrabold text-[#1E4831]">إنشاء مشرف جديد</h2>
        <form onSubmit={handleSubmit} dir="rtl" className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <TextField
            name="name"
            label="الاسم"
            value={form.name}
            onChange={(value) => setForm({ ...form, name: value })}
            placeholder="اسم المشرف"
            required
          />
          <TextField
            name="email"
            label="البريد الإلكتروني"
            type="email"
            ltr
            value={form.email}
            onChange={(value) => setForm({ ...form, email: value })}
            placeholder="supervisor@example.com"
            required
          />
          <TextField
            name="password"
            label="كلمة المرور"
            type="password"
            ltr
            value={form.password}
            onChange={(value) => setForm({ ...form, password: value })}
            placeholder="8 أحرف على الأقل"
            required
          />
          <TextField
            name="phone"
            label="الهاتف (اختياري)"
            type="tel"
            ltr
            value={form.phone}
            onChange={(value) => setForm({ ...form, phone: value })}
            placeholder="+20 ..."
          />

          {error && <FormMessage text={error} tone="error" />}
          {success && <FormMessage text={success} tone="success" />}

          <div className="sm:col-span-2">
            <button
              type="submit"
              disabled={submitting}
              className="cursor-pointer rounded-xl bg-[#DE2F2C] px-6 py-2.5 text-sm font-bold text-white transition-all hover:bg-[#BD221F] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? "جارٍ الإنشاء..." : "إنشاء المشرف"}
            </button>
          </div>
        </form>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-extrabold text-[#1E4831]">المشرفون ({supervisors.length})</h2>
        <div className="overflow-x-auto rounded-2xl border border-[#D5C9AE] bg-[#F9F5EC]">
          <table className="w-full min-w-[560px] text-right text-sm">
            <thead className="bg-[#DCE6E0] text-[#1E4831]">
              <tr>
                <th className="px-4 py-3 font-bold">الاسم</th>
                <th className="px-4 py-3 font-bold">البريد</th>
                <th className="px-4 py-3 font-bold">الهاتف</th>
                <th className="px-4 py-3 font-bold">الحالة</th>
                <th className="px-4 py-3 font-bold">إجراء</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#D5C9AE]/70">
              {supervisors.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-[#657F71]">لا يوجد مشرفون بعد.</td>
                </tr>
              ) : (
                supervisors.map((supervisor) => (
                  <tr key={supervisor._id} className="hover:bg-white">
                    <td className="px-4 py-3 font-semibold">{supervisor.name}</td>
                    <td className="px-4 py-3" dir="ltr">{supervisor.email}</td>
                    <td className="px-4 py-3" dir="ltr">{supervisor.phone ?? "—"}</td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full border px-2.5 py-1 text-xs font-bold ${STATUS_BADGE_CLASSES[supervisor.status]}`}>
                        {STATUS_LABELS[supervisor.status]}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {actor?.role === "manager" && (
                          <button
                            type="button"
                            onClick={() => promotion.open(supervisor)}
                            title="ترقية إلى مدير"
                            aria-label={`ترقية ${supervisor.name} إلى مدير`}
                            className="cursor-pointer rounded-lg border border-[#1E4831]/25 bg-[#DCE6E0] p-2 text-[#1E4831] transition-colors hover:bg-[#1E4831] hover:text-white"
                          >
                            <ArrowUpCircle className="h-4 w-4" />
                          </button>
                        )}
                        {canDeleteUser(actor?.role, supervisor) ? (
                          <button
                            type="button"
                            onClick={() => deletion.open(supervisor)}
                            title="حذف المشرف"
                            aria-label={`حذف ${supervisor.name}`}
                            className="cursor-pointer rounded-lg border border-[#DE2F2C]/25 bg-[#FDE8E7] p-2 text-[#DE2F2C] transition-colors hover:bg-[#DE2F2C] hover:text-white"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        ) : (
                          <span className="text-[#657F71]">—</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      <ConfirmDeleteModal
        user={deletion.target}
        busy={deletion.busy}
        error={deletion.error}
        onCancel={deletion.cancel}
        onConfirm={() => void deletion.confirm()}
      />

      <ConfirmPromoteModal
        user={promotion.target}
        busy={promotion.busy}
        error={promotion.error}
        onCancel={promotion.cancel}
        onConfirm={() => void promotion.confirm()}
      />
    </div>
  );
}
