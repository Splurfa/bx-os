
import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import AppHeader from "./AppHeader";
import EmptyState from "./EmptyState";
import FloatingActionButton from "./FloatingActionButton";
import QueueDisplay from "./QueueDisplay";
import BSRModal from "./BSRModal";
import ReviewReflection from "./ReviewReflection";
import { Loader2 } from "lucide-react";
import { useSupabaseQueue } from "../hooks/useSupabaseQueue";
import { useProfile } from '@/hooks/useProfile';
import { useEffect } from 'react';

const TeacherDashboard = () => {
  const navigate = useNavigate();
  const { signOut, user } = useAuth();
  const { profile } = useProfile();

  // Defensive role checking - ensure user has access to teacher dashboard
  useEffect(() => {
    if (profile && user) {
      if (profile.role !== 'teacher' && profile.role !== 'admin' && profile.role !== 'super_admin') {
        console.warn('🚫 Unauthorized user detected on teacher dashboard, redirecting:', profile.role);
        navigate('/auth', { replace: true });
      } else if (profile.role === 'admin' || profile.role === 'super_admin') {
        // Admin users accessing teacher dashboard - this is allowed but log it
        console.log('ℹ️ Admin user accessing teacher dashboard:', profile.role);
      }
    }
  }, [profile, user, navigate]);
  
  const [showBSRModal, setShowBSRModal] = useState(false);
  const [selectedReflection, setSelectedReflection] = useState(null);
  const studentSelectionRefreshRef = useRef<(() => void) | null>(null);
  const { 
    items, 
    loading, 
    addToQueue, 
    approveReflection, 
    requestRevision, 
    formatTimeElapsed 
  } = useSupabaseQueue();

  const openBSRModal = () => {
    setShowBSRModal(true);
  };

  const closeBSRModal = () => {
    setShowBSRModal(false);
  };

  const handleBSRSubmit = async (data: any) => {
    await addToQueue({
      student: data.student,
      behaviors: data.behaviors,
      mood: String(data.mood),
      urgent: data.urgent,
      notes: data.notes
    });
    
    // Immediately refresh student selection to exclude the newly submitted student
    if (studentSelectionRefreshRef.current) {
      studentSelectionRefreshRef.current();
    }
    
    setShowBSRModal(false);
  };

  const handleSelectReflection = (item: any) => {
    setSelectedReflection(item);
  };

  const handleApproveReflection = async () => {
    if (selectedReflection) {
      await approveReflection(selectedReflection.id);
      setSelectedReflection(null);
    }
  };

  const handleRequestRevision = async (feedback: string) => {
    if (selectedReflection) {
      await requestRevision(selectedReflection.id, feedback);
      setSelectedReflection(null);
    }
  };

  // Show reflection review if selected
  if (selectedReflection) {
    return (
      <ReviewReflection
        item={selectedReflection}
        onApprove={handleApproveReflection}
        onRequestRevision={handleRequestRevision}
        onBack={() => setSelectedReflection(null)}
      />
    );
  }

  return (
    <div className="h-screen bg-background flex flex-col overflow-hidden">
      <AppHeader />
      
      <main className="flex-1 overflow-hidden spacing-page flex items-center justify-center">
        {loading ? (
          <div className="flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : items.length > 0 ? (
          <div className="w-full h-full overflow-auto">
            <QueueDisplay
              items={items}
              onSelectReflection={handleSelectReflection}
              formatTimeElapsed={formatTimeElapsed}
              showReviewButtons={true}
              layout="teacher"
            />
          </div>
        ) : (
          <EmptyState />
        )}
      </main>
      
      <FloatingActionButton onClick={openBSRModal} />

      <BSRModal
        isOpen={showBSRModal}
        onClose={closeBSRModal}
        onSubmit={handleBSRSubmit}
        studentSelectionRefreshRef={studentSelectionRefreshRef}
      />
    </div>
  );
};

export default TeacherDashboard;
