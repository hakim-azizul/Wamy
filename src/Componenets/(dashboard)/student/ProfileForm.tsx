"use client";

import { useEffect, useState, type FormEvent } from "react";
import {
  apiFetch,
  type SectionSaveResponse,
  type StudentDetailsBundleResponse,
} from "@/lib/api/api-client";
import {
  STUDENT_DETAIL_SECTIONS,
  type SectionMeta,
} from "@/lib/studentDetailsMeta";
import type { StudentProfileSectionKey } from "@/lib/types/studentDetails";
import { FormMessage, MetaField } from "../shared/FormFields";

type FormValues = Record<string, string>;
type ValuesBySection = Record<StudentProfileSectionKey, FormValues>;

function sectionValues(section: SectionMeta, doc: Record<string, unknown> | null): FormValues {
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

function emptyValues(): ValuesBySection {
  return Object.fromEntries(
    STUDENT_DETAIL_SECTIONS.map((section) => [section.key, sectionValues(section, null)]),
  ) as ValuesBySection;
}

function toPayload(section: SectionMeta, values: FormValues): Record<string, unknown> {
  const payload: Record<string, unknown> = {};
  for (const field of section.fields) {
    const raw = values[field.name] ?? "";
    if (field.type === "tags") {
      payload[field.name] = raw
        .split(/[،,]/)
        .map((item) => item.trim())
        .filter(Boolean);
    } else if (field.type === "number") {
      payload[field.name] = raw === "" ? null : Number(raw);
    } else {
      payload[field.name] = raw;
    }
  }
  return payload;
}

export default function ProfileForm() {
  const [active, setActive] = useState(0);
  const [values, setValues] = useState<ValuesBySection>(emptyValues);
  const [completed, setCompleted] = useState<Record<StudentProfileSectionKey, boolean>>({
    personal: false,
    academic: false,
    skills: false,
    achievements: false,
    additional: false,
  });
  const [completion, setCompletion] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    let mounted = true;
    apiFetch<StudentDetailsBundleResponse>("/api/student-details/me")
      .then((bundle) => {
        if (!mounted) return;
        setValues(
          Object.fromEntries(
            STUDENT_DETAIL_SECTIONS.map((section) => [
              section.key,
              sectionValues(section, bundle[section.key] as unknown as Record<string, unknown> | null),
            ]),
          ) as ValuesBySection,
        );
        setCompletion(bundle.completionSummary?.completedSections ?? 0);
        setCompleted(
          Object.fromEntries(
            STUDENT_DETAIL_SECTIONS.map((section) => [
              section.key,
              Boolean(
                (bundle[section.key] as { isCompleted?: boolean } | null)?.isCompleted,
              ),
            ]),
          ) as Record<StudentProfileSectionKey, boolean>,
        );
      })
      .catch((err) => {
        if (mounted) setError(err instanceof Error ? err.message : "تعذر تحميل بياناتك.");
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const section = STUDENT_DETAIL_SECTIONS[active];
  const sectionValuesState = values[section.key];

  function setValue(name: string, value: string) {
    setValues((current) => ({
      ...current,
      [section.key]: { ...current[section.key], [name]: value },
    }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccess("");

    const missingTags = section.fields.find(
      (field) =>
        field.required &&
        field.type === "tags" &&
        !(sectionValuesState[field.name] ?? "").trim(),
    );
    if (missingTags) {
      setError(`الحقل "${missingTags.label}" مطلوب.`);
      return;
    }

    setSaving(true);
    try {
      const response = await apiFetch<SectionSaveResponse>(
        `/api/student-details/${section.key}`,
        { method: "PUT", body: JSON.stringify(toPayload(section, sectionValuesState)) },
      );
      setCompleted((current) => ({ ...current, [section.key]: true }));
      setCompletion(response.completionSummary.completedSections);
      setSuccess(`تم حفظ قسم "${section.label}" بنجاح.`);
      if (active < STUDENT_DETAIL_SECTIONS.length - 1) {
        setActive(active + 1);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "تعذر حفظ البيانات.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <p className="text-sm text-[#657F71]">جارٍ تحميل بياناتك...</p>;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold text-[#1E4831] sm:text-3xl">بياناتي الشخصية</h1>
        <p className="mt-1 text-sm text-[#3E5E4D]">
          عبّئ الأقسام الخمسة واحفظ كل قسم؛ يمكنك العودة وتعديل أي قسم لاحقًا.
        </p>
      </div>

      <section className="rounded-2xl border border-[#D5C9AE] bg-[#F9F5EC] p-5 shadow-sm">
        <div className="mb-3 flex items-center justify-between">
          <span className="text-sm font-bold text-[#1E4831]">نسبة الإكمال</span>
          <span className="rounded-full border border-[#1E4831]/20 bg-white px-3 py-1 text-xs font-extrabold text-[#1E4831]">
            {completion}/5
          </span>
        </div>
        <div className="h-2.5 w-full overflow-hidden rounded-full bg-[#DDD1B2]">
          <div
            className="h-full rounded-full bg-[#1E4831] transition-all"
            style={{ width: `${(completion / 5) * 100}%` }}
          />
        </div>
      </section>

      <nav className="flex flex-wrap gap-2">
        {STUDENT_DETAIL_SECTIONS.map((item, index) => (
          <button
            key={item.key}
            type="button"
            onClick={() => {
              setActive(index);
              setError("");
              setSuccess("");
            }}
            className={`cursor-pointer rounded-xl border px-4 py-2.5 text-xs font-bold transition-colors ${
              index === active
                ? "border-[#1E4831] bg-[#1E4831] text-[#F9F5EC]"
                : "border-[#D5C9AE] bg-white text-[#3E5E4D] hover:border-[#1E4831]"
            }`}
          >
            {item.label}
            {completed[item.key] && <span className="mr-2 text-[#DE2F2C]">✓</span>}
          </button>
        ))}
      </nav>

      <section className="rounded-2xl border border-[#D5C9AE] bg-[#F9F5EC] p-6 shadow-sm">
        <div className="mb-6">
          <h2 className="text-lg font-extrabold text-[#1E4831]">{section.label}</h2>
          <p className="mt-1 text-xs text-[#657F71]">{section.description}</p>
        </div>

        <form onSubmit={handleSubmit} dir="rtl" className="space-y-5">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {section.fields.map((field) => (
              <div key={field.name} className={field.type === "textarea" ? "sm:col-span-2" : undefined}>
                <MetaField
                  meta={field}
                  value={sectionValuesState[field.name] ?? ""}
                  onChange={(value) => setValue(field.name, value)}
                />
              </div>
            ))}
          </div>

          {error && <FormMessage text={error} tone="error" />}
          {success && <FormMessage text={success} tone="success" />}

          <div className="flex flex-wrap gap-3 border-t border-[#D5C9AE] pt-5">
            {active > 0 && (
              <button
                type="button"
                onClick={() => setActive(active - 1)}
                className="cursor-pointer rounded-xl border border-[#D5C9AE] bg-white px-6 py-2.5 text-sm font-bold text-[#1E4831] transition-colors hover:bg-[#DDD1B2]/60"
              >
                السابق
              </button>
            )}
            <button
              type="submit"
              disabled={saving}
              className="cursor-pointer rounded-xl bg-[#DE2F2C] px-6 py-2.5 text-sm font-bold text-white transition-all hover:bg-[#BD221F] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving
                ? "جارٍ الحفظ..."
                : active === STUDENT_DETAIL_SECTIONS.length - 1
                  ? "حفظ القسم"
                  : "حفظ ومتابعة"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
