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
      
      // Fetch actual profile data from database
      const { data: profileData, error } = await supabase
        .from('profiles')
        .select('id, email, full_name, first_name, last_name, role, created_at, updated_at')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        // Fallback to user metadata if profile doesn't exist
        const profile: ProfileWithTeacher = {
          id: user.id,
          email: user.email || '',
          first_name: user.user_metadata?.first_name,
          last_name: user.user_metadata?.last_name,
          role: user.user_metadata?.role || 'teacher',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        setProfile(profile);
        return;
      }

      const profile: ProfileWithTeacher = {
        id: profileData.id,
        email: profileData.email || '',
        first_name: profileData.first_name,
        last_name: profileData.last_name,
        role: profileData.role as 'teacher' | 'admin',
        created_at: profileData.created_at,
        updated_at: profileData.updated_at
      };

      setProfile(profile);
    } catch (error) {
      console.error('Error setting up profile:', error);
      // Still create basic profile
      const profile: ProfileWithTeacher = {
        id: user.id,
        email: user.email || '',
        first_name: user.user_metadata?.first_name,
        last_name: user.user_metadata?.last_name,
        role: user.user_metadata?.role || 'teacher',
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

    // Set up real-time subscription for profile changes
    if (user?.id) {
      const channel = supabase
        .channel('profile_changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'profiles',
            filter: `id=eq.${user.id}`
          },
          () => {
            fetchProfile();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
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