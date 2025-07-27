import { useState } from "react";
import { ArrowLeft, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface CreateBSRFormProps {
  onSubmit: (data: { studentName: string; behavior: string; mood: string }) => void;
  onCancel: () => void;
}

const behaviors = [
  { id: 'disruptive', label: 'Disruptive', color: 'behavior-disruptive' },
  { id: 'social-emotional', label: 'Social-Emotional', color: 'behavior-social' },
  { id: 'avoidance', label: 'Avoidance', color: 'behavior-avoidance' },
  { id: 'eloping', label: 'Eloping', color: 'behavior-eloping' },
  { id: 'minor-physical', label: 'Minor-Physical', color: 'behavior-minor-physical' },
  { id: 'major-physical', label: 'Major-Physical', color: 'behavior-major-physical' }
];

const moods = [
  'Frustrated', 'Angry', 'Upset', 'Anxious', 'Confused', 'Defiant', 'Overwhelmed', 'Sad'
];

const CreateBSRForm = ({ onSubmit, onCancel }: CreateBSRFormProps) => {
  const [studentName, setStudentName] = useState('');
  const [selectedBehavior, setSelectedBehavior] = useState('');
  const [selectedMood, setSelectedMood] = useState('');
  const [step, setStep] = useState(1);

  const handleSubmit = () => {
    if (studentName && selectedBehavior && selectedMood) {
      onSubmit({
        studentName,
        behavior: selectedBehavior,
        mood: selectedMood
      });
    }
  };

  const canProceed = () => {
    switch (step) {
      case 1: return studentName.trim() !== '';
      case 2: return selectedBehavior !== '';
      case 3: return selectedMood !== '';
      default: return false;
    }
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center space-x-4">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onCancel}
            className="text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Create Behavior Support Report</h1>
            <p className="text-muted-foreground">Step {step} of 3</p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-muted rounded-full h-2">
          <div 
            className="bg-gradient-primary h-2 rounded-full transition-all duration-300"
            style={{ width: `${(step / 3) * 100}%` }}
          ></div>
        </div>

        {/* Step 1: Student Name */}
        {step === 1 && (
          <Card className="p-8 bg-gradient-card shadow-card animate-slide-up">
            <div className="text-center space-y-6">
              <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                <User className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-foreground mb-2">Student Information</h2>
                <p className="text-muted-foreground">Enter the student's name</p>
              </div>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="studentName" className="text-sm font-medium text-foreground">
                    Student Name
                  </Label>
                  <Input
                    id="studentName"
                    value={studentName}
                    onChange={(e) => setStudentName(e.target.value)}
                    placeholder="Enter student's full name"
                    className="mt-2 text-center text-lg"
                    autoFocus
                  />
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Step 2: Behavior Selection */}
        {step === 2 && (
          <Card className="p-8 bg-gradient-card shadow-card animate-slide-up">
            <div className="text-center space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-foreground mb-2">Behavior Category</h2>
                <p className="text-muted-foreground">Select the primary behavior observed</p>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {behaviors.map((behavior) => (
                  <button
                    key={behavior.id}
                    onClick={() => setSelectedBehavior(behavior.label)}
                    className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                      selectedBehavior === behavior.label
                        ? `bg-${behavior.color}/10 border-${behavior.color} shadow-button`
                        : 'border-border hover:border-muted-foreground bg-card'
                    }`}
                  >
                    <div className={`w-6 h-6 rounded-full bg-${behavior.color} mx-auto mb-2`}></div>
                    <span className="text-sm font-medium text-foreground">{behavior.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </Card>
        )}

        {/* Step 3: Mood Selection */}
        {step === 3 && (
          <Card className="p-8 bg-gradient-card shadow-card animate-slide-up">
            <div className="text-center space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-foreground mb-2">Student's Mood</h2>
                <p className="text-muted-foreground">How did the student appear?</p>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {moods.map((mood) => (
                  <button
                    key={mood}
                    onClick={() => setSelectedMood(mood)}
                    className={`p-3 rounded-lg border-2 transition-all duration-200 ${
                      selectedMood === mood
                        ? 'bg-primary/10 border-primary shadow-button'
                        : 'border-border hover:border-muted-foreground bg-card'
                    }`}
                  >
                    <span className="text-sm font-medium text-foreground">{mood}</span>
                  </button>
                ))}
              </div>
            </div>
          </Card>
        )}

        {/* Navigation */}
        <div className="flex justify-between">
          {step > 1 && (
            <Button 
              variant="outline" 
              onClick={() => setStep(step - 1)}
              className="min-w-24"
            >
              Previous
            </Button>
          )}
          
          <div className="ml-auto">
            {step < 3 ? (
              <Button 
                onClick={() => setStep(step + 1)}
                disabled={!canProceed()}
                className="bg-gradient-primary text-white shadow-button hover:shadow-elevated transition-all duration-200 min-w-24"
              >
                Next
              </Button>
            ) : (
              <Button 
                onClick={handleSubmit}
                disabled={!canProceed()}
                className="bg-gradient-primary text-white shadow-button hover:shadow-elevated transition-all duration-200 min-w-24"
              >
                Submit BSR
              </Button>
            )}
          </div>
        </div>

        {/* Summary */}
        {step === 3 && studentName && selectedBehavior && (
          <Card className="p-4 bg-muted/50 border-dashed">
            <div className="text-center space-y-2">
              <p className="text-sm text-muted-foreground">Summary:</p>
              <p className="font-medium text-foreground">
                {studentName} • {selectedBehavior} • {selectedMood}
              </p>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default CreateBSRForm;