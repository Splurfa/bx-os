import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface KioskState {
  id: number;
  name: string;
  location?: string;
  isActive: boolean;
  currentStudentId?: string;
  currentBehaviorRequestId?: string;
  activatedAt?: Date;
  activatedBy?: string;
}

interface KioskContextType {
  kiosks: KioskState[];
  activeKioskCount: number;
  loading: boolean;
  activateKiosk: (kioskId?: number) => Promise<number | null>;
  deactivateKiosk: (kioskId: number) => Promise<void>;
  deactivateAllKiosks: () => Promise<void>;
  updateKioskStudent: (kioskId: number, studentId?: string, behaviorRequestId?: string) => Promise<void>;
  getKioskById: (kioskId: number) => KioskState | undefined;
  refreshKiosks: () => Promise<void>;
}

const KioskContext = createContext<KioskContextType | undefined>(undefined);

export const useKiosks = () => {
  const context = useContext(KioskContext);
  if (context === undefined) {
    throw new Error('useKiosks must be used within a KioskProvider');
  }
  return context;
};

export const KioskProvider = ({ children }: { children: React.ReactNode }) => {
  const [kiosks, setKiosks] = useState<KioskState[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchKiosks = async () => {
    try {
      const { data, error } = await supabase
        .from('kiosks')
        .select('*')
        .order('id');

      if (error) {
        console.error('Error fetching kiosks:', error);
        return;
      }

      const kioskData: KioskState[] = data.map((k: any) => ({
        id: k.id,
        name: k.name,
        location: k.location,
        isActive: k.is_active,
        currentStudentId: k.current_student_id,
        currentBehaviorRequestId: k.current_behavior_request_id,
        activatedAt: k.activated_at ? new Date(k.activated_at) : undefined,
        activatedBy: k.activated_by,
      }));

      setKiosks(kioskData);
    } catch (error) {
      console.error('Error in fetchKiosks:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Only fetch kiosks when user is authenticated
    if (!user) {
      setLoading(false);
      return;
    }

    fetchKiosks();

    // Set up real-time subscription for kiosks
    const channel = supabase
      .channel('kiosks-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'kiosks'
        },
        () => {
          fetchKiosks();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const activateKiosk = async (kioskId?: number): Promise<number | null> => {
    try {
      
      // CRITICAL FIX: Skip local validation - go straight to database
      // Previous code failed because local kiosks array was empty due to RLS
      if (!kioskId) {
        // If no specific kiosk requested, try to activate kiosk 1 by default
        kioskId = 1;
        
      }

      

      const { data, error } = await supabase
        .from('kiosks')
        .update({
          is_active: true,
          activated_at: new Date().toISOString(),
          activated_by: user?.id
        })
        .eq('id', kioskId)
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to activate kiosk: ${error.message}`);
      }
      
      // NEW: Assign waiting students to newly activated kiosk
      try {
        await supabase.rpc('assign_waiting_students_to_kiosk', {
          p_kiosk_id: kioskId
        });
      } catch (assignError) {
        // Don't fail the activation if student assignment fails
        // Don't fail the activation if student assignment fails
      }
      
      return kioskId;
    } catch (error) {
      throw error;
    }
  };

  const deactivateKiosk = async (kioskId: number): Promise<void> => {
    try {

      const { data, error } = await supabase
        .from('kiosks')
        .update({
          is_active: false,
          current_student_id: null,
          current_behavior_request_id: null,
          activated_at: null,
          activated_by: null
        })
        .eq('id', kioskId)
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to deactivate kiosk: ${error.message}`);
      }
      
      // Refresh kiosks data to update UI - same pattern as clearQueue
      await refreshKiosks();
    } catch (error) {
      throw error;
    }
  };

  const deactivateAllKiosks = async (): Promise<void> => {
    try {

      const { data, error } = await supabase
        .from('kiosks')
        .update({
          is_active: false,
          current_student_id: null,
          current_behavior_request_id: null,
          activated_at: null,
          activated_by: null
        })
        .eq('is_active', true)
        .select();

      if (error) {
        throw new Error(`Failed to deactivate all kiosks: ${error.message}`);
      }
      
      // Refresh kiosks data to update UI - same pattern as individual deactivateKiosk
      await refreshKiosks();
    } catch (error) {
      throw error;
    }
  };

  const updateKioskStudent = async (kioskId: number, studentId?: string, behaviorRequestId?: string): Promise<void> => {
    try {
      const { error } = await supabase
        .from('kiosks')
        .update({
          current_student_id: studentId || null,
          current_behavior_request_id: behaviorRequestId || null
        })
        .eq('id', kioskId);

      if (error) {
        console.error('Error updating kiosk student:', error);
      }
    } catch (error) {
      console.error('Error in updateKioskStudent:', error);
    }
  };

  const getKioskById = (kioskId: number): KioskState | undefined => {
    return kiosks.find(k => k.id === kioskId);
  };

  const refreshKiosks = async (): Promise<void> => {
    await fetchKiosks();
  };

  const activeKioskCount = kiosks.filter(k => k.isActive).length;

  const value = {
    kiosks,
    activeKioskCount,
    loading,
    activateKiosk,
    deactivateKiosk,
    deactivateAllKiosks,
    updateKioskStudent,
    getKioskById,
    refreshKiosks,
  };

  return <KioskContext.Provider value={value}>{children}</KioskContext.Provider>;
};