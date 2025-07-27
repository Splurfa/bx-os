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
      console.log('🚀 ATTEMPTING KIOSK ACTIVATION:', { 
        kioskId, 
        userId: user?.id, 
        localKiosksCount: kiosks.length,
        timestamp: new Date().toISOString()
      });
      
      // CRITICAL FIX: Skip local validation - go straight to database
      // Previous code failed because local kiosks array was empty due to RLS
      if (!kioskId) {
        // If no specific kiosk requested, try to activate kiosk 1 by default
        kioskId = 1;
        console.log('⚡ No kiosk ID provided, defaulting to kiosk 1');
      }

      console.log('💾 WRITING TO DATABASE - Kiosk ID:', kioskId);

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
        console.error('❌ DATABASE ERROR:', error);
        throw new Error(`Failed to activate kiosk: ${error.message}`);
      }

      console.log('✅ KIOSK ACTIVATED SUCCESSFULLY:', data);
      console.log('🔍 Database response shows is_active:', data.is_active);
      return kioskId;
    } catch (error) {
      console.error('💥 ACTIVATION ERROR:', error);
      throw error;
    }
  };

  const deactivateKiosk = async (kioskId: number): Promise<void> => {
    try {
      console.log('🔄 INDIVIDUAL KIOSK DEACTIVATION - START:', { 
        kioskId, 
        userId: user?.id, 
        timestamp: new Date().toISOString()
      });

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
        console.error('❌ DEACTIVATION DATABASE ERROR:', error);
        throw new Error(`Failed to deactivate kiosk: ${error.message}`);
      }

      console.log('✅ INDIVIDUAL KIOSK DEACTIVATED SUCCESSFULLY:', data);
      console.log('🔍 Database response shows is_active:', data.is_active);
      
      // Refresh kiosks data to update UI - same pattern as clearQueue
      await refreshKiosks();
    } catch (error) {
      console.error('💥 DEACTIVATION ERROR:', error);
      throw error;
    }
  };

  const deactivateAllKiosks = async (): Promise<void> => {
    try {
      console.log('🔄 ATTEMPTING ALL KIOSKS DEACTIVATION:', { 
        userId: user?.id, 
        timestamp: new Date().toISOString()
      });

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
        console.error('❌ DEACTIVATE ALL DATABASE ERROR:', error);
        throw new Error(`Failed to deactivate all kiosks: ${error.message}`);
      }

      console.log('✅ ALL KIOSKS DEACTIVATED SUCCESSFULLY:', data);
      
      // Refresh kiosks data to update UI - same pattern as individual deactivateKiosk
      await refreshKiosks();
    } catch (error) {
      console.error('💥 DEACTIVATE ALL ERROR:', error);
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