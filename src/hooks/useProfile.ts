import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface Profile {
  id: string;
  email: string;
  full_name?: string;
  role: 'teacher' | 'admin' | 'super_admin';
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
        .select('id, email, full_name, role, created_at, updated_at')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        // Fallback to user metadata if profile doesn't exist
        const profile: ProfileWithTeacher = {
          id: user.id,
          email: user.email || '',
          full_name: user.user_metadata?.full_name || `${user.user_metadata?.first_name || ''} ${user.user_metadata?.last_name || ''}`.trim(),
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
        full_name: profileData.full_name,
        role: profileData.role as 'teacher' | 'admin' | 'super_admin',
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
        full_name: user.user_metadata?.full_name || `${user.user_metadata?.first_name || ''} ${user.user_metadata?.last_name || ''}`.trim(),
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
          (payload) => {
            console.log('📡 Profile change detected:', payload);
            fetchProfile();
            
            // If role changed, trigger a re-evaluation of current route
            if (payload.eventType === 'UPDATE' && payload.new?.role !== payload.old?.role) {
              console.log('🔄 Role change detected, triggering navigation check');
              // Emit custom event for components to react to role changes
              window.dispatchEvent(new CustomEvent('roleChange', { 
                detail: { newRole: payload.new?.role, oldRole: payload.old?.role }
              }));
            }
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
    
    if (profile.full_name) return profile.full_name;
    
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