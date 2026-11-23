"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import {
  apiFetch,
  type UserResponse,
  type UsersResponse,
} from "@/lib/api/api-client";
import type { IUser } from "@/lib/types/users";
import UsersTable from "../shared/UsersTable";

type StudentForm = {
  email: string;
  password: string;
  phone: string;
  name: string;
  fathersName: string;
  passportNumber: string;
  passportExpiryDate: string;
  residencePermitExpiryDate: string;
  countryOrNationality: string;
  university: string;
  faculty: string;
  department: string;
  academicYear: string;
  apartmentNumber: string;
  roomNumber: string;
};

const EMPTY_FORM: StudentForm = {
  email: "",
  password: "",
  phone: "",
  name: "",
  fathersName: "",
  passportNumber: "",
  passportExpiryDate: "",
  residencePermitExpiryDate: "",
  countryOrNationality: "",
  university: "",
  faculty: "",
  department: "",
  academicYear: "",
  apartmentNumber: "",
  roomNumber: "",
};

export default function SupervisorView() {
  const [students, setStudents] = useState<IUser[]>([]);
  const [form, setForm] = useState<StudentForm>(EMPTY_FORM);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const loadStudents = useCallback(async () => {
    try {
      const data = await apiFetch<UsersResponse>("/api/users");
      setStudents(data.users);
    } catch (err) {
      setError(err instanceof Error ? err.message : "تعذر تحميل بيانات الطلاب.");
    }
  }, []);

  useEffect(() => {
    void loadStudents();
  }, [loadStudents]);

  function update(field: keyof StudentForm, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccess("");
    setSubmitting(true);

    try {
      const { user } = await apiFetch<UserResponse>("/api/users/students", {
        method: "POST",
        body: JSON.stringify({
          email: form.email.trim().toLowerCase(),
          password: form.password,
          phone: form.phone.trim() || null,
          studentProfile: {
            name: form.name.trim(),
            fathersName: form.fathersName.trim(),
            passportNumber: form.passportNumber.trim().toUpperCase(),
            passportExpiryDate: form.passportExpiryDate,
            residencePermitExpiryDate: form.residencePermitExpiryDate,
            countryOrNationality: form.countryOrNationality.trim(),
            university: form.university.trim(),
            faculty: form.faculty.trim(),
            department: form.department.trim(),
            academicYear: form.academicYear.trim(),
            apartmentNumber: form.apartmentNumber.trim(),
            roomNumber: form.roomNumber.trim(),
          },
        }),
      });
      setSuccess(`تم إضافة الطالب "${user.name}" بنجاح.`);
      setForm(EMPTY_FORM);
      await loadStudents();
    } catch (err) {
      setError(err instanceof Error ? err.message : "تعذر إضافة الطالب.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold text-[#1E4831] sm:text-3xl">لوحة المشرف</h1>
        <p className="mt-1 text-sm text-[#3E5E4D]">
          إضافة الطلاب وعرض بياناتهم. readonly: درجة المراجعة تُعيَّن تلقائيًا من الإعدادات.
        </p>
      </div>

      <section className="rounded-2xl border border-[#D5C9AE] bg-[#F9F5EC] p-6 shadow-sm">
        <h2 className="mb-5 text-lg font-extrabold text-[#1E4831]">إضافة طالب جديد</h2>
        <form onSubmit={handleSubmit} dir="rtl" className="space-y-6">
          <fieldset className="space-y-4">
            <legend className="mb-2 text-sm font-bold text-[#1E4831]">بيانات تسجيل الدخول</legend>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <FormField
                label="البريد الإلكتروني"
                type="email"
                dir="ltr"
                value={form.email}
                onChange={(value) => update("email", value)}
                placeholder="student@example.com"
              />
              <FormField
                label="كلمة المرور"
                type="password"
                dir="ltr"
                value={form.password}
                onChange={(value) => update("password", value)}
                placeholder="8 أحرف على الأقل"
              />
              <FormField
                label="الهاتف (اختياري)"
                type="tel"
                dir="ltr"
                required={false}
                value={form.phone}
                onChange={(value) => update("phone", value)}
                placeholder="+20 ..."
              />
            </div>
          </fieldset>

          <fieldset className="space-y-4 border-t border-[#D5C9AE] pt-5">
            <legend className="text-sm font-bold text-[#1E4831]">البيانات الشخصية والأكاديمية</legend>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <FormField
                label="اسم الطالب"
                value={form.name}
                onChange={(value) => update("name", value)}
                placeholder="الاسم الكامل"
              />
              <FormField
                label="اسم الأب"
                value={form.fathersName}
                onChange={(value) => update("fathersName", value)}
                placeholder="اسم الأب"
              />
              <FormField
                label="رقم الجواز"
                dir="ltr"
                value={form.passportNumber}
                onChange={(value) => update("passportNumber", value)}
                placeholder="A12345678"
              />
              <FormField
                label="تاريخ انتهاء الجواز"
                type="date"
                dir="ltr"
                value={form.passportExpiryDate}
                onChange={(value) => update("passportExpiryDate", value)}
              />
              <FormField
                label="تاريخ انتهاء الإقامة"
                type="date"
                dir="ltr"
                value={form.residencePermitExpiryDate}
                onChange={(value) => update("residencePermitExpiryDate", value)}
              />
              <FormField
                label="الدولة / الجنسية"
                value={form.countryOrNationality}
                onChange={(value) => update("countryOrNationality", value)}
                placeholder="الجنسية"
              />
              <FormField
                label="الجامعة"
                value={form.university}
                onChange={(value) => update("university", value)}
                placeholder="اسم الجامعة"
              />
              <FormField
                label="الكلية"
                value={form.faculty}
                onChange={(value) => update("faculty", value)}
                placeholder="اسم الكلية"
              />
              <FormField
                label="القسم"
                value={form.department}
                onChange={(value) => update("department", value)}
                placeholder="اسم القسم"
              />
              <FormField
                label="السنة الأكاديمية"
                value={form.academicYear}
                onChange={(value) => update("academicYear", value)}
                placeholder="مثال: 2025/2026"
              />
              <FormField
                label="رقم الشقة"
                value={form.apartmentNumber}
                onChange={(value) => update("apartmentNumber", value)}
                placeholder="رقم الشقة"
              />
              <FormField
                label="رقم الغرفة"
                value={form.roomNumber}
                onChange={(value) => update("roomNumber", value)}
                placeholder="رقم الغرفة"
              />
            </div>
          </fieldset>

          <p className="rounded-xl border border-[#1E4831]/15 bg-[#DCE6E0] px-4 py-3 text-xs font-medium text-[#3E5E4D]">
            درجة المراجعة (الحقل الثالث عشر) تُضاف تلقائيًا من إعداد الخادم
            <span dir="ltr" className="mx-1 font-bold">INITIAL_REVIEW_SCORE</span>
            ولا يمكن إدخالها يدويًا هنا.
          </p>

          {error && <FormMessage text={error} tone="error" />}
          {success && <FormMessage text={success} tone="success" />}

          <button
            type="submit"
            disabled={submitting}
            className="cursor-pointer rounded-xl bg-[#DE2F2C] px-6 py-2.5 text-sm font-bold text-white transition-all hover:bg-[#BD221F] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? "جارٍ الإضافة..." : "إضافة الطالب"}
          </button>
        </form>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-extrabold text-[#1E4831]">الطلاب ({students.length})</h2>
        <UsersTable users={students} showScore />
      </section>
    </div>
  );
}

function FormField({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  required = true,
  dir,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  placeholder?: string;
  required?: boolean;
  dir?: "ltr" | "rtl";
}) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-semibold text-[#1E4831]">{label}</label>
      <input
        type={type}
        dir={dir}
        required={required}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-[#D5C9AE] bg-white px-4 py-2.5 text-sm text-[#1E4831] outline-none transition-colors placeholder:text-[#657F71] focus:border-[#1E4831] focus:ring-2 focus:ring-[#1E4831]/15"
      />
    </div>
  );
}

function FormMessage({ text, tone }: { text: string; tone: "error" | "success" }) {
  return (
    <p
      role="alert"
      className={`rounded-xl border px-4 py-3 text-sm font-medium ${
        tone === "error"
          ? "border-[#DE2F2C]/25 bg-[#FDE8E7] text-[#931815]"
          : "border-[#1E4831]/20 bg-[#DCE6E0] text-[#1E4831]"
      }`}
    >
      {text}
    </p>
  );
}
