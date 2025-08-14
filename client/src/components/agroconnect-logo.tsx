export function AgroConnectLogo({ className = "w-12 h-12" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 100 100"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Background circle */}
      <circle cx="50" cy="50" r="48" fill="#166534" stroke="#15803d" strokeWidth="2"/>

      {/* Leaf design */}
      <path
        d="M30 60 Q35 45 50 50 Q65 45 70 60 Q65 75 50 70 Q35 75 30 60 Z"
        fill="#22c55e"
      />

      {/* Stem */}
      <path
        d="M50 70 L50 85"
        stroke="#15803d"
        strokeWidth="3"
        strokeLinecap="round"
      />

      {/* Small leaves */}
      <path
        d="M45 75 Q40 70 45 68 Q50 70 45 75"
        fill="#16a34a"
      />
      <path
        d="M55 75 Q60 70 55 68 Q50 70 55 75"
        fill="#16a34a"
      />

      {/* Center highlight */}
      <ellipse cx="50" cy="55" rx="8" ry="12" fill="#34d399" opacity="0.6"/>
    </svg>
  );
}

