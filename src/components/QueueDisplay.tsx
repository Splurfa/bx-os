
import React, { useMemo } from "react";
import { User, CheckCircle, Monitor } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import LiveTimer from "./LiveTimer";
import { BehaviorRequest } from "@/hooks/useSupabaseQueue";
import { MockBehaviorRequest } from "@/hooks/useMockData";

interface QueueDisplayProps {
  items: (BehaviorRequest | MockBehaviorRequest)[];
  onSelectReflection: (item: BehaviorRequest | MockBehaviorRequest) => void;
  formatTimeElapsed: (timestamp: Date) => string;
  onClearQueue?: () => void;
  clearQueueLoading?: boolean;
  queueLoading?: boolean;
  showClearButton?: boolean;
  showReviewButtons?: boolean;
}

const getBehaviorColor = (behavior: string) => {
  // Handle both display labels and stored IDs
  const behaviorMap: Record<string, string> = {
    // Display labels (what's shown in queue)
    'Disruptive': 'bg-behavior-disruptive',
    'Social-Emotional': 'bg-behavior-social',
    'Avoidance': 'bg-behavior-avoidance',
    'Eloping': 'bg-behavior-eloping',
    'Minor-Physical': 'bg-behavior-minor-physical',
    'Major-Physical': 'bg-behavior-major-physical',
    // IDs (what's stored in database)
    'disruptive': 'bg-behavior-disruptive',
    'social-emotional': 'bg-behavior-social',
    'avoidance': 'bg-behavior-avoidance',
    'eloping': 'bg-behavior-eloping',
    'minor-physical': 'bg-behavior-minor-physical',
    'major-physical': 'bg-behavior-major-physical'
  };
  return behaviorMap[behavior] || 'bg-primary';
};

const QueueDisplay = React.memo(({ 
  items, 
  onSelectReflection, 
  formatTimeElapsed, 
  onClearQueue, 
  clearQueueLoading = false, 
  queueLoading = false, 
  showClearButton = false,
  showReviewButtons = true
}: QueueDisplayProps) => {
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-16">
        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
          <User className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold text-foreground">Queue is Empty</h3>
      </div>
    );
  }

  // Sort items: completed first, then by timestamp - memoized for performance
  const sortedItems = useMemo(() => {
    return [...items].sort((a, b) => {
      if (a.status === 'completed' && b.status !== 'completed') return -1;
      if (a.status !== 'completed' && b.status === 'completed') return 1;
      const aTime = a.timestamp?.getTime() || new Date(a.created_at).getTime();
      const bTime = b.timestamp?.getTime() || new Date(b.created_at).getTime();
      return aTime - bTime;
    });
  }, [items]);

  return (
    <div className="space-y-4">
      {/* Header with Clear Queue button */}
      {showClearButton && onClearQueue && (
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Behavior Queue</h3>
          <Button 
            variant="destructive" 
            size="sm"
            onClick={onClearQueue}
            disabled={queueLoading || clearQueueLoading}
          >
            {clearQueueLoading ? 'Clearing...' : 'Clear Queue'}
          </Button>
        </div>
      )}
      
      <div className="space-y-1">
        {sortedItems.map((item) => {
        const isCompleted = item.status === 'completed';
        const isActive = (item.position === 1 || (!item.position && item.status === 'waiting')) && !isCompleted;
        
        return (
          <div
            key={item.id}
            className={`flex items-center justify-between px-4 py-3 border-b border-border last:border-b-0 ${
              isActive ? 'bg-primary/5' : 'bg-background'
            }`}
          >
            <div className="flex items-center space-x-3 flex-1">
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <h3 className="text-sm font-medium text-foreground">{item.student?.name || 'Unknown Student'}</h3>
                  <div className="flex items-center space-x-1">
                    {item.behaviors.map((behavior, index) => (
                      <div 
                        key={index}
                        className={`w-2 h-2 rounded-full ${getBehaviorColor(behavior)}`}
                      />
                    ))}
                  </div>
                </div>
                <div className="flex items-center space-x-3 text-xs text-muted-foreground">
                  <LiveTimer startTime={item.timestamp || new Date(item.created_at)} />
                  {/* Show kiosk assignment for mock data */}
                  {'assigned_kiosk_id' in item && item.assigned_kiosk_id && (
                    <Badge variant="outline" className="text-xs">
                      <Monitor className="h-3 w-3 mr-1" />
                      Kiosk {item.assigned_kiosk_id}
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center">
              {isCompleted && showReviewButtons ? (
                <Button
                  size="sm"
                  onClick={() => onSelectReflection(item)}
                  className="text-xs h-7 px-3"
                >
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Review
                </Button>
              ) : isCompleted && !showReviewButtons ? (
                <Badge variant="default" className="bg-green-100 text-green-800 border-green-200 text-xs">
                  Completed
                </Badge>
              ) : 'kiosk_status' in item && item.kiosk_status === 'in_progress' ? (
                <Badge variant="secondary" className="bg-amber-100 text-amber-800 border-amber-200 text-xs">
                  In Progress
                </Badge>
              ) : 'kiosk_status' in item && item.kiosk_status === 'ready' ? (
                <Badge variant="secondary" className="bg-blue-100 text-blue-800 border-blue-200 text-xs">
                  At Kiosk
                </Badge>
              ) : item.assigned_kiosk_id ? (
                <Badge variant="outline" className="text-orange-600 border-orange-200 text-xs">
                  Assigned
                </Badge>
              ) : (
                <Badge variant="outline" className="text-muted-foreground text-xs">
                  Waiting
                </Badge>
              )}
            </div>
          </div>
        );
        })}
      </div>
    </div>
  );
});

export default QueueDisplay;
