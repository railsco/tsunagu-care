'use server';

import { createClient, getCareManager } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function createDailyLog(formData: {
  careReceiverId: string;
  mood: number;
  appetite: number;
  sleepQuality: number;
  activityLevel: number;
  notes: string;
}) {
  const careManager = await getCareManager();
  if (!careManager) {
    return { success: false, error: 'ケアマネージャー情報が取得できません' };
  }

  const supabase = await createClient();

  // 利用者がこのケアマネに属しているか確認
  const { data: receiver, error: receiverError } = await supabase
    .from('care_receivers')
    .select('id')
    .eq('id', formData.careReceiverId)
    .eq('care_manager_id', careManager.id)
    .single();

  if (receiverError || !receiver) {
    return { success: false, error: '指定された利用者はこのケアマネージャーに属していません' };
  }

  const today = new Date().toISOString().split('T')[0];

  try {
    const { data, error } = await supabase
      .from('daily_logs')
      .insert({
        care_receiver_id: formData.careReceiverId,
        log_date: today,
        mood: formData.mood,
        appetite: formData.appetite,
        sleep_quality: formData.sleepQuality,
        activity_level: formData.activityLevel,
        notes: formData.notes,
      } as any)
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        // 既存レコードを更新
        const { error: updateError } = await supabase
          .from('daily_logs')
          .update({
            mood: formData.mood,
            appetite: formData.appetite,
            sleep_quality: formData.sleepQuality,
            activity_level: formData.activityLevel,
            notes: formData.notes,
          } as any)
          .eq('care_receiver_id', formData.careReceiverId)
          .eq('log_date', today);

        if (updateError) throw updateError;
        revalidatePath('/dashboard/debug');
        return { success: true, message: '既存の日記を更新しました' };
      }
      throw error;
    }

    revalidatePath('/dashboard/debug');
    return { success: true, message: `日記を作成しました (ID: ${data.id.slice(0, 8)}...)` };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function createFeedback(formData: {
  careReceiverId: string;
  category: string;
  content: string;
  isAnonymous: boolean;
}) {
  const careManager = await getCareManager();
  if (!careManager) {
    return { success: false, error: 'ケアマネージャー情報が取得できません' };
  }

  const supabase = await createClient();

  // 利用者がこのケアマネに属しているか確認
  const { data: receiver, error: receiverError } = await supabase
    .from('care_receivers')
    .select('id')
    .eq('id', formData.careReceiverId)
    .eq('care_manager_id', careManager.id)
    .single();

  if (receiverError || !receiver) {
    return { success: false, error: '指定された利用者はこのケアマネージャーに属していません' };
  }

  try {
    // NOTE: family_member_id is not available in debug actions.
    // The insert relies on the column being nullable or having a default value.
    const { data, error } = await supabase
      .from('feedbacks')
      .insert({
        care_receiver_id: formData.careReceiverId,
        category: formData.category,
        content: formData.content,
        is_anonymous: formData.isAnonymous,
        status: 'unread',
      } as any)
      .select()
      .single();

    if (error) throw error;

    revalidatePath('/dashboard/debug');
    return { success: true, message: `フィードバックを作成しました (ID: ${data.id.slice(0, 8)}...)` };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}
