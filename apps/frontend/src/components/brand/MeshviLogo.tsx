import React from 'react';

export interface MeshviLogoProps {
  variant?: 'full' | 'mark' | 'white';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showSubtitle?: boolean;
}

export const MeshviLogo: React.FC<MeshviLogoProps> = ({
  variant = 'full',
  size = 'md',
  className = '',
}) => {
  // Dimension mappings
  const dimensions = {
    xs: variant === 'mark' ? 'h-5 w-5' : 'h-5 w-auto',
    sm: variant === 'mark' ? 'h-7 w-7' : 'h-7 w-auto',
    md: variant === 'mark' ? 'h-9 w-9' : 'h-9 w-auto',
    lg: variant === 'mark' ? 'h-12 w-12' : 'h-12 w-auto',
    xl: variant === 'mark' ? 'h-16 w-16' : 'h-16 w-auto',
  };

  const imageSrc =
    variant === 'mark'
      ? '/meshvi-mark.png'
      : variant === 'white'
      ? '/meshvi-logo-white.png'
      : '/meshvi-logo-full.png';

  return (
    <img
      src={imageSrc}
      alt="MESHVI — Discover Connect Grow"
      className={`object-contain select-none shrink-0 ${dimensions[size]} ${className}`}
      draggable={false}
    />
  );
};
