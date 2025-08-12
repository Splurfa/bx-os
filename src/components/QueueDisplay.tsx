
import React, { useMemo } from "react";
import { User, CheckCircle, Monitor, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import LiveTimer from "./LiveTimer";
import { BehaviorRequest } from "@/hooks/useSupabaseQueue";
import { MockBehaviorRequest } from "@/hooks/useMockData";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";

interface QueueDisplayProps {
  items: (BehaviorRequest | MockBehaviorRequest)[];
  onSelectReflection: (item: BehaviorRequest | MockBehaviorRequest) => void;
  formatTimeElapsed: (timestamp: Date) => string;
  onClearQueue?: () => void;
  clearQueueLoading?: boolean;
  queueLoading?: boolean;
  showClearButton?: boolean;
  showReviewButtons?: boolean;
  onClearItem?: (id: string) => void;
  showTeacherLastNameChip?: boolean;
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
  showReviewButtons = true,
  onClearItem,
  showTeacherLastNameChip = false
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
    <div className="space-y-3">
      {/* Header with Clear Queue button */}
      {showClearButton && onClearQueue && (
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Active Queue</h3>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button 
                variant="destructive" 
                size="sm"
                className="text-xs"
                disabled={queueLoading || clearQueueLoading}
              >
                {clearQueueLoading ? 'Clearing...' : 'Clear Queue'}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Clear entire queue?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will remove all active items from the queue. This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={onClearQueue}>Confirm</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      )}

      
      <div className="space-y-1">
        {sortedItems.map((item) => {
        const isActive = (item.position === 1 || (!item.position && item.status === 'waiting'));
        
        return (
          <div
            key={item.id}
            className={`grid grid-cols-[minmax(0,1fr)_auto] grid-rows-2 gap-x-2 gap-y-1 px-3 py-2 border-b border-border last:border-b-0 ${
              (item as any).urgent ? 'bg-queue-urgent/10 border-queue-urgent/20' : (isActive ? 'bg-primary/5' : 'bg-background')
            }`}
          >
            {/* Row 1, Col 1: Student name (mobile abbreviated) + behavior dots */}
            <div className="col-[1] row-[1] flex items-center min-w-0 gap-2">
              {(() => {
                const fullName = item.student?.name || 'Unknown Student';
                const parts = fullName.trim().split(/\s+/);
                const first = parts[0] || '';
                const last = parts.length > 1 ? parts[parts.length - 1] : '';
                const abbreviated = `${first ? first.charAt(0).toUpperCase() + '.' : ''} ${last}`.trim();
                return (
                  <h3 className="text-sm font-medium text-foreground min-w-0 truncate">
                    <span className="md:hidden">{abbreviated}</span>
                    <span className="hidden md:inline">{fullName}</span>
                  </h3>
                );
              })()}
              <div className="flex items-center gap-1 shrink-0">
                {item.behaviors.map((behavior, index) => (
                  <div
                    key={index}
                    className={`w-2 h-2 rounded-full ${getBehaviorColor(behavior)}`}
                  />
                ))}
              </div>
            </div>

            {/* Row 2, Col 1: Timer + Kiosk (mobile = K1) */}
            <div className="col-[1] row-[2] flex items-center gap-2 text-xs text-muted-foreground min-w-0">
              <span className="whitespace-nowrap">
                <LiveTimer startTime={item.timestamp || new Date(item.created_at)} />
              </span>
              {('assigned_kiosk_id' in item) && item.assigned_kiosk_id && item.status !== 'review' && (
                <Badge variant="outline" className="text-xs px-1.5 py-0.5 whitespace-nowrap">
                  <Monitor className="h-3 w-3 mr-1" />
                  <span className="md:hidden">K{item.assigned_kiosk_id}</span>
                  <span className="hidden md:inline">Kiosk {item.assigned_kiosk_id}</span>
                </Badge>
              )}
            </div>

            {/* Row 1, Col 2: Status/Review + Clear (tight spacing) */}
            <div className="col-[2] row-[1] flex items-center justify-self-end gap-0.5">
              <div className="flex items-center gap-1">
                {showReviewButtons && item.status === 'review' ? (
                  <Button
                    size="sm"
                    variant="default"
                    onClick={() => onSelectReflection(item)}
                    className="text-xs whitespace-nowrap"
                  >
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Review
                  </Button>
                ) : (
                  <>
                    {item.status === 'review' && !showReviewButtons ? (
                      <Badge variant="secondary" className="bg-purple-100 text-purple-800 border-purple-200 text-xs px-1.5 py-0.5 whitespace-nowrap">
                        Pending Review
                      </Badge>
                    ) : (
                      <>
                        {('kiosk_status' in item) && item.kiosk_status === 'in_progress' ? (
                          <Badge variant="secondary" className="bg-amber-100 text-amber-800 border-amber-200 text-xs px-1.5 py-0.5 whitespace-nowrap">
                            In Progress
                          </Badge>
                        ) : ('kiosk_status' in item) && item.kiosk_status === 'ready' ? (
                          <Badge variant="secondary" className="bg-blue-100 text-blue-800 border-blue-200 text-xs px-1.5 py-0.5 whitespace-nowrap">
                            At Kiosk
                          </Badge>
                        ) : item.assigned_kiosk_id ? (
                          <Badge variant="outline" className="text-orange-600 border-orange-200 text-xs px-1.5 py-0.5 whitespace-nowrap">
                            Assigned
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-muted-foreground text-xs px-1.5 py-0.5 whitespace-nowrap">
                            Waiting
                          </Badge>
                        )}
                      </>
                    )}
                  </>
                )}
              </div>

              {onClearItem && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="rounded-full h-5 w-5 p-0 shrink-0"
                      aria-label="Remove from queue"
                      title="Remove from queue"
                    >
                      <XCircle className="h-4 w-4 text-destructive" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Remove this student?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will remove the student from the active queue. This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={() => onClearItem(item.id)}>Confirm</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </div>

            {/* Row 2, Col 2: Teacher last name chip (hidden if missing) */}
            {showTeacherLastNameChip && (() => {
              const last = (item as any).teacher_last_name as string | undefined;
              const full = (item as any).teacher_full_name as string | undefined;
              const email = (item as any).teacher_email as string | undefined;
              const fromLast = last && last.trim();
              const fromFull = !fromLast && full ? full.trim().split(/\s+/).slice(-1)[0] : undefined;
              const fromEmail = !fromLast && !fromFull && email ? email.split('@')[0].split('.').slice(-1)[0] : undefined;
              const derived = (fromLast as string) || (fromFull as string) || (fromEmail as string) || "";
              return derived ? (
                <Badge variant="outline" className="text-xs px-1.5 py-0.5 justify-self-end whitespace-nowrap">
                  {derived}
                </Badge>
              ) : null;
            })()}
          </div>
        );
        })}
      </div>
    </div>
  );
});

export default QueueDisplay;
