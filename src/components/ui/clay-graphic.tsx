import React from 'react';

interface ClayGraphicProps {
  variant: 'hero' | 'essay' | 'rating' | 'consensus' | 'ai';
  className?: string;
}

export const ClayGraphic: React.FC<ClayGraphicProps> = ({ variant, className = '' }) => {
  if (variant === 'hero') {
    return (
      <svg
        viewBox="0 0 160 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        aria-hidden="true"
      >
        <defs>
          <radialGradient id="clayHeroBook" cx="35%" cy="30%" r="70%">
            <stop offset="0%" stopColor="#93B2F8" />
            <stop offset="60%" stopColor="#1E3A2F" />
            <stop offset="100%" stopColor="#152A22" />
          </radialGradient>
          <radialGradient id="clayHeroOrange" cx="30%" cy="30%" r="70%">
            <stop offset="0%" stopColor="#FBEDB0" />
            <stop offset="60%" stopColor="#F1B94C" />
            <stop offset="100%" stopColor="#D49929" />
          </radialGradient>
          <radialGradient id="clayYellowSparkle" cx="30%" cy="30%" r="70%">
            <stop offset="0%" stopColor="#FCFDFF" />
            <stop offset="70%" stopColor="#FBEDB0" />
            <stop offset="100%" stopColor="#F1B94C" />
          </radialGradient>
          <filter id="clayOceanShadow" x="-10%" y="-10%" width="130%" height="130%">
            <feDropShadow dx="0" dy="6" stdDeviation="6" floodColor="#152A22" floodOpacity="0.25" />
          </filter>
        </defs>

        {/* Floating Book */}
        <g filter="url(#clayOceanShadow)">
          <rect x="25" y="30" width="75" height="60" rx="14" fill="#FCFDFF" transform="rotate(-6 62 60)" />
          <rect x="30" y="32" width="70" height="56" rx="12" fill="url(#clayHeroBook)" transform="rotate(-6 62 60)" />
          <line x1="42" y1="46" x2="88" y2="41" stroke="#93B2F8" strokeWidth="4" strokeLinecap="round" />
          <line x1="43" y1="56" x2="84" y2="52" stroke="#93B2F8" strokeWidth="4" strokeLinecap="round" />
          <line x1="44" y1="66" x2="75" y2="62" stroke="#FBEDB0" strokeWidth="4" strokeLinecap="round" />
        </g>

        {/* Clay Stylus in Orange Pastel */}
        <g filter="url(#clayOceanShadow)">
          <rect x="90" y="20" width="16" height="55" rx="8" fill="url(#clayHeroOrange)" transform="rotate(35 98 47)" />
          <polygon points="120,68 132,77 116,80" fill="#FBEDB0" />
          <circle cx="120" cy="74" r="2.5" fill="#152A22" />
        </g>

        {/* Sparkles & Orbs */}
        <path
          d="M 125 15 Q 130 18 135 15 Q 132 20 135 25 Q 130 22 125 25 Q 128 20 125 15 Z"
          fill="url(#clayYellowSparkle)"
          filter="url(#clayOceanShadow)"
        />
        <circle cx="20" cy="40" r="5" fill="#93B2F8" opacity="0.9" />
        <circle cx="140" cy="95" r="7" fill="#FBEDB0" />
      </svg>
    );
  }

  if (variant === 'essay') {
    return (
      <svg
        viewBox="0 0 120 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        aria-hidden="true"
      >
        <defs>
          <radialGradient id="claySheetOcean" cx="35%" cy="25%" r="75%">
            <stop offset="0%" stopColor="#FCFDFF" />
            <stop offset="70%" stopColor="#F2F6FD" />
            <stop offset="100%" stopColor="#C9D9E8" />
          </radialGradient>
          <filter id="clayDocOceanShadow" x="-10%" y="-10%" width="130%" height="130%">
            <feDropShadow dx="0" dy="5" stdDeviation="5" floodColor="#152A22" floodOpacity="0.1" />
          </filter>
        </defs>
        <g filter="url(#clayDocOceanShadow)">
          <rect x="25" y="15" width="70" height="70" rx="14" fill="url(#claySheetOcean)" />
          <rect x="36" y="30" width="48" height="5" rx="2.5" fill="#1E3A2F" />
          <rect x="36" y="42" width="40" height="4" rx="2" fill="#93B2F8" />
          <rect x="36" y="52" width="44" height="4" rx="2" fill="#93B2F8" />
          <rect x="36" y="62" width="30" height="4" rx="2" fill="#C9D9E8" />
          <circle cx="82" cy="72" r="8" fill="#F1B94C" />
          <polyline points="79,72 81,74 85,70" stroke="#152A22" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </g>
      </svg>
    );
  }

  return (
    <svg
      viewBox="0 0 120 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <defs>
        <radialGradient id="clayBadgeOcean" cx="35%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#93B2F8" />
          <stop offset="70%" stopColor="#1E3A2F" />
          <stop offset="100%" stopColor="#152A22" />
        </radialGradient>
        <filter id="clayStarOceanShadow" x="-10%" y="-10%" width="130%" height="130%">
          <feDropShadow dx="0" dy="5" stdDeviation="5" floodColor="#152A22" floodOpacity="0.18" />
        </filter>
      </defs>
      <g filter="url(#clayStarOceanShadow)">
        <circle cx="60" cy="50" r="32" fill="url(#clayBadgeOcean)" />
        <circle cx="60" cy="50" r="26" fill="#FCFDFF" fillOpacity="0.15" />
        <circle cx="60" cy="50" r="14" fill="#F1B94C" />
      </g>
    </svg>
  );
};
