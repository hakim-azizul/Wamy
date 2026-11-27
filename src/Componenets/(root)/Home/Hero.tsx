"use client";

import React from "react";
import { Button } from "@heroui/react";
import Image from "next/image";

export default function HeroSection() {
  return (
    <section className="bg-linear-to-b from-[#EBE2CA] to-[#F4EFE2] py-12 lg:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12">
          {/* ডান পাশের অংশ: শিরোনাম, বর্ণনা ও বাটন */}
          <div className="flex flex-col items-start lg:col-span-7">
            <span className="mb-3 rounded-full bg-[#DCE6E0] px-3.5 py-1 text-sm font-semibold text-[#1E4831] sm:text-base">
              برنامج السكن الطلابي
            </span>

            <h1 className="mb-6 text-3xl font-extrabold leading-[1.35] text-[#1E4831] sm:text-4xl lg:text-5xl">
              الندوة العالمية للشباب الإسلامي - بمصر <br />
              <span className="text-[#132F20] underline decoration-[#DE2F2C]/65 decoration-4 underline-offset-8">
                بيت أمن - لقادة المستقبل
              </span>
            </h1>

            <p className="mb-8 max-w-xl text-base leading-relaxed text-[#3E5E4D] sm:text-lg">
              سكن لا يمنح الطلاب الدوليين مجرد غرفة، بل مجتمعًا يسنِدُهم في
              دراستهم وإيمانهم، ويرافقهم في رحلتهم نحو ما سيصبحون عليه.
            </p>

            <div className="flex flex-wrap items-center gap-4">
              {/* একমাত্র প্রাইমারি CTA বাটনে ১০% Accent Red */}
              <Button className="rounded-xl bg-[#DE2F2C] px-8 py-3 text-base font-semibold text-white shadow-md transition-all hover:bg-[#BD221F] active:bg-[#931815]">
                قدم الآن
              </Button>

              <Button
                variant="outline"
                className="rounded-xl border-[#B9A988] bg-[#F9F5EC] px-8 py-3 text-base font-semibold text-[#1E4831] shadow-sm transition-all hover:bg-[#DDD1B2]/60"
              >
                استكشف السكن
              </Button>
            </div>
          </div>

          {/* বাম পাশের অংশ: ইমেজ কার্ড ও নিচে ওভারল্যাপ করা ৩টি স্ট্যাট কার্ড */}
          <div className="relative flex justify-center pb-10 lg:col-span-5 lg:justify-end">
            <div className="relative flex h-107.5 w-full max-w-105 flex-col justify-between overflow-hidden rounded-3xl border border-[#D5C9AE] p-6 text-white shadow-2xl">
              <Image
                src="/hero-building.jpeg"
                alt="المبنى الرئيسي لسكن وامي الطلابي"
                fill
                priority
                unoptimized
                className="object-cover"
              />

              <div className="absolute inset-0 bg-linear-to-b from-[#132F20]/55 via-transparent to-[#132F20]/75" />

              <div className="relative z-10 text-xs font-medium text-white/95">
                المبنى الرئيسي لسكن وامي الطلابي
              </div>

              <div className="relative z-10 mb-8 w-fit rounded-lg bg-[#1E4831]/80 px-3 py-1.5 text-xs font-medium text-[#F9F5EC] backdrop-blur-sm border border-white/15">
                المبنى الرئيسي — الجناح الشرقي
              </div>
            </div>

            {/* ৩টি স্ট্যাটাস কার্ডে একই ফরেস্ট গ্রিন টোন */}
            <div className="absolute bottom-0 grid w-full max-w-105 grid-cols-3 gap-3 px-2">
              <div className="flex flex-col items-center justify-center rounded-2xl border border-[#D5C9AE] bg-white py-3.5 shadow-lg">
                <h3 className="text-lg font-extrabold text-[#1E4831] sm:text-xl">
                  75+
                </h3>
                <p className="mt-0.5 text-[11px] font-medium text-[#3E5E4D]">
                  طالب كل سنة
                </p>
              </div>

              <div className="flex flex-col items-center justify-center rounded-2xl border border-[#D5C9AE] bg-white py-3.5 shadow-lg">
                <h3 className="text-lg font-extrabold text-[#1E4831] sm:text-xl">
                  15+
                </h3>
                <p className="mt-0.5 text-[11px] font-medium text-[#3E5E4D]">
                  جنسية
                </p>
              </div>

              <div className="flex flex-col items-center justify-center rounded-2xl border border-[#D5C9AE] bg-white py-3.5 shadow-lg">
                <h3 className="text-lg font-extrabold text-[#1E4831] sm:text-xl">
                  24/7
                </h3>
                <p className="mt-0.5 text-[11px] font-medium text-[#3E5E4D]">
                  دعم دائم
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
