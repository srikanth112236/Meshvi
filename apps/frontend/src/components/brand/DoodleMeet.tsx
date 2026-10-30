import React from 'react';

type DoodleMeetProps = {
  className?: string;
};

/**
 * Hand-drawn "handshake" doodle in the spirit of Google Doodles:
 * wobbly stroke arms + clasped hands + sparkles.
 */
export const DoodleMeet: React.FC<DoodleMeetProps> = ({ className }) => {
  return (
    <svg
      viewBox="0 0 120 84"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      role="img"
    >
      {/* doodle arms reaching out to shake hands */}
      <path
        d="M6 56 C 36 46, 74 48, 112 38"
        stroke="#38BDF8"
        strokeWidth="11"
        strokeLinecap="round"
      />
      <path
        d="M112 38 C 74 28, 36 30, 6 40"
        stroke="#0284C7"
        strokeWidth="11"
        strokeLinecap="round"
      />
      {/* clasped hands */}
      <circle cx="62" cy="42" r="17" fill="#0284C7" />
      <circle cx="70" cy="44" r="13.5" fill="#38BDF8" />
      <circle cx="62" cy="42" r="6.5" fill="#E0F2FE" />
      {/* doodle sparkles */}
      <path d="M88 14 L91 18.5 L95 20 L91 21.5 L88 26 L85 21.5 L80 20 L85 18.5 Z" fill="#FBBF24" />
      <path d="M16 11 L18 14.5 L21.5 16 L18 17.5 L16 21 L14 17.5 L10.5 16 L14 14.5 Z" fill="#34D399" />
    </svg>
  );
};
