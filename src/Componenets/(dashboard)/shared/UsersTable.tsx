"use client";

import { ArrowUpCircle, Trash2 } from "lucide-react";
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
  showCreatedBy = false,
  actorRole,
  onRequestDelete,
  onRequestPromote,
}: {
  users: IUser[];
  showCreatedBy?: boolean;
  actorRole?: IUser["role"];
  onRequestDelete?: (user: IUser) => void;
  onRequestPromote?: (user: IUser) => void;
}) {
  const showDelete = Boolean(actorRole && onRequestDelete);
  const showPromote = Boolean(actorRole === "manager" && onRequestPromote);
  const columnCount = 6 + (showCreatedBy ? 1 : 0) + (showDelete ? 1 : 0);

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
                <td className="px-4 py-3 text-[#657F71]">{formatDate(user.createdAt)}</td>
                {showDelete && (
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {showPromote && user.role === "supervisor" && (
                        <button
                          type="button"
                          onClick={() => onRequestPromote?.(user)}
                          title="ترقية إلى مدير"
                          aria-label={`ترقية ${user.name} إلى مدير`}
                          className="cursor-pointer rounded-lg border border-[#1E4831]/25 bg-[#DCE6E0] p-2 text-[#1E4831] transition-colors hover:bg-[#1E4831] hover:text-white"
                        >
                          <ArrowUpCircle className="h-4 w-4" />
                        </button>
                      )}
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
                    </div>
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
