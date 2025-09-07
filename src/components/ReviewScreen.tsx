import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
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
  const [sliderValue, setSliderValue] = useState([teacherMood]);

  const handleSliderChange = (value: number[]) => {
    setSliderValue(value);
    onTeacherMoodChange(value[0]);
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 overflow-y-auto space-y-3 p-3">
        {/* Summary Section */}
        <Card className="p-3 bg-gradient-card shadow-card">
          <h3 className="text-sm font-semibold text-foreground mb-2">Summary</h3>
          
          <div className="space-y-2">
            <div className="flex flex-wrap gap-1 items-center text-xs">
              <span className="text-muted-foreground">Student:</span>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-primary text-primary-foreground">
                {studentName}
              </span>
            </div>
            
            <div className="flex flex-wrap gap-1 items-center text-xs">
              <span className="text-muted-foreground">Context:</span>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-secondary text-secondary-foreground">
                {contextLabel}
              </span>
            </div>
            
            <div className="flex flex-wrap gap-1 items-center text-xs">
              <span className="text-muted-foreground">Behaviors:</span>
              <div className="flex flex-wrap gap-1">
                {selectedBehaviors.map((behavior, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-muted text-muted-foreground"
                  >
                    {behavior}
                  </span>
                ))}
              </div>
            </div>
          </div>
      </Card>

        {/* Teacher Mood Section */}
        <Card className="p-3 bg-gradient-card shadow-card">
          <div className="space-y-2">
            <Label className="text-xs font-medium text-foreground">
              Your mood: {moodLabels[teacherMood - 1]}
            </Label>
            <div className="px-1">
              <Slider
                value={sliderValue}
                onValueChange={handleSliderChange}
                max={5}
                min={1}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>Calm</span>
                <span>Frustrated</span>
              </div>
            </div>
          </div>
        </Card>

        {/* Urgency Level Section */}
        <Card className="p-3 bg-gradient-card shadow-card">
          <div className="space-y-2">
            <Label className="text-xs font-medium text-foreground">Urgency Level</Label>
            <div className="grid grid-cols-1 gap-1">
              {urgencyOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => onUrgencyLevelChange(option.value)}
                  className={`p-2 text-left border rounded transition-all ${
                    urgencyLevel === option.value
                      ? 'border-primary bg-primary/10'
                      : 'border-border hover:border-muted-foreground bg-card'
                  }`}
                >
                  <div className="font-medium text-xs text-foreground">{option.label}</div>
                  <div className="text-xs text-muted-foreground opacity-80">{option.description}</div>
                </button>
              ))}
            </div>
          </div>
        </Card>

        {/* Notes Section */}
        <Card className="p-3 bg-gradient-card shadow-card">
          <div className="space-y-2">
            <Label className="text-xs font-medium text-foreground">Additional Notes</Label>
            <NotesModal note={note} onNoteChange={onNoteChange} />
            {note && (
              <div className="text-xs text-muted-foreground bg-muted/50 p-2 rounded border">
                {note.substring(0, 100)}{note.length > 100 ? '...' : ''}
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Submit Button - Fixed to bottom */}
      <div className="p-3 border-t border-border bg-background">
        <Button 
          onClick={onSubmit}
          disabled={isSubmitting}
          className="w-full bg-gradient-primary text-white shadow-button hover:shadow-elevated transition-all duration-200"
          size="lg"
        >
          {isSubmitting ? 'Submitting...' : 'Submit Request'}
        </Button>
      </div>
    </div>
  );
};

export default ReviewScreen;