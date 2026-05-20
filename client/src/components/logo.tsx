// Skillsgem mark — a faceted gem. Geometric, symmetric, works at 24px and 200px.
// Uses currentColor for theme adaptability.
export function Logo({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Skillsgem"
      className={className}
    >
      {/* Top edge */}
      <path d="M6 11 L16 4 L26 11 Z" fill="currentColor" opacity="0.85" />
      {/* Left facet */}
      <path d="M6 11 L16 28 L11 11 Z" fill="currentColor" opacity="0.55" />
      {/* Center facet */}
      <path d="M11 11 L16 28 L21 11 Z" fill="currentColor" opacity="0.95" />
      {/* Right facet */}
      <path d="M21 11 L16 28 L26 11 Z" fill="currentColor" opacity="0.55" />
      {/* Highlight */}
      <path d="M11 11 L16 4 L21 11 Z" fill="currentColor" opacity="0.75" />
    </svg>
  );
}
