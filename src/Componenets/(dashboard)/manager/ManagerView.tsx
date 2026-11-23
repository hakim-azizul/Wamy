"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import {
  apiFetch,
  type UserResponse,
  type UsersResponse,
} from "@/lib/api/api-client";
import type { IUser } from "@/lib/types/users";
import UsersTable from "../shared/UsersTable";

const EMPTY_FORM = { name: "", email: "", password: "", phone: "" };

export default function ManagerView() {
  const [users, setUsers] = useState<IUser[]>([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const loadUsers = useCallback(async () => {
    try {
      const data = await apiFetch<UsersResponse>("/api/users");
      setUsers(data.users);
    } catch (err) {
      setError(err instanceof Error ? err.message : "تعذر تحميل المستخدمين.");
    }
  }, []);

  useEffect(() => {
    void loadUsers();
  }, [loadUsers]);

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
      await loadUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : "تعذر إنشاء المشرف.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold text-[#1E4831] sm:text-3xl">لوحة المدير</h1>
        <p className="mt-1 text-sm text-[#3E5E4D]">
          إنشاء حسابات المشرفين وعرض جميع المستخدمين في النظام.
        </p>
      </div>

      <section className="rounded-2xl border border-[#D5C9AE] bg-[#F9F5EC] p-6 shadow-sm">
        <h2 className="mb-5 text-lg font-extrabold text-[#1E4831]">إنشاء مشرف جديد</h2>
        <form onSubmit={handleSubmit} dir="rtl" className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField
            label="الاسم"
            value={form.name}
            onChange={(value) => setForm({ ...form, name: value })}
            placeholder="اسم المشرف"
          />
          <FormField
            label="البريد الإلكتروني"
            type="email"
            dir="ltr"
            value={form.email}
            onChange={(value) => setForm({ ...form, email: value })}
            placeholder="supervisor@example.com"
          />
          <FormField
            label="كلمة المرور"
            type="password"
            dir="ltr"
            value={form.password}
            onChange={(value) => setForm({ ...form, password: value })}
            placeholder="8 أحرف على الأقل"
          />
          <FormField
            label="الهاتف (اختياري)"
            type="tel"
            dir="ltr"
            required={false}
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
        <h2 className="text-lg font-extrabold text-[#1E4831]">جميع المستخدمين ({users.length})</h2>
        <UsersTable users={users} showScore />
      </section>
    </div>
  );
}

function FormField({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  required = true,
  dir,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  placeholder?: string;
  required?: boolean;
  dir?: "ltr" | "rtl";
}) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-semibold text-[#1E4831]">{label}</label>
      <input
        type={type}
        dir={dir}
        required={required}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-[#D5C9AE] bg-white px-4 py-2.5 text-sm text-[#1E4831] outline-none transition-colors placeholder:text-[#657F71] focus:border-[#1E4831] focus:ring-2 focus:ring-[#1E4831]/15"
      />
    </div>
  );
}

function FormMessage({ text, tone }: { text: string; tone: "error" | "success" }) {
  return (
    <p
      role="alert"
      className={`rounded-xl border px-4 py-3 text-sm font-medium sm:col-span-2 ${
        tone === "error"
          ? "border-[#DE2F2C]/25 bg-[#FDE8E7] text-[#931815]"
          : "border-[#1E4831]/20 bg-[#DCE6E0] text-[#1E4831]"
      }`}
    >
      {text}
    </p>
  );
}
