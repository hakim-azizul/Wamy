"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { apiFetch, setToken, type AuthResponse } from "@/lib/api/api-client";

export default function SignInForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const data = await apiFetch<AuthResponse>("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ email: email.trim().toLowerCase(), password }),
      });
      setToken(data.token);
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "تعذر تسجيل الدخول. حاول مرة أخرى.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} dir="rtl" className="space-y-5">
      <div className="space-y-1.5">
        <label htmlFor="signin-email" className="block text-sm font-semibold text-[#1E4831]">
          البريد الإلكتروني
        </label>
        <input
          id="signin-email"
          type="email"
          autoComplete="email"
          required
          dir="ltr"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="name@example.com"
          className="w-full rounded-xl border border-[#D5C9AE] bg-white px-4 py-3 text-left text-sm text-[#1E4831] outline-none transition-colors placeholder:text-[#657F71] focus:border-[#1E4831] focus:ring-2 focus:ring-[#1E4831]/15"
        />
      </div>

      <div className="space-y-1.5">
        <label htmlFor="signin-password" className="block text-sm font-semibold text-[#1E4831]">
          كلمة المرور
        </label>
        <input
          id="signin-password"
          type="password"
          autoComplete="current-password"
          required
          dir="ltr"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="••••••••"
          className="w-full rounded-xl border border-[#D5C9AE] bg-white px-4 py-3 text-left text-sm text-[#1E4831] outline-none transition-colors placeholder:text-[#657F71] focus:border-[#1E4831] focus:ring-2 focus:ring-[#1E4831]/15"
        />
      </div>

      {error && (
        <p
          role="alert"
          className="rounded-xl border border-[#DE2F2C]/25 bg-[#FDE8E7] px-4 py-3 text-sm font-medium text-[#931815]"
        >
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="w-full cursor-pointer rounded-xl bg-[#DE2F2C] px-5 py-3 text-sm font-bold text-white shadow-sm transition-all hover:bg-[#BD221F] active:bg-[#931815] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {submitting ? "جارٍ تسجيل الدخول..." : "تسجيل الدخول"}
      </button>

      <p className="text-center text-xs leading-relaxed text-[#657F71]">
        التسجيل متاح للمصرح لهم فقط عبر الإدارة. لا يوجد تسجيل عام.
      </p>
    </form>
  );
}
