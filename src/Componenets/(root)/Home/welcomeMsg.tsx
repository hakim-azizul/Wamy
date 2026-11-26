"use client";

import React from "react";
import Image from "next/image";

export default function WelcomeMsg() {
  return (
    <section
      id="about"
      dir="rtl"
      className="bg-[#F4EFE2] py-16 lg:py-24 border-b border-[#D5C9AE]"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12">
          {/* ডান পাশের অংশ (RTL অনুযায়ী প্রথম কলাম): عن السكن, শিরোনাম, رسالتنا, رؤيتنا ও পরিচিতি */}
          <div className="flex flex-col items-start lg:col-span-6 space-y-6">
            <span className="inline-block rounded-full bg-[#DCE6E0] px-3.5 py-1 text-xs font-bold tracking-wide text-[#1E4831] sm:text-sm">
              عن السكن
            </span>

            <h2 className="text-3xl font-extrabold leading-[1.3] text-[#1E4831] sm:text-4xl lg:text-[42px]">
              مجتمع قائم على الثقة والإيمان{" "}
              <span className="text-[#132F20] underline decoration-[#DE2F2C]/65 decoration-4 underline-offset-8">
                والانتماء.
              </span>
            </h2>

            {/* رسالتنا */}
            <div className="space-y-2 pt-1">
              <h3 className="text-lg font-bold text-[#1E4831]">رسالتنا</h3>
              <p className="text-sm leading-relaxed text-[#3E5E4D] sm:text-base">
                أن نمنح كل طالب، مهما كان بلده، مكانًا يشعر فيه بالبيت أثناء
                متابعة تعليمه في الخارج – مكان آمن وداعم ومتجذر في قيم مشتركة.
              </p>
            </div>

            {/* رؤيتنا */}
            <div className="space-y-2">
              <h3 className="text-lg font-bold text-[#1E4831]">رؤيتنا</h3>
              <p className="text-sm leading-relaxed text-[#3E5E4D] sm:text-base">
                جيل من الخريجين يغادرون وهم يحملون أكثر من شهادة جامعية : يحملون
                صداقات تدوم مدى الحياة من أكثر من 25 جنسية، وثقة تؤهلهم للقيادة
                أينما ذهبوا.
              </p>
            </div>

            {/* ঐতিহাসিক পটভূমি ও পরিচালক */}
            <div className="w-full border-t border-[#D5C9AE] pt-5 space-y-4">
              <p className="text-sm leading-relaxed text-[#3E5E4D] sm:text-[15px]">
                ما بدأ كمبنى سكني واحد قبل عقدين من الزمن، أصبح اليوم سكنًا
                استضاف آلاف الطلاب – كثير منهم يعودون اليوم كموجهين وداعمين
                وأصدقاء لهذا المجتمع الذي اعتمدوا عليه يومًا.
              </p>

              <div className="flex flex-col items-start pt-1">
                <span
                  style={{ fontFamily: "var(--font-cairo), sans-serif" }}
                  className="text-lg font-extrabold text-[#1E4831]"
                >
                  د. إسلام عيسى
                </span>
                <span className="text-xs font-medium text-[#657F71]">
                  مدير السكن
                </span>
              </div>
            </div>
          </div>

          {/* বাম পাশের অংশ (RTL অনুযায়ী দ্বিতীয় কলাম): ৩টি ছবির গ্রিড (الفناء الداخلي, ركن المكتبة, المطبخ المشترك) */}
          <div className="lg:col-span-6">
            <div className="grid grid-cols-12 gap-4 h-112 sm:h-120">
              {/* বড় ভার্টিকাল কার্ড: الفناء الداخلي */}
              <div className="group relative col-span-7 h-full overflow-hidden rounded-3xl border border-[#D5C9AE] bg-[#FAF7F2] shadow-md">
                <Image
                  src="/hero-building.jpeg"
                  alt="الفناء الداخلي"
                  fill
                  unoptimized
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-linear-to-t from-[#132F20]/75 via-[#132F20]/15 to-transparent" />
                <div className="absolute bottom-4 right-4 z-10 rounded-xl bg-[#132F20]/85 px-3.5 py-1.5 text-xs font-semibold text-[#FAF7F2] backdrop-blur-sm border border-white/15">
                  الفناء الداخلي
                </div>
              </div>

              {/* ডান পাশের দুটি স্ট্যাকড কার্ড: ركن المكتبة ও المطبخ المشترك */}
              <div className="col-span-5 flex flex-col gap-4 h-full">
                {/* উপরের কার্ড: ركن المكتبة */}
                <div className="group relative h-1/2 w-full overflow-hidden rounded-3xl border border-[#D5C9AE] bg-[#FAF7F2] shadow-md">
                  <Image
                    src="/hero-building.jpeg"
                    alt="ركن المكتبة"
                    fill
                    unoptimized
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-[#132F20]/75 via-[#132F20]/15 to-transparent" />
                  <div className="absolute bottom-3.5 right-3.5 z-10 rounded-xl bg-[#132F20]/85 px-3 py-1.5 text-xs font-semibold text-[#FAF7F2] backdrop-blur-sm border border-white/15">
                    ركن المكتبة
                  </div>
                </div>

                {/* নিচের কার্ড: المطبخ المشترك */}
                <div className="group relative h-1/2 w-full overflow-hidden rounded-3xl border border-[#D5C9AE] bg-[#FAF7F2] shadow-md">
                  <Image
                    src="/hero-building.jpeg"
                    alt="المطبخ المشترك"
                    fill
                    unoptimized
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-[#132F20]/75 via-[#132F20]/15 to-transparent" />
                  <div className="absolute bottom-3.5 right-3.5 z-10 rounded-xl bg-[#132F20]/85 px-3 py-1.5 text-xs font-semibold text-[#FAF7F2] backdrop-blur-sm border border-white/15">
                    المطبخ المشترك
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
