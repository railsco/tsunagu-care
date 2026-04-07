'use client';

import { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { FeedbackWithRelations, FeedbackStatusType } from '@tsunagu-care/shared';

interface UseFeedbacksOptions {
  careReceiverId?: string;
  status?: FeedbackStatusType;
  limit?: number;
}

export function useFeedbacks(options: UseFeedbacksOptions = {}) {
  const { careReceiverId, status, limit = 50 } = options;
  const [feedbacks, setFeedbacks] = useState<FeedbackWithRelations[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchFeedbacks = useCallback(async () => {
    setIsLoading(true);
    const supabase = createClient();

    try {
      let query = supabase
        .from('feedbacks')
        .select(`
          *,
          care_receiver:care_receivers (
            id,
            name
          ),
          family_member:family_members (
            id,
            name,
            relation
          )
        `)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (careReceiverId) {
        query = query.eq('care_receiver_id', careReceiverId);
      }
      if (status) {
        query = query.eq('status', status);
      }

      const { data, error } = await query;

      if (error) throw error;

      setFeedbacks(data as unknown as FeedbackWithRelations[]);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setIsLoading(false);
    }
  }, [careReceiverId, status, limit]);

  useEffect(() => {
    fetchFeedbacks();
  }, [fetchFeedbacks]);

  const updateStatus = async (feedbackId: string, newStatus: FeedbackStatusType, managerNotes?: string) => {
    const supabase = createClient();

    const updateData: { status: FeedbackStatusType; manager_notes?: string; addressed_at?: string } = {
      status: newStatus,
    };

    if (managerNotes !== undefined) {
      updateData.manager_notes = managerNotes;
    }

    if (newStatus === 'addressed') {
      updateData.addressed_at = new Date().toISOString();
    }

    const { error } = await supabase
      .from('feedbacks')
      .update(updateData)
      .eq('id', feedbackId);

    if (error) {
      setError(new Error(error.message));
      return;
    }

    // ローカル状態を更新
    setFeedbacks((prev) =>
      prev.map((fb) =>
        fb.id === feedbackId
          ? {
              ...fb,
              status: newStatus,
              manager_notes: managerNotes ?? fb.manager_notes,
              ...(newStatus === 'addressed' ? { addressed_at: new Date().toISOString() } : {}),
            }
          : fb
      )
    );
  };

  const unreadCount = feedbacks.filter((fb) => fb.status === 'unread').length;

  return { feedbacks, isLoading, error, refetch: fetchFeedbacks, updateStatus, unreadCount };
}
