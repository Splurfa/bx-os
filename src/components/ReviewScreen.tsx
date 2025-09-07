import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import MoodSlider from "./MoodSlider";
import NotesModal from "./NotesModal";

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
      {/* Content Area - No Scrolling */}
      <div className="flex-1 p-4 space-y-4">
        {/* Summary Section - Flat Design */}
        <div className="space-y-3">
          <h3 className="text-base font-semibold text-foreground border-b border-border pb-2">
            📋 Review Summary
          </h3>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground text-sm w-16">Student:</span>
              <Badge className="bg-primary text-primary-foreground">
                {studentName}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground text-sm w-16">Context:</span>
              <Badge variant="secondary" className="bg-secondary text-secondary-foreground">
                {contextLabel}
              </Badge>
            </div>
            <div className="space-y-2">
              <span className="text-muted-foreground text-sm">Behaviors:</span>
              <div className="flex flex-wrap gap-1.5">
                {selectedBehaviors.map((behaviorId, index) => {
                  const behavior = behaviors.find(b => b.id === behaviorId);
                  const label = behavior ? behavior.label : behaviorId;
                  const classes = getBehaviorClasses(behaviorId);
                  
                  return (
                    <span 
                      key={index} 
                      className={`px-2 py-1 rounded-full text-xs font-medium border ${classes}`}
                    >
                      {label}
                    </span>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Teacher Mood Section - Compact */}
        <div className="space-y-3">
          <h4 className="text-base font-semibold text-foreground border-b border-border pb-2">
            🎯 Your Current Mood
          </h4>
          <div className="px-2">
            <MoodSlider
              value={moodToPercentage(teacherMood)}
              onChange={handleMoodChange}
            />
          </div>
        </div>

        {/* Notes Section - Streamlined */}
        <div className="space-y-3">
          <div className="flex items-center justify-between border-b border-border pb-2">
            <h4 className="text-base font-semibold text-foreground">
              📝 Notes
            </h4>
            <NotesModal note={note} onNoteChange={onNoteChange} />
          </div>
          {note && (
            <div className="px-3 py-2 bg-muted/30 rounded-lg">
              <p className="text-sm text-foreground">
                {note.length > 100 ? `${note.substring(0, 100)}...` : note}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Submit Button - Anchored to Bottom */}
      <div className="p-4 bg-background border-t border-border">
        <Button 
          onClick={onSubmit}
          disabled={isSubmitting}
          className="w-full h-12 bg-gradient-primary text-white shadow-lg hover:shadow-elevated transition-all duration-200"
          size="lg"
        >
          {isSubmitting ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Submitting Request...
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span>📤</span>
              Submit Request
            </div>
          )}
        </Button>
      </div>
    </div>
  );
};

export default ReviewScreen;