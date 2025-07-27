
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface StickyFooterProps {
  primaryAction: {
    label: string;
    onClick: () => void;
    disabled?: boolean;
    variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
    variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  };
  className?: string;
}

const StickyFooter = ({ primaryAction, secondaryAction, className }: StickyFooterProps) => {
  return (
    <div className={cn(
      "sticky bottom-0 z-10 bg-background border-t border-border p-4 shadow-lg",
      "flex items-center justify-between space-x-3",
      className
    )}>
      {secondaryAction ? (
        <Button 
          variant={secondaryAction.variant || "outline"}
          onClick={secondaryAction.onClick}
          className="flex-1"
        >
          {secondaryAction.label}
        </Button>
      ) : <div />}
      
      <Button 
        variant={primaryAction.variant || "default"}
        onClick={primaryAction.onClick}
        disabled={primaryAction.disabled}
        className="flex-1 h-11 bg-gradient-primary text-white shadow-button hover:shadow-elevated transition-all duration-200"
      >
        {primaryAction.label}
      </Button>
    </div>
  );
};

export default StickyFooter;
