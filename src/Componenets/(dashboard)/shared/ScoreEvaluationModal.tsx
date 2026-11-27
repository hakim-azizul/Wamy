"use client";

import { useEffect, useState, type FormEvent } from "react";
import { Minus, Plus, X } from "lucide-react";
import {
  apiFetch,
  type ScoreAdjustResponse,
} from "@/lib/api/api-client";
import {
  SCORE_REASON_MAX_LENGTH,
  VIOLATION_SEVERITY_OPTIONS,
} from "@/lib/scoreSystem";
import type { ViolationSeverity } from "@/lib/types/scores";
import { FormMessage, TextField } from "./FormFields";

type Tab = "increase" | "decrease";

/**
 * RTL evaluation modal for office roles: two tabs (زيادة / خصم) backed by the
 * existing POST /api/scores endpoint and its conditional severity rules.
 */
export default function ScoreEvaluationModal({
  studentUserId,
  studentName,
  onClose,
  onSuccess,
}: {
  studentUserId: string;
  studentName?: string;
  onClose: () => void;
  onSuccess: (response: ScoreAdjustResponse) => void;
}) {
  const [tab, setTab] = useState<Tab>("increase");
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");
  const [severity, setSeverity] = useState<ViolationSeverity>("simple");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && !busy) onClose();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [busy, onClose]);

  function switchTab(next: Tab) {
    setTab(next);
    setError("");
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    const value = Number(amount);
    if (!Number.isInteger(value) || value <= 0) {
      setError("أدخل قيمة صحيحة أكبر من صفر.");
      return;
    }
    if (!reason.trim()) {
      setError("السبب مطلوب.");
      return;
    }
    if (reason.trim().length > SCORE_REASON_MAX_LENGTH) {
      setError(`السبب يجب ألا يتجاوز ${SCORE_REASON_MAX_LENGTH} حرفًا.`);
      return;
    }

    setBusy(true);
    try {
      const response = await apiFetch<ScoreAdjustResponse>("/api/scores", {
        method: "POST",
        body: JSON.stringify({
          studentUserId,
          delta: tab === "increase" ? value : -value,
          reason: reason.trim(),
          ...(tab === "decrease" ? { violationSeverity: severity } : {}),
        }),
      });
      onSuccess(response);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "تعذر حفظ التقييم.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div
      dir="rtl"
      className="fixed inset-0 z-70 flex items-center justify-center bg-[#132F20]/55 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="evaluation-modal-title"
    >
      <div className="w-full max-w-lg rounded-3xl border border-white/70 bg-[#F9F5EC]/95 p-6 shadow-2xl backdrop-blur-xl">
        <div className="mb-5 flex items-start justify-between gap-4 border-b border-[#D5C9AE] pb-4">
          <div>
            <h2 id="evaluation-modal-title" className="text-lg font-extrabold text-[#1E4831]">
              تقييم الطالب
            </h2>
            <p className="mt-1 text-xs text-[#657F71]">
              {studentName ? `تعديل درجة: ${studentName}` : "اختر نوع التعديل وأدخل القيمة والسبب."}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={busy}
            aria-label="إغلاق"
            className="cursor-pointer rounded-lg p-1.5 text-[#657F71] transition-colors hover:bg-[#DCE6E0] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mb-5 grid grid-cols-2 gap-2 rounded-xl bg-[#EBE2CA] p-1">
          <button
            type="button"
            onClick={() => switchTab("increase")}
            className={`flex cursor-pointer items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-bold transition-colors ${
              tab === "increase"
                ? "bg-white text-[#1E4831] shadow-sm"
                : "text-[#657F71] hover:text-[#1E4831]"
            }`}
          >
            <Plus className="h-4 w-4" />
            زيادة
          </button>
          <button
            type="button"
            onClick={() => switchTab("decrease")}
            className={`flex cursor-pointer items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-bold transition-colors ${
              tab === "decrease"
                ? "bg-white text-[#931815] shadow-sm"
                : "text-[#657F71] hover:text-[#931815]"
            }`}
          >
            <Minus className="h-4 w-4" />
            خصم
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <TextField
              name="evaluation-amount"
              label="القيمة"
              type="number"
              ltr
              required
              value={amount}
              onChange={setAmount}
              placeholder="مثال: 10"
            />
            {tab === "decrease" && (
              <div className="space-y-1.5">
                <label htmlFor="evaluation-severity" className="block text-sm font-bold text-[#1E4831]">
                  درجة المخالفة <span className="mr-1 text-[#DE2F2C]">*</span>
                </label>
                <select
                  id="evaluation-severity"
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
            <label htmlFor="evaluation-reason" className="block text-sm font-bold text-[#1E4831]">
              السبب <span className="mr-1 text-[#DE2F2C]">*</span>
            </label>
            <textarea
              id="evaluation-reason"
              required
              rows={3}
              maxLength={SCORE_REASON_MAX_LENGTH}
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              placeholder="اكتب سبب الزيادة أو الخصم..."
              className="w-full rounded-xl border border-[#D5C9AE] bg-white px-4 py-2.5 text-sm text-[#1E4831] outline-none placeholder:text-[#657F71] focus:border-[#1E4831] focus:ring-2 focus:ring-[#1E4831]/15"
            />
            <p
              dir="ltr"
              className={`text-left text-[11px] font-semibold ${
                reason.length >= SCORE_REASON_MAX_LENGTH ? "text-[#DE2F2C]" : "text-[#657F71]"
              }`}
            >
              {reason.length} / {SCORE_REASON_MAX_LENGTH}
            </p>
          </div>

          {error && <FormMessage text={error} tone="error" />}

          <div className="flex flex-wrap gap-3 border-t border-[#D5C9AE] pt-4">
            <button
              type="submit"
              disabled={busy}
              className="cursor-pointer rounded-xl bg-[#DE2F2C] px-6 py-2.5 text-sm font-bold text-white transition-all hover:bg-[#BD221F] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {busy ? "جارٍ الحفظ..." : "حفظ التقييم"}
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={busy}
              className="cursor-pointer rounded-xl border border-[#D5C9AE] bg-white px-6 py-2.5 text-sm font-bold text-[#1E4831] transition-colors hover:bg-[#DDD1B2]/60 disabled:cursor-not-allowed disabled:opacity-60"
            >
              إلغاء
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
