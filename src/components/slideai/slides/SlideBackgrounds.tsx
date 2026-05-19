import type { ThemeId } from '../../../types/slideai';

interface BackgroundProps {
  theme: ThemeId;
  scale?: number;
}

export function FutureNeonBackground({ scale = 1 }: { scale?: number }) {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Deep blue gradient */}
      <div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(160deg, #081B5B 0%, #060f35 50%, #1a0533 100%)',
        }}
      />

      {/* Grid floor */}
      <div
        className="absolute bottom-0 left-0 right-0"
        style={{
          height: '45%',
          backgroundImage: `
            linear-gradient(rgba(60,242,255,0.12) 1px, transparent 1px),
            linear-gradient(90deg, rgba(60,242,255,0.12) 1px, transparent 1px)
          `,
          backgroundSize: `${60 * scale}px ${60 * scale}px`,
          transform: 'perspective(600px) rotateX(45deg)',
          transformOrigin: 'bottom center',
          maskImage: 'linear-gradient(to top, black 20%, transparent 100%)',
          WebkitMaskImage: 'linear-gradient(to top, black 20%, transparent 100%)',
        }}
      />

      {/* Purple horizon glow */}
      <div
        className="absolute"
        style={{
          bottom: '35%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '80%',
          height: '4px',
          background: 'linear-gradient(90deg, transparent, #C026FF, #3CF2FF, #C026FF, transparent)',
          boxShadow: '0 0 40px 20px rgba(192,38,255,0.3), 0 0 80px 40px rgba(60,242,255,0.15)',
          filter: 'blur(2px)',
        }}
      />

      {/* Skyline silhouette */}
      <svg
        className="absolute"
        style={{ bottom: '35%', left: 0, right: 0, width: '100%', height: '25%', opacity: 0.5 }}
        viewBox="0 0 1200 200"
        preserveAspectRatio="xMidYMax slice"
      >
        <path
          d="M0,200 L0,140 L40,140 L40,100 L60,100 L60,80 L80,80 L80,60 L100,60 L100,40 L120,40 L120,60 L140,60 L140,100 L180,100 L180,80 L200,80 L200,50 L220,50 L220,30 L240,30 L240,50 L260,50 L260,120 L300,120 L300,90 L320,90 L320,70 L340,70 L340,40 L360,40 L360,70 L380,70 L380,100 L420,100 L420,80 L440,80 L440,110 L480,110 L480,90 L500,90 L500,60 L520,60 L520,40 L540,40 L540,60 L560,60 L560,90 L600,90 L600,70 L620,70 L620,50 L640,50 L640,30 L660,30 L660,50 L680,50 L680,80 L720,80 L720,100 L740,100 L740,80 L760,80 L760,60 L780,60 L780,40 L800,40 L800,60 L820,60 L820,100 L860,100 L860,80 L880,80 L880,110 L920,110 L920,90 L940,90 L940,60 L960,60 L960,40 L980,40 L980,60 L1000,60 L1000,90 L1040,90 L1040,70 L1060,70 L1060,50 L1080,50 L1080,70 L1100,70 L1100,100 L1140,100 L1140,120 L1200,120 L1200,200 Z"
          fill="#0a1240"
        />
        <path
          d="M0,200 L0,155 L60,155 L60,130 L90,130 L90,115 L120,115 L120,130 L160,130 L160,145 L200,145 L200,125 L230,125 L230,110 L260,110 L260,125 L300,125 L300,155 L360,155 L360,140 L400,140 L400,125 L430,125 L430,140 L480,140 L480,150 L530,150 L530,135 L560,135 L560,120 L590,120 L590,135 L630,135 L630,150 L680,150 L680,140 L720,140 L720,125 L750,125 L750,140 L800,140 L800,155 L840,155 L840,140 L880,140 L880,125 L910,125 L910,140 L960,140 L960,150 L1010,150 L1010,135 L1040,135 L1040,120 L1070,120 L1070,135 L1110,135 L1110,155 L1200,155 L1200,200 Z"
          fill="#060d2e"
        />
      </svg>

      {/* Neon rings */}
      <div
        className="absolute"
        style={{
          top: '15%',
          right: '8%',
          width: `${120 * scale}px`,
          height: `${120 * scale}px`,
          borderRadius: '50%',
          border: '2px solid rgba(60,242,255,0.3)',
          boxShadow: '0 0 20px rgba(60,242,255,0.2), inset 0 0 20px rgba(60,242,255,0.1)',
        }}
      />
      <div
        className="absolute"
        style={{
          top: '15%',
          right: '8%',
          width: `${80 * scale}px`,
          height: `${80 * scale}px`,
          margin: `${20 * scale}px`,
          borderRadius: '50%',
          border: '2px solid rgba(192,38,255,0.3)',
          boxShadow: '0 0 15px rgba(192,38,255,0.2)',
        }}
      />

      {/* Top grid */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `
            linear-gradient(rgba(60,242,255,0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(60,242,255,0.04) 1px, transparent 1px)
          `,
          backgroundSize: `${80 * scale}px ${80 * scale}px`,
        }}
      />

      {/* Floating clouds / blur orbs */}
      <div
        className="absolute"
        style={{
          top: '20%',
          left: '5%',
          width: `${200 * scale}px`,
          height: `${80 * scale}px`,
          borderRadius: '50%',
          background: 'rgba(60,242,255,0.04)',
          filter: 'blur(30px)',
        }}
      />
      <div
        className="absolute"
        style={{
          top: '30%',
          right: '20%',
          width: `${150 * scale}px`,
          height: `${60 * scale}px`,
          borderRadius: '50%',
          background: 'rgba(192,38,255,0.06)',
          filter: 'blur(25px)',
        }}
      />

      {/* Corner accent */}
      <div
        className="absolute top-0 left-0"
        style={{
          width: `${4 * scale}px`,
          height: '40%',
          background: 'linear-gradient(to bottom, #3CF2FF, transparent)',
          opacity: 0.5,
        }}
      />
      <div
        className="absolute top-0 left-0"
        style={{
          width: '30%',
          height: `${4 * scale}px`,
          background: 'linear-gradient(to right, #3CF2FF, transparent)',
          opacity: 0.5,
        }}
      />
    </div>
  );
}

export function CybersecurityBackground({ scale = 1 }: { scale?: number }) {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Base gradient */}
      <div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(160deg, #050d1a 0%, #071525 50%, #03080f 100%)',
        }}
      />

      {/* Hex grid pattern */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `
            linear-gradient(rgba(0,229,255,0.08) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,229,255,0.08) 1px, transparent 1px)
          `,
          backgroundSize: `${40 * scale}px ${40 * scale}px`,
        }}
      />

      {/* Cyan glow top-left */}
      <div
        className="absolute"
        style={{
          top: '-20%',
          left: '-10%',
          width: `${400 * scale}px`,
          height: `${400 * scale}px`,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(0,229,255,0.12) 0%, transparent 70%)',
          filter: 'blur(40px)',
        }}
      />

      {/* Purple glow bottom-right */}
      <div
        className="absolute"
        style={{
          bottom: '-20%',
          right: '-10%',
          width: `${350 * scale}px`,
          height: `${350 * scale}px`,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(124,77,255,0.15) 0%, transparent 70%)',
          filter: 'blur(40px)',
        }}
      />

      {/* Scan line */}
      <div
        className="absolute left-0 right-0 opacity-10"
        style={{
          height: '1px',
          top: '30%',
          background: 'linear-gradient(90deg, transparent, #00e5ff, transparent)',
          boxShadow: '0 0 10px rgba(0,229,255,0.5)',
        }}
      />

      {/* Corner decorations */}
      <div
        className="absolute top-0 right-0"
        style={{
          width: `${80 * scale}px`,
          height: `${80 * scale}px`,
          border: '2px solid rgba(0,229,255,0.3)',
          borderLeft: 'none',
          borderBottom: 'none',
        }}
      />
      <div
        className="absolute bottom-0 left-0"
        style={{
          width: `${60 * scale}px`,
          height: `${60 * scale}px`,
          border: '2px solid rgba(0,191,165,0.3)',
          borderRight: 'none',
          borderTop: 'none',
        }}
      />

      {/* Circuit lines */}
      <svg
        className="absolute right-0 top-0 opacity-10"
        style={{ width: `${200 * scale}px`, height: `${200 * scale}px` }}
        viewBox="0 0 200 200"
      >
        <path d="M200,0 L200,80 L160,80 L160,40 L120,40 L120,80 L80,80 L80,120 L120,120 L120,160 L160,160 L160,120 L200,120" stroke="#00e5ff" strokeWidth="1" fill="none" />
        <circle cx="120" cy="40" r="3" fill="#00e5ff" />
        <circle cx="80" cy="80" r="3" fill="#00e5ff" />
        <circle cx="120" cy="160" r="3" fill="#00e5ff" />
      </svg>
    </div>
  );
}

export function CorporateYellowBackground({ scale = 1 }: { scale?: number }) {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* White base */}
      <div className="absolute inset-0" style={{ background: 'linear-gradient(160deg, #ffffff 0%, #f9f9fc 100%)' }} />

      {/* Yellow top accent bar */}
      <div
        className="absolute top-0 left-0 right-0"
        style={{
          height: `${10 * scale}px`,
          background: 'linear-gradient(90deg, #FFD84D, #FF6B35, #FFD84D)',
        }}
      />

      {/* Yellow large right triangle */}
      <div
        className="absolute"
        style={{
          top: 0,
          right: 0,
          width: `${280 * scale}px`,
          height: `${250 * scale}px`,
          background: 'linear-gradient(135deg, #FFD84D18, #FF6B3508)',
          clipPath: 'polygon(100% 0, 0 0, 100% 100%)',
        }}
      />

      {/* Left side yellow accent */}
      <div
        className="absolute top-0 left-0"
        style={{
          width: `${6 * scale}px`,
          height: '100%',
          background: 'linear-gradient(to bottom, #FFD84D, #FF6B35, transparent)',
        }}
      />

      {/* Bottom horizontal line */}
      <div
        className="absolute bottom-0 left-0 right-0"
        style={{
          height: `${6 * scale}px`,
          background: 'linear-gradient(90deg, #FFD84D80, #FF6B3540, transparent)',
        }}
      />

      {/* Subtle circle decoration */}
      <div
        className="absolute"
        style={{
          bottom: `-${40 * scale}px`,
          right: `${40 * scale}px`,
          width: `${160 * scale}px`,
          height: `${160 * scale}px`,
          borderRadius: '50%',
          border: `${2 * scale}px solid #FFD84D20`,
        }}
      />
      <div
        className="absolute"
        style={{
          bottom: `-${20 * scale}px`,
          right: `${60 * scale}px`,
          width: `${100 * scale}px`,
          height: `${100 * scale}px`,
          borderRadius: '50%',
          border: `${2 * scale}px solid #FF6B3515`,
        }}
      />

      {/* Subtle dot pattern */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: 'radial-gradient(circle, #FFD84D30 1px, transparent 1px)',
          backgroundSize: `${25 * scale}px ${25 * scale}px`,
        }}
      />
    </div>
  );
}

export function GlassmorphismBackground({ scale = 1 }: { scale?: number }) {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div
        className="absolute inset-0"
        style={{ background: 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)' }}
      />
      <div
        className="absolute"
        style={{
          top: '10%', left: '10%',
          width: `${250 * scale}px`, height: `${250 * scale}px`,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(167,139,250,0.2) 0%, transparent 70%)',
          filter: 'blur(40px)',
        }}
      />
      <div
        className="absolute"
        style={{
          bottom: '20%', right: '15%',
          width: `${200 * scale}px`, height: `${200 * scale}px`,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(52,211,153,0.2) 0%, transparent 70%)',
          filter: 'blur(35px)',
        }}
      />
      <div
        className="absolute"
        style={{
          top: '50%', right: '30%',
          width: `${150 * scale}px`, height: `${150 * scale}px`,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(244,114,182,0.15) 0%, transparent 70%)',
          filter: 'blur(30px)',
        }}
      />
    </div>
  );
}

export function StartupNeonBackground({ scale = 1 }: { scale?: number }) {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, #0a0a0a, #1a0a2e)' }} />
      <div
        className="absolute"
        style={{
          top: '-10%', left: '20%',
          width: `${300 * scale}px`, height: `${300 * scale}px`,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,0,110,0.15) 0%, transparent 70%)',
          filter: 'blur(50px)',
        }}
      />
      <div
        className="absolute"
        style={{
          bottom: '-10%', right: '20%',
          width: `${250 * scale}px`, height: `${250 * scale}px`,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(131,56,236,0.15) 0%, transparent 70%)',
          filter: 'blur(45px)',
        }}
      />
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `linear-gradient(rgba(255,0,110,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,0,110,0.1) 1px, transparent 1px)`,
          backgroundSize: `${50 * scale}px ${50 * scale}px`,
        }}
      />
    </div>
  );
}

export function MinimalDarkBackground({ scale = 1 }: { scale?: number }) {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, #111827, #0f172a)' }} />
      <div
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage: 'radial-gradient(circle, rgba(99,102,241,0.06) 1px, transparent 1px)',
          backgroundSize: `${25 * scale}px ${25 * scale}px`,
        }}
      />
    </div>
  );
}

export function SlideBackground({ theme, scale = 1 }: BackgroundProps) {
  switch (theme) {
    case 'future-neon': return <FutureNeonBackground scale={scale} />;
    case 'cybersecurity': return <CybersecurityBackground scale={scale} />;
    case 'corporate-yellow': return <CorporateYellowBackground scale={scale} />;
    case 'glassmorphism': return <GlassmorphismBackground scale={scale} />;
    case 'startup-neon': return <StartupNeonBackground scale={scale} />;
    case 'minimal-dark': return <MinimalDarkBackground scale={scale} />;
    default: return <FutureNeonBackground scale={scale} />;
  }
}
