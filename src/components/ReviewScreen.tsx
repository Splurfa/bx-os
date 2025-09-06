import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";

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
    <div className="space-y-6 p-4">
      {/* Summary Section */}
      <Card className="p-6 bg-gradient-card shadow-card">
        <h3 className="text-lg font-semibold text-foreground mb-4">Review & Submit</h3>
        
        <div className="space-y-3">
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-sm text-muted-foreground">Student:</span>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary text-primary-foreground">
              {studentName}
            </span>
          </div>
          
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-sm text-muted-foreground">Context:</span>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-secondary text-secondary-foreground">
              {contextLabel}
            </span>
          </div>
          
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-sm text-muted-foreground">Behaviors:</span>
            <div className="flex flex-wrap gap-1">
              {selectedBehaviors.map((behavior, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-muted text-muted-foreground"
                >
                  {behavior}
                </span>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* Teacher Mood Section */}
      <Card className="p-6 bg-gradient-card shadow-card">
        <div className="space-y-4">
          <Label className="text-sm font-medium text-foreground">
            How are you feeling right now? ({moodLabels[teacherMood - 1]})
          </Label>
          <div className="px-2">
            <Slider
              value={sliderValue}
              onValueChange={handleSliderChange}
              max={5}
              min={1}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground mt-2">
              <span>Very Calm</span>
              <span>Very Frustrated</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Urgency Level Section */}
      <Card className="p-6 bg-gradient-card shadow-card">
        <div className="space-y-4">
          <Label className="text-sm font-medium text-foreground">Urgency Level</Label>
          <div className="grid grid-cols-1 gap-2">
            {urgencyOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => onUrgencyLevelChange(option.value)}
                className={`p-3 text-left border-2 rounded-lg transition-all ${
                  urgencyLevel === option.value
                    ? 'border-primary bg-primary/10 shadow-sm'
                    : 'border-border hover:border-muted-foreground bg-card'
                }`}
              >
                <div className="font-medium text-sm text-foreground">{option.label}</div>
                <div className="text-xs text-muted-foreground">{option.description}</div>
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Notes Section */}
      <Card className="p-6 bg-gradient-card shadow-card">
        <div className="space-y-4">
          <Label htmlFor="notes" className="text-sm font-medium text-foreground">
            Additional Notes (Optional)
          </Label>
          <Textarea
            id="notes"
            value={note}
            onChange={(e) => onNoteChange(e.target.value)}
            placeholder="Add any additional context or observations..."
            className="min-h-20"
          />
        </div>
      </Card>

      {/* Submit Button */}
      <Button 
        onClick={onSubmit}
        disabled={isSubmitting}
        className="w-full bg-gradient-primary text-white shadow-button hover:shadow-elevated transition-all duration-200"
        size="lg"
      >
        {isSubmitting ? 'Submitting...' : 'Submit Behavior Support Request'}
      </Button>
    </div>
  );
};

export default ReviewScreen;