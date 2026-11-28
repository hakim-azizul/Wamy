"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowRight, FileUser, Pencil, Trophy } from "lucide-react";
import {
  apiFetch,
  type StudentDetailsBundleResponse,
} from "@/lib/api/api-client";
import WamyLoader from "@/Componenets/shared/WamyLoader";
import { ROLE_BADGE_CLASSES, ROLE_LABELS } from "@/lib/labels";
import { useDashboardUser } from "./DashboardShell";
import StudentDetailsViewer from "./StudentDetailsViewer";
import StudentEditModal from "./StudentEditModal";
import StudentScorePanel from "./StudentScorePanel";

type CvTab = "details" | "scores";

export default function StudentCvPage() {
  const params = useParams<{ userId: string }>();
  const userId = params.userId;
  const actor = useDashboardUser();
  const [bundle, setBundle] = useState<StudentDetailsBundleResponse | null>(null);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState(false);
  const [tab, setTab] = useState<CvTab>("details");

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
            التفاصيل الشخصية والأكاديمية ونظام النقاط في مكان واحد.
          </p>
        </div>

        {canEdit && bundle && tab === "details" && (
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

      <nav className="flex flex-wrap gap-2" aria-label="تبويبات ملف الطالب">
        <button
          type="button"
          onClick={() => setTab("details")}
          className={`inline-flex cursor-pointer items-center gap-2 rounded-xl border px-5 py-2.5 text-sm font-bold transition-colors ${
            tab === "details"
              ? "border-[#1E4831] bg-[#1E4831] text-[#F9F5EC]"
              : "border-[#D5C9AE] bg-white text-[#3E5E4D] hover:border-[#1E4831]"
          }`}
        >
          <FileUser className="h-4 w-4" />
          التفاصيل
        </button>
        <button
          type="button"
          onClick={() => setTab("scores")}
          className={`inline-flex cursor-pointer items-center gap-2 rounded-xl border px-5 py-2.5 text-sm font-bold transition-colors ${
            tab === "scores"
              ? "border-[#1E4831] bg-[#1E4831] text-[#F9F5EC]"
              : "border-[#D5C9AE] bg-white text-[#3E5E4D] hover:border-[#1E4831]"
          }`}
        >
          <Trophy className="h-4 w-4" />
          نظام النقاط
        </button>
      </nav>

      {error && (
        <p role="alert" className="rounded-xl border border-[#DE2F2C]/25 bg-[#FDE8E7] px-4 py-3 text-sm font-medium text-[#931815]">
          {error}
        </p>
      )}

      {!bundle && !error && (
        <WamyLoader label="جاري تحميل الملف..." variant="compact" />
      )}

      {bundle && tab === "details" && <StudentDetailsViewer bundle={bundle} />}

      {bundle && tab === "scores" && (
        <StudentScorePanel
          studentUserId={userId}
          student={
            bundle.user
              ? { name: bundle.user.name, email: bundle.user.email, score: (bundle.user as { score?: number }).score }
              : null
          }
        />
      )}

      {bundle && editing && tab === "details" && (
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
