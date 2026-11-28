import WMark from "@/Componenets/(root)/shared/WMark";

export default function Loading() {
  return (
    <div
      dir="rtl"
      className="flex min-h-screen items-center justify-center bg-linear-to-b from-[#EBE2CA] via-[#F4EFE2] to-[#EBE2CA] px-6"
    >
      <div className="flex flex-col items-center text-center">
        <div className="relative flex h-32 w-32 items-center justify-center rounded-[2rem] border border-[#D5C9AE] bg-[#F9F5EC]/85 shadow-[0_18px_50px_rgba(30,72,49,0.10)] backdrop-blur-xl">
          <span className="pointer-events-none absolute inset-3 rounded-[1.5rem] bg-[#DCE6E0]/35 blur-xl" />
          <WMark className="relative h-16 w-24" />
        </div>

        <p
          style={{ fontFamily: "var(--font-cairo), sans-serif" }}
          className="mt-7 text-xl font-extrabold tracking-tight text-[#1E4831]"
        >
          السكن الجامعي
        </p>
        <p className="mt-2 text-sm font-medium text-[#657F71]">جاري التحميل...</p>

        <div className="mt-5 flex items-center gap-1.5" aria-hidden="true">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#1E4831]" />
          <span
            className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#3E5E4D]"
            style={{ animationDelay: "180ms" }}
          />
          <span
            className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#657F71]"
            style={{ animationDelay: "360ms" }}
          />
        </div>
      </div>
    </div>
  );
}
