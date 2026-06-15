interface LogoProps {
  onClick?: () => void;
}

export default function Logo({ onClick }: LogoProps) {
  return (
    <div className="flex items-center gap-2 cursor-pointer" onClick={onClick}>
      <img src="/images/logo.jpg" alt="EchoMentor Logo" className="w-9 h-9 rounded-xl object-cover" />
      <span className="text-xl font-bold">
        <span className="text-white">Echo</span>
        <span className="text-purple-400">Mentor</span>
      </span>
    </div>
  );
}
