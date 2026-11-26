"use client";

import { useState, type FormEvent } from "react";
import { Minus, Plus } from "lucide-react";
import {
  apiFetch,
  type ScoreAdjustResponse,
} from "@/lib/api/api-client";
import { VIOLATION_SEVERITY_OPTIONS } from "@/lib/scoreSystem";
import type { ViolationSeverity } from "@/lib/types/scores";
import { FormMessage, TextField } from "./FormFields";

export default function ScoreAdjustForm({
  studentUserId,
  studentLabel,
  onSuccess,
}: {
  studentUserId: string;
  studentLabel?: string;
  onSuccess?: (response: ScoreAdjustResponse) => void;
}) {
  const [direction, setDirection] = useState<"increase" | "decrease">("increase");
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");
  const [severity, setSeverity] = useState<ViolationSeverity>("simple");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccess("");

    const value = Number(amount);
    if (!Number.isInteger(value) || value <= 0) {
      setError("أدخل قيمة صحيحة أكبر من صفر.");
      return;
    }

    setBusy(true);
    try {
      const response = await apiFetch<ScoreAdjustResponse>("/api/scores", {
        method: "POST",
        body: JSON.stringify({
          studentUserId,
          delta: direction === "increase" ? value : -value,
          reason: reason.trim(),
          // Sent only for decreases; the server strips it for increases.
          ...(direction === "decrease" ? { violationSeverity: severity } : {}),
        }),
      });
      setSuccess(
        `تم تعديل الدرجة إلى ${response.student.score ?? response.transaction.newScore}.`,
      );
      setAmount("");
      setReason("");
      onSuccess?.(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : "تعذر تعديل الدرجة.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} dir="rtl" className="space-y-4">
      {studentLabel && (
        <p className="text-xs font-semibold text-[#657F71]">
          الطالب: <span className="text-[#1E4831]">{studentLabel}</span>
        </p>
      )}

      <div className="space-y-1.5">
        <label className="block text-sm font-bold text-[#1E4831]">نوع التعديل</label>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => {
              setDirection("increase");
              setError("");
            }}
            className={`flex cursor-pointer items-center justify-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-bold transition-colors ${
              direction === "increase"
                ? "border-[#1E4831] bg-[#E8F3ED] text-[#1E4831]"
                : "border-[#D5C9AE] bg-white text-[#657F71] hover:border-[#1E4831]"
            }`}
          >
            <Plus className="h-4 w-4" />
            زيادة
          </button>
          <button
            type="button"
            onClick={() => {
              setDirection("decrease");
              setError("");
            }}
            className={`flex cursor-pointer items-center justify-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-bold transition-colors ${
              direction === "decrease"
                ? "border-[#DE2F2C]/40 bg-[#FDE8E7] text-[#931815]"
                : "border-[#D5C9AE] bg-white text-[#657F71] hover:border-[#DE2F2C]"
            }`}
          >
            <Minus className="h-4 w-4" />
            خصم
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <TextField
          name="score-amount"
          label="القيمة"
          type="number"
          ltr
          required
          value={amount}
          onChange={setAmount}
          placeholder="مثال: 10"
        />
        {direction === "decrease" && (
          <div className="space-y-1.5">
            <label htmlFor="score-severity" className="block text-sm font-bold text-[#1E4831]">
              درجة المخالفة <span className="mr-1 text-[#DE2F2C]">*</span>
            </label>
            <select
              id="score-severity"
              required
              value={severity}
              onChange={(event) => setSeverity(event.target.value as ViolationSeverity)}
              className="w-full rounded-xl border border-[#D5C9AE] bg-white px-4 py-2.5 text-sm text-[#1E4831] outline-none focus:border-[#1E4831] focus:ring-2 focus:ring-[#1E4831]/15"
            >
              {VIOLATION_SEVERITY_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      <div className="space-y-1.5">
        <label htmlFor="score-reason" className="block text-sm font-bold text-[#1E4831]">
          السبب <span className="mr-1 text-[#DE2F2C]">*</span>
        </label>
        <textarea
          id="score-reason"
          required
          rows={2}
          value={reason}
          onChange={(event) => setReason(event.target.value)}
          placeholder="اكتب سبب الزيادة أو الخصم..."
          className="w-full rounded-xl border border-[#D5C9AE] bg-white px-4 py-2.5 text-sm text-[#1E4831] outline-none placeholder:text-[#657F71] focus:border-[#1E4831] focus:ring-2 focus:ring-[#1E4831]/15"
        />
      </div>

      {error && <FormMessage text={error} tone="error" />}
      {success && <FormMessage text={success} tone="success" />}

      <button
        type="submit"
        disabled={busy}
        className="cursor-pointer rounded-xl bg-[#DE2F2C] px-6 py-2.5 text-sm font-bold text-white transition-all hover:bg-[#BD221F] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {busy ? "جارٍ الحفظ..." : "حفظ التعديل"}
      </button>
    </form>
  );
}
