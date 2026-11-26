"use client";

import { useEffect, useState } from "react";
import { Trash2 } from "lucide-react";
import { formatDate } from "@/lib/format";
import { canDeleteUser } from "@/lib/deletePermissions";
import {
  ROLE_BADGE_CLASSES,
  ROLE_LABELS,
  STATUS_BADGE_CLASSES,
  STATUS_LABELS,
} from "@/lib/labels";
import type { IUser } from "@/lib/types/users";

export default function UsersTable({
  users,
  showScore = false,
  showCreatedBy = false,
  onScoreChange,
  actorRole,
  onRequestDelete,
}: {
  users: IUser[];
  showScore?: boolean;
  showCreatedBy?: boolean;
  onScoreChange?: (userId: string, score: number) => void;
  actorRole?: IUser["role"];
  onRequestDelete?: (user: IUser) => void;
}) {
  const showDelete = Boolean(actorRole && onRequestDelete);
  const columnCount =
    6 + (showScore ? 1 : 0) + (showCreatedBy ? 1 : 0) + (showDelete ? 1 : 0);

  return (
    <div className="overflow-x-auto rounded-2xl border border-[#D5C9AE] bg-[#F9F5EC]">
      <table className="w-full min-w-[760px] text-right text-sm">
        <thead className="bg-[#DCE6E0] text-[#1E4831]">
          <tr>
            <th className="px-4 py-3 font-bold">الاسم</th>
            <th className="px-4 py-3 font-bold">البريد الإلكتروني</th>
            <th className="px-4 py-3 font-bold">الدور</th>
            <th className="px-4 py-3 font-bold">الحالة</th>
            {showCreatedBy && <th className="px-4 py-3 font-bold">أنشأه</th>}
            <th className="px-4 py-3 font-bold">الهاتف</th>
            {showScore && <th className="px-4 py-3 font-bold">الدرجة</th>}
            <th className="px-4 py-3 font-bold">تاريخ الإنشاء</th>
            {showDelete && <th className="px-4 py-3 font-bold">إجراء</th>}
          </tr>
        </thead>
        <tbody className="divide-y divide-[#D5C9AE]/70">
          {users.length === 0 ? (
            <tr>
              <td colSpan={columnCount} className="px-4 py-8 text-center text-sm text-[#657F71]">
                لا توجد بيانات لعرضها.
              </td>
            </tr>
          ) : (
            users.map((user) => (
              <tr key={user._id} className="transition-colors hover:bg-white">
                <td className="px-4 py-3 font-semibold text-[#1E4831]">{user.name}</td>
                <td className="px-4 py-3 text-[#3E5E4D]" dir="ltr">{user.email}</td>
                <td className="px-4 py-3">
                  <span className={`rounded-full border px-2.5 py-1 text-xs font-bold ${ROLE_BADGE_CLASSES[user.role]}`}>
                    {ROLE_LABELS[user.role]}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className={`rounded-full border px-2.5 py-1 text-xs font-bold ${STATUS_BADGE_CLASSES[user.status]}`}>
                    {STATUS_LABELS[user.status]}
                  </span>
                </td>
                {showCreatedBy && (
                  <td className="px-4 py-3 text-[#3E5E4D]">{user.createdBy ?? "—"}</td>
                )}
                <td className="px-4 py-3 text-[#3E5E4D]" dir="ltr">{user.phone ?? "—"}</td>
                {showScore && (
                  <td className="px-4 py-3">
                    {user.role !== "student" ? (
                      <span className="text-[#657F71]">—</span>
                    ) : onScoreChange ? (
                      <ScoreCell
                        userId={user._id}
                        score={user.score}
                        onSave={onScoreChange}
                      />
                    ) : (
                      <span className="font-bold text-[#1E4831]">{user.score ?? "—"}</span>
                    )}
                  </td>
                )}
                <td className="px-4 py-3 text-[#657F71]">{formatDate(user.createdAt)}</td>
                {showDelete && (
                  <td className="px-4 py-3">
                    {canDeleteUser(actorRole, user) ? (
                      <button
                        type="button"
                        onClick={() => onRequestDelete?.(user)}
                        title="حذف الحساب"
                        className="cursor-pointer rounded-lg border border-[#DE2F2C]/25 bg-[#FDE8E7] p-2 text-[#DE2F2C] transition-colors hover:bg-[#DE2F2C] hover:text-white"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    ) : (
                      <span className="text-[#657F71]">—</span>
                    )}
                  </td>
                )}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

function ScoreCell({
  userId,
  score,
  onSave,
}: {
  userId: string;
  score?: number;
  onSave: (userId: string, score: number) => void;
}) {
  const [value, setValue] = useState(String(score ?? 0));

  useEffect(() => {
    setValue(String(score ?? 0));
  }, [score]);

  return (
    <div className="flex items-center gap-2" dir="ltr">
      <input
        type="number"
        step="any"
        value={value}
        onChange={(event) => setValue(event.target.value)}
        className="w-20 rounded-lg border border-[#D5C9AE] bg-white px-2 py-1.5 text-sm text-[#1E4831] outline-none focus:border-[#1E4831]"
      />
      <button
        type="button"
        onClick={() => {
          const next = Number(value);
          if (Number.isFinite(next)) onSave(userId, next);
        }}
        className="cursor-pointer rounded-lg bg-[#1E4831] px-2.5 py-1.5 text-xs font-bold text-white transition-colors hover:bg-[#132F20]"
      >
        حفظ
      </button>
    </div>
  );
}
