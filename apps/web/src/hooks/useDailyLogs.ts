'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { DailyLogWithRelations } from '@tsunagu-care/shared';

interface UseDailyLogsOptions {
  careReceiverId: string;
  startDate?: string;
  endDate?: string;
  limit?: number;
}

export function useDailyLogs(options: UseDailyLogsOptions) {
  const { careReceiverId, startDate, endDate, limit = 30 } = options;
  const [logs, setLogs] = useState<DailyLogWithRelations[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchLogs = async () => {
      setIsLoading(true);
      const supabase = createClient();

      try {
        let query = supabase
          .from('daily_logs')
          .select(`
            *,
            family_member:family_members (
              id,
              name,
              relation
            )
          `)
          .eq('care_receiver_id', careReceiverId)
          .order('log_date', { ascending: false })
          .limit(limit);

        if (startDate) {
          query = query.gte('log_date', startDate);
        }
        if (endDate) {
          query = query.lte('log_date', endDate);
        }

        const { data, error } = await query;

        if (error) throw error;

        setLogs(data as unknown as DailyLogWithRelations[]);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchLogs();
  }, [careReceiverId, startDate, endDate, limit]);

  return { logs, isLoading, error };
}

export function useLatestDailyLog(careReceiverId: string) {
  const [log, setLog] = useState<DailyLogWithRelations | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchLog = async () => {
      setIsLoading(true);
      const supabase = createClient();

      try {
        const { data, error } = await supabase
          .from('daily_logs')
          .select(`
            *,
            family_member:family_members (
              id,
              name,
              relation
            )
          `)
          .eq('care_receiver_id', careReceiverId)
          .order('log_date', { ascending: false })
          .limit(1)
          .single();

        if (error && error.code !== 'PGRST116') throw error;

        setLog(data as DailyLogWithRelations | null);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchLog();
  }, [careReceiverId]);

  return { log, isLoading, error };
}
