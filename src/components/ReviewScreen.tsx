import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
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
    <div className="h-full flex flex-col space-y-2 p-2">
      {/* Summary Section - Flat */}
      <div className="border border-border rounded p-2">
        <h3 className="text-sm font-medium text-foreground mb-2">Summary</h3>
        <div className="space-y-1 text-xs">
          <div className="flex items-center gap-1">
            <span className="text-muted-foreground">Student:</span>
            <span className="font-medium">{studentName}</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-muted-foreground">Context:</span>
            <span className="font-medium">{contextLabel}</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-muted-foreground">Behaviors:</span>
            <span className="font-medium">{selectedBehaviors.join(', ')}</span>
          </div>
        </div>
      </div>

      {/* Teacher Mood - Compact */}
      <div className="border border-border rounded p-2">
        <Label className="text-xs font-medium text-foreground mb-1 block">
          Your mood: {moodLabels[teacherMood - 1]}
        </Label>
        <Slider
          value={sliderValue}
          onValueChange={handleSliderChange}
          max={5}
          min={1}
          step={1}
          className="w-full mb-1"
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Calm</span>
          <span>Frustrated</span>
        </div>
      </div>

      {/* Notes - Modal only */}
      <div className="border border-border rounded p-2">
        <div className="flex items-center justify-between">
          <Label className="text-xs font-medium text-foreground">Notes</Label>
          <NotesModal note={note} onNoteChange={onNoteChange} />
        </div>
        {note && (
          <div className="text-xs text-muted-foreground mt-1 p-1 bg-muted/20 rounded">
            {note.substring(0, 60)}{note.length > 60 ? '...' : ''}
          </div>
        )}
      </div>

      {/* Submit Button - Fixed to bottom */}
      <div className="mt-auto pt-2">
        <Button 
          onClick={onSubmit}
          disabled={isSubmitting}
          className="w-full"
          size="lg"
        >
          {isSubmitting ? 'Submitting...' : 'Submit Request'}
        </Button>
      </div>
    </div>
  );
};

export default ReviewScreen;