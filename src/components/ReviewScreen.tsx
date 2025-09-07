import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import MoodSlider from "./MoodSlider";

interface ReviewScreenProps {
  studentName: string;
  contextLabel: string;
  selectedBehaviors: string[];
  teacherMood: number;
  urgencyLevel: string;
  note: string;
  onTeacherMoodChange: (mood: number) => void;
  onUrgencyLevelChange: (urgency: string) => void;
  onNoteChange: (note: string) => void;
  onSubmit: () => void;
  isSubmitting?: boolean;
}

const behaviors = [
  { 
    id: 'disruptive', 
    label: 'Disruptive', 
    selectedClasses: 'bg-behavior-disruptive border-behavior-disruptive text-white shadow-sm',
    unselectedClasses: 'bg-behavior-disruptive-light border-behavior-disruptive-light text-behavior-disruptive'
  },
  { 
    id: 'social-emotional', 
    label: 'Social-Emotional', 
    selectedClasses: 'bg-behavior-social border-behavior-social text-white shadow-sm',
    unselectedClasses: 'bg-behavior-social-light border-behavior-social-light text-behavior-social'
  },
  { 
    id: 'avoidance', 
    label: 'Avoidance', 
    selectedClasses: 'bg-behavior-avoidance border-behavior-avoidance text-white shadow-sm',
    unselectedClasses: 'bg-behavior-avoidance-light border-behavior-avoidance-light text-behavior-avoidance'
  },
  { 
    id: 'eloping', 
    label: 'Eloping', 
    selectedClasses: 'bg-behavior-eloping border-behavior-eloping text-white shadow-sm',
    unselectedClasses: 'bg-behavior-eloping-light border-behavior-eloping-light text-behavior-eloping'
  },
  { 
    id: 'minor-physical', 
    label: 'Minor-Physical', 
    selectedClasses: 'bg-behavior-minor-physical border-behavior-minor-physical text-white shadow-sm',
    unselectedClasses: 'bg-behavior-minor-physical-light border-behavior-minor-physical-light text-behavior-minor-physical'
  },
  { 
    id: 'major-physical', 
    label: 'Major-Physical', 
    selectedClasses: 'bg-behavior-major-physical border-behavior-major-physical text-white shadow-sm',
    unselectedClasses: 'bg-behavior-major-physical-light border-behavior-major-physical-light text-behavior-major-physical'
  }
];

const getBehaviorClasses = (behaviorId: string) => {
  const behavior = behaviors.find(b => b.id === behaviorId);
  return behavior ? behavior.selectedClasses : 'bg-primary text-primary-foreground';
};

const ReviewScreen = ({
  studentName,
  contextLabel,
  selectedBehaviors,
  teacherMood,
  urgencyLevel,
  note,
  onTeacherMoodChange,
  onUrgencyLevelChange,
  onNoteChange,
  onSubmit,
  isSubmitting = false
}: ReviewScreenProps) => {
  // Convert teacherMood (1-5) to percentage (0-100) for MoodSlider
  const moodToPercentage = (mood: number) => ((mood - 1) / 4) * 100;
  const percentageToMood = (percentage: number) => Math.round((percentage / 100) * 4) + 1;

  const handleMoodChange = (percentage: number) => {
    const moodValue = percentageToMood(percentage);
    onTeacherMoodChange(moodValue);
  };

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Content Area with compact spacing like QueueDisplay */}
      <div className="flex-1 p-2 space-y-2">
        {/* Summary Section - QueueDisplay compact style */}
        <div className="space-y-1 p-2 bg-background border-b border-border">
          <div className="flex items-center gap-2">
            <span className="text-foreground font-medium text-sm min-w-[60px]">Student:</span>
            <span className="text-foreground text-sm">{studentName}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-foreground font-medium text-sm min-w-[60px]">Context:</span>
            <span className="text-foreground text-sm">{contextLabel}</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-foreground font-medium text-sm min-w-[60px] mt-0.5">Behaviors:</span>
            <div className="flex flex-wrap gap-1">
              {selectedBehaviors.map((behaviorId, index) => {
                const behavior = behaviors.find(b => b.id === behaviorId);
                const label = behavior ? behavior.label : behaviorId;
                const classes = getBehaviorClasses(behaviorId);
                
                return (
                  <span 
                    key={index} 
                    className={`px-1.5 py-0.5 rounded-full text-xs font-medium border ${classes}`}
                  >
                    {label}
                  </span>
                );
              })}
            </div>
          </div>
        </div>

        {/* Teacher Mood Section - Compact */}
        <div className="space-y-2 p-2">
          <h4 className="text-center text-base font-semibold text-foreground">Current Mood</h4>
          <div className="px-2">
            <MoodSlider
              value={moodToPercentage(teacherMood)}
              onChange={handleMoodChange}
            />
          </div>
        </div>
      </div>

      {/* Notes and Submit Section - Compact like QueueDisplay */}
      <div className="p-2 space-y-2 bg-background border-t border-border">
        {/* Notes Section */}
        <div className="space-y-2">
          <Label htmlFor="notes" className="text-sm font-medium text-foreground">
            Additional Notes
          </Label>
          <Textarea
            id="notes"
            placeholder="Add any additional context or observations..."
            value={note}
            onChange={(e) => onNoteChange(e.target.value)}
            className="min-h-[80px] resize-none"
          />
        </div>
        
        {/* Submit Button - Anchored to bottom */}
        <Button 
          onClick={onSubmit}
          disabled={isSubmitting}
          className="w-full h-12 bg-gradient-primary text-white shadow-lg hover:shadow-elevated transition-all duration-200"
          size="lg"
        >
          {isSubmitting ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Submitting...
            </div>
          ) : (
            "Submit Request"
          )}
        </Button>
      </div>
    </div>
  );
};

export default ReviewScreen;