import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from './useAuth';
import type { DailyLog, Feedback, FeedbackCategory } from '@tsunagu-care/shared';

export function useCareReceiver() {
  const { familyMember, careReceiver } = useAuth();
  const [recentLogs, setRecentLogs] = useState<DailyLog[]>([]);
  const [isLoadingLogs, setIsLoadingLogs] = useState(false);

  const fetchRecentLogs = useCallback(async () => {
    if (!careReceiver?.id) return;

    setIsLoadingLogs(true);
    try {
      // パフォーマンス最適化: 必要なカラムのみ取得
      const { data, error } = await supabase
        .from('daily_logs')
        .select('id, care_receiver_id, family_member_id, log_date, mood, appetite, sleep_quality, activity_level, notes, concerns, photo_urls, created_at, updated_at')
        .eq('care_receiver_id', careReceiver.id)
        .order('log_date', { ascending: false })
        .limit(10);

      if (error) throw error;
      setRecentLogs(data || []);
    } catch (error) {
      console.error('Failed to fetch logs:', error);
    } finally {
      setIsLoadingLogs(false);
    }
  }, [careReceiver?.id]);

  useEffect(() => {
    fetchRecentLogs();
  }, [fetchRecentLogs]);

  const createLog = useCallback(async (logData: Omit<DailyLog, 'id' | 'created_at' | 'updated_at'>) => {
    if (!careReceiver?.id || !familyMember?.id) {
      throw new Error('利用者または家族メンバー情報が見つかりません');
    }

    const { data, error } = await supabase
      .from('daily_logs')
      .insert({
        ...logData,
        care_receiver_id: careReceiver.id,
        family_member_id: familyMember.id,
      })
      .select('id, log_date, mood, appetite, sleep_quality, activity_level')
      .single();

    if (error) throw error;
    
    // リストを更新
    await fetchRecentLogs();
    
    return data;
  }, [careReceiver?.id, familyMember?.id, fetchRecentLogs]);

  const createFeedback = useCallback(async (feedbackData: {
    category: FeedbackCategory;
    content: string;
    is_anonymous: boolean;
  }) => {
    if (!careReceiver?.id || !familyMember?.id) {
      throw new Error('利用者または家族メンバー情報が見つかりません');
    }

    const { data, error } = await supabase
      .from('feedbacks')
      .insert({
        care_receiver_id: careReceiver.id,
        family_member_id: familyMember.id,
        category: feedbackData.category,
        content: feedbackData.content,
        is_anonymous: feedbackData.is_anonymous,
        status: 'unread' as const,
      })
      .select('id, category, content, is_anonymous, status, created_at')
      .single();

    if (error) throw error;
    return data;
  }, [careReceiver?.id, familyMember?.id]);

  return {
    careReceiver,
    familyMember,
    recentLogs,
    isLoadingLogs,
    fetchRecentLogs,
    createLog,
    createFeedback,
  };
}
