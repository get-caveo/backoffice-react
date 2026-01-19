export function CaveoLogo({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Grape bunch - burgundy circles */}
      <circle cx="50" cy="35" r="8" fill="#6B1F3D" stroke="#2D5F5D" strokeWidth="1.5" />
      <circle cx="65" cy="35" r="8" fill="#6B1F3D" stroke="#2D5F5D" strokeWidth="1.5" />
      <circle cx="42" cy="47" r="8" fill="#6B1F3D" stroke="#2D5F5D" strokeWidth="1.5" />
      <circle cx="57" cy="47" r="8" fill="#6B1F3D" stroke="#2D5F5D" strokeWidth="1.5" />
      <circle cx="72" cy="47" r="8" fill="#6B1F3D" stroke="#2D5F5D" strokeWidth="1.5" />
      <circle cx="50" cy="59" r="8" fill="#6B1F3D" stroke="#2D5F5D" strokeWidth="1.5" />
      <circle cx="65" cy="59" r="8" fill="#6B1F3D" stroke="#2D5F5D" strokeWidth="1.5" />
      <circle cx="57" cy="71" r="8" fill="#6B1F3D" stroke="#2D5F5D" strokeWidth="1.5" />
      <circle cx="50" cy="83" r="8" fill="#6B1F3D" stroke="#2D5F5D" strokeWidth="1.5" />
      
      {/* Leaf - teal green */}
      <path
        d="M 52 20 Q 52 12 58 10 Q 62 9 65 12 Q 66 14 64 18 Q 62 22 58 24 Q 54 25 52 20 Z"
        fill="#2D5F5D"
      />
      
      {/* Stem */}
      <path
        d="M 52 22 L 52 32"
        stroke="#2D5F5D"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}
