import React from 'react';
import { Button, ButtonProps } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface TouchOptimizedButtonProps extends ButtonProps {
  touchTargetSize?: 'default' | 'large' | 'xl';
  enableHaptic?: boolean;
}

export const TouchOptimizedButton: React.FC<TouchOptimizedButtonProps> = ({
  className,
  touchTargetSize = 'default',
  enableHaptic = true,
  children,
  onClick,
  ...props
}) => {
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    // Haptic feedback for mobile devices
    if (enableHaptic && 'vibrate' in navigator) {
      navigator.vibrate(50);
    }

    // Call original onClick
    if (onClick) {
      onClick(event);
    }
  };

  const touchSizeClasses = {
    default: 'min-h-[44px] min-w-[44px]', // iOS recommended minimum
    large: 'min-h-[60px] min-w-[60px] text-lg',
    xl: 'min-h-[80px] min-w-[80px] text-xl'
  };

  return (
    <Button
      className={cn(
        touchSizeClasses[touchTargetSize],
        'touch-manipulation select-none', // Improve touch responsiveness
        'active:scale-95 transition-transform duration-75', // Visual feedback
        'focus-visible:ring-2 focus-visible:ring-offset-2', // Accessibility
        className
      )}
      onClick={handleClick}
      {...props}
    >
      {children}
    </Button>
  );
};