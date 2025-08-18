import { useState } from "react";
import { X, ArrowLeft, AlertTriangle, Edit3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import StudentSelection from "./StudentSelection";
import MoodSlider from "./MoodSlider";
import BehaviorSelection from "./BehaviorSelection";
import StickyFooter from "./StickyFooter";
import { Student } from "@/hooks/useSupabaseQueue";

interface BSRModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
}

const BSRModal = ({ isOpen, onClose, onSubmit }: BSRModalProps) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [teacherMood, setTeacherMood] = useState(50);
  const [selectedBehaviors, setSelectedBehaviors] = useState<string[]>([]);
  const [isUrgent, setIsUrgent] = useState(false);
  const [notes, setNotes] = useState('');
  const [showNotesModal, setShowNotesModal] = useState(false);

  const resetForm = () => {
    setSelectedStudent(null);
    setTeacherMood(50);
    setSelectedBehaviors([]);
    setIsUrgent(false);
    setNotes('');
    setCurrentStep(1);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleStudentSelect = (student: Student) => {
    setSelectedStudent(student);
  };

  const handleStudentDeselect = () => {
    setSelectedStudent(null);
  };

  const handleBehaviorToggle = (behavior: string) => {
    setSelectedBehaviors(prev => 
      prev.includes(behavior) 
        ? prev.filter(b => b !== behavior)
        : [...prev, behavior]
    );
  };

  const handleSubmit = () => {
    if (!selectedStudent || selectedBehaviors.length === 0) return;
    
    onSubmit({
      student: selectedStudent,
      mood: teacherMood,
      behaviors: selectedBehaviors,
      urgent: isUrgent,
      notes
    });
    
    handleClose();
  };

  const canContinue = selectedStudent !== null;
  const canSubmit = selectedBehaviors.length > 0;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm">
      {/* Step 1: Student Selection */}
      {currentStep === 1 && (
        <div className="h-full bg-background flex flex-col">
          <div className="flex items-center justify-between p-4 border-b border-border bg-background">
            <h2 className="text-h4">Select Student</h2>
            <Button variant="ghost" size="sm" onClick={handleClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="flex-1 overflow-hidden">
            <StudentSelection 
              onStudentSelect={handleStudentSelect}
              onStudentDeselect={handleStudentDeselect}
              selectedStudentId={selectedStudent?.id}
            />
          </div>
          
          <StickyFooter
            primaryAction={{
              label: "Continue to Behavior Logging",
              onClick: () => setCurrentStep(2),
              disabled: !canContinue
            }}
          />
        </div>
      )}

      {/* Step 2: Behavior Logging */}
      {currentStep === 2 && (
        <div className="h-full bg-background flex flex-col">
          <div className="flex items-center justify-between p-4 border-b border-border bg-background">
            <div className="flex items-center space-x-3">
              <Button variant="ghost" size="sm" onClick={() => setCurrentStep(1)}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div>
                <h2 className="text-h4">Log Behavior</h2>
                <p className="text-caption">{selectedStudent?.name}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsUrgent(!isUrgent)}
                className={`transition-all duration-200 ${
                  isUrgent 
                    ? "bg-queue-urgent/20 text-queue-urgent border-queue-urgent/30 hover:bg-queue-urgent/30" 
                    : "border border-queue-urgent/30 text-queue-urgent bg-transparent hover:bg-transparent hover:text-queue-urgent"
                }`}
              >
                <AlertTriangle className="icon-inline" />
                <span className="ml-1 text-xs font-medium">URGENT</span>
              </Button>
              <Button variant="ghost" size="sm" onClick={handleClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className={`flex-1 flex flex-col transition-colors duration-300 ${isUrgent ? "bg-gradient-to-br from-queue-urgent/5 via-orange-50/10 to-red-50/5" : "bg-background"}`}>
            {/* Teacher Mood - Fixed height */}
            <div className="p-4 border-b border-border bg-background shrink-0">
              <h3 className="text-h5 text-center mb-3">Teacher Mood</h3>
              <MoodSlider value={teacherMood} onChange={setTeacherMood} />
            </div>

            {/* Behavior Selection - Takes remaining space */}
            <div className="flex-1 flex flex-col bg-background">
              <div className="p-4 pb-2 shrink-0">
                <h3 className="text-h5 text-center">Select Behaviors</h3>
              </div>
              <div className="flex-1">
                <BehaviorSelection 
                  selectedBehaviors={selectedBehaviors}
                  onBehaviorToggle={handleBehaviorToggle}
                />
              </div>
            </div>
          </div>

          <div className="border-t border-border bg-background p-3 space-y-2 shrink-0">
            <Button 
              variant="outline"
              onClick={() => setShowNotesModal(true)}
              className="w-full h-11 text-sm"
            >
              <Edit3 className="icon-small mr-2" />
              {notes ? 'Edit Notes' : 'Add Notes'}
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!canSubmit}
              className={`w-full h-11 bg-gradient-primary text-white shadow-button hover:shadow-elevated transition-all duration-200 ${
                isUrgent ? "!bg-queue-urgent !hover:bg-queue-urgent/90 !text-white !shadow-lg" : ""
              }`}
            >
              Submit Behavior Report
            </Button>
          </div>
        </div>
      )}

      {/* Notes Modal */}
      {showNotesModal && (
        <div className="fixed inset-0 z-[70] bg-black/60 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-background rounded-lg max-w-md w-full shadow-xl">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h3 className="text-h5">Additional Notes</h3>
              <Button variant="ghost" size="sm" onClick={() => setShowNotesModal(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="p-4">
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={4}
                placeholder="Brief description of the incident..."
                className="w-full p-3 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent text-xs resize-none bg-background"
              />
            </div>
            <div className="flex items-center justify-end space-x-2 p-4 border-t border-border">
              <Button variant="ghost" size="sm" onClick={() => setNotes('')}>
                Clear
              </Button>
              <Button size="sm" onClick={() => setShowNotesModal(false)}>
                Save Notes
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BSRModal;
