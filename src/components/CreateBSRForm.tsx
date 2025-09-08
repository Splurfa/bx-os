import { useState, useEffect, useCallback } from "react";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import ActivitySelection from "./ActivitySelection";
import BehaviorSelection from "./BehaviorSelection";
import ReviewScreen from "./ReviewScreen";
import StudentSelection from "./StudentSelection";
import StickyFooter from "./StickyFooter";
import { supabase } from "@/integrations/supabase/client";
import type { Student } from "@/hooks/useStudents";

interface CreateBSRFormProps {
  onSubmit: (data: { 
    student: Student; 
    contextId: string;
    behaviors: string[]; 
    teacherMood: number;
    urgencyLevel: 'standard' | 're_integration' | 'urgent';
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
  const [urgencyLevel, setUrgencyLevel] = useState<'standard' | 're_integration' | 'urgent'>('standard');
  const [note, setNote] = useState('');
  const [step, setStep] = useState(1);
  const [contextLabel, setContextLabel] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAdvancing, setIsAdvancing] = useState(false);

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

  // Auto-advancement logic for seamless workflow with step validation
  const handleAutoAdvance = useCallback((fromStep: number) => {
    console.log(`Auto-advance requested from step ${fromStep}, current step: ${step}`);
    
    // Only allow advancement from steps 1 and 2
    if (fromStep !== step || (step !== 1 && step !== 2)) {
      console.log(`Auto-advance blocked: invalid step transition from ${fromStep} to ${step + 1}`);
      return;
    }

    setIsAdvancing(true);
    setTimeout(() => {
      setStep(prev => {
        console.log(`Advancing from step ${prev} to ${prev + 1}`);
        return prev + 1;
      });
      setIsAdvancing(false);
    }, 300);
  }, [step]);

  // Enhanced student selection with auto-advancement
  const handleStudentSelect = useCallback((student: Student) => {
    setSelectedStudent(student);
    // Only auto-advance if we're on step 1
    if (step === 1) {
      console.log('Student selected, auto-advancing from step 1');
      handleAutoAdvance(1);
    }
  }, [handleAutoAdvance, step]);

  // Enhanced context selection with auto-advancement  
  const handleContextSelect = useCallback((contextId: string) => {
    setSelectedContext(contextId);
    // Only auto-advance if we're on step 2
    if (step === 2) {
      console.log('Context selected, auto-advancing from step 2');
      handleAutoAdvance(2);
    }
  }, [handleAutoAdvance, step]);

  const handleBehaviorToggle = (behaviorId: string) => {
    setSelectedBehaviors(prev => 
      prev.includes(behaviorId)
        ? prev.filter(id => id !== behaviorId)
        : [...prev, behaviorId]
    );
  };

  const [showUrgencyDialog, setShowUrgencyDialog] = useState(false);

  const handleSubmit = async () => {
    if (selectedStudent && selectedContext && selectedBehaviors.length > 0) {
      setShowUrgencyDialog(true);
    }
  };

  const handleUrgencySubmit = async () => {
    setIsSubmitting(true);
    try {
      onSubmit({
        student: selectedStudent!,
        contextId: selectedContext,
        behaviors: selectedBehaviors,
        teacherMood,
        urgencyLevel,
        note
      });
    } finally {
      setIsSubmitting(false);
      setShowUrgencyDialog(false);
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
    <>
      <div className="h-screen bg-background p-4 flex flex-col">
        <div className="space-y-4 flex-1 flex flex-col">
          {/* Header */}
          <div className="flex items-center space-x-3">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onCancel}
              className="text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back
            </Button>
            <div>
              <h1 className="text-xl font-bold text-foreground">Create BSR</h1>
              <p className="text-xs text-muted-foreground">Step {step} of 4</p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-muted rounded-full h-1">
            <div 
              className="bg-primary h-1 rounded-full transition-all duration-300"
              style={{ width: `${(step / 4) * 100}%` }}
            ></div>
          </div>

          {/* Step 1: Student Name */}
          {step === 1 && (
            <div className="flex-1 flex flex-col">
              <div className="text-center mb-4">
                <h2 className="text-base font-semibold text-foreground">Student</h2>
                <p className="text-sm text-muted-foreground">Select a student</p>
              </div>
              <div className="flex-1 min-h-0">
                <StudentSelection
                  onStudentSelect={handleStudentSelect}
                  onStudentDeselect={() => setSelectedStudent(null)}
                  selectedStudentId={selectedStudent?.id}
                />
              </div>
            </div>
          )}

          {/* Step 2: Context Selection */}
          {step === 2 && (
            <div className="flex-1 flex flex-col">
              <div className="text-center mb-4">
                <h2 className="text-base font-semibold text-foreground">Context</h2>
                <p className="text-sm text-muted-foreground">What was happening?</p>
              </div>
              <div className="flex-1 min-h-0">
                <ActivitySelection
                  selectedContext={selectedContext}
                  onContextSelect={handleContextSelect}
                />
              </div>
            </div>
          )}

          {/* Step 3: Behavior Selection */}
          {step === 3 && (
            <div className="flex-1 flex flex-col">
              <div className="text-center mb-4">
                <h2 className="text-base font-semibold text-foreground">Behaviors</h2>
                <p className="text-sm text-muted-foreground">Select all that apply</p>
              </div>
              <div className="flex-1 min-h-0">
                <BehaviorSelection
                  selectedBehaviors={selectedBehaviors}
                  onBehaviorToggle={handleBehaviorToggle}
                />
              </div>
            </div>
          )}

          {/* Step 4: Review & Submit */}
          {step === 4 && (
            <div className="flex-1 flex flex-col">
              <div className="text-center mb-4">
                <h2 className="text-base font-semibold text-foreground">Review</h2>
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
                  onUrgencyLevelChange={(urgency) => setUrgencyLevel(urgency as 'standard' | 're_integration' | 'urgent')}
                  onNoteChange={setNote}
                  onSubmit={handleSubmit}
                  isSubmitting={isSubmitting}
                />
              </div>
            </div>
          )}

          {/* Navigation - Only show StickyFooter on behavior selection step */}
          {step === 3 && (
            <StickyFooter
              primaryAction={{
                label: "Review",
                onClick: () => setStep(4),
                disabled: selectedBehaviors.length === 0 || isSubmitting || isAdvancing,
                variant: selectedBehaviors.length > 0 ? "default" : "outline"
              }}
              secondaryAction={{
                label: "Previous",
                onClick: () => setStep(2),
                variant: "outline"
              }}
            />
          )}
        </div>
      </div>

      {/* Urgency Selection Dialog */}
      <Dialog open={showUrgencyDialog} onOpenChange={setShowUrgencyDialog}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Select submission type</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <RadioGroup value={urgencyLevel} onValueChange={(value) => setUrgencyLevel(value as 'standard' | 're_integration' | 'urgent')}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="standard" id="standard" />
                <Label htmlFor="standard" className="text-sm">Standard (regular processing)</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="re_integration" id="re_integration" />
                <Label htmlFor="re_integration" className="text-sm">Re-integration (priority return)</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="urgent" id="urgent" />
                <Label htmlFor="urgent" className="text-sm">Urgent (immediate attention)</Label>
              </div>
            </RadioGroup>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setShowUrgencyDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleUrgencySubmit} disabled={isSubmitting}>
                {isSubmitting ? 'Submitting...' : 'Submit'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CreateBSRForm;