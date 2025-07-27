import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  userSessionId: string | null;
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

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [userSessionId, setUserSessionId] = useState<string | null>(null);

  const createUserSession = useCallback(async (userId: string) => {
    try {
      // First get the user's role from profiles table
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .single();
      
      if (profileError) {
        console.error('Error fetching user role:', profileError);
        return;
      }
      
      const userRole = profileData?.role || 'teacher'; // fallback to teacher
      
      // Create session with user's role as device_type
      const { data, error } = await supabase.rpc('create_user_session', {
        p_user_id: userId,
        p_device_type: userRole,
        p_location: window.location.pathname,
        p_device_identifier: navigator.userAgent
      });
      
      if (!error && data) {
        setUserSessionId(data);
        console.log('Session created successfully:', data);
      } else {
        console.error('Error creating session:', error);
      }
    } catch (error) {
      console.error('Error creating user session:', error);
    }
  }, []);

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
        
        // Handle session creation on sign in
        if (event === 'SIGNED_IN' && session?.user) {
          // Use setTimeout to avoid issues in the auth callback
          setTimeout(() => {
            createUserSession(session.user.id);
          }, 100);
        }
        
        // Handle session ending on sign out
        if (event === 'SIGNED_OUT') {
          setUserSessionId(null);
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [createUserSession]);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  };

  const signUp = async (email: string, password: string, userData: any) => {
    const redirectUrl = `${window.location.origin}/`;
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: userData
      }
    });
    return { error };
  };

  const signOut = async () => {
    // End user session before signing out
    if (userSessionId) {
      try {
        await supabase.rpc('end_user_session', {
          p_session_id: userSessionId
        });
      } catch (error) {
        console.error('Error ending user session:', error);
      }
    }
    
    await supabase.auth.signOut();
  };

  const value = {
    user,
    session,
    loading,
    userSessionId,
    signIn,
    signUp,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};