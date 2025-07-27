// Enhanced mock data system for the BSR prototype

export interface MockStudent {
  id: string;
  name: string;
  grade: string;
  class_name: string;
  teacher_id?: string;
  created_at: string;
}

export interface MockBehaviorRequest {
  id: string;
  student_id: string;
  teacher_id: string;
  behaviors: string[];
  mood: string;
  status: 'waiting' | 'active' | 'completed';
  urgent: boolean;
  notes?: string;
  created_at: string;
  updated_at: string;
  student?: MockStudent;
  reflection?: MockReflection;
  position?: number;
  timestamp?: Date;
  assigned_kiosk_id?: number; // New field for kiosk assignment
}

export interface MockReflection {
  id: string;
  behavior_request_id: string;
  question1: string;
  question2: string;
  question3: string;
  question4: string;
  status: 'pending' | 'approved' | 'revision_requested';
  teacher_feedback?: string;
  created_at: string;
  updated_at: string;
}

// Mock students database
export const MOCK_STUDENTS: MockStudent[] = [
  { id: 'student-1', name: 'Alex Thompson', grade: '6th', class_name: '6A', created_at: '2024-01-01T00:00:00Z' },
  { id: 'student-2', name: 'Jordan Martinez', grade: '6th', class_name: '6A', created_at: '2024-01-01T00:00:00Z' },
  { id: 'student-3', name: 'Sam Chen', grade: '6th', class_name: '6B', created_at: '2024-01-01T00:00:00Z' },
  { id: 'student-4', name: 'Taylor Rodriguez', grade: '7th', class_name: '7A', created_at: '2024-01-01T00:00:00Z' },
  { id: 'student-5', name: 'Casey Williams', grade: '7th', class_name: '7A', created_at: '2024-01-01T00:00:00Z' },
  { id: 'student-6', name: 'Riley Johnson', grade: '7th', class_name: '7B', created_at: '2024-01-01T00:00:00Z' },
  { id: 'student-7', name: 'Avery Brown', grade: '8th', class_name: '8A', created_at: '2024-01-01T00:00:00Z' },
  { id: 'student-8', name: 'Morgan Davis', grade: '8th', class_name: '8A', created_at: '2024-01-01T00:00:00Z' },
  { id: 'student-9', name: 'Jamie Wilson', grade: '8th', class_name: '8B', created_at: '2024-01-01T00:00:00Z' },
  { id: 'student-10', name: 'Skylar Anderson', grade: '8th', class_name: '8B', created_at: '2024-01-01T00:00:00Z' },
];

// Behavior categories with consistent styling
export const BEHAVIOR_CATEGORIES = [
  'Disruptive',
  'Social-Emotional', 
  'Avoidance',
  'Eloping',
  'Minor-Physical',
  'Major-Physical'
];

// Mood options
export const MOOD_OPTIONS = [
  'Very Calm',
  'Calm', 
  'Neutral',
  'Agitated',
  'Very Agitated'
];

// Sample reflection questions
export const REFLECTION_QUESTIONS = [
  'What did you do that led to being sent out of class?',
  'What were you hoping would happen when you acted that way?',
  'Who else was impacted by your behavior, and in what way?',
  'Write two sentences showing you understand what\'s expected when you return to class.'
];

// Helper functions
export const getStudentById = (id: string): MockStudent | undefined => {
  return MOCK_STUDENTS.find(student => student.id === id);
};

export const getStudentByName = (name: string): MockStudent | undefined => {
  return MOCK_STUDENTS.find(student => student.name === name);
};

export const createMockId = (): string => {
  return `mock-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

export const formatTimeStamp = (date: Date): string => {
  return date.toISOString();
};