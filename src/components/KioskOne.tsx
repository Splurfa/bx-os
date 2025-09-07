import { useState, useEffect, useRef } from "react";
import { User, ArrowRight, CheckCircle, Loader2, Eye, EyeOff, Monitor } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { TouchOptimizedButton } from "@/components/TouchOptimizedButton";
import { useKioskQueue } from "../hooks/useKioskQueue";
import { useKiosks } from "@/contexts/KioskContext";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const KIOSK_ID = 1;

const questions = [
  {
    id: 'question1',
    text: 'What did you do that led to being sent out of class?',
    helper: 'Describe your actions and behavior.'
  },
  {
    id: 'question2', 
    text: 'What were you hoping would happen when you acted that way?',
    helper: 'What was your goal or reason for your behavior?'
  },
  {
    id: 'question3',
    text: 'Who else was impacted by your behavior, and in what way?',
    helper: 'Think about classmates, your teacher, or others.'
  },
  {
    id: 'question4',
    text: 'Write two sentences that show you understand what\'s expected of you when you go back to class.',
    helper: 'Be specific about what you\'ll do differently.'
  }
];

const KioskOne = () => {
  const { user, session, loading: authLoading } = useAuth();
  const { activateKiosk, getKioskById, updateKioskStudent } = useKiosks();
  const { 
    loading, 
    getFirstWaitingStudentForKiosk, 
    submitReflection,
    updateStudentKioskStatus
  } = useKioskQueue();
  
  const [kioskState, setKioskState] = useState<'setup' | 'welcome' | 'password' | 'reflection' | 'completed'>('setup');
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activationError, setActivationError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(10);
  
  const firstWaitingStudent = getFirstWaitingStudentForKiosk(KIOSK_ID);
  const hasTeacherFeedback = firstWaitingStudent?.reflection?.teacher_feedback;

const updateKioskStudentRef = useRef(updateKioskStudent);

// Debug: track identity changes to prove fix
useEffect(() => {
  if (updateKioskStudentRef.current !== updateKioskStudent) {
    console.log('🔁 updateKioskStudent identity changed');
    updateKioskStudentRef.current = updateKioskStudent;
  }
}, [updateKioskStudent]);

  // Check if kiosk is already active - anonymous access allowed
  useEffect(() => {
    if (kioskState === 'setup' && !authLoading) {
      const checkKiosk = async () => {
        try {
          setActivationError(null);
          
          console.log('Checking if kiosk 1 is available for anonymous student access...');
          const kiosk = getKioskById(KIOSK_ID);
          
          if (kiosk && kiosk.isActive) {
            setKioskState('welcome');
          } else {
            console.log('Kiosk 1 is not activated. Admin must activate it first.');
            setActivationError('Kiosk 1 is not available. Please ask an administrator to activate it.');
          }
        } catch (error) {
          console.error('Error checking kiosk 1 status:', error);
          const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
          setActivationError(`Kiosk 1 check failed: ${errorMessage}`);
        }
      };
      checkKiosk();
    }
  }, [kioskState, getKioskById, authLoading]);

  // Store completed student data to prevent early state transitions
  const [completedStudentData, setCompletedStudentData] = useState<any>(null);

  // Improved state management - prevent race conditions in completed state
  useEffect(() => {
    // Never interrupt the completed state
    if (kioskState === 'completed') return;

    // Only sync assignment while on the welcome screen
    if (kioskState !== 'welcome') return;

    if (!firstWaitingStudent) {
      console.log('🏠 No student waiting - staying on welcome');
      // Clear kiosk assignment while idle
      updateKioskStudentRef.current(KIOSK_ID, undefined, undefined);
    } else {
      console.log('👤 Student assigned to kiosk:', firstWaitingStudent.student.name);
      // Only update kiosk assignment, keep status as 'waiting' until user interacts
      updateKioskStudentRef.current(KIOSK_ID, firstWaitingStudent.student_id, firstWaitingStudent.id);
    }
  }, [firstWaitingStudent?.id, kioskState]);

  // Timer for reflection process
  useEffect(() => {
    if (kioskState === 'reflection') {
      const timer = setInterval(() => {
        setTimeElapsed(prev => prev + 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [kioskState]);

  // Robust completion state management with proper isolation
  useEffect(() => {
    if (kioskState === 'completed') {
      console.log('⏰ Starting 10-second completion countdown');
      setCountdown(10);
      
      const resetTimer = setTimeout(() => {
        console.log('🔄 Completion timer finished - resetting kiosk state');
        
        // Complete state reset
        setKioskState('welcome');
        setPasswordInput('');
        setPasswordError('');
        setCurrentQuestion(0);
        setAnswers({});
        setTimeElapsed(0);
        setCountdown(10);
        
        // Clear kiosk assignment to allow next student
        updateKioskStudentRef.current(KIOSK_ID, undefined, undefined);
      }, 10000);
      
      return () => {
        console.log('🧹 Cleaning up completion timer');
        clearTimeout(resetTimer);
      };
    }
  }, [kioskState]);

  // Countdown timer effect
  useEffect(() => {
    if (kioskState === 'completed') {
      const timer = setInterval(() => {
        setCountdown(prev => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [kioskState]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handlePasswordSubmit = async () => {
    if (!passwordInput || passwordInput.length !== 4) {
      toast.error('Please enter your 4-digit birthday (MMDD format). For example: 0315 for March 15th');
      return;
    }

    if (!firstWaitingStudent) {
      toast.error('No student assigned to this kiosk');
      return;
    }

    try {
      // Validate birthday password using database function
      const { data, error } = await supabase.rpc('validate_student_birthday_password', {
        p_student_id: firstWaitingStudent.student_id,
        p_password: passwordInput
      });

      if (error) {
        console.error('Password validation error:', error);
        toast.error('Authentication error. Please try again.');
        return;
      }

      if (!data) {
        // Log failed attempt
        await supabase.rpc('log_kiosk_auth_attempt', {
          p_kiosk_id: KIOSK_ID,
          p_student_id: firstWaitingStudent.student_id,
          p_success: false
        });
        
        toast.error('Incorrect birthday. Please enter MMDD format (e.g., 0315 for March 15th)');
        return;
      }

      // Log successful attempt
      await supabase.rpc('log_kiosk_auth_attempt', {
        p_kiosk_id: KIOSK_ID,
        p_student_id: firstWaitingStudent.student_id,
        p_success: true
      });

      // Update student status to active
      if (firstWaitingStudent) {
        updateStudentKioskStatus(KIOSK_ID, firstWaitingStudent.student_id, firstWaitingStudent.id);
        setTimeout(() => {
          updateStudentKioskStatus(KIOSK_ID, firstWaitingStudent.student_id, firstWaitingStudent.id);
        }, 100);
      }
      
      setCurrentQuestion(0);
      setAnswers({});
      setKioskState('reflection');
      setTimeElapsed(0);
      setPasswordError('');
    } catch (error) {
      console.error('Authentication error:', error);
      toast.error('Authentication failed. Please try again.');
    }
  };

  const handleAnswerChange = (questionId: string, value: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  const canProceedToNext = () => {
    const currentQuestionId = questions[currentQuestion].id;
    return answers[currentQuestionId]?.trim().length > 10;
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    if (!firstWaitingStudent || isSubmitting) return;

    setIsSubmitting(true);
    
    try {
      const reflection = {
        question1: answers.question1 || '',
        question2: answers.question2 || '',
        question3: answers.question3 || '',
        question4: answers.question4 || ''
      };
      
      console.log('Submitting reflection and transitioning to completed state');
      
      // Store student data before it becomes null due to status change
      setCompletedStudentData({
        name: firstWaitingStudent.student.name,
        id: firstWaitingStudent.id
      });
      
      await submitReflection(firstWaitingStudent.id, reflection);
      
      // Set completion state to show splash screen
      setKioskState('completed');
      
      console.log('Reflection submitted, showing completion screen');
    } catch (error) {
      console.error('Error submitting reflection:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show loading state during kiosk setup (no auth required)
  if (loading || (kioskState === 'setup')) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center space-y-4 max-w-md">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground">
            Activating kiosk 1...
          </p>
        </div>
      </div>
    );
  }

  // Show activation error if it exists
  if (activationError) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center space-y-4 max-w-md">
          <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto">
            <Monitor className="h-8 w-8 text-destructive" />
          </div>
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-destructive">Kiosk 1 Activation Failed</h3>
            <p className="text-sm text-muted-foreground">{activationError}</p>
            <Button 
              onClick={() => {
                setActivationError(null);
                setKioskState('setup');
              }}
              className="mt-4"
            >
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Welcome screen - no active student
  if (kioskState === 'welcome') {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        {/* Kiosk Header */}
        <div className="p-4 bg-primary/5 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                <Monitor className="h-4 w-4 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Student Kiosk #1</h3>
                <p className="text-xs text-muted-foreground">Ready for next student</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="w-full max-w-4xl">
            <Card className="p-12 text-center bg-gradient-card shadow-elevated w-full">
              <div className="space-y-6">
                <div className="mx-auto w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center">
                  <User className="h-10 w-10 text-primary" />
                </div>
                
                <div>
                  <h2 className="text-3xl font-bold text-foreground mb-3">Student Reflection Kiosk</h2>
                  {firstWaitingStudent ? (
                    <div className="space-y-4">
                      <div className="space-y-4">
                        <p className="text-lg text-muted-foreground">
                          Hello, <span className="font-semibold text-foreground">{firstWaitingStudent.student.name}</span>
                        </p>
                        <p className="text-muted-foreground">
                          You've been asked to complete a behavior reflection. Click below to begin.
                        </p>
                        <Button 
                          onClick={() => setKioskState('password')}
                          className="w-full bg-gradient-primary text-white shadow-button hover:shadow-elevated transition-all duration-200"
                          size="lg"
                        >
                          Begin Reflection
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-muted-foreground">
                      No students currently need to complete a reflection. This kiosk is ready for the next student.
                    </p>
                  )}
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // Password entry screen
  if (kioskState === 'password') {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        {/* Kiosk Header */}
        <div className="p-4 bg-primary/5 border-b">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
              <Monitor className="h-4 w-4 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Student Kiosk #1</h3>
              <p className="text-xs text-muted-foreground">Password verification</p>
            </div>
          </div>
        </div>
        
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="w-full max-w-md">
            <Card className="p-8 bg-gradient-card shadow-elevated w-full">
              <div className="space-y-6">
                <div className="text-center">
                  <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                    <User className="h-8 w-8 text-primary" />
                  </div>
                  <h2 className="text-2xl font-bold text-primary mb-2">
                    Hello {firstWaitingStudent?.student?.first_name}!
                  </h2>
                  <p className="text-muted-foreground mb-4">
                    Please enter your birthday password to get started with your reflection.
                  </p>
                  <p className="text-sm text-muted-foreground/70 mb-6">
                    Use 4 digits: month and day (MMDD)<br/>
                    Example: March 15th = 0315
                  </p>
                </div>
                
                <div className="space-y-4">
                  <Input
                    type="tel"
                    placeholder="MMDD (e.g., 0315)"
                    value={passwordInput}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '').slice(0, 4);
                      setPasswordInput(value);
                    }}
                    onKeyPress={(e) => e.key === 'Enter' && handlePasswordSubmit()}
                    className="text-lg py-6 text-center tracking-widest"
                    maxLength={4}
                    autoFocus
                  />
                  {passwordError && (
                    <p className="text-sm text-destructive">{passwordError}</p>
                  )}
                  
                  <TouchOptimizedButton 
                    onClick={handlePasswordSubmit}
                    className="w-full py-6 text-xl"
                    disabled={passwordInput.length !== 4}
                  >
                    Continue
                  </TouchOptimizedButton>
                  
                  <TouchOptimizedButton 
                    variant="outline"
                    onClick={() => setKioskState('welcome')}
                    className="w-full py-4"
                  >
                    Back
                  </TouchOptimizedButton>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // Completion screen
  if (kioskState === 'completed') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <Card className="p-8 text-center bg-gradient-card shadow-elevated">
            <div className="space-y-6">
              <div className="mx-auto w-20 h-20 bg-success/10 rounded-full flex items-center justify-center">
                <CheckCircle className="h-12 w-12 text-success" />
              </div>
              
              <div className="space-y-2">
                <h2 className="text-2xl font-bold text-primary">Reflection Complete!</h2>
                <p className="text-muted-foreground">
                  Thank you {completedStudentData?.name ? completedStudentData.name.split(' ')[0] : ''} for completing your reflection.
                </p>
                <p className="text-sm text-muted-foreground">
                  Your teacher will review your responses and provide feedback.
                </p>
              </div>
              
              <div className="p-4 bg-muted/30 rounded-lg">
                <p className="text-sm text-muted-foreground mb-2">
                  Returning to main screen in
                </p>
                <div className="text-2xl font-bold text-primary">
                  {countdown}
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  // Reflection questions
  const currentQuestionData = questions[currentQuestion];
  const allQuestionsAnswered = questions.every(q => answers[q.id]?.trim().length > 10);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="p-4 bg-primary/5 border-b sticky top-0 z-10">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-primary">Kiosk One</h1>
          <div className="flex items-center gap-2">
            <Badge variant="outline">
              {firstWaitingStudent ? firstWaitingStudent.student.first_name : 'Available'}
            </Badge>
            <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse"></div>
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">
              Question {currentQuestion + 1} of {questions.length}
            </span>
            <div className="flex gap-1">
              {questions.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full ${
                    index === currentQuestion
                      ? 'bg-primary'
                      : answers[questions[index].id]?.trim().length > 10
                      ? 'bg-success'
                      : 'bg-muted'
                  }`}
                />
              ))}
            </div>
          </div>
          <div className="text-sm text-muted-foreground">
            Time: {formatTime(timeElapsed)}
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 p-6">
        <div className="max-w-4xl mx-auto">
          <Card className="p-8 bg-gradient-card shadow-elevated">
            <div className="space-y-6">
              <div className="space-y-3">
                <h2 className="text-xl font-semibold text-foreground">
                  {currentQuestionData.text}
                </h2>
                <p className="text-muted-foreground">
                  {currentQuestionData.helper}
                </p>
              </div>
              
              <div className="space-y-4">
                <Label htmlFor="answer" className="text-sm font-medium">
                  Your answer (minimum 10 characters)
                </Label>
                <Textarea
                  id="answer"
                  placeholder="Take your time to think about your response..."
                  value={answers[currentQuestionData.id] || ''}
                  onChange={(e) => handleAnswerChange(currentQuestionData.id, e.target.value)}
                  className="min-h-[200px] text-base leading-relaxed"
                  autoFocus
                />
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>
                    {answers[currentQuestionData.id]?.length || 0} characters
                  </span>
                  <span className={answers[currentQuestionData.id]?.trim().length >= 10 ? 'text-success' : ''}>
                    {answers[currentQuestionData.id]?.trim().length >= 10 ? '✓ Minimum reached' : 'Keep writing...'}
                  </span>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Navigation */}
      <div className="p-6 bg-muted/20 border-t">
        <div className="max-w-4xl mx-auto flex justify-between">
          <TouchOptimizedButton
            variant="outline"
            onClick={handlePrevious}
            disabled={currentQuestion === 0}
            className="px-8"
          >
            Previous
          </TouchOptimizedButton>
          
          <div className="flex gap-3">
            {currentQuestion === questions.length - 1 ? (
              <TouchOptimizedButton
                onClick={handleSubmit}
                disabled={!allQuestionsAnswered || isSubmitting}
                className="px-8 bg-gradient-primary text-white"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    Submit Reflection
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </TouchOptimizedButton>
            ) : (
              <TouchOptimizedButton
                onClick={handleNext}
                disabled={!canProceedToNext()}
                className="px-8"
              >
                Next
                <ArrowRight className="w-4 h-4 ml-2" />
              </TouchOptimizedButton>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default KioskOne;
