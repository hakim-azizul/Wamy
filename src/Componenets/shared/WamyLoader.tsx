import WMark from "./WMark";

/**
 * Shared hostel-themed loading view: animated W mark, warm glass card and RTL copy.
 * Used by the global loading.tsx and by auth/data loading states across the app.
 */
export default function WamyLoader({
  label = "جاري التحميل...",
  variant = "fullscreen",
}: {
  label?: string;
  variant?: "fullscreen" | "compact";
}) {
  const fullscreen = variant === "fullscreen";

  return (
    <div
      dir="rtl"
      className={`flex items-center justify-center ${
        fullscreen
          ? "min-h-screen bg-linear-to-b from-[#EBE2CA] via-[#F4EFE2] to-[#EBE2CA] px-6"
          : "w-full py-12"
      }`}
      role="status"
      aria-live="polite"
    >
      <div className="flex flex-col items-center text-center">
        <div
          className={`relative flex items-center justify-center rounded-[2rem] border border-[#D5C9AE] bg-[#F9F5EC]/85 shadow-[0_18px_50px_rgba(30,72,49,0.10)] backdrop-blur-xl ${
            fullscreen ? "h-32 w-32" : "h-24 w-24 rounded-3xl"
          }`}
        >
          <span className="pointer-events-none absolute inset-3 rounded-[1.5rem] bg-[#DCE6E0]/35 blur-xl" />
          <WMark className={fullscreen ? "relative h-16 w-24" : "relative h-11 w-17"} />
        </div>

        {fullscreen && (
          <p
            style={{ fontFamily: "var(--font-cairo), sans-serif" }}
            className="mt-7 text-xl font-extrabold tracking-tight text-[#1E4831]"
          >
            السكن الجامعي
          </p>
        )}
        <p className={`font-medium text-[#657F71] ${fullscreen ? "mt-2 text-sm" : "mt-3 text-xs"}`}>
          {label}
        </p>

        <div className="mt-4 flex items-center gap-1.5" aria-hidden="true">
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
