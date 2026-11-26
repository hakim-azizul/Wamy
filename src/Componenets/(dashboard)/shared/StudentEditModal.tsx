"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Pencil, X } from "lucide-react";
import {
  apiFetch,
  type StudentDetailsBundleResponse,
} from "@/lib/api/api-client";
import {
  STUDENT_DETAIL_SECTIONS,
  type FieldMeta,
  type SectionMeta,
} from "@/lib/studentDetailsMeta";
import type { StudentProfileSectionKey } from "@/lib/types/studentDetails";
import { FormMessage, MetaField, ReadOnlyField } from "./FormFields";

type FormValues = Record<string, string>;
type SectionPayload = Record<string, unknown>;

function toFormValues(section: SectionMeta, doc: Record<string, unknown> | null): FormValues {
  const result: FormValues = {};
  for (const field of section.fields) {
    const value = doc?.[field.name];
    if (field.type === "tags") {
      result[field.name] = Array.isArray(value) ? value.join(", ") : "";
    } else if (value !== null && value !== undefined) {
      result[field.name] = String(value);
    } else if (!doc && field.type === "select" && field.required) {
      result[field.name] = field.options?.[0]?.value ?? "";
    } else {
      result[field.name] = "";
    }
  }
  return result;
}

function toPayload(section: SectionMeta, values: FormValues): SectionPayload {
  const payload: SectionPayload = {};
  for (const field of section.fields) {
    const raw = values[field.name] ?? "";
    if (field.type === "tags") {
      payload[field.name] = raw.trim() === "" ? null : raw.split(/[،,]/).map((item) => item.trim()).filter(Boolean);
    } else if (field.type === "number") {
      payload[field.name] = raw.trim() === "" ? null : Number(raw);
    } else {
      payload[field.name] = raw;
    }
  }
  return payload;
}

interface StudentEditModalProps {
  userId: string;
  bundle: StudentDetailsBundleResponse;
  onClose: () => void;
  onUpdated: (bundle: StudentDetailsBundleResponse) => void;
}

export default function StudentEditModal({
  userId,
  bundle,
  onClose,
  onUpdated,
}: StudentEditModalProps) {
  const [sectionKey, setSectionKey] = useState<StudentProfileSectionKey>("personal");
  const [valuesBySection, setValuesBySection] = useState<Record<StudentProfileSectionKey, FormValues>>(
    () =>
      Object.fromEntries(
        STUDENT_DETAIL_SECTIONS.map((section) => [
          section.key,
          toFormValues(section, bundle[section.key] as unknown as Record<string, unknown> | null),
        ]),
      ) as Record<StudentProfileSectionKey, FormValues>,
  );
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const section = useMemo(
    () => STUDENT_DETAIL_SECTIONS.find((item) => item.key === sectionKey) ?? STUDENT_DETAIL_SECTIONS[0],
    [sectionKey],
  );
  const values = valuesBySection[section.key] ?? {};

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && !busy) onClose();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [busy, onClose]);

  function setValue(field: FieldMeta, value: string) {
    setValuesBySection((current) => ({
      ...current,
      [section.key]: { ...current[section.key], [field.name]: value },
    }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setBusy(true);
    try {
      const updated = await apiFetch<StudentDetailsBundleResponse>(
        `/api/student-details/${userId}/details`,
        {
          method: "PATCH",
          body: JSON.stringify({ section: section.key, fields: toPayload(section, values) }),
        },
      );
      onUpdated(updated);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "تعذر حفظ التعديلات.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div
      dir="rtl"
      className="fixed inset-0 z-[70] flex items-center justify-center bg-[#132F20]/55 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="edit-details-title"
    >
      <div className="flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-3xl border border-[#D5C9AE] bg-[#F9F5EC] shadow-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-[#D5C9AE] p-6">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-[#1E4831]/20 bg-[#DCE6E0] text-[#1E4831]">
              <Pencil className="h-5 w-5" />
            </span>
            <div>
              <h2 id="edit-details-title" className="text-lg font-extrabold text-[#1E4831]">
                تعديل بيانات الطالب
              </h2>
              <p className="mt-1 text-xs text-[#657F71]">
                اختر نوع البيانات المطلوب تعديله، ثم عدّل الحقول واحفظ.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={busy}
            aria-label="إغلاق"
            className="cursor-pointer rounded-lg p-1.5 text-[#657F71] transition-colors hover:bg-[#DCE6E0] hover:text-[#1E4831] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
          <div className="min-h-0 flex-1 space-y-5 overflow-y-auto p-6">
            <div className="space-y-1.5">
              <label className="block text-sm font-bold text-[#1E4831]">نوع البيانات</label>
              <select
                value={section.key}
                onChange={(event) => {
                  setSectionKey(event.target.value as StudentProfileSectionKey);
                  setError("");
                }}
                className="w-full rounded-xl border border-[#D5C9AE] bg-white px-4 py-2.5 text-sm font-semibold text-[#1E4831] outline-none focus:border-[#1E4831] focus:ring-2 focus:ring-[#1E4831]/15"
              >
                {STUDENT_DETAIL_SECTIONS.map((item) => (
                  <option key={item.key} value={item.key}>{item.label}</option>
                ))}
              </select>
            </div>

            {bundle.user && (
              <div className="rounded-xl border border-dashed border-[#B9A988] bg-[#F4EFE2] p-4">
                <p className="mb-3 text-xs font-bold text-[#657F71]">
                  بيانات الحساب — للقراءة فقط (لا تُعدّل من هنا)
                </p>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <ReadOnlyField label="البريد الإلكتروني" value={bundle.user.email} ltr />
                  <ReadOnlyField label="رقم الغرفة" value={bundle.user.roomNumber} ltr />
                  <ReadOnlyField label="رقم الشقة" value={bundle.user.flatNumber} ltr />
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {section.fields.map((field) => (
                <div key={field.name} className={field.type === "textarea" ? "sm:col-span-2" : undefined}>
                  <MetaField
                    meta={field}
                    value={values[field.name] ?? ""}
                    onChange={(value) => setValue(field, value)}
                  />
                </div>
              ))}
            </div>

            {error && <FormMessage text={error} tone="error" />}
          </div>

          <div className="flex flex-wrap gap-3 border-t border-[#D5C9AE] bg-[#F9F5EC] p-6">
            <button
              type="submit"
              disabled={busy}
              className="cursor-pointer rounded-xl bg-[#DE2F2C] px-6 py-2.5 text-sm font-bold text-white transition-all hover:bg-[#BD221F] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {busy ? "جارٍ الحفظ..." : "حفظ التعديلات"}
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
