import React from 'react';

export const LevixLogo: React.FC<{ className?: string; size?: number }> = ({
  className = '',
  size = 56
}) => {
  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      {/* Precision Geometric Monogram */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="text-white drop-shadow-[0_0_20px_rgba(255,255,255,0.4)]"
      >
        <rect
          x="2"
          y="2"
          width="60"
          height="60"
          rx="16"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeOpacity="0.4"
        />
        {/* Monogram L and X */}
        <path
          d="M18 16V46H36"
          stroke="currentColor"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M34 26L48 46"
          stroke="#E4E4E7"
          strokeWidth="4"
          strokeLinecap="round"
        />
        <path
          d="M48 26L34 46"
          stroke="#71717A"
          strokeWidth="4"
          strokeLinecap="round"
        />
        <circle cx="48" cy="18" r="3" fill="#FFFFFF" />
      </svg>
    </div>
  );
};
