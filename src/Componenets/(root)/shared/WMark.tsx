/**
 * Refined W mark inspired by the Wamy logo's slanted, rounded strokes.
 * Pure SVG + CSS so it works in Server Components and needs no JS.
 */
export default function WMark({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 132 84"
      className={className}
      role="img"
      aria-label="علامة وامي"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="wam-w-gradient" x1="12" y1="12" x2="118" y2="70" gradientUnits="userSpaceOnUse">
          <stop stopColor="#1E4831" />
          <stop offset="0.55" stopColor="#3E5E4D" />
          <stop offset="1" stopColor="#657F71" />
        </linearGradient>
      </defs>

      <g
        className="wam-mark"
        stroke="url(#wam-w-gradient)"
        strokeWidth="15"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path className="wam-stroke" style={{ animationDelay: "0ms" }} pathLength={1} d="M16 15 L40 66" />
        <path
          className="wam-stroke"
          style={{ animationDelay: "140ms" }}
          pathLength={1}
          d="M40 66 L66 19 L92 66"
        />
        <path className="wam-stroke" style={{ animationDelay: "280ms" }} pathLength={1} d="M92 66 L116 15" />
      </g>
    </svg>
  );
}
