import { useState, useEffect, useRef } from "react";
import { User, ArrowRight, CheckCircle, Loader2, Monitor } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { TouchOptimizedButton } from "@/components/TouchOptimizedButton";
import StudentMoodSlider from "@/components/StudentMoodSlider";
import AccountabilitySlider from "@/components/AccountabilitySlider";
import CommitmentSlider from "@/components/CommitmentSlider";
import { useKioskQueue } from "../hooks/useKioskQueue";
import { useKiosks } from "@/contexts/KioskContext";
import { formatBirthdateForPassword } from "@/lib/dateUtils";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const KIOSK_ID = 1;

const questions = [
  {
    id: 'question1',
    text: 'What did you do that led to being sent out of class?',
    helper: 'Describe your actions and behavior.',
    showMoodSlider: true,
    moodLabel: 'How were you feeling when this happened?'
  },
  {
    id: 'question2', 
    text: 'What were you hoping would happen when you acted that way?',
    helper: 'What was your goal or reason for your behavior?',
    showAccountabilitySlider: true,
    accountabilityLabel: 'How much do you take responsibility for what happened?'
  },
  {
    id: 'question3',
    text: 'Who else was impacted by your behavior, and in what way?',
    helper: 'Think about classmates, your teacher, or others.',
    showMoodSlider: true,
    moodLabel: 'How are you feeling now after thinking about this?',
    showAccountabilitySlider: true,
    accountabilityLabel: 'How much responsibility do you take now?'
  },
  {
    id: 'question4',
    text: 'Write two sentences that show you understand what\'s expected of you when you go back to class.',
    helper: 'Be specific about what you\'ll do differently.',
    showMoodSlider: true,
    moodLabel: 'How are you feeling about going back to class?',
    showAccountabilitySlider: true,
    accountabilityLabel: 'How accountable do you feel for making better choices?',
    showCommitmentSlider: true,
    commitmentLabel: 'How committed are you to making better choices?'
  }
];

const EnhancedKioskOne = () => {
  const { loading: authLoading } = useAuth();
  const { getKioskById, updateKioskStudent } = useKiosks();
  const { 
    loading, 
    getFirstWaitingStudentForKiosk, 
    submitReflection,
    updateStudentKioskStatus
  } = useKioskQueue();
  
  const [kioskState, setKioskState] = useState<'setup' | 'welcome' | 'password' | 'reflection' | 'completed'>('setup');
  const [passwordInput, setPasswordInput] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [moodRatings, setMoodRatings] = useState<Record<string, number>>({
    step1: 3,
    step3: 3,
    step4: 3
  });
  const [accountabilityRatings, setAccountabilityRatings] = useState<Record<string, number>>({
    step2: 3,
    step3: 3,
    step4: 3
  });
  const [commitmentRating, setCommitmentRating] = useState(3);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activationError, setActivationError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(10);
  const [completedStudentData, setCompletedStudentData] = useState<any>(null);
  
  const firstWaitingStudent = getFirstWaitingStudentForKiosk(KIOSK_ID);
  const updateKioskStudentRef = useRef(updateKioskStudent);

  useEffect(() => {
    if (updateKioskStudentRef.current !== updateKioskStudent) {
      console.log('🔁 updateKioskStudent identity changed');
      updateKioskStudentRef.current = updateKioskStudent;
    }
  }, [updateKioskStudent]);

  useEffect(() => {
    if (kioskState === 'setup' && !authLoading) {
      const checkKiosk = async () => {
        try {
          setActivationError(null);
          
          console.log('Checking if enhanced kiosk 1 is available for anonymous student access...');
          const kiosk = getKioskById(KIOSK_ID);
          
          if (kiosk && kiosk.isActive) {
            setKioskState('welcome');
          } else {
            console.log('Enhanced kiosk 1 is not activated. Admin must activate it first.');
            setActivationError('Enhanced Kiosk 1 is not available. Please ask an administrator to activate it.');
          }
        } catch (error) {
          console.error('Error checking enhanced kiosk 1 status:', error);
          const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
          setActivationError(`Enhanced Kiosk 1 check failed: ${errorMessage}`);
        }
      };
      checkKiosk();
    }
  }, [kioskState, getKioskById, authLoading]);

  useEffect(() => {
    if (kioskState === 'completed') return;
    if (kioskState !== 'welcome') return;

    if (!firstWaitingStudent) {
      console.log('🏠 No student waiting - staying on welcome');
      updateKioskStudentRef.current(KIOSK_ID, undefined, undefined).catch(error => {
        console.warn('Failed to clear kiosk assignment:', error);
      });
    } else {
      console.log('👤 Student assigned to enhanced kiosk:', firstWaitingStudent.student.name);
      updateKioskStudentRef.current(KIOSK_ID, firstWaitingStudent.student_id, firstWaitingStudent.id).catch(error => {
        console.warn('Failed to assign student to enhanced kiosk:', error);
      });
    }
  }, [firstWaitingStudent?.id, kioskState]);

  useEffect(() => {
    if (kioskState === 'reflection') {
      const timer = setInterval(() => {
        setTimeElapsed(prev => prev + 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [kioskState]);

  useEffect(() => {
    if (kioskState === 'completed') {
      console.log('⏰ Starting 10-second completion countdown');
      setCountdown(10);
      
      const resetTimer = setTimeout(() => {
        console.log('🔄 Completion timer finished - resetting enhanced kiosk state');
        
        setKioskState('welcome');
        setPasswordInput('');
        setPasswordError('');
        setCurrentQuestion(0);
        setAnswers({});
        setMoodRatings({ step1: 3, step3: 3, step4: 3 });
        setAccountabilityRatings({ step2: 3, step3: 3, step4: 3 });
        setCommitmentRating(3);
        setTimeElapsed(0);
        setCountdown(10);
        
        updateKioskStudentRef.current(KIOSK_ID, undefined, undefined);
      }, 10000);
      
      return () => {
        console.log('🧹 Cleaning up completion timer');
        clearTimeout(resetTimer);
      };
    }
  }, [kioskState]);

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
    const birthdateInfo = formatBirthdateForPassword(firstWaitingStudent?.student?.date_of_birth);
    
    if (!passwordInput || passwordInput.length !== 4) {
      toast.error(`Please enter your 4-digit birthday (MMDD format). For example: ${birthdateInfo.errorExample}`);
      return;
    }

    if (!firstWaitingStudent) {
      toast.error('No student assigned to this enhanced kiosk');
      return;
    }

    try {
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
        await supabase.rpc('log_kiosk_auth_attempt', {
          p_kiosk_id: KIOSK_ID,
          p_student_id: firstWaitingStudent.student_id,
          p_success: false
        });
        
        const birthdateInfo = formatBirthdateForPassword(firstWaitingStudent?.student?.date_of_birth);
        toast.error(`Incorrect birthday. Please enter MMDD format (e.g., ${birthdateInfo.errorExample})`);
        return;
      }

      await supabase.rpc('log_kiosk_auth_attempt', {
        p_kiosk_id: KIOSK_ID,
        p_student_id: firstWaitingStudent.student_id,
        p_success: true
      });

      if (firstWaitingStudent) {
        updateStudentKioskStatus(KIOSK_ID, firstWaitingStudent.student_id, firstWaitingStudent.id);
        setTimeout(() => {
          updateStudentKioskStatus(KIOSK_ID, firstWaitingStudent.student_id, firstWaitingStudent.id);
        }, 100);
      }
      
      setCurrentQuestion(0);
      setAnswers({});
      setMoodRatings({ step1: 3, step3: 3, step4: 3 });
      setAccountabilityRatings({ step2: 3, step3: 3, step4: 3 });
      setCommitmentRating(3);
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

  const handleMoodChange = (step: string, value: number) => {
    setMoodRatings(prev => ({ ...prev, [step]: value }));
  };

  const handleAccountabilityChange = (step: string, value: number) => {
    setAccountabilityRatings(prev => ({ ...prev, [step]: value }));
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
        question4: answers.question4 || '',
        mood_step1: moodRatings.step1,
        mood_step3: moodRatings.step3,
        mood_step4: moodRatings.step4,
        accountability_step2: accountabilityRatings.step2,
        accountability_step3: accountabilityRatings.step3,
        accountability_step4: accountabilityRatings.step4,
        commitment_step4: commitmentRating
      };
      
      console.log('Submitting enhanced reflection with sliders:', reflection);
      
      setCompletedStudentData({
        name: firstWaitingStudent.student.name,
        id: firstWaitingStudent.id
      });
      
      await submitReflection(firstWaitingStudent.id, reflection);
      
      setKioskState('completed');
      
      console.log('Enhanced reflection submitted successfully');
    } catch (error) {
      console.error('Error submitting enhanced reflection:', error);
      toast.error('Failed to submit reflection. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading || (kioskState === 'setup')) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center space-y-4 max-w-md">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground">Activating enhanced kiosk 1...</p>
        </div>
      </div>
    );
  }

  if (activationError) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center space-y-4 max-w-md">
          <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto">
            <Monitor className="h-8 w-8 text-destructive" />
          </div>
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-destructive">Enhanced Kiosk 1 Activation Failed</h3>
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

  if (kioskState === 'welcome') {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <div className="p-4 bg-primary/5 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                <Monitor className="h-4 w-4 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Enhanced Student Kiosk #1</h3>
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
                  <h2 className="text-3xl font-bold text-foreground mb-3">Enhanced Student Reflection Kiosk</h2>
                  {firstWaitingStudent ? (
                    <div className="space-y-4">
                      <div className="space-y-4">
                        <p className="text-lg text-muted-foreground">
                          Hello, <span className="font-semibold text-foreground">{firstWaitingStudent.student.name}</span>
                        </p>
                        <p className="text-muted-foreground">
                          You've been asked to complete a behavior reflection with mood and accountability tracking. Click below to begin.
                        </p>
                        <Button 
                          onClick={() => setKioskState('password')}
                          className="w-full bg-gradient-primary text-white shadow-button hover:shadow-elevated transition-all duration-200"
                          size="lg"
                        >
                          Begin Enhanced Reflection
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-muted-foreground">
                      No students currently need to complete a reflection. This enhanced kiosk is ready for the next student.
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

  if (kioskState === 'password') {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <div className="p-4 bg-primary/5 border-b">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
              <Monitor className="h-4 w-4 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Enhanced Student Kiosk #1</h3>
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
                    Please enter your birthday password to get started with your enhanced reflection.
                  </p>
                  {(() => {
                    const birthdateInfo = formatBirthdateForPassword(firstWaitingStudent?.student?.date_of_birth);
                    return (
                      <p className="text-sm text-muted-foreground/70 mb-6">
                        Use 4 digits: month and day (MMDD)<br/>
                        {birthdateInfo.helperText}
                      </p>
                    );
                  })()}
                </div>
                
                <div className="space-y-4">
                  {(() => {
                    const birthdateInfo = formatBirthdateForPassword(firstWaitingStudent?.student?.date_of_birth);
                    return (
                      <Input
                        type="tel"
                        placeholder={birthdateInfo.placeholder}
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
                    );
                  })()}
                  {passwordError && (
                    <p className="text-destructive text-sm text-center">{passwordError}</p>
                  )}
                  <TouchOptimizedButton 
                    onClick={handlePasswordSubmit}
                    className="w-full bg-gradient-primary text-white shadow-button hover:shadow-elevated transition-all duration-200"
                    disabled={passwordInput.length !== 4}
                  >
                    Continue to Enhanced Reflection
                  </TouchOptimizedButton>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (kioskState === 'reflection') {
    const currentQ = questions[currentQuestion];
    const questionNumber = currentQuestion + 1;
    const isLastQuestion = currentQuestion === questions.length - 1;

    return (
      <div className="min-h-screen bg-background flex flex-col">
        <div className="p-4 bg-primary/5 border-b shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                <Monitor className="h-4 w-4 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Enhanced Reflection - {firstWaitingStudent?.student?.first_name}</h3>
                <p className="text-xs text-muted-foreground">Question {questionNumber} of {questions.length}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                Time: {formatTime(timeElapsed)}
              </Badge>
            </div>
          </div>
        </div>

        <div className="flex-1 flex flex-col p-6 space-y-6">
          <Card className="p-6 bg-gradient-card shadow-soft">
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-3">
                <Badge className="bg-primary text-primary-foreground">
                  Question {questionNumber}
                </Badge>
              </div>
              <h2 className="text-xl font-semibold text-foreground mb-2">
                {currentQ.text}
              </h2>
              <p className="text-muted-foreground text-sm">
                {currentQ.helper}
              </p>
            </div>
          </Card>

          <div className="space-y-4">
            {currentQ.showMoodSlider && (
              <Card className="p-4 bg-card border border-border shadow-sm">
                <StudentMoodSlider
                  label={currentQ.moodLabel}
                  value={moodRatings[`step${questionNumber}`] || 3}
                  onChange={(value) => handleMoodChange(`step${questionNumber}`, value)}
                />
              </Card>
            )}

            {currentQ.showAccountabilitySlider && (
              <Card className="p-4 bg-card border border-border shadow-sm">
                <AccountabilitySlider
                  label={currentQ.accountabilityLabel}
                  value={accountabilityRatings[`step${questionNumber}`] || 3}
                  onChange={(value) => handleAccountabilityChange(`step${questionNumber}`, value)}
                />
              </Card>
            )}

            {currentQ.showCommitmentSlider && (
              <Card className="p-4 bg-card border border-border shadow-sm">
                <CommitmentSlider
                  label={currentQ.commitmentLabel}
                  value={commitmentRating}
                  onChange={setCommitmentRating}
                />
              </Card>
            )}
          </div>

          <Card className="p-4 bg-card border border-border shadow-sm">
            <div className="space-y-3">
              <Label htmlFor="answer" className="text-sm font-medium text-foreground">
                Your Answer
              </Label>
              <Textarea
                id="answer"
                placeholder="Type your thoughtful response here... (minimum 10 characters)"
                value={answers[currentQ.id] || ''}
                onChange={(e) => handleAnswerChange(currentQ.id, e.target.value)}
                className="min-h-[120px] resize-none text-base"
                autoFocus
              />
              <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground">
                  {(answers[currentQ.id] || '').length} characters
                </p>
                {(answers[currentQ.id] || '').length >= 10 && (
                  <Badge variant="outline" className="text-xs bg-success/10 text-success border-success/20">
                    ✓ Good length
                  </Badge>
                )}
              </div>
            </div>
          </Card>
        </div>

        <div className="p-4 bg-background border-t border-border shrink-0">
          <div className="flex items-center justify-between gap-4">
            <TouchOptimizedButton
              variant="outline"
              onClick={handlePrevious}
              disabled={currentQuestion === 0}
              className="flex-1 h-12"
            >
              Previous
            </TouchOptimizedButton>
            
            {isLastQuestion ? (
              <TouchOptimizedButton
                onClick={handleSubmit}
                disabled={!canProceedToNext() || isSubmitting}
                className="flex-1 h-12 bg-gradient-primary text-white shadow-button hover:shadow-elevated transition-all duration-200"
              >
                {isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Submitting...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    Submit Enhanced Reflection
                    <CheckCircle className="h-4 w-4" />
                  </div>
                )}
              </TouchOptimizedButton>
            ) : (
              <TouchOptimizedButton
                onClick={handleNext}
                disabled={!canProceedToNext()}
                className="flex-1 h-12 bg-gradient-primary text-white shadow-button hover:shadow-elevated transition-all duration-200"
              >
                <div className="flex items-center gap-2">
                  Next Question
                  <ArrowRight className="h-4 w-4" />
                </div>
              </TouchOptimizedButton>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (kioskState === 'completed') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-2xl">
          <Card className="p-12 text-center bg-gradient-card shadow-elevated">
            <div className="space-y-6">
              <div className="mx-auto w-20 h-20 bg-success/10 rounded-full flex items-center justify-center">
                <CheckCircle className="h-10 w-10 text-success" />
              </div>
              
              <div>
                <h2 className="text-3xl font-bold text-foreground mb-3">
                  Enhanced Reflection Complete!
                </h2>
                <p className="text-lg text-muted-foreground mb-4">
                  Thank you, <span className="font-semibold text-foreground">{completedStudentData?.name}</span>
                </p>
                <p className="text-muted-foreground">
                  Your teacher will review your enhanced reflection and mood tracking data. 
                  Please return to class or wait for further instructions.
                </p>
              </div>
              
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  This kiosk will automatically reset in:
                </p>
                <div className="text-4xl font-mono font-bold text-primary">
                  {countdown}s
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return null;
};

export default EnhancedKioskOne;