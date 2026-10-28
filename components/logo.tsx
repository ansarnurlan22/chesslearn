import React from 'react';

interface LogoProps {
  className?: string;
  iconOnly?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function ChessCheeseIcon({ className = 'w-9 h-9' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="ChessCheese Logo Icon"
    >
      <defs>
        {/* Cheese Body Gradient */}
        <linearGradient id="cheeseGrad" x1="6" y1="4" x2="42" y2="44" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#fef08a" />
          <stop offset="25%" stopColor="#fbbf24" />
          <stop offset="75%" stopColor="#f59e0b" />
          <stop offset="100%" stopColor="#d97706" />
        </linearGradient>

        {/* Cheese 3D Side Shadow Gradient */}
        <linearGradient id="cheeseSideGrad" x1="24" y1="18" x2="44" y2="44" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#f59e0b" />
          <stop offset="100%" stopColor="#b45309" />
        </linearGradient>

        {/* Crown Gold Gradient */}
        <linearGradient id="crownGrad" x1="12" y1="2" x2="36" y2="22" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
          <stop offset="30%" stopColor="#fef08a" />
          <stop offset="100%" stopColor="#f59e0b" />
        </linearGradient>

        {/* Hole Drop Shadow */}
        <radialGradient id="holeGrad1" cx="30%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#92400e" stopOpacity="0.75" />
          <stop offset="60%" stopColor="#b45309" stopOpacity="0.85" />
          <stop offset="100%" stopColor="#d97706" stopOpacity="0.9" />
        </radialGradient>

        <filter id="cheeseGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#f59e0b" floodOpacity="0.35" />
        </filter>
      </defs>

      {/* Main triangular cheese wedge with a crowned chess silhouette */}
      <g filter="url(#cheeseGlow)">
        {/* Cheese wedge top surface */}
        <path
          d="M 6 36 L 24 6 C 25.5 4 27.5 4 29 6 L 42 34 C 42.8 35.8 41.5 38 39.5 38 L 8.5 38 C 6.5 38 5.2 35.8 6 36 Z"
          fill="url(#cheeseGrad)"
        />

        {/* Cheese thickness / 3D cut edge */}
        <path
          d="M 6 36 L 8.5 38 L 39.5 38 L 42 34 C 43 36.5 41.5 41 38.5 41 L 9.5 41 C 6.5 41 5 38 6 36 Z"
          fill="url(#cheeseSideGrad)"
        />

        {/* Chess Crown finials integrated gracefully at the top */}
        <path
          d="M 17 19 L 20 12 L 24 16 L 28 12 L 31 19 Z"
          fill="url(#crownGrad)"
          stroke="#b45309"
          strokeWidth="0.75"
          strokeLinejoin="round"
        />
        <circle cx="20" cy="11.5" r="1.3" fill="#ffffff" />
        <circle cx="24" cy="15" r="1.3" fill="#ffffff" />
        <circle cx="28" cy="11.5" r="1.3" fill="#ffffff" />

        {/* Chess Knight Mane Curve (silhouette imprint) */}
        <path
          d="M 24 16 C 21 20 20 24 22 28 C 22.8 29.5 24.5 30 26 29"
          stroke="#b45309"
          strokeWidth="1.2"
          strokeLinecap="round"
          opacity="0.45"
        />

        {/* Swiss Cheese Holes (appetizing craters) */}
        {/* Big hole bottom left */}
        <ellipse cx="16" cy="31" rx="4" ry="3" fill="url(#holeGrad1)" />
        <ellipse cx="16" cy="30.5" rx="3.6" ry="1" fill="#fef08a" opacity="0.3" />

        {/* Medium hole right side */}
        <ellipse cx="32" cy="27" rx="3.2" ry="2.5" fill="url(#holeGrad1)" />
        <ellipse cx="32" cy="26.6" rx="2.8" ry="0.8" fill="#fef08a" opacity="0.35" />

        {/* Small hole top-center */}
        <circle cx="24" cy="22" r="1.8" fill="url(#holeGrad1)" />

        {/* Tiny edge hole */}
        <ellipse cx="26" cy="34" rx="2.2" ry="1.6" fill="url(#holeGrad1)" />

        {/* Highlight sheen along cheese edge */}
        <path
          d="M 8 35.5 L 24 7"
          stroke="#ffffff"
          strokeWidth="1"
          strokeLinecap="round"
          opacity="0.4"
        />
      </g>
    </svg>
  );
}

export function Logo({ className = '', iconOnly = false, size = 'md' }: LogoProps) {
  const iconSizes = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-12 h-12',
  };

  const textSizes = {
    sm: 'text-base',
    md: 'text-xl',
    lg: 'text-2xl',
  };

  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      <div className="shrink-0 transition-transform duration-200 group-hover:scale-105">
        <ChessCheeseIcon className={iconSizes[size]} />
      </div>

      {!iconOnly && (
        <div className="flex items-center leading-none tracking-tight">
          <span className={`font-black text-white ${textSizes[size]}`}>Chess</span>
          <span className={`font-black text-[#fbbf24] ${textSizes[size]} ml-0.5 drop-shadow-[0_1px_4px_rgba(251,191,36,0.25)]`}>
            Cheese
          </span>
        </div>
      )}
    </div>
  );
}
