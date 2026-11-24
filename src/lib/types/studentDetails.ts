export type StudentProfileSectionKey =
  | "personal"
  | "academic"
  | "skills"
  | "achievements"
  | "additional";

export type GenderOption = "male" | "female";
export type ReligionOption = "muslim" | "christian" | "other";
export type MaritalStatusOption = "single" | "married" | "divorced" | "widowed";

export type AcademicLevelOption =
  | "level_1" // السنة الأولى
  | "level_2" // السنة الثانية
  | "level_3" // السنة الثالثة
  | "level_4" // السنة الرابعة
  | "level_5"; // السنة الخامسة

export type StudyTypeOption = "general" | "private" | "external";
export type EnrollmentStatusOption =
  | "regular"
  | "probation"
  | "suspended"
  | "graduated";

export type ScholarshipStatusOption = "none" | "partial" | "full";

export interface BaseStudentDetailCollection {
  _id?: string;
  userId: string; // Reference to users._id (unique per student)
  isCompleted: boolean;
  createdAt: Date | string;
  updatedAt: Date | string;
}

// الورقة 1: البيانات الشخصية (student_personal_info)
export interface StudentPersonalInfo extends BaseStudentDetailCollection {
  fullNameAr: string; // الاسم الكامل (عربي)
  fullNameEn: string; // الاسم الكامل (إنجليزي)
  passport: string; // رقم الجواز / الهوية (normalized trim().toLowerCase() by the server)
  passportExpiryDate: Date | string; // تاريخ انتهاء الجواز
  iqamaExpiryDate: Date | string; // تاريخ انتهاء الإقامة
  universityStudentId: string; // رقم الطالب الجامعي
  birthDate: Date | string; // تاريخ الميلاد
  gender: GenderOption; // الجنس (ذكر / أنثى)
  nationality: string; // الجنسية
  religion?: ReligionOption | null; // الديانة (اختياري: مسلم / مسيحي / أخرى)
  maritalStatus: MaritalStatusOption; // الحالة الاجتماعية
  flatNo: string; // رقم الشقة
  roomNo: string; // رقم الغرفة
  detailedAddress: string; // العنوان بالتفصيل في بلد الطالب
  phone: string; // رقم الهاتف
  personalEmail: string; // البريد الإلكتروني الشخصي
  universityEmail?: string | null; // البريد الإلكتروني الجامعي
  emergencyContactName: string; // اسم جهة اتصال للطوارئ
  emergencyPhone: string; // هاتف الطوارئ
}

// الورقة 2: البيانات الأكاديمية (student_academic_info)
export interface StudentAcademicInfo extends BaseStudentDetailCollection {
  faculty: string; // الكلية
  department: string; // القسم / التخصص
  currentLevel: AcademicLevelOption; // المستوى الدراسي الحالي
  currentSemester: string; // الفصل الدراسي الحالي (مثال: خريف 2025 / ربيع 2026)
  studyType: StudyTypeOption; // نوع الدراسة (عام / خاص / انتساب)
  enrollmentStatus: EnrollmentStatusOption; // حالة التسجيل (منتظم / متعثر / موقوف / متخرج)
  gpa: number; // المعدل التراكمي (GPA)
  completedCredits: number; // عدد الساعات المعتمدة
  remainingCredits: number; // الساعات المتبقية للتخرج
  enrollmentDate: Date | string; // تاريخ الالتحاق بالجامعة
  expectedGraduationDate: Date | string; // تاريخ التخرج المتوقع
  academicAdvisor?: string | null; // اسم المشرف الأكاديمي
  graduationProject?: string | null; // مشروع التخرج
}

// الورقة 3: المهارات والمواهب (student_skills_talents)
export interface StudentSkillsAndTalents extends BaseStudentDetailCollection {
  languages: string[]; // المهارات اللغوية
  computerAndProgrammingSkills?: string[] | null; // مهارات الحاسوب والبرمجة
  softSkills?: string[] | null; // المهارات الشخصية (Soft Skills)
  artisticTalents?: string[] | null; // المواهب الفنية
  sportsTalents?: string[] | null; // المواهب الرياضية
  hobbiesAndInterests: string[]; // الاهتمامات والهوايات
  trainingCourses?: string[] | null; // الدورات التدريبية
  professionalCertificates?: string[] | null; // الشهادات المهنية
  practicalExperience?: string[] | null; // الخبرات التطبيقية (تدريب)
}

// الورقة 4: الإنجازات والأنشطة (student_achievements)
export interface StudentAchievementsAndActivities
  extends BaseStudentDetailCollection {
  academicAwards?: string[] | null; // الجوائز الأكاديمية
  competitions?: string[] | null; // المسابقات
  studentActivities?: string[] | null; // الأنشطة الطلابية
  volunteering?: string[] | null; // العمل التطوعي
  publicationsAndResearch?: string[] | null; // المنشورات / الأبحاث
}

// الورقة 5: معلومات إضافية (student_additional_info)
export interface StudentAdditionalInfo extends BaseStudentDetailCollection {
  iqScore?: number | null; // نسبة الذكاء (IQ)
  aptitudeTestScores?: string | null; // نتائج اختبارات القدرات (SAT / GRE / IELTS)
  scholarshipStatus: ScholarshipStatusOption; // حالة المنح الدراسية
  scholarshipProvider: string; // جهة المنح الدراسي
  generalNotes?: string | null; // ملاحظات عامة
}

// Combined view for student profile dashboard
export interface StudentFullDetailsBundle {
  userId: string;
  personal: StudentPersonalInfo | null;
  academic: StudentAcademicInfo | null;
  skills: StudentSkillsAndTalents | null;
  achievements: StudentAchievementsAndActivities | null;
  additional: StudentAdditionalInfo | null;
  completionSummary?: {
    completedSections: number;
    totalSections: 5;
  };
}