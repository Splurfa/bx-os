import { useState, useEffect } from "react";
import { ArrowLeft, User, BookOpen, Eye, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import ActivitySelection from "./ActivitySelection";
import BehaviorSelection from "./BehaviorSelection";
import ReviewScreen from "./ReviewScreen";
import { supabase } from "@/integrations/supabase/client";

interface CreateBSRFormProps {
  onSubmit: (data: { 
    studentName: string; 
    contextId: string;
    behaviors: string[]; 
    teacherMood: number;
    urgencyLevel: string;
    note: string;
  }) => void;
  onCancel: () => void;
}

const behaviors = [
  { id: 'disruptive', label: 'Disruptive' },
  { id: 'social-emotional', label: 'Social-Emotional' },
  { id: 'avoidance', label: 'Avoidance' },
  { id: 'eloping', label: 'Eloping' },
  { id: 'minor-physical', label: 'Minor-Physical' },
  { id: 'major-physical', label: 'Major-Physical' }
];

const CreateBSRForm = ({ onSubmit, onCancel }: CreateBSRFormProps) => {
  const [studentName, setStudentName] = useState('');
  const [selectedContext, setSelectedContext] = useState('');
  const [selectedBehaviors, setSelectedBehaviors] = useState<string[]>([]);
  const [teacherMood, setTeacherMood] = useState(3);
  const [urgencyLevel, setUrgencyLevel] = useState('standard');
  const [note, setNote] = useState('');
  const [step, setStep] = useState(1);
  const [contextLabel, setContextLabel] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch context label when context is selected
  useEffect(() => {
    const fetchContextLabel = async () => {
      if (selectedContext) {
        const { data } = await supabase
          .from('antecedent_contexts')
          .select('label')
          .eq('id', selectedContext)
          .single();
        
        if (data) {
          setContextLabel(data.label);
        }
      }
    };

    fetchContextLabel();
  }, [selectedContext]);

  const handleBehaviorToggle = (behaviorId: string) => {
    setSelectedBehaviors(prev => 
      prev.includes(behaviorId)
        ? prev.filter(id => id !== behaviorId)
        : [...prev, behaviorId]
    );
  };

  const handleSubmit = async () => {
    if (studentName && selectedContext && selectedBehaviors.length > 0) {
      setIsSubmitting(true);
      try {
        onSubmit({
          studentName,
          contextId: selectedContext,
          behaviors: selectedBehaviors,
          teacherMood,
          urgencyLevel,
          note
        });
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const canProceed = () => {
    switch (step) {
      case 1: return studentName.trim() !== '';
      case 2: return selectedContext !== '';
      case 3: return selectedBehaviors.length > 0;
      case 4: return true; // Review screen
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
            <p className="text-muted-foreground">Step {step} of 4</p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-muted rounded-full h-2">
          <div 
            className="bg-gradient-primary h-2 rounded-full transition-all duration-300"
            style={{ width: `${(step / 4) * 100}%` }}
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

        {/* Step 2: Context Selection */}
        {step === 2 && (
          <Card className="p-8 bg-gradient-card shadow-card animate-slide-up">
            <div className="text-center space-y-6">
              <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                <BookOpen className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-foreground mb-2">Activity Context</h2>
                <p className="text-muted-foreground">What was the class doing when the behavior occurred?</p>
              </div>
              <div className="max-h-96">
                <ActivitySelection
                  selectedContext={selectedContext}
                  onContextSelect={setSelectedContext}
                />
              </div>
            </div>
          </Card>
        )}

        {/* Step 3: Behavior Selection */}
        {step === 3 && (
          <Card className="p-8 bg-gradient-card shadow-card animate-slide-up">
            <div className="text-center space-y-6">
              <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                <Eye className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-foreground mb-2">Behavior Categories</h2>
                <p className="text-muted-foreground">Select all behaviors that apply (multiple allowed)</p>
              </div>
              <div className="max-h-96">
                <BehaviorSelection
                  selectedBehaviors={selectedBehaviors}
                  onBehaviorToggle={handleBehaviorToggle}
                />
              </div>
            </div>
          </Card>
        )}

        {/* Step 4: Review & Submit */}
        {step === 4 && (
          <Card className="bg-gradient-card shadow-card animate-slide-up">
            <div className="text-center py-6 px-4 border-b">
              <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="h-8 w-8 text-primary" />
              </div>
              <h2 className="text-xl font-semibold text-foreground">Review & Submit</h2>
              <p className="text-muted-foreground">Review your selections and provide additional details</p>
            </div>
            <ReviewScreen
              studentName={studentName}
              contextLabel={contextLabel}
              selectedBehaviors={selectedBehaviors}
              teacherMood={teacherMood}
              urgencyLevel={urgencyLevel}
              note={note}
              onTeacherMoodChange={setTeacherMood}
              onUrgencyLevelChange={setUrgencyLevel}
              onNoteChange={setNote}
              onSubmit={handleSubmit}
              isSubmitting={isSubmitting}
            />
          </Card>
        )}

        {/* Navigation */}
        {step < 4 && (
          <div className="flex justify-between">
            {step > 1 && (
              <Button 
                variant="outline" 
                onClick={() => setStep(step - 1)}
                className="min-w-24"
                disabled={isSubmitting}
              >
                Previous
              </Button>
            )}
            
            <div className="ml-auto">
              <Button 
                onClick={() => setStep(step + 1)}
                disabled={!canProceed() || isSubmitting}
                className="bg-gradient-primary text-white shadow-button hover:shadow-elevated transition-all duration-200 min-w-24"
              >
                {step === 3 ? 'Review' : 'Next'}
              </Button>
            </div>
          </div>
        )}

        {/* Quick Summary for steps 2-3 */}
        {(step === 2 || step === 3) && studentName && (
          <Card className="p-4 bg-muted/50 border-dashed">
            <div className="text-center space-y-2">
              <p className="text-sm text-muted-foreground">Current Selection:</p>
              <div className="flex flex-wrap gap-2 justify-center">
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary text-primary-foreground">
                  {studentName}
                </span>
                {step >= 2 && contextLabel && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-secondary text-secondary-foreground">
                    {contextLabel}
                  </span>
                )}
                {step >= 3 && selectedBehaviors.length > 0 && (
                  selectedBehaviors.map((behavior, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-muted text-muted-foreground"
                    >
                      {behavior}
                    </span>
                  ))
                )}
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default CreateBSRForm;