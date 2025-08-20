
import { useState } from "react";
import { ArrowLeft, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import StickyFooter from "./StickyFooter";
import { BehaviorRequest } from "@/hooks/useSupabaseQueue";

interface ReviewReflectionProps {
  item: BehaviorRequest;
  onApprove: () => void;
  onRequestRevision: (feedback: string) => void;
  onBack: () => void;
}

const questions = [
  {
    text: "What did you do that led to being sent out of class?",
    category: "Incident",
    color: "text-orange-600"
  },
  {
    text: "What were you hoping would happen when you acted that way?",
    category: "Intent", 
    color: "text-blue-600"
  },
  {
    text: "Who else was impacted by your behavior, and in what way?",
    category: "Impact",
    color: "text-purple-600"
  },
  {
    text: "What is expected of you when you return to class?",
    category: "Plan",
    color: "text-green-600"
  }
];

const getBehaviorColor = (behavior: string) => {
  const colors: Record<string, string> = {
    // Display labels
    'Disruptive': 'bg-behavior-disruptive',
    'Social-Emotional': 'bg-behavior-social',
    'Avoidance': 'bg-behavior-avoidance',
    'Eloping': 'bg-behavior-eloping',
    'Minor-Physical': 'bg-behavior-minor-physical',
    'Major-Physical': 'bg-behavior-major-physical',
    // Stored IDs
    'disruptive': 'bg-behavior-disruptive',
    'social-emotional': 'bg-behavior-social',
    'avoidance': 'bg-behavior-avoidance',
    'eloping': 'bg-behavior-eloping',
    'minor-physical': 'bg-behavior-minor-physical',
    'major-physical': 'bg-behavior-major-physical'
  };
  return colors[behavior] || 'bg-primary';
};

const ReviewReflection = ({ item, onApprove, onRequestRevision, onBack }: ReviewReflectionProps) => {
  const [feedback, setFeedback] = useState('');
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);

  const handleRequestRevision = () => {
    if (feedback.trim()) {
      onRequestRevision(feedback);
      setShowFeedbackModal(false);
      setFeedback('');
    }
  };

  // Debug logging to see the actual structure
  console.log('ReviewReflection item:', item);
  console.log('item.reflection:', item.reflection);
  
  const reflection = item.reflection || {
    question_1_response: '',
    question_2_response: '',
    question_3_response: '',
    question_4_response: ''
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Sticky Header */}
      <div className="sticky top-0 z-20 flex items-center justify-between p-4 border-b border-border bg-background shadow-sm">
        <div className="flex items-center space-x-3">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h2 className="text-sm font-medium text-foreground">Review Reflection</h2>
            <div className="flex items-center space-x-2 mt-0.5">
              <span className="text-xs text-foreground">{item.student?.name || 'Unknown Student'}</span>
              <div className="flex items-center space-x-1">
                {item.behaviors.map((behavior, index) => (
                  <div 
                    key={index}
                    className={`w-2 h-2 rounded-full ${getBehaviorColor(behavior)}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Area with proper bottom spacing */}
      <div className="flex-1 overflow-auto pb-28 px-4">
        <div className="space-y-3 py-4">
          {questions.map((question, index) => {
            const answerKey = `question_${index + 1}_response` as keyof typeof reflection;
            const answer = reflection[answerKey] as string;
            
            return (
              <Card key={index} className="shadow-sm hover:shadow-md transition-shadow duration-200 border-border">
                <CardContent className="p-0">
                  <div className="px-4 py-2 bg-muted/20 border-b border-border">
                    <div className="space-y-1">
                      <div className={`text-xs font-bold uppercase tracking-wide ${question.color}`}>
                        {question.category}
                      </div>
                      <h4 className="text-sm font-semibold text-foreground leading-normal">
                        {question.text}
                      </h4>
                    </div>
                  </div>
                  
                  <div className="px-4 py-3 bg-background">
                    <div className="prose prose-sm max-w-none">
                      <p className="text-xs text-foreground leading-normal m-0 whitespace-pre-wrap">
                        {answer || 'No response provided'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Sticky Footer positioned at bottom */}
      <div className="fixed bottom-0 left-0 right-0 z-30 bg-background border-t border-border shadow-lg">
        <StickyFooter
          secondaryAction={{
            label: "Try Again",
            onClick: () => setShowFeedbackModal(true),
            variant: "outline"
          }}
          primaryAction={{
            label: "Approved",
            onClick: onApprove
          }}
          className="border-0 shadow-none"
        />
      </div>

      {/* Feedback Modal */}
      {showFeedbackModal && (
        <div className="fixed inset-0 z-[70] bg-black/60 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-background rounded-lg max-w-md w-full shadow-xl border border-border">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h3 className="text-sm font-semibold text-foreground">Request Revision</h3>
              <Button variant="ghost" size="sm" onClick={() => setShowFeedbackModal(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="p-4">
              <p className="text-xs text-muted-foreground mb-3 leading-relaxed">
                Explain what the student should improve in their reflection:
              </p>
              <Textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Provide specific feedback for improvement..."
                className="min-h-20 text-sm leading-relaxed"
              />
            </div>
            <div className="flex items-center justify-end space-x-2 p-4 border-t border-border bg-muted/10">
              <Button variant="ghost" size="sm" onClick={() => setFeedback('')}>
                Clear
              </Button>
              <Button 
                size="sm" 
                onClick={handleRequestRevision}
                disabled={!feedback.trim()}
                className="bg-gradient-primary text-white shadow-button hover:shadow-elevated transition-all duration-200"
              >
                Send for Revision
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReviewReflection;
