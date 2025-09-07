import { useState } from "react";
import { Label } from "@/components/ui/label";
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

const urgencyOptions = [
  { value: 'standard', label: 'Standard', description: 'Regular processing' },
  { value: 're_integration', label: 'Re-integration', description: 'Priority return to class' },
  { value: 'urgent', label: 'Urgent', description: 'Immediate attention needed' }
];

const moodLabels = ['Very Calm', 'Calm', 'Neutral', 'Frustrated', 'Very Frustrated'];

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
      {/* Content Area - Scrollable */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Summary Section - Enhanced with Colors */}
        <div className="bg-gradient-to-r from-primary/5 to-secondary/5 border border-primary/20 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            📋 Review Summary
          </h3>
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground text-sm">Student:</span>
              <Badge variant="default" className="bg-primary/10 text-primary border-primary/20">
                {studentName}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground text-sm">Context:</span>
              <Badge variant="secondary" className="bg-secondary/10 text-secondary-foreground border-secondary/20">
                {contextLabel}
              </Badge>
            </div>
            <div className="flex flex-col gap-2">
              <span className="text-muted-foreground text-sm">Behaviors:</span>
              <div className="flex flex-wrap gap-2">
                {selectedBehaviors.map((behavior, index) => (
                  <Badge 
                    key={index} 
                    variant="outline" 
                    className="bg-accent/10 text-accent-foreground border-accent/30"
                  >
                    {behavior}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Teacher Mood - Enhanced with Colorful Slider */}
        <div className="bg-gradient-to-r from-secondary/5 to-accent/5 border border-secondary/20 rounded-lg p-4">
          <h4 className="text-base font-medium text-foreground mb-4 flex items-center gap-2">
            🎯 Your Current Mood
          </h4>
          <div className="bg-background/80 rounded-lg p-4 border border-border/50">
            <MoodSlider
              value={moodToPercentage(teacherMood)}
              onChange={handleMoodChange}
            />
          </div>
        </div>

        {/* Notes Section - Enhanced */}
        <div className="bg-gradient-to-r from-accent/5 to-primary/5 border border-accent/20 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-base font-medium text-foreground flex items-center gap-2">
              📝 Additional Notes
            </h4>
            <NotesModal note={note} onNoteChange={onNoteChange} />
          </div>
          {note ? (
            <div className="bg-background/80 rounded-lg p-3 border border-border/50">
              <p className="text-sm text-muted-foreground">
                {note.length > 120 ? `${note.substring(0, 120)}...` : note}
              </p>
            </div>
          ) : (
            <div className="bg-muted/20 rounded-lg p-3 border border-dashed border-muted-foreground/30">
              <p className="text-sm text-muted-foreground text-center">
                No additional notes added
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