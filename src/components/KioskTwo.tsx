import { useState, useEffect } from "react";
import { User, ArrowRight, CheckCircle, Loader2, Eye, EyeOff, Monitor } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { TouchOptimizedButton } from "@/components/TouchOptimizedButton";
import AccountabilitySlider from "@/components/AccountabilitySlider";
import CommitmentSlider from "@/components/CommitmentSlider";
import StudentMoodSlider from "@/components/StudentMoodSlider";
import { useSupabaseQueue } from "../hooks/useSupabaseQueue";
import { useKiosks } from "@/contexts/KioskContext";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { formatBirthdateForPassword } from "@/lib/dateUtils";

const KIOSK_ID = 2;

// 8-step workflow configuration
const steps = [
  {
    id: 'step1',
    type: 'text',
    heading: 'What did you do that led to being sent out of class?',
    helper: 'Describe your actions and behavior.',
    minLength: 10
  },
  {
    id: 'step2',
    type: 'mood',
    heading: 'How were you feeling just before or during the incident?',
    helper: 'Tap the face that shows how you felt.',
    component: 'self'
  },
  {
    id: 'step3',
    type: 'accountability',
    heading: 'How much responsibility do you take for this incident?',
    helper: 'Move the slider to show your level of responsibility.'
  },
  {
    id: 'step4',
    type: 'text',
    heading: 'What were you hoping would happen when you acted that way?',
    helper: 'What was your goal or reason for your behavior?',
    minLength: 10
  },
  {
    id: 'step5',
    type: 'text',
    heading: 'Who else was affected by your behaviour, and how do you think they felt?',
    helper: 'Think about classmates, your teacher, or others.',
    minLength: 10
  },
  {
    id: 'step5b',
    type: 'mood',
    heading: 'How do you think others felt about your behavior?',
    helper: 'Tap the face that shows how others might have felt.',
    component: 'others'
  },
  {
    id: 'step6',
    type: 'text',
    heading: 'What will you do differently next time?',
    helper: 'Be specific about what you\'ll do differently.',
    minLength: 10
  },
  {
    id: 'step7',
    type: 'mood',
    heading: 'How do you feel now?',
    helper: 'Tap the face that shows how you feel right now.',
    component: 'self'
  },
  {
    id: 'step8',
    type: 'commitment',
    heading: 'How ready are you to follow through?',
    helper: 'Move the slider to show your commitment level.'
  }
];

const KioskTwo = () => {
  const { user, session, loading: authLoading } = useAuth();
  const { activateKiosk, getKioskById, updateKioskStudent } = useKiosks();
  const { 
    loading, 
    getFirstWaitingStudentForKiosk, 
    submitReflection,
    updateStudentKioskStatus
  } = useSupabaseQueue();
  
  const [kioskState, setKioskState] = useState<'setup' | 'welcome' | 'password' | 'reflection' | 'completed'>('setup');
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [currentStep, setCurrentStep] = useState(0);
  const [reflectionData, setReflectionData] = useState<Record<string, string | number>>({});
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activationError, setActivationError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(10);
  
  const firstWaitingStudent = getFirstWaitingStudentForKiosk(KIOSK_ID);
  const hasTeacherFeedback = firstWaitingStudent?.reflection?.teacher_feedback;

  // Check if kiosk is already active - anonymous access allowed
  useEffect(() => {
    if (kioskState === 'setup' && !authLoading) {
      const checkKiosk = async () => {
        try {
          setActivationError(null);
          
          console.log('Checking if kiosk 2 is available for anonymous student access...');
          const kiosk = getKioskById(KIOSK_ID);
          
          if (kiosk && kiosk.isActive) {
            setKioskState('welcome');
          } else {
            console.log('Kiosk 2 is not activated. Admin must activate it first.');
            setActivationError('Kiosk 2 is not available. Please ask an administrator to activate it.');
          }
        } catch (error) {
          console.error('Error checking kiosk 2 status:', error);
          const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
          setActivationError(`Kiosk 2 check failed: ${errorMessage}`);
        }
      };
      checkKiosk();
    }
  }, [kioskState, getKioskById, authLoading]);

  // Reset state when student changes or completes
  useEffect(() => {
    if (!firstWaitingStudent && kioskState !== 'setup' && kioskState !== 'completed') {
      setKioskState('welcome');
      resetReflectionState();
      
      // Clear kiosk assignment using atomic function
      updateKioskStudent(KIOSK_ID, undefined, undefined).catch(error => {
        console.warn('Failed to clear kiosk assignment:', error);
      });
    } else if (firstWaitingStudent && kioskState === 'welcome') {
      // Assign student to kiosk 2 using atomic function
      updateKioskStudent(KIOSK_ID, firstWaitingStudent.student_id, firstWaitingStudent.id).catch(error => {
        console.warn('Failed to assign student to kiosk:', error);
      });
    }
  }, [firstWaitingStudent?.id, kioskState, updateKioskStudent]);

  // Timer for reflection process
  useEffect(() => {
    if (kioskState === 'reflection') {
      const timer = setInterval(() => {
        setTimeElapsed(prev => prev + 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [kioskState]);

  // Auto-reset after completion and manage countdown
  useEffect(() => {
    if (kioskState === 'completed') {
      setCountdown(10);
      
      const countdownTimer = setInterval(() => {
        setCountdown(prev => prev - 1);
      }, 1000);
      
      const resetTimer = setTimeout(() => {
        setKioskState('welcome');
        resetReflectionState();
      }, 10000);
      
      return () => {
        clearInterval(countdownTimer);
        clearTimeout(resetTimer);
      };
    }
  }, [kioskState]);

  const resetReflectionState = () => {
    setPasswordInput('');
    setPasswordError('');
    setCurrentStep(0);
    setReflectionData({});
    setTimeElapsed(0);
  };

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
        
        const birthdateInfo = formatBirthdateForPassword(firstWaitingStudent?.student?.date_of_birth);
        toast.error(`Incorrect birthday. Please enter MMDD format (e.g., ${birthdateInfo.errorExample})`);
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
      
      setKioskState('reflection');
      setTimeElapsed(0);
      setPasswordError('');
    } catch (error) {
      console.error('Authentication error:', error);
      toast.error('Authentication failed. Please try again.');
    }
  };

  const handleInputChange = (stepId: string, value: string | number) => {
    setReflectionData(prev => ({ ...prev, [stepId]: value }));
  };

  const canProceedToNext = () => {
    const currentStepConfig = steps[currentStep];
    const currentValue = reflectionData[currentStepConfig.id];
    
    if (currentStepConfig.type === 'text') {
      return typeof currentValue === 'string' && currentValue.trim().length >= (currentStepConfig.minLength || 0);
    }
    
    return currentValue !== undefined;
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    if (!firstWaitingStudent || isSubmitting) return;

    setIsSubmitting(true);
    
    try {
      const reflection = {
        step1_incident_response: reflectionData.step1 as string || '',
        step2_mood_before: reflectionData.step2 as number || 3,
        step3_accountability: reflectionData.step3 as number || 3,
        step4_intent_response: reflectionData.step4 as string || '',
        step5_impact_response: reflectionData.step5 as string || '',
        step5_others_mood: reflectionData.step5b as number || 3,
        step6_plan_response: reflectionData.step6 as string || '',
        step7_mood_after: reflectionData.step7 as number || 3,
        step8_commitment: reflectionData.step8 as number || 3
      };
      
      await submitReflection(firstWaitingStudent.id, reflection);
      setKioskState('completed');
    } catch (error) {
      console.error('Error submitting reflection:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStepContent = () => {
    const currentStepConfig = steps[currentStep];
    const currentValue = reflectionData[currentStepConfig.id];

    if (currentStepConfig.type === 'text') {
      return (
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-foreground mb-3">
              {currentStepConfig.heading}
            </h2>
            <p className="text-muted-foreground mb-6">
              {currentStepConfig.helper}
            </p>
          </div>
          
          <div className="space-y-4">
            <Textarea
              placeholder="Type your response here..."
              value={(currentValue as string) || ''}
              onChange={(e) => handleInputChange(currentStepConfig.id, e.target.value)}
              className="min-h-32 text-lg leading-relaxed resize-none"
            />
            
            <div className="text-right">
              <span className="text-sm text-muted-foreground">
                {((currentValue as string) || '').length} characters
              </span>
            </div>
          </div>
        </div>
      );
    }

    if (currentStepConfig.type === 'mood') {
      return (
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-foreground mb-3">
              {currentStepConfig.heading}
            </h2>
            <p className="text-muted-foreground mb-6">
              {currentStepConfig.helper}
            </p>
          </div>
          
          <div className="flex justify-center">
            <StudentMoodSlider
              value={(currentValue as number) || 3}
              onChange={(value) => handleInputChange(currentStepConfig.id, value)}
            />
          </div>
        </div>
      );
    }

    if (currentStepConfig.type === 'accountability') {
      return (
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-foreground mb-3">
              {currentStepConfig.heading}
            </h2>
            <p className="text-muted-foreground mb-6">
              {currentStepConfig.helper}
            </p>
          </div>
          
          <div className="flex justify-center">
            <AccountabilitySlider
              value={(currentValue as number) || 3}
              onChange={(value) => handleInputChange(currentStepConfig.id, value)}
              label=""
            />
          </div>
        </div>
      );
    }

    if (currentStepConfig.type === 'commitment') {
      return (
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-foreground mb-3">
              {currentStepConfig.heading}
            </h2>
            <p className="text-muted-foreground mb-6">
              {currentStepConfig.helper}
            </p>
          </div>
          
          <div className="flex justify-center">
            <CommitmentSlider
              value={(currentValue as number) || 3}
              onChange={(value) => handleInputChange(currentStepConfig.id, value)}
              label=""
            />
          </div>
        </div>
      );
    }

    return null;
  };

  // Show loading state during kiosk setup (no auth required)
  if (loading || kioskState === 'setup') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center space-y-4 max-w-md">
          {activationError ? (
            <>
              <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto">
                <Monitor className="h-8 w-8 text-destructive" />
              </div>
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-destructive">Kiosk 2 Activation Failed</h3>
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
            </>
          ) : (
            <>
              <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
              <p className="text-muted-foreground">
                Activating kiosk 2...
              </p>
            </>
          )}
        </div>
      </div>
    );
  }

  // Welcome screen - no active student
  if ((!firstWaitingStudent || kioskState === 'welcome') && kioskState !== 'completed') {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        {/* Kiosk Header */}
        <div className="p-4 bg-primary/5 border-b">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
              <Monitor className="h-4 w-4 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Student Kiosk #2</h3>
              <p className="text-xs text-muted-foreground">Ready for next student</p>
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
              <h3 className="font-semibold text-foreground">Student Kiosk #2</h3>
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
                    <p className="text-sm text-destructive">{passwordError}</p>
                  )}
                  
                  <TouchOptimizedButton 
                    onClick={handlePasswordSubmit}
                    className="w-full py-6 text-xl"
                    disabled={passwordInput.length !== 4}
                  >
                    Start Reflection
                  </TouchOptimizedButton>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // Reflection screen with 8-step workflow
  if (kioskState === 'reflection') {
    const currentStepConfig = steps[currentStep];
    const progress = ((currentStep + 1) / steps.length) * 100;
    
    return (
      <div className="min-h-screen bg-background flex flex-col">
        {/* Header with progress */}
        <div className="p-4 bg-primary/5 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                <Monitor className="h-4 w-4 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">
                  {firstWaitingStudent?.student?.first_name}'s Reflection
                </h3>
                <p className="text-xs text-muted-foreground">
                  Step {currentStep + 1} of {steps.length} • {formatTime(timeElapsed)}
                </p>
              </div>
            </div>
            
            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
              {Math.round(progress)}% Complete
            </Badge>
          </div>
          
          {/* Progress bar */}
          <div className="mt-3 w-full bg-muted rounded-full h-2">
            <div 
              className="bg-gradient-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
        
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="w-full max-w-2xl">
            <Card className="p-8 bg-gradient-card shadow-elevated w-full">
              {renderStepContent()}
              
              {/* Navigation */}
              <div className="flex justify-between items-center mt-8 pt-6 border-t border-border">
                <div>
                  {currentStep > 0 && (
                    <TouchOptimizedButton
                      onClick={handlePrevious}
                      variant="outline"
                      className="px-6 py-3"
                    >
                      Previous
                    </TouchOptimizedButton>
                  )}
                </div>
                
                <div>
                  {currentStep < steps.length - 1 ? (
                    <TouchOptimizedButton
                      onClick={handleNext}
                      disabled={!canProceedToNext()}
                      className="px-6 py-3 bg-gradient-primary text-white"
                    >
                      Next
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </TouchOptimizedButton>
                  ) : (
                    <TouchOptimizedButton
                      onClick={handleSubmit}
                      disabled={!canProceedToNext() || isSubmitting}
                      className="px-8 py-3 bg-gradient-primary text-white"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Submitting...
                        </>
                      ) : (
                        <>
                          Complete Reflection
                          <CheckCircle className="ml-2 h-4 w-4" />
                        </>
                      )}
                    </TouchOptimizedButton>
                  )}
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
          <Card className="p-8 text-center bg-gradient-card shadow-elevated w-full">
            <div className="space-y-6">
              <div className="mx-auto w-20 h-20 bg-success/10 rounded-full flex items-center justify-center">
                <CheckCircle className="h-10 w-10 text-success" />
              </div>
              
              <div>
                <h2 className="text-2xl font-bold text-success mb-3">Reflection Complete!</h2>
                <p className="text-muted-foreground mb-4">
                  Thank you for taking the time to reflect on your behavior.
                </p>
                <p className="text-sm text-muted-foreground">
                  Your teacher will review your reflection and provide feedback.
                </p>
              </div>
              
              <div className="text-center">
                <p className="text-sm text-muted-foreground">
                  Returning to main screen in {countdown} seconds...
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return null;
};

export default KioskTwo;