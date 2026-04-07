'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { CareReceiverWithRelations } from '@tsunagu-care/shared';

export function useReceivers(careManagerId: string | undefined) {
  const [receivers, setReceivers] = useState<CareReceiverWithRelations[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!careManagerId) {
      setIsLoading(false);
      return;
    }

    const fetchReceivers = async () => {
      setIsLoading(true);
      const supabase = createClient();

      try {
        const { data, error } = await supabase
          .from('care_receivers')
          .select(`
            *,
            daily_logs (
              id,
              log_date,
              mood,
              appetite,
              sleep_quality,
              activity_level,
              concerns
            ),
            family_members (
              id,
              name,
              relation,
              is_primary
            )
          `)
          .eq('care_manager_id', careManagerId)
          .eq('is_active', true)
          .order('name');

        if (error) throw error;

        // daily_logsを日付降順でソート
        const typedData = (data || []) as unknown as CareReceiverWithRelations[];
        const sortedData = typedData.map((receiver) => ({
          ...receiver,
          daily_logs: receiver.daily_logs?.sort(
            (a, b) => new Date(b.log_date).getTime() - new Date(a.log_date).getTime()
          ),
        }));

        setReceivers(sortedData as CareReceiverWithRelations[]);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchReceivers();
  }, [careManagerId]);

  return { receivers, isLoading, error };
}

export function useReceiver(receiverId: string) {
  const [receiver, setReceiver] = useState<CareReceiverWithRelations | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchReceiver = async () => {
      setIsLoading(true);
      const supabase = createClient();

      try {
        const { data, error } = await supabase
          .from('care_receivers')
          .select(`
            *,
            care_manager:care_managers (*),
            family_members (*)
          `)
          .eq('id', receiverId)
          .single();

        if (error) throw error;

        setReceiver(data as unknown as CareReceiverWithRelations);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchReceiver();
  }, [receiverId]);

  return { receiver, isLoading, error };
}
