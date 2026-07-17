'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { createClient } from '@/lib/supabase/client';
import { FeedbackList } from './FeedbackList';
import { FeedbackDetailDialog } from './FeedbackDetail';
import type { FeedbackWithRelations, FeedbackStatusType } from '@tsunagu-care/shared';

interface FeedbackSectionProps {
  feedbacks: FeedbackWithRelations[];
}

export function FeedbackSection({ feedbacks: initialFeedbacks }: FeedbackSectionProps) {
  const router = useRouter();
  const [feedbacks, setFeedbacks] = useState(initialFeedbacks);
  const [selectedFeedback, setSelectedFeedback] = useState<FeedbackWithRelations | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleSelectFeedback = useCallback((feedback: FeedbackWithRelations) => {
    setSelectedFeedback(feedback);
    setIsDialogOpen(true);
  }, []);

  const handleCloseDialog = useCallback(() => {
    setIsDialogOpen(false);
    setSelectedFeedback(null);
  }, []);

  const handleUpdateStatus = useCallback(async (
    feedbackId: string,
    status: FeedbackStatusType,
    managerNotes?: string
  ) => {
    const supabase = createClient();

    const updateData: {
      status: FeedbackStatusType;
      manager_notes?: string;
      addressed_at?: string;
    } = {
      status,
    };

    if (managerNotes !== undefined) {
      updateData.manager_notes = managerNotes;
    }

    if (status === 'addressed') {
      updateData.addressed_at = new Date().toISOString();
    }

    const { error } = await supabase
      .from('feedbacks')
      .update(updateData)
      .eq('id', feedbackId);

    if (error) {
      toast.error('フィードバックの更新に失敗しました。時間をおいて再度お試しください');
      throw error;
    }

    // ローカルの状態を更新
    setFeedbacks((prev) =>
      prev.map((f) =>
        f.id === feedbackId
          ? {
              ...f,
              status,
              manager_notes: managerNotes ?? f.manager_notes,
              addressed_at: status === 'addressed' ? new Date().toISOString() : f.addressed_at,
            }
          : f
      )
    );

    // 選択中のフィードバックも更新
    if (selectedFeedback?.id === feedbackId) {
      setSelectedFeedback((prev) =>
        prev
          ? {
              ...prev,
              status,
              manager_notes: managerNotes ?? prev.manager_notes,
              addressed_at: status === 'addressed' ? new Date().toISOString() : prev.addressed_at,
            }
          : null
      );
    }

    // サーバーコンポーネントのデータを再検証
    router.refresh();
  }, [router, selectedFeedback?.id]);

  return (
    <>
      <FeedbackList
        feedbacks={feedbacks}
        onSelect={handleSelectFeedback}
        selectedId={selectedFeedback?.id}
      />

      <FeedbackDetailDialog
        feedback={selectedFeedback}
        isOpen={isDialogOpen}
        onClose={handleCloseDialog}
        onUpdateStatus={handleUpdateStatus}
      />
    </>
  );
}
