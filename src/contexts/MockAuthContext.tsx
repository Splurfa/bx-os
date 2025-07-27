import React, { createContext, useContext, useState, useEffect } from 'react';

// Mock user interface matching Supabase user structure
interface MockUser {
  id: string;
  email: string;
  user_metadata?: {
    first_name?: string;
    last_name?: string;
    role?: string;
  };
}

interface AuthContextType {
  user: MockUser | null;
  session: any;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, userData: any) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Mock users database
const MOCK_USERS = [
  {
    id: 'teacher-1',
    email: 'teacher@school.edu',
    password: 'password123',
    user_metadata: {
      first_name: 'Demo',
      last_name: 'Teacher',
      role: 'teacher'
    }
  },
  {
    id: 'teacher-2', 
    email: 'sarah.johnson@school.edu',
    password: 'password123',
    user_metadata: {
      first_name: 'Sarah',
      last_name: 'Johnson',
      role: 'teacher'
    }
  },
  {
    id: 'teacher-3',
    email: 'mike.davis@school.edu',
    password: 'password123',
    user_metadata: {
      first_name: 'Mike',
      last_name: 'Davis',
      role: 'teacher'
    }
  },
  {
    id: 'admin-1',
    email: 'admin@school.edu',
    password: 'password123',
    user_metadata: {
      first_name: 'Demo',
      last_name: 'Admin',
      role: 'admin'
    }
  }
];

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<MockUser | null>(null);
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for stored user session on mount
    const storedUser = localStorage.getItem('mock_user');
    if (storedUser) {
      const userData = JSON.parse(storedUser);
      setUser(userData);
      setSession({ user: userData });
    }
    setLoading(false);
  }, []);

  const signIn = async (email: string, password: string) => {
    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay
    
    const foundUser = MOCK_USERS.find(u => u.email === email && u.password === password);
    
    if (!foundUser) {
      return { error: { message: 'Invalid email or password' } };
    }

    const userData: MockUser = {
      id: foundUser.id,
      email: foundUser.email,
      user_metadata: foundUser.user_metadata
    };

    setUser(userData);
    setSession({ user: userData });
    localStorage.setItem('mock_user', JSON.stringify(userData));
    
    return { error: null };
  };

  const signUp = async (email: string, password: string, userData: any) => {
    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay
    
    // Check if user already exists
    if (MOCK_USERS.find(u => u.email === email)) {
      return { error: { message: 'User already exists' } };
    }

    // In a real app, this would create the user
    // For demo, we'll just simulate success
    return { error: null };
  };

  const signOut = async () => {
    await new Promise(resolve => setTimeout(resolve, 300)); // Simulate network delay
    setUser(null);
    setSession(null);
    localStorage.removeItem('mock_user');
  };

  const value = {
    user,
    session,
    loading,
    signIn,
    signUp,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};