import { formatDate } from "@/lib/format";
import type { StudentProfileSectionKey } from "@/lib/types/studentDetails";

export type FieldType =
  | "text"
  | "date"
  | "number"
  | "email"
  | "tel"
  | "select"
  | "textarea"
  | "tags";

export interface SelectOption {
  value: string;
  label: string;
}

export interface FieldMeta {
  name: string;
  label: string;
  type?: FieldType;
  options?: SelectOption[];
  required?: boolean;
  ltr?: boolean;
  placeholder?: string;
}

export interface SectionMeta {
  key: StudentProfileSectionKey;
  label: string;
  shortLabel: string;
  description: string;
  fields: FieldMeta[];
}

const genderOptions: SelectOption[] = [
  { value: "male", label: "ذكر" },
  { value: "female", label: "أنثى" },
];

const religionOptions: SelectOption[] = [
  { value: "", label: "غير محدد" },
  { value: "muslim", label: "مسلم" },
  { value: "christian", label: "مسيحي" },
  { value: "other", label: "أخرى" },
];

const maritalOptions: SelectOption[] = [
  { value: "single", label: "أعزب" },
  { value: "married", label: "متزوج" },
  { value: "divorced", label: "مطلق" },
  { value: "widowed", label: "أرمل" },
];

const levelOptions: SelectOption[] = [
  { value: "level_1", label: "السنة الأولى" },
  { value: "level_2", label: "السنة الثانية" },
  { value: "level_3", label: "السنة الثالثة" },
  { value: "level_4", label: "السنة الرابعة" },
  { value: "level_5", label: "السنة الخامسة" },
];

const studyTypeOptions: SelectOption[] = [
  { value: "general", label: "عام" },
  { value: "private", label: "خاص" },
  { value: "external", label: "انتساب" },
];

const enrollmentOptions: SelectOption[] = [
  { value: "regular", label: "منتظم" },
  { value: "probation", label: "متعثر" },
  { value: "suspended", label: "موقوف" },
  { value: "graduated", label: "متخرج" },
];

const scholarshipOptions: SelectOption[] = [
  { value: "none", label: "لا يوجد" },
  { value: "partial", label: "منحة جزئية" },
  { value: "full", label: "منحة كاملة" },
];

export const STUDENT_DETAIL_SECTIONS: SectionMeta[] = [
  {
    key: "personal",
    label: "البيانات الشخصية",
    shortLabel: "شخصي",
    description: "الهوية والبيانات الشخصية وبيانات السكن والطوارئ.",
    fields: [
      { name: "fullNameAr", label: "الاسم الكامل (عربي)", required: true },
      { name: "fullNameEn", label: "الاسم الكامل (إنجليزي)", ltr: true, required: true },
      { name: "passport", label: "رقم الجواز / الهوية", ltr: true, required: true },
      { name: "passportExpiryDate", label: "تاريخ انتهاء الجواز", type: "date", required: true },
      { name: "iqamaExpiryDate", label: "تاريخ انتهاء الإقامة", type: "date", required: true },
      { name: "universityStudentId", label: "رقم الطالب الجامعي", ltr: true, required: true },
      { name: "birthDate", label: "تاريخ الميلاد", type: "date", required: true },
      { name: "gender", label: "الجنس", type: "select", options: genderOptions, required: true },
      { name: "nationality", label: "الجنسية", required: true },
      { name: "religion", label: "الديانة", type: "select", options: religionOptions },
      { name: "maritalStatus", label: "الحالة الاجتماعية", type: "select", options: maritalOptions, required: true },
      { name: "flatNo", label: "رقم الشقة", ltr: true, required: true },
      { name: "roomNo", label: "رقم الغرفة", ltr: true, required: true },
      { name: "detailedAddress", label: "العنوان التفصيلي في بلد الطالب", type: "textarea", required: true },
      { name: "phone", label: "رقم الهاتف", type: "tel", ltr: true, required: true },
      { name: "personalEmail", label: "البريد الشخصي", type: "email", ltr: true, required: true },
      { name: "universityEmail", label: "البريد الجامعي (اختياري)", type: "email", ltr: true },
      { name: "emergencyContactName", label: "اسم جهة الاتصال للطوارئ", required: true },
      { name: "emergencyPhone", label: "هاتف الطوارئ", type: "tel", ltr: true, required: true },
    ],
  },
  {
    key: "academic",
    label: "البيانات الأكاديمية",
    shortLabel: "أكاديمي",
    description: "الكلية والتخصص والمستوى الدراسي والمعدل والساعات.",
    fields: [
      { name: "faculty", label: "الكلية", required: true },
      { name: "department", label: "القسم / التخصص", required: true },
      { name: "currentLevel", label: "المستوى الحالي", type: "select", options: levelOptions, required: true },
      { name: "currentSemester", label: "الفصل الدراسي الحالي", required: true, placeholder: "مثال: خريف 2026" },
      { name: "studyType", label: "نوع الدراسة", type: "select", options: studyTypeOptions, required: true },
      { name: "enrollmentStatus", label: "حالة التسجيل", type: "select", options: enrollmentOptions, required: true },
      { name: "gpa", label: "المعدل التراكمي (GPA)", type: "number", required: true },
      { name: "completedCredits", label: "الساعات المكتملة", type: "number", required: true },
      { name: "remainingCredits", label: "الساعات المتبقية", type: "number", required: true },
      { name: "enrollmentDate", label: "تاريخ الالتحاق", type: "date", required: true },
      { name: "expectedGraduationDate", label: "تاريخ التخرج المتوقع", type: "date", required: true },
      { name: "academicAdvisor", label: "المشرف الأكاديمي (اختياري)" },
      { name: "graduationProject", label: "مشروع التخرج (اختياري)" },
    ],
  },
  {
    key: "skills",
    label: "المهارات والمواهب",
    shortLabel: "مهارات",
    description: "اللغات والمهارات التقنية والشخصية والهوايات (افصل بين العناصر بفاصلة).",
    fields: [
      { name: "languages", label: "اللغات", type: "tags", ltr: true, required: true, placeholder: "العربية, الإنجليزية, الفرنسية" },
      { name: "computerAndProgrammingSkills", label: "مهارات الحاسوب والبرمجة", type: "tags", ltr: true },
      { name: "softSkills", label: "المهارات الشخصية", type: "tags", ltr: true },
      { name: "artisticTalents", label: "المواهب الفنية", type: "tags" },
      { name: "sportsTalents", label: "المواهب الرياضية", type: "tags" },
      { name: "hobbiesAndInterests", label: "الهوايات والاهتمامات", type: "tags", required: true },
      { name: "trainingCourses", label: "الدورات التدريبية", type: "tags" },
      { name: "professionalCertificates", label: "الشهادات المهنية", type: "tags" },
      { name: "practicalExperience", label: "الخبرات التطبيقية", type: "tags" },
    ],
  },
  {
    key: "achievements",
    label: "الإنجازات والأنشطة",
    shortLabel: "إنجازات",
    description: "الجوائز والمسابقات والأنشطة والعمل التطوعي والبحوث (افصل بفاصلة).",
    fields: [
      { name: "academicAwards", label: "الجوائز الأكاديمية", type: "tags" },
      { name: "competitions", label: "المسابقات", type: "tags" },
      { name: "studentActivities", label: "الأنشطة الطلابية", type: "tags" },
      { name: "volunteering", label: "العمل التطوعي", type: "tags" },
      { name: "publicationsAndResearch", label: "المنشورات والأبحاث", type: "tags" },
    ],
  },
  {
    key: "additional",
    label: "معلومات إضافية",
    shortLabel: "إضافي",
    description: "نتائج الاختبارات وحالة المنح والملاحظات العامة.",
    fields: [
      { name: "iqScore", label: "نسبة الذكاء (IQ)", type: "number" },
      { name: "aptitudeTestScores", label: "نتائج اختبارات القدرات", placeholder: "SAT / IELTS / GRE" },
      { name: "scholarshipStatus", label: "حالة المنحة", type: "select", options: scholarshipOptions, required: true },
      { name: "scholarshipProvider", label: "جهة المنحة" },
      { name: "generalNotes", label: "ملاحظات عامة", type: "textarea" },
    ],
  },
];

export function formatFieldValue(field: FieldMeta, value: unknown): string {
  if (value === null || value === undefined || value === "") return "—";
  if (field.type === "select") {
    return field.options?.find((option) => option.value === value)?.label ?? String(value);
  }
  if (field.type === "tags" && Array.isArray(value)) {
    return value.length ? value.join("، ") : "—";
  }
  if (field.type === "date") return formatDate(String(value));
  return String(value);
}
