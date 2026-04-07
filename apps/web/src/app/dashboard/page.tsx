import { getCareManager, createClient } from '@/lib/supabase/server';
import { ReceiverList } from '@/components/dashboard/ReceiverList';
import { Badge } from '@/components/ui/badge';

// 利用者データの型（未読フィードバック数付き）
export interface ReceiverWithStats {
  id: string;
  name: string;
  care_level: string | null;
  conditions: string[] | null;
  birth_date: string | null;
  gender: string | null;
  latest_log: {
    log_date: string;
    mood: number | null;
  } | null;
  unread_feedback_count: number;
}

async function getReceiversWithStats(careManagerId: string): Promise<ReceiverWithStats[]> {
  const supabase = await createClient();

  // 利用者一覧を取得
  const { data: receivers } = await supabase
    .from('care_receivers')
    .select('id, name, care_level, conditions, birth_date, gender')
    .eq('care_manager_id', careManagerId)
    .eq('is_active', true)
    .order('name');

  if (!receivers || receivers.length === 0) {
    return [];
  }

  const receiverIds = receivers.map((r) => r.id);

  // 各利用者の最新日記を取得
  const { data: latestLogs } = await supabase
    .from('daily_logs')
    .select('care_receiver_id, log_date, mood')
    .in('care_receiver_id', receiverIds)
    .order('log_date', { ascending: false });

  // 利用者ごとの最新日記をマップ
  const latestLogMap = new Map<string, { log_date: string; mood: number | null }>();
  if (latestLogs) {
    for (const log of latestLogs) {
      if (log.care_receiver_id && !latestLogMap.has(log.care_receiver_id)) {
        latestLogMap.set(log.care_receiver_id, {
          log_date: log.log_date,
          mood: log.mood,
        });
      }
    }
  }

  // 未読フィードバック数を取得
  const { data: feedbackCounts } = await supabase
    .from('feedbacks')
    .select('care_receiver_id')
    .in('care_receiver_id', receiverIds)
    .eq('status', 'unread');

  // 利用者ごとの未読フィードバック数をカウント
  const feedbackCountMap = new Map<string, number>();
  if (feedbackCounts) {
    for (const fb of feedbackCounts) {
      if (fb.care_receiver_id) {
        feedbackCountMap.set(
          fb.care_receiver_id,
          (feedbackCountMap.get(fb.care_receiver_id) || 0) + 1
        );
      }
    }
  }

  // データを結合
  return receivers.map((receiver) => ({
    ...receiver,
    latest_log: latestLogMap.get(receiver.id) || null,
    unread_feedback_count: feedbackCountMap.get(receiver.id) || 0,
  }));
}

export default async function DashboardPage() {
  const careManager = await getCareManager();

  if (!careManager) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">ケアマネージャー情報が見つかりません</p>
      </div>
    );
  }

  const receivers = await getReceiversWithStats(careManager.id);

  return (
    <div className="space-y-6">
      {/* ページタイトル */}
      <div className="flex items-center gap-3">
        <h1 className="text-2xl font-bold text-gray-900">担当利用者一覧</h1>
        <Badge className="bg-teal-600 hover:bg-teal-600 text-white text-sm px-3 py-1">
          {receivers.length}名
        </Badge>
      </div>

      {/* 利用者一覧（検索・フィルター付き） */}
      <ReceiverList receivers={receivers} />
    </div>
  );
}
