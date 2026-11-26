"use client";

import { useEffect } from "react";
import { Trash2, X } from "lucide-react";
import { ROLE_BADGE_CLASSES, ROLE_LABELS } from "@/lib/labels";
import type { IUser } from "@/lib/types/users";

interface ConfirmDeleteModalProps {
  user: IUser | null;
  busy: boolean;
  error: string;
  onCancel: () => void;
  onConfirm: () => void;
}

export default function ConfirmDeleteModal({
  user,
  busy,
  error,
  onCancel,
  onConfirm,
}: ConfirmDeleteModalProps) {
  useEffect(() => {
    if (!user) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && !busy) onCancel();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [user, busy, onCancel]);

  if (!user) return null;

  return (
    <div
      dir="rtl"
      className="fixed inset-0 z-[70] flex items-center justify-center bg-[#132F20]/55 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-delete-title"
    >
      <div className="w-full max-w-md rounded-3xl border border-[#D5C9AE] bg-[#F9F5EC] shadow-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-[#D5C9AE] p-6">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-[#DE2F2C]/25 bg-[#FDE8E7] text-[#DE2F2C]">
              <Trash2 className="h-5 w-5" />
            </span>
            <div>
              <h2 id="confirm-delete-title" className="text-lg font-extrabold text-[#1E4831]">
                تأكيد حذف الحساب
              </h2>
              <p className="mt-1 text-xs text-[#657F71]">لا يمكن التراجع عن هذا الإجراء.</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onCancel}
            disabled={busy}
            aria-label="إغلاق"
            className="cursor-pointer rounded-lg p-1.5 text-[#657F71] transition-colors hover:bg-[#DCE6E0] hover:text-[#1E4831] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4 p-6">
          <p className="text-sm leading-relaxed text-[#3E5E4D]">
            هل أنت متأكد من حذف الحساب التالي؟ سيتم حذف بياناته وجميع السجلات المرتبطة به.
          </p>

          <div className="space-y-3 rounded-2xl border border-[#D5C9AE] bg-white p-4">
            <div className="flex items-center justify-between gap-4">
              <span className="text-xs font-semibold text-[#657F71]">الاسم</span>
              <span className="text-sm font-bold text-[#1E4831]">{user.name}</span>
            </div>
            <div className="flex items-center justify-between gap-4 border-t border-[#D5C9AE]/60 pt-3">
              <span className="text-xs font-semibold text-[#657F71]">البريد الإلكتروني</span>
              <span dir="ltr" className="text-sm font-bold text-[#1E4831]">{user.email}</span>
            </div>
            <div className="flex items-center justify-between gap-4 border-t border-[#D5C9AE]/60 pt-3">
              <span className="text-xs font-semibold text-[#657F71]">الدور</span>
              <span className={`rounded-full border px-2.5 py-1 text-xs font-bold ${ROLE_BADGE_CLASSES[user.role]}`}>
                {ROLE_LABELS[user.role]}
              </span>
            </div>
          </div>

          {error && (
            <p role="alert" className="rounded-xl border border-[#DE2F2C]/25 bg-[#FDE8E7] px-4 py-3 text-sm font-medium text-[#931815]">
              {error}
            </p>
          )}

          <div className="flex flex-wrap gap-3 pt-2">
            <button
              type="button"
              onClick={onConfirm}
              disabled={busy}
              className="cursor-pointer rounded-xl bg-[#DE2F2C] px-6 py-2.5 text-sm font-bold text-white transition-all hover:bg-[#BD221F] active:bg-[#931815] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {busy ? "جارٍ الحذف..." : "تأكيد الحذف"}
            </button>
            <button
              type="button"
              onClick={onCancel}
              disabled={busy}
              className="cursor-pointer rounded-xl border border-[#D5C9AE] bg-white px-6 py-2.5 text-sm font-bold text-[#1E4831] transition-colors hover:bg-[#DDD1B2]/60 disabled:cursor-not-allowed disabled:opacity-60"
            >
              إلغاء
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
