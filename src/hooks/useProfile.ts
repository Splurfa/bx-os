import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface Profile {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  role: 'teacher' | 'admin';
  created_at: string;
  updated_at: string;
}

export interface Teacher {
  id: string;
  school_name?: string;
  classroom?: string;
  grade_level?: string;
  subject?: string;
  created_at: string;
}

export interface ProfileWithTeacher extends Profile {
  teacher?: Teacher;
}

export const useProfile = () => {
  const [profile, setProfile] = useState<ProfileWithTeacher | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchProfile = async () => {
    if (!user) {
      setProfile(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      
      // Create profile from auth user data with role detection
      const profile: ProfileWithTeacher = {
        id: user.id,
        email: user.email || '',
        first_name: user.user_metadata?.first_name,
        last_name: user.user_metadata?.last_name,
        role: user.email === 'admin@school.edu' ? 'admin' : 'teacher',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      // If teacher, try to add teacher info
      if (profile.role === 'teacher') {
        // For demo purposes, add mock teacher data based on email
        if (user.email === 'sarah.johnson@school.edu') {
          profile.teacher = {
            id: user.id,
            school_name: 'Lincoln Elementary',
            classroom: 'Room 101',
            grade_level: '3rd Grade',
            subject: 'Mathematics',
            created_at: new Date().toISOString()
          };
        }
      }

      setProfile(profile);
    } catch (error) {
      console.error('Error setting up profile:', error);
      // Still create basic profile
      const profile: ProfileWithTeacher = {
        id: user.id,
        email: user.email || '',
        first_name: user.user_metadata?.first_name,
        last_name: user.user_metadata?.last_name,
        role: user.email === 'admin@school.edu' ? 'admin' : 'teacher',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      setProfile(profile);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [user]);

  const getDisplayName = () => {
    if (!profile) return 'Loading...';
    
    if (profile.first_name || profile.last_name) {
      return `${profile.first_name || ''} ${profile.last_name || ''}`.trim();
    }
    
    return profile.email.split('@')[0];
  };

  const getTeacherDisplayInfo = () => {
    if (!profile?.teacher) return null;
    
    const parts = [];
    if (profile.teacher.classroom) parts.push(profile.teacher.classroom);
    if (profile.teacher.grade_level) parts.push(profile.teacher.grade_level);
    
    return parts.length > 0 ? parts.join(' • ') : 'Teacher';
  };

  return {
    profile,
    loading,
    getDisplayName,
    getTeacherDisplayInfo,
    refreshProfile: fetchProfile
  };
};