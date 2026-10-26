import React from 'react';

export interface MeshviSpinnerProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'rotate' | 'pulse' | 'glow';
  className?: string;
}

export const MeshviSpinner: React.FC<MeshviSpinnerProps> = ({
  size = 'md',
  variant = 'rotate',
  className = '',
}) => {
  const sizeClasses = {
    xs: 'w-4 h-4',
    sm: 'w-6 h-6',
    md: 'w-9 h-9',
    lg: 'w-14 h-14',
    xl: 'w-20 h-20',
  };

  const animClass =
    variant === 'pulse'
      ? 'animate-pulse'
      : variant === 'glow'
      ? 'animate-bounce'
      : 'animate-[spin_3s_linear_infinite]';

  return (
    <div className={`relative inline-flex items-center justify-center ${className}`}>
      {/* Outer ambient glow */}
      <div className={`absolute inset-0 bg-sky-400/20 rounded-full blur-md animate-pulse`} />
      <img
        src="/meshvi-mark.png"
        alt="Loading..."
        className={`relative z-10 object-contain ${sizeClasses[size]} ${animClass}`}
        draggable={false}
      />
    </div>
  );
};
