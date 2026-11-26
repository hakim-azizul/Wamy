"use client";

import { useEffect, useState } from "react";
import {
  apiFetch,
  type StudentDetailsBundleResponse,
} from "@/lib/api/api-client";
import type { IUser } from "@/lib/types/users";
import StudentDetailsViewer from "./StudentDetailsViewer";

export default function StudentDirectory({
  students,
  showCompletion = false,
}: {
  students: IUser[];
  showCompletion?: boolean;
}) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [bundle, setBundle] = useState<StudentDetailsBundleResponse | null>(null);
  const [completion, setCompletion] = useState<Record<string, number>>({});
  const [error, setError] = useState("");

  useEffect(() => {
    if (!showCompletion) return;
    let active = true;

    Promise.all(
      students.map(async (student) => {
        try {
          const data = await apiFetch<StudentDetailsBundleResponse>(
            `/api/student-details/${student._id}`,
          );
          return [student._id, data.completionSummary?.completedSections ?? 0] as const;
        } catch {
          return [student._id, 0] as const;
        }
      }),
    )
      .then((entries) => {
        if (active) setCompletion(Object.fromEntries(entries));
      })
      .catch(() => undefined);

    return () => {
      active = false;
    };
  }, [students, showCompletion]);

  async function inspect(userId: string) {
    setError("");
    setSelectedId(userId);
    setBundle(null);
    try {
      const data = await apiFetch<StudentDetailsBundleResponse>(
        `/api/student-details/${userId}`,
      );
      setBundle(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "تعذر تحميل ملف الطالب.");
    }
  }

  return (
    <div className="space-y-6">
      <div className="overflow-x-auto rounded-2xl border border-[#D5C9AE] bg-[#F9F5EC]">
        <table className="w-full min-w-[640px] text-right text-sm">
          <thead className="bg-[#DCE6E0] text-[#1E4831]">
            <tr>
              <th className="px-4 py-3 font-bold">الطالب</th>
              <th className="px-4 py-3 font-bold">البريد الإلكتروني</th>
              <th className="px-4 py-3 font-bold">الغرفة</th>
              <th className="px-4 py-3 font-bold">الشقة</th>
              <th className="px-4 py-3 font-bold">أنشأه</th>
              <th className="px-4 py-3 font-bold">الدرجة</th>
              {showCompletion && <th className="px-4 py-3 font-bold">الاكتمال</th>}
              <th className="px-4 py-3 font-bold">إجراء</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#D5C9AE]/70">
            {students.length === 0 ? (
              <tr>
                <td colSpan={showCompletion ? 8 : 7} className="px-4 py-8 text-center text-[#657F71]">
                  لا يوجد طلاب بعد.
                </td>
              </tr>
            ) : (
              students.map((student) => (
                <tr key={student._id} className="transition-colors hover:bg-white">
                  <td className="px-4 py-3 font-semibold text-[#1E4831]">{student.name}</td>
                  <td className="px-4 py-3 text-[#3E5E4D]" dir="ltr">{student.email}</td>
                  <td className="px-4 py-3 text-[#3E5E4D]" dir="ltr">{student.roomNumber ?? "—"}</td>
                  <td className="px-4 py-3 text-[#3E5E4D]" dir="ltr">{student.flatNumber ?? "—"}</td>
                  <td className="px-4 py-3 text-[#3E5E4D]">{student.createdBy ?? "—"}</td>
                  <td className="px-4 py-3 font-bold text-[#1E4831]">{student.score ?? "—"}</td>
                  {showCompletion && (
                    <td className="px-4 py-3">
                      <span className="rounded-full border border-[#1E4831]/20 bg-white px-2.5 py-1 text-xs font-bold text-[#1E4831]">
                        {completion[student._id] ?? 0}/5
                      </span>
                    </td>
                  )}
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      onClick={() => void inspect(student._id)}
                      className="cursor-pointer rounded-lg border border-[#1E4831]/20 bg-white px-3 py-1.5 text-xs font-bold text-[#1E4831] transition-colors hover:border-[#DE2F2C] hover:text-[#DE2F2C]"
                    >
                      عرض الملف
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {error && (
        <p role="alert" className="rounded-xl border border-[#DE2F2C]/25 bg-[#FDE8E7] px-4 py-3 text-sm text-[#931815]">
          {error}
        </p>
      )}

      {selectedId && bundle && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-extrabold text-[#1E4831]">
              ملف الطالب: {students.find((student) => student._id === selectedId)?.name}
            </h2>
            <button
              type="button"
              onClick={() => {
                setSelectedId(null);
                setBundle(null);
              }}
              className="cursor-pointer rounded-lg border border-[#D5C9AE] bg-white px-3 py-1.5 text-xs font-bold text-[#657F71] hover:text-[#DE2F2C]"
            >
              إغلاق
            </button>
          </div>
          <StudentDetailsViewer bundle={bundle} />
        </div>
      )}
    </div>
  );
}
