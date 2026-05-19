interface LogoProps {
  onClick?: () => void;
}

export default function Logo({ onClick }: LogoProps) {
  return (
    <div className="flex items-center gap-2 cursor-pointer" onClick={onClick}>
      <div className="w-9 h-9 bg-purple-600 rounded-xl flex items-center justify-center relative">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="9" r="5" fill="white" opacity="0.9"/>
          <circle cx="9.5" cy="8" r="1.5" fill="#7c3aed"/>
          <circle cx="14.5" cy="8" r="1.5" fill="#7c3aed"/>
          <path d="M9 13 Q12 16 15 13" stroke="#7c3aed" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
          <rect x="5" y="16" width="14" height="4" rx="2" fill="white" opacity="0.6"/>
          <rect x="10" y="14" width="4" height="3" rx="1" fill="white" opacity="0.7"/>
        </svg>
      </div>
      <span className="text-xl font-bold">
        <span className="text-white">Echo</span>
        <span className="text-purple-400">Mentor</span>
      </span>
    </div>
  );
}
