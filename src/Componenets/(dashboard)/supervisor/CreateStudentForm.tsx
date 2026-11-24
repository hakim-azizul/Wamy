"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { apiFetch, type UserResponse } from "@/lib/api/api-client";
import { FormMessage, TextField } from "../shared/FormFields";

const EMPTY_FORM = { name: "", email: "", password: "", phone: "" };

export default function CreateStudentForm() {
  const router = useRouter();
  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccess("");
    setSubmitting(true);

    try {
      const { user } = await apiFetch<UserResponse>("/api/users/students", {
        method: "POST",
        body: JSON.stringify({
          name: form.name.trim(),
          email: form.email.trim().toLowerCase(),
          password: form.password,
          phone: form.phone.trim() || null,
        }),
      });
      setSuccess(`تم إنشاء حساب الطالب "${user.name}" بنجاح. سيقوم الطالب بتعبئة بياناته الخمسة بنفسه.`);
      setForm(EMPTY_FORM);
    } catch (err) {
      setError(err instanceof Error ? err.message : "تعذر إنشاء حساب الطالب.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold text-[#1E4831] sm:text-3xl">إضافة طالب جديد</h1>
        <p className="mt-1 text-sm text-[#3E5E4D]">
          يتم إنشاء حساب دخول خفيف فقط؛ يكمل الطالب بياناته الشخصية والأكاديمية لاحقًا.
        </p>
      </div>

      <section className="rounded-2xl border border-[#D5C9AE] bg-[#F9F5EC] p-6 shadow-sm">
        <form onSubmit={handleSubmit} dir="rtl" className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <TextField
            name="name"
            label="اسم الطالب"
            value={form.name}
            onChange={(value) => setForm({ ...form, name: value })}
            placeholder="الاسم الكامل"
            required
          />
          <TextField
            name="email"
            label="البريد الإلكتروني"
            type="email"
            ltr
            value={form.email}
            onChange={(value) => setForm({ ...form, email: value })}
            placeholder="student@example.com"
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

          <p className="rounded-xl border border-[#1E4831]/15 bg-[#DCE6E0] px-4 py-3 text-xs text-[#3E5E4D] sm:col-span-2">
            درجة المراجعة تُضاف تلقائيًا من إعداد الخادم
            <span dir="ltr" className="mx-1 font-bold">INITIAL_REVIEW_SCORE</span>
            ولا تُدخل يدويًا هنا.
          </p>

          {error && <FormMessage text={error} tone="error" />}
          {success && <FormMessage text={success} tone="success" />}

          <div className="flex flex-wrap gap-3 sm:col-span-2">
            <button
              type="submit"
              disabled={submitting}
              className="cursor-pointer rounded-xl bg-[#DE2F2C] px-6 py-2.5 text-sm font-bold text-white transition-all hover:bg-[#BD221F] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? "جارٍ الإنشاء..." : "إنشاء حساب الطالب"}
            </button>
            <button
              type="button"
              onClick={() => router.push("/dashboard/supervisor/students")}
              className="cursor-pointer rounded-xl border border-[#D5C9AE] bg-white px-6 py-2.5 text-sm font-bold text-[#1E4831] transition-colors hover:bg-[#DDD1B2]/60"
            >
              العودة للطلاب
            </button>
          </div>
        </form>
      </section>

      <Link href="/dashboard/supervisor/students" className="text-sm font-semibold text-[#1E4831] hover:text-[#DE2F2C]">
        عرض قائمة الطلاب
      </Link>
    </div>
  );
}
