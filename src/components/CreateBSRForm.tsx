import { useState, useEffect } from "react";
import { ArrowLeft, User, BookOpen, Eye, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import ActivitySelection from "./ActivitySelection";
import BehaviorSelection from "./BehaviorSelection";
import ReviewScreen from "./ReviewScreen";
import StudentSelection from "./StudentSelection";
import { supabase } from "@/integrations/supabase/client";
import type { Student } from "@/hooks/useStudents";

interface CreateBSRFormProps {
  onSubmit: (data: { 
    student: Student; 
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
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
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
    if (selectedStudent && selectedContext && selectedBehaviors.length > 0) {
      setIsSubmitting(true);
      try {
        onSubmit({
          student: selectedStudent,
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
      case 1: return selectedStudent !== null;
      case 2: return selectedContext !== '';
      case 3: return selectedBehaviors.length > 0;
      case 4: return true; // Review screen
      default: return false;
    }
  };

  return (
    <div className="h-screen bg-background p-3 flex flex-col">
      <div className="max-w-2xl mx-auto space-y-3 flex-1 flex flex-col">
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
          <Card className="p-3 bg-gradient-card shadow-card animate-slide-up flex-1 flex flex-col">
            <div className="text-center space-y-3 flex-1 flex flex-col">
              <div>
                <h2 className="text-lg font-semibold text-foreground mb-1">Student Information</h2>
                <p className="text-sm text-muted-foreground">Select a student</p>
              </div>
              <div className="flex-1 min-h-0">
                <StudentSelection
                  onStudentSelect={setSelectedStudent}
                  onStudentDeselect={() => setSelectedStudent(null)}
                  selectedStudentId={selectedStudent?.id}
                />
              </div>
            </div>
          </Card>
        )}

        {/* Step 2: Context Selection */}
        {step === 2 && (
          <Card className="p-3 bg-gradient-card shadow-card animate-slide-up flex-1 flex flex-col">
            <div className="text-center space-y-3 flex-1 flex flex-col">
              <div>
                <h2 className="text-lg font-semibold text-foreground mb-1">Activity Context</h2>
                <p className="text-sm text-muted-foreground">What was happening when the behavior occurred?</p>
              </div>
              <div className="flex-1 min-h-0">
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
          <Card className="p-3 bg-gradient-card shadow-card animate-slide-up flex-1 flex flex-col">
            <div className="text-center space-y-3 flex-1 flex flex-col">
              <div>
                <h2 className="text-lg font-semibold text-foreground mb-1">Behavior Categories</h2>
                <p className="text-sm text-muted-foreground">Select all that apply</p>
              </div>
              <div className="flex-1 min-h-0">
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
          <Card className="bg-gradient-card shadow-card animate-slide-up flex-1 flex flex-col">
            <div className="text-center py-3 px-3 border-b">
              <h2 className="text-lg font-semibold text-foreground">Review & Submit</h2>
              <p className="text-sm text-muted-foreground">Finalize your report</p>
            </div>
            <div className="flex-1 min-h-0">
              <ReviewScreen
                studentName={selectedStudent ? `${selectedStudent.first_name} ${selectedStudent.last_name}` : ''}
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
            </div>
          </Card>
        )}

        {/* Navigation - Fixed to bottom */}
        {step < 4 && (
          <div className="sticky bottom-0 bg-background p-3 border-t border-border flex justify-between">
            {step > 1 && (
              <Button 
                variant="outline" 
                onClick={() => setStep(step - 1)}
                className="min-w-20"
                disabled={isSubmitting}
              >
                Previous
              </Button>
            )}
            
            <div className="ml-auto">
              <Button 
                onClick={() => setStep(step + 1)}
                disabled={!canProceed() || isSubmitting}
                className="bg-gradient-primary text-white shadow-button hover:shadow-elevated transition-all duration-200 min-w-20"
              >
                {step === 3 ? 'Review' : 'Next'}
              </Button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default CreateBSRForm;