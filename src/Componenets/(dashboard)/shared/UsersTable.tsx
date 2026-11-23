"use client";

import { formatDate } from "@/lib/format";
import { ROLE_BADGE_CLASSES, ROLE_LABELS, STATUS_LABELS } from "@/lib/labels";
import type { IUser } from "@/lib/types/users";

export default function UsersTable({
  users,
  showScore = false,
}: {
  users: IUser[];
  showScore?: boolean;
}) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-[#D5C9AE] bg-[#F9F5EC]">
      <table className="w-full min-w-[720px] text-right text-sm">
        <thead className="bg-[#DCE6E0] text-[#1E4831]">
          <tr>
            <th className="px-4 py-3 font-bold">الاسم</th>
            <th className="px-4 py-3 font-bold">البريد الإلكتروني</th>
            <th className="px-4 py-3 font-bold">الدور</th>
            <th className="px-4 py-3 font-bold">الحالة</th>
            <th className="px-4 py-3 font-bold">الهاتف</th>
            {showScore && <th className="px-4 py-3 font-bold">الدرجة</th>}
            <th className="px-4 py-3 font-bold">تاريخ الإنشاء</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#D5C9AE]/70">
          {users.length === 0 ? (
            <tr>
              <td
                colSpan={showScore ? 7 : 6}
                className="px-4 py-8 text-center text-sm text-[#657F71]"
              >
                لا توجد بيانات لعرضها.
              </td>
            </tr>
          ) : (
            users.map((user) => (
              <tr key={user._id} className="transition-colors hover:bg-white">
                <td className="px-4 py-3 font-semibold text-[#1E4831]">{user.name}</td>
                <td className="px-4 py-3 text-[#3E5E4D]" dir="ltr">{user.email}</td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full border px-2.5 py-1 text-xs font-bold ${ROLE_BADGE_CLASSES[user.role]}`}
                  >
                    {ROLE_LABELS[user.role]}
                  </span>
                </td>
                <td className="px-4 py-3 text-[#3E5E4D]">{STATUS_LABELS[user.status]}</td>
                <td className="px-4 py-3 text-[#3E5E4D]" dir="ltr">{user.phone ?? "—"}</td>
                {showScore && (
                  <td className="px-4 py-3 font-bold text-[#1E4831]">
                    {user.studentProfile?.score ?? "—"}
                  </td>
                )}
                <td className="px-4 py-3 text-[#657F71]">{formatDate(user.createdAt)}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
