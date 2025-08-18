import React, { useState, useRef, useEffect } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { X } from 'lucide-react';
import { TouchOptimizedButton } from './TouchOptimizedButton';

interface MobileModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  className?: string;
  enableSwipeToClose?: boolean;
  fullHeight?: boolean;
}

export const MobileModal: React.FC<MobileModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  className,
  enableSwipeToClose = true,
  fullHeight = false
}) => {
  const [dragY, setDragY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startY, setStartY] = useState(0);
  const modalRef = useRef<HTMLDivElement>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (!enableSwipeToClose) return;
    
    const touch = e.touches[0];
    setStartY(touch.clientY);
    setIsDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!enableSwipeToClose || !isDragging) return;
    
    const touch = e.touches[0];
    const deltaY = touch.clientY - startY;
    
    // Only allow downward swipes
    if (deltaY > 0) {
      setDragY(deltaY);
      
      // Add resistance as user drags further
      const resistance = Math.max(0, 1 - deltaY / 300);
      if (modalRef.current) {
        modalRef.current.style.transform = `translateY(${deltaY * resistance}px)`;
      }
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!enableSwipeToClose || !isDragging) return;
    
    setIsDragging(false);
    
    // Close modal if dragged down more than 150px
    if (dragY > 150) {
      onClose();
    }
    
    // Reset position
    setDragY(0);
    if (modalRef.current) {
      modalRef.current.style.transform = 'translateY(0px)';
    }
  };

  // Reset drag state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setDragY(0);
      setIsDragging(false);
    }
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        ref={modalRef}
        className={cn(
          'fixed bottom-0 left-0 right-0 top-auto',
          'rounded-t-2xl border-t border-border',
          'max-h-[90vh] overflow-hidden',
          'transform transition-transform duration-200 ease-out',
          fullHeight && 'h-[90vh]',
          isDragging && 'transition-none',
          className
        )}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Drag handle */}
        {enableSwipeToClose && (
          <div className="flex justify-center pt-2 pb-4">
            <div className="w-12 h-1 bg-muted-foreground/30 rounded-full" />
          </div>
        )}
        
        {/* Header */}
        {title && (
          <div className="flex items-center justify-between pb-4 border-b">
            <h2 className="text-lg font-semibold">{title}</h2>
            <TouchOptimizedButton
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </TouchOptimizedButton>
          </div>
        )}
        
        {/* Content */}
        <div className={cn(
          'overflow-y-auto',
          fullHeight ? 'flex-1' : 'max-h-[60vh]'
        )}>
          {children}
        </div>
      </DialogContent>
    </Dialog>
  );
};