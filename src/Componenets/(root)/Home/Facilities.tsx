"use client";

import React from "react";
import {
  BedDouble,
  BookOpen,
  MoonStar,
  Utensils,
  Globe,
  ShieldCheck,
} from "lucide-react";

const facilities = [
  {
    title: "غرف مريحة",
    description:
      "غرف واسعة ومضاءة جيدًا، مصممة للراحة والتركيز بعد يوم دراسي طويل.",
    icon: BedDouble,
    accent: false,
  },
  {
    title: "قاعات مذاكرة مخصصة",
    description:
      "قاعات هادئة وغرف جماعية مهيأة للتركيز العميق ومراجعة الدروس والاستعداد الليلي للامتحانات.",
    icon: BookOpen,
    accent: false,
  },
  {
    title: "مصلّيات مخصصة",
    description:
      "مصليات مخصصة ومريحة، مفتوحة على مدار الساعة للصلاة والتأمل.",
    icon: MoonStar,
    accent: false,
  },
  {
    title: "وجبات متوازنة",
    description:
      "وجبات طازجة ومتوازنة تُقدَّم يوميًا، مع خيارات تناسب مختلف الاحتياجات الغذائية.",
    icon: Utensils,
    accent: true,
  },
  {
    title: "مجتمع دولي",
    description:
      "عِش إلى جانب طلاب من أكثر من 25 دولة، وابنِ شبكة علاقات تدوم طويلًا بعد التخرج.",
    icon: Globe,
    accent: false,
  },
  {
    title: "أمن على مدار الساعة",
    description:
      "فريق أمن دائم ومداخل مراقبة، لتطمئن الأسر في الخارج على أبنائها.",
    icon: ShieldCheck,
    accent: false,
  },
];

export default function FacilitiesSection() {
  return (
    <section
      id="student-life"
      dir="rtl"
      className="bg-linear-to-b from-[#EBE2CA] via-[#F4EFE2] to-[#EBE2CA] py-16 lg:py-24 border-b border-[#D5C9AE]"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* সেকশন হেডার (ডান পাশের মতো aligned) */}
        <div className="mb-12 flex flex-col items-start text-right">
          <span className="mb-2 inline-block rounded-full bg-[#DCE6E0] px-3.5 py-1 text-xs font-bold text-[#1E4831] sm:text-sm">
            ما يتضمنه السكن
          </span>

          <h2 className="text-3xl font-extrabold leading-[1.3] text-[#1E4831] sm:text-4xl lg:text-[42px]">
            كل ما يحتاجه الطالب،{" "}
            <span className="text-[#132F20] underline decoration-[#DE2F2C]/65 decoration-4 underline-offset-8">
              في مكان واحد.
            </span>
          </h2>
        </div>

        {/* ৬টি কার্ডের গ্রিড */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {facilities.map((item, idx) => {
            const IconComponent = item.icon;
            return (
              <div
                key={idx}
                className="group flex flex-col items-end rounded-3xl border border-[#D5C9AE] bg-[#FAF7F2] p-7 text-right shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-[#1E4831]/40 hover:bg-white hover:shadow-md"
              >
                {/* আইকন বক্স */}
                <div
                  className={`mb-5 flex h-12 w-12 items-center justify-center rounded-2xl border transition-colors duration-300 ${
                    item.accent
                      ? "border-[#DE2F2C]/25 bg-[#FDE8E7] text-[#DE2F2C] group-hover:bg-[#DE2F2C] group-hover:text-white"
                      : "border-[#1E4831]/15 bg-[#DCE6E0] text-[#1E4831] group-hover:bg-[#1E4831] group-hover:text-[#FAF7F2]"
                  }`}
                >
                  <IconComponent className="h-5 w-5" strokeWidth={2} />
                </div>

                {/* কার্ডের শিরোনাম */}
                <h3 className="mb-2.5 text-lg font-extrabold text-[#1E4831] sm:text-xl">
                  {item.title}
                </h3>

                {/* কার্ডের বর্ণনা */}
                <p className="text-sm leading-relaxed text-[#3E5E4D]">
                  {item.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}