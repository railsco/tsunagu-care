import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getCareManager, createClient } from '@/lib/supabase/server';
import { AverageScoreChart, type DailyAverage } from '@/components/stats/AverageScoreChart';
import { formatDate } from '@/lib/utils';
import {
  feedbackCategoryLabels,
  feedbackStatusLabels,
  FEEDBACK_CATEGORIES,
  FEEDBACK_STATUSES,
  getCareLevelGroup,
} from '@tsunagu-care/shared';
import type { FeedbackCategoryType, FeedbackStatusType, ScoreValue } from '@tsunagu-care/shared';

const DAYS_CHART = 30;
const DAYS_RECENT = 7;

interface ReceiverStat {
  id: string;
  name: string;
  care_level: string | null;
  logDays7: number;
  avgMood7: number | null;
  lastLogDate: string | null;
}

function isoDaysAgo(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().slice(0, 10);
}

function average(values: number[]): number | null {
  if (values.length === 0) return null;
  return Math.round((values.reduce((a, b) => a + b, 0) / values.length) * 10) / 10;
}

async function getStats(careManagerId: string) {
  const supabase = await createClient();

  const { data: receivers } = await supabase
    .from('care_receivers')
    .select('id, name, care_level')
    .eq('care_manager_id', careManagerId)
    .eq('is_active', true)
    .order('name');

  if (!receivers || receivers.length === 0) {
    return null;
  }

  const receiverIds = receivers.map((r) => r.id);
  const since30 = isoDaysAgo(DAYS_CHART);
  const since7 = isoDaysAgo(DAYS_RECENT);

  const [{ data: logs }, { data: feedbacks }] = await Promise.all([
    supabase
      .from('daily_logs')
      .select('care_receiver_id, log_date, mood, appetite, sleep_quality, activity_level')
      .in('care_receiver_id', receiverIds)
      .gte('log_date', since30)
      .order('log_date'),
    supabase
      .from('feedbacks')
      .select('status, category')
      .in('care_receiver_id', receiverIds),
  ]);

  // 日次平均（30日）
  const byDate = new Map<string, NonNullable<typeof logs>>();
  for (const log of logs ?? []) {
    const list = byDate.get(log.log_date) ?? [];
    list.push(log);
    byDate.set(log.log_date, list);
  }
  const dailyAverages: DailyAverage[] = [...byDate.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, dayLogs]) => ({
      date: formatDate(date, 'M/d'),
      fullDate: formatDate(date, 'yyyy年M月d日'),
      気分: average(dayLogs.map((l) => l.mood).filter((v): v is ScoreValue => v != null)),
      食欲: average(dayLogs.map((l) => l.appetite).filter((v): v is ScoreValue => v != null)),
      睡眠: average(dayLogs.map((l) => l.sleep_quality).filter((v): v is ScoreValue => v != null)),
      活動: average(dayLogs.map((l) => l.activity_level).filter((v): v is ScoreValue => v != null)),
    }));

  // 利用者別の直近7日状況
  const receiverStats: ReceiverStat[] = receivers.map((receiver) => {
    const ownLogs = (logs ?? []).filter((l) => l.care_receiver_id === receiver.id);
    const recent = ownLogs.filter((l) => l.log_date >= since7);
    const lastLogDate = ownLogs.length > 0 ? ownLogs[ownLogs.length - 1].log_date : null;
    return {
      id: receiver.id,
      name: receiver.name,
      care_level: receiver.care_level,
      logDays7: new Set(recent.map((l) => l.log_date)).size,
      avgMood7: average(recent.map((l) => l.mood).filter((v): v is ScoreValue => v != null)),
      lastLogDate,
    };
  });

  // フィードバック内訳
  const statusCounts = {} as Record<FeedbackStatusType, number>;
  for (const status of FEEDBACK_STATUSES) statusCounts[status] = 0;
  const categoryCounts = {} as Record<FeedbackCategoryType, number>;
  for (const category of FEEDBACK_CATEGORIES) categoryCounts[category] = 0;
  for (const fb of feedbacks ?? []) {
    statusCounts[fb.status as FeedbackStatusType] += 1;
    categoryCounts[fb.category as FeedbackCategoryType] += 1;
  }

  const postRate =
    Math.round((receiverStats.filter((r) => r.logDays7 > 0).length / receivers.length) * 100);

  return {
    receiverCount: receivers.length,
    postRate,
    unreadCount: statusCounts.unread,
    avgMood7: average(
      (logs ?? [])
        .filter((l) => l.log_date >= since7)
        .map((l) => l.mood)
        .filter((v): v is ScoreValue => v != null)
    ),
    dailyAverages,
    receiverStats,
    statusCounts,
    categoryCounts,
    feedbackTotal: (feedbacks ?? []).length,
  };
}

function careLevelBadgeClass(careLevel: string | null): string {
  switch (getCareLevelGroup(careLevel)) {
    case 'support':
      return 'bg-green-100 text-green-700';
    case 'care1-2':
      return 'bg-yellow-100 text-yellow-700';
    case 'care3-5':
      return 'bg-red-100 text-red-700';
    default:
      return 'bg-gray-100 text-gray-600';
  }
}

export default async function StatsPage() {
  const careManager = await getCareManager();

  if (!careManager) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">ケアマネージャー情報が見つかりません</p>
      </div>
    );
  }

  const stats = await getStats(careManager.id);

  if (!stats) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">統計</h1>
        <p className="text-gray-500">担当利用者がまだ登録されていません</p>
      </div>
    );
  }

  const summaryCards = [
    { label: '担当利用者', value: `${stats.receiverCount}名` },
    { label: `記録投稿率（直近${DAYS_RECENT}日）`, value: `${stats.postRate}%` },
    { label: '未読フィードバック', value: `${stats.unreadCount}件` },
    {
      label: `平均気分スコア（直近${DAYS_RECENT}日）`,
      value: stats.avgMood7 != null ? `${stats.avgMood7}/5` : '—',
    },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">統計</h1>

      {/* サマリーカード */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        {summaryCards.map((card) => (
          <Card key={card.label} className="bg-white">
            <CardContent className="pt-6">
              <p className="text-sm text-gray-500">{card.label}</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{card.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 平均スコア推移 */}
      <AverageScoreChart
        data={stats.dailyAverages}
        title={`全利用者の平均スコア推移（過去${DAYS_CHART}日）`}
      />

      <div className="grid gap-6 lg:grid-cols-2">
        {/* フィードバック内訳 */}
        <Card className="bg-white">
          <CardHeader>
            <CardTitle className="text-lg">
              💬 フィードバック内訳（累計{stats.feedbackTotal}件）
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div>
              <p className="text-sm text-gray-500 mb-2">対応状況</p>
              <div className="flex flex-wrap gap-2">
                {FEEDBACK_STATUSES.map((status) => (
                  <Badge key={status} variant="outline" className="text-sm px-3 py-1">
                    {feedbackStatusLabels[status]}: {stats.statusCounts[status]}件
                  </Badge>
                ))}
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-2">カテゴリ別</p>
              <div className="space-y-2">
                {FEEDBACK_CATEGORIES.map((category) => {
                  const count = stats.categoryCounts[category];
                  const percent =
                    stats.feedbackTotal > 0 ? (count / stats.feedbackTotal) * 100 : 0;
                  return (
                    <div key={category} className="flex items-center gap-3 text-sm">
                      <span className="w-28 text-gray-700">
                        {feedbackCategoryLabels[category]}
                      </span>
                      <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-teal-500 rounded-full"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                      <span className="w-10 text-right text-gray-600">{count}件</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 利用者別の記録状況 */}
        <Card className="bg-white">
          <CardHeader>
            <CardTitle className="text-lg">
              📝 利用者別の記録状況（直近{DAYS_RECENT}日）
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.receiverStats.map((receiver) => (
                <Link
                  key={receiver.id}
                  href={`/dashboard/receivers/${receiver.id}`}
                  className="flex items-center justify-between p-3 rounded-lg border hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="font-medium text-gray-900">{receiver.name}</span>
                    {receiver.care_level && (
                      <span
                        className={`px-2 py-0.5 rounded text-xs font-medium ${careLevelBadgeClass(receiver.care_level)}`}
                      >
                        {receiver.care_level}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span>記録 {receiver.logDays7}/{DAYS_RECENT}日</span>
                    <span>
                      気分 {receiver.avgMood7 != null ? `${receiver.avgMood7}/5` : '—'}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
