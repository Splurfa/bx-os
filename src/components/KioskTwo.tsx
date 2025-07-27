import { useState, useEffect } from "react";
import { User, ArrowRight, CheckCircle, Loader2, Eye, EyeOff, Monitor } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useSupabaseQueue } from "../hooks/useSupabaseQueue";
import { useKiosks } from "@/contexts/KioskContext";
import { useAuth } from "@/contexts/AuthContext";

const KIOSK_ID = 2;

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

const KioskTwo = () => {
  const { user, session, loading: authLoading } = useAuth();
  const { activateKiosk, getKioskById, updateKioskStudent } = useKiosks();
  const { 
    loading, 
    getFirstWaitingStudentForKiosk, 
    submitReflection 
  } = useSupabaseQueue();
  
  const [kioskState, setKioskState] = useState<'setup' | 'welcome' | 'password' | 'reflection' | 'completed'>('setup');
  const [studentPassword, setStudentPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activationError, setActivationError] = useState<string | null>(null);
  
  const firstWaitingStudent = getFirstWaitingStudentForKiosk(KIOSK_ID);
  const hasTeacherFeedback = firstWaitingStudent?.reflection?.teacher_feedback;

  // Initialize kiosk on mount - ONLY when authenticated
  useEffect(() => {
    if (kioskState === 'setup' && !authLoading) {
      const setupKiosk = async () => {
        try {
          console.log('=== KIOSK 2 ACTIVATION DEBUG ===');
          console.log('Auth Loading:', authLoading);
          console.log('User:', user);
          console.log('Session:', session);
          console.log('User ID:', user?.id);
          console.log('Session User ID:', session?.user?.id);
          console.log('Is Authenticated:', !!user && !!session);
          console.log('===============================');
          
          setActivationError(null);
          
          // Only proceed if user is authenticated
          if (!user || !session) {
            console.error('Cannot activate kiosk: No authenticated user');
            setActivationError('Authentication required to activate kiosk. Please ensure you are logged in.');
            return;
          }
          
          console.log('Proceeding with kiosk 2 activation for authenticated user...');
          const id = await activateKiosk(KIOSK_ID);
          
          if (id) {
            console.log('Kiosk 2 activated successfully with ID:', id);
            setKioskState('welcome');
          } else {
            console.error('Failed to activate kiosk 2: No ID returned');
            setActivationError('Failed to activate kiosk 2.');
          }
        } catch (error) {
          console.error('Error during kiosk 2 activation:', error);
          const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
          setActivationError(`Kiosk 2 activation failed: ${errorMessage}`);
        }
      };
      setupKiosk();
    }
  }, [kioskState, activateKiosk, user, session, authLoading]);

  // Reset state when student changes or completes
  useEffect(() => {
    if (!firstWaitingStudent && kioskState !== 'setup') {
      setKioskState('welcome');
      setStudentPassword('');
      setPasswordError('');
      setCurrentQuestion(0);
      setAnswers({});
      setTimeElapsed(0);
      
      // Clear kiosk assignment
      updateKioskStudent(KIOSK_ID, undefined, undefined);
    } else if (firstWaitingStudent && kioskState === 'welcome') {
      // Assign student to kiosk 2
      updateKioskStudent(KIOSK_ID, firstWaitingStudent.student_id, firstWaitingStudent.id);
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

  // Auto-reset after completion
  useEffect(() => {
    if (kioskState === 'completed') {
      const resetTimer = setTimeout(() => {
        setKioskState('welcome');
        setStudentPassword('');
        setPasswordError('');
        setCurrentQuestion(0);
        setAnswers({});
        setTimeElapsed(0);
      }, 10000); // 10 seconds
      return () => clearTimeout(resetTimer);
    }
  }, [kioskState]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handlePasswordSubmit = () => {
    // For demo purposes, accept "password123" for any student
    if (studentPassword === 'password123') {
      setKioskState('reflection');
      setPasswordError('');
    } else {
      setPasswordError('Incorrect password. Please try again.');
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
      
      await submitReflection(firstWaitingStudent.id, reflection);
      setKioskState('completed');
    } catch (error) {
      console.error('Error submitting reflection:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Setup/Loading state - wait for auth to be ready
  if (loading || authLoading || kioskState === 'setup') {
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
                {authLoading ? 'Authenticating...' : 
                 kioskState === 'setup' ? 'Activating kiosk 2...' : 'Loading kiosk 2...'}
              </p>
            </>
          )}
        </div>
      </div>
    );
  }

  // Welcome screen - no active student
  if (!firstWaitingStudent || kioskState === 'welcome') {
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
          <div className="w-full max-w-md">
            <Card className="p-12 text-center bg-gradient-card shadow-elevated w-full">
              <div className="space-y-6">
                <div className="mx-auto w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center">
                  <User className="h-10 w-10 text-primary" />
                </div>
                
                <div>
                  <h2 className="text-3xl font-bold text-foreground mb-3">Student Reflection Kiosk</h2>
                  {firstWaitingStudent ? (
                    <div className="space-y-4">
                      <p className="text-lg text-muted-foreground">
                        Hello, <span className="font-semibold text-foreground">{firstWaitingStudent.student.name}</span>
                      </p>
                 {hasTeacherFeedback ? (
                   <div className="space-y-3">
                     <p className="text-muted-foreground">
                       Your teacher has reviewed your previous reflection and provided feedback.
                     </p>
                     <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-left">
                       <p className="text-sm font-medium text-blue-900 mb-1">Teacher's Feedback:</p>
                       <p className="text-sm text-blue-800">{hasTeacherFeedback}</p>
                     </div>
                     <p className="text-sm text-muted-foreground">
                       Please complete your reflection again, keeping this feedback in mind.
                     </p>
                   </div>
                 ) : (
                   <p className="text-muted-foreground">
                     You've been asked to complete a behavior reflection. Click below to begin.
                   </p>
                 )}
                      <Button 
                        onClick={() => setKioskState('password')}
                        className="w-full bg-gradient-primary text-white shadow-button hover:shadow-elevated transition-all duration-200"
                        size="lg"
                      >
                        Begin Reflection
                      </Button>
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
                  <h2 className="text-2xl font-bold text-foreground mb-2">Welcome, {firstWaitingStudent.student.name}</h2>
                  <p className="text-muted-foreground">Please enter your student password to continue</p>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="password">Student Password</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        value={studentPassword}
                        onChange={(e) => setStudentPassword(e.target.value)}
                        placeholder="Enter your password"
                        className="pr-10"
                        onKeyPress={(e) => e.key === 'Enter' && handlePasswordSubmit()}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                    {passwordError && (
                      <p className="text-sm text-destructive">{passwordError}</p>
                    )}
                  </div>

                  <div className="space-y-3">
                    <Button 
                      onClick={handlePasswordSubmit}
                      disabled={!studentPassword.trim()}
                      className="w-full bg-gradient-primary text-white shadow-button hover:shadow-elevated transition-all duration-200"
                    >
                      Continue to Reflection
                    </Button>
                    
                    <Button 
                      variant="outline"
                      onClick={() => setKioskState('welcome')}
                      className="w-full"
                    >
                      Go Back
                    </Button>
                  </div>

                  <div className="text-center text-xs text-muted-foreground mt-4 p-3 bg-muted/50 rounded-lg">
                    <p><strong>Demo Password:</strong> password123</p>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // Completion view with auto-reset countdown
  if (kioskState === 'completed') {
    const [countdown, setCountdown] = useState(10);
    
    useEffect(() => {
      const timer = setInterval(() => {
        setCountdown(prev => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    }, []);

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
              <p className="text-xs text-muted-foreground">Reflection completed</p>
            </div>
          </div>
        </div>
        
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="w-full max-w-md">
            <Card className="p-12 text-center bg-gradient-card shadow-elevated max-w-md w-full">
              <div className="space-y-6">
                <div className="mx-auto w-20 h-20 bg-queue-completed/10 rounded-full flex items-center justify-center">
                  <CheckCircle className="h-10 w-10 text-queue-completed" />
                </div>
                
                <div>
                  <h2 className="text-2xl font-bold text-foreground mb-2">Reflection Complete!</h2>
                  <p className="text-muted-foreground">Thank you for your thoughtful responses, {firstWaitingStudent.student.name}</p>
                </div>

                <div className="space-y-4">
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <p className="text-sm text-muted-foreground">
                      Your reflection has been submitted for teacher review. Please return to class when instructed.
                    </p>
                  </div>
                  
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">
                      Returning to welcome screen in <span className="font-semibold">{countdown}</span> seconds...
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // Reflection form
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
              <h3 className="font-semibold text-foreground">Student Kiosk #2</h3>
              <p className="text-xs text-muted-foreground">Reflection in progress</p>
            </div>
          </div>
          <div className="text-sm text-muted-foreground">
            Time: {formatTime(timeElapsed)}
          </div>
        </div>
      </div>
      
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-2xl">
          <Card className="p-8 bg-gradient-card shadow-elevated w-full">
            <div className="space-y-6">
              {/* Progress */}
              <div className="text-center">
                <h2 className="text-2xl font-bold text-foreground mb-2">Behavior Reflection</h2>
                <p className="text-muted-foreground mb-4">Question {currentQuestion + 1} of {questions.length}</p>
                <div className="w-full bg-muted rounded-full h-2">
                  <div 
                    className="bg-gradient-primary h-2 rounded-full transition-all duration-300" 
                    style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
                  />
                </div>
              </div>

              {/* Teacher Feedback */}
              {hasTeacherFeedback && (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <User className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-blue-900 mb-1">Teacher Feedback</h4>
                      <p className="text-sm text-blue-800">{hasTeacherFeedback}</p>
                      <p className="text-xs text-blue-600 mt-2">Please keep this feedback in mind as you complete your reflection.</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Question */}
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    {questions[currentQuestion].text}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {questions[currentQuestion].helper}
                  </p>
                </div>

                <div>
                  <Textarea
                    value={answers[questions[currentQuestion].id] || ''}
                    onChange={(e) => handleAnswerChange(questions[currentQuestion].id, e.target.value)}
                    placeholder="Type your response here..."
                    className="min-h-[120px] text-base"
                  />
                  <div className="flex justify-between items-center mt-2">
                    <p className="text-xs text-muted-foreground">
                      {answers[questions[currentQuestion].id]?.length || 0} characters
                    </p>
                    {!canProceedToNext() && (
                      <p className="text-xs text-muted-foreground">
                        Please write at least 10 characters
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Navigation */}
              <div className="flex justify-between pt-4">
                <Button
                  variant="outline"
                  onClick={handlePrevious}
                  disabled={currentQuestion === 0}
                >
                  Previous
                </Button>

                {currentQuestion === questions.length - 1 ? (
                  <Button
                    onClick={handleSubmit}
                    disabled={!canProceedToNext() || isSubmitting}
                    className="bg-gradient-primary text-white shadow-button hover:shadow-elevated transition-all duration-200"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        Submit Reflection
                        <CheckCircle className="h-4 w-4 ml-2" />
                      </>
                    )}
                  </Button>
                ) : (
                  <Button
                    onClick={handleNext}
                    disabled={!canProceedToNext()}
                    className="bg-gradient-primary text-white shadow-button hover:shadow-elevated transition-all duration-200"
                  >
                    Next
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                )}
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default KioskTwo;