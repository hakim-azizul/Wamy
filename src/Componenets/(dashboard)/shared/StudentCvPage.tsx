"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowRight, Pencil } from "lucide-react";
import {
  apiFetch,
  type StudentDetailsBundleResponse,
} from "@/lib/api/api-client";
import { ROLE_BADGE_CLASSES, ROLE_LABELS } from "@/lib/labels";
import { useDashboardUser } from "./DashboardShell";
import StudentDetailsViewer from "./StudentDetailsViewer";
import StudentEditModal from "./StudentEditModal";

export default function StudentCvPage() {
  const params = useParams<{ userId: string }>();
  const userId = params.userId;
  const actor = useDashboardUser();
  const [bundle, setBundle] = useState<StudentDetailsBundleResponse | null>(null);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    let active = true;
    apiFetch<StudentDetailsBundleResponse>(`/api/student-details/${userId}`)
      .then((data) => {
        if (active) setBundle(data);
      })
      .catch((err) => {
        if (active) setError(err instanceof Error ? err.message : "تعذر تحميل ملف الطالب.");
      });
    return () => {
      active = false;
    };
  }, [userId]);

  const canEdit = actor?.role === "manager" || actor?.role === "supervisor";

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-2">
          <Link
            href={actor?.role === "manager" ? "/dashboard/manager/students" : "/dashboard/supervisor/students"}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#657F71] transition-colors hover:text-[#DE2F2C]"
          >
            العودة لقائمة الطلاب
            <ArrowRight className="h-4 w-4" />
          </Link>
          <h1 className="text-2xl font-extrabold text-[#1E4831] sm:text-3xl">
            ملف الطالب الكامل
          </h1>
          <p className="text-sm text-[#3E5E4D]">
            السيرة الذاتية الأكاديمية والشخصية موزّعة على خمسة أقسام.
          </p>
        </div>

        {canEdit && bundle && (
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-[#1E4831] px-5 py-2.5 text-sm font-bold text-[#F9F5EC] transition-colors hover:bg-[#132F20]"
          >
            <Pencil className="h-4 w-4" />
            تعديل
          </button>
        )}
      </div>

      {bundle?.user && (
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-[#1E4831]/20 bg-[#EBE2CA] px-6 py-5">
          <div className="flex items-center gap-4">
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#1E4831] text-xl font-extrabold text-[#F9F5EC]">
              {bundle.user.name.charAt(0)}
            </span>
            <div>
              <p className="text-lg font-extrabold text-[#1E4831]">{bundle.user.name}</p>
              <p dir="ltr" className="text-xs text-[#657F71]">{bundle.user.email}</p>
            </div>
          </div>
          {actor && (
            <span className={`rounded-full border px-3 py-1 text-xs font-bold ${ROLE_BADGE_CLASSES[actor.role]}`}>
              {ROLE_LABELS[actor.role]}
            </span>
          )}
        </div>
      )}

      {error && (
        <p role="alert" className="rounded-xl border border-[#DE2F2C]/25 bg-[#FDE8E7] px-4 py-3 text-sm font-medium text-[#931815]">
          {error}
        </p>
      )}

      {!bundle && !error && <p className="text-sm text-[#657F71]">جارٍ تحميل الملف...</p>}

      {bundle && <StudentDetailsViewer bundle={bundle} />}

      {bundle && editing && (
        <StudentEditModal
          userId={userId}
          bundle={bundle}
          onClose={() => setEditing(false)}
          onUpdated={setBundle}
        />
      )}
    </div>
  );
}
