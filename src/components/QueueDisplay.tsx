
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
  // Filter to only show active items - waiting students + review students + revision students
  const sortedItems = useMemo(() => {
    const activeItems = items.filter(item => {
      // Include waiting students
      if (item.status === 'waiting') return true;
      
      // Include students ready for review
      if (item.status === 'review') return true;
      
      // Include completed students who need revision
      if (item.status === 'completed' && item.reflection?.status === 'revision_requested') return true;
      
      // Exclude all other completed students
      return false;
    });
    
    return [...activeItems].sort((a, b) => {
      // Priority order: review status first, then waiting, then by timestamp
      if (a.status === 'review' && b.status !== 'review') return -1;
      if (b.status === 'review' && a.status !== 'review') return 1;
      
      const aTime = a.timestamp?.getTime() || new Date(a.created_at).getTime();
      const bTime = b.timestamp?.getTime() || new Date(b.created_at).getTime();
      return aTime - bTime;
    });
  }, [items]);

  if (sortedItems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-16">
        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
          <User className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold text-foreground">Active Queue is Empty</h3>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header with Clear Queue button */}
      {showClearButton && onClearQueue && (
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Active Queue</h3>
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
        const isActive = (item.position === 1 || (!item.position && item.status === 'waiting'));
        
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
                  {/* Show kiosk assignment only for non-review students */}
                  {'assigned_kiosk_id' in item && item.assigned_kiosk_id && item.status !== 'review' && (
                    <Badge variant="outline" className="text-xs">
                      <Monitor className="h-3 w-3 mr-1" />
                      Kiosk {item.assigned_kiosk_id}
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              {/* Show Review button for students with status 'review' */}
              {showReviewButtons && item.status === 'review' && (
                <Button
                  size="sm"
                  variant="default"
                  onClick={() => onSelectReflection(item)}
                  className="text-xs"
                >
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Review
                </Button>
              )}
              
              {/* Status badges */}
              {item.status === 'review' && !showReviewButtons ? (
                <Badge variant="secondary" className="bg-purple-100 text-purple-800 border-purple-200 text-xs">
                  Pending Review
                </Badge>
              ) : item.status !== 'review' && (
                'kiosk_status' in item && item.kiosk_status === 'in_progress' ? (
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
                )
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
