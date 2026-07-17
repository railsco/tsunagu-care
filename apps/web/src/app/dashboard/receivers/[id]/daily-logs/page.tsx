import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase/server';
import { LogTimeline } from '@/components/daily-log/LogTimeline';
import { MoodChart } from '@/components/daily-log/MoodChart';
import type { CareReceiver, DailyLogWithRelations } from '@tsunagu-care/shared';

interface PageProps {
  params: Promise<{ id: string }>;
}

async function getReceiver(id: string): Promise<CareReceiver | null> {
  const supabase = await createClient();

  const { data } = await supabase
    .from('care_receivers')
    .select('*')
    .eq('id', id)
    .single();

  return data;
}

async function getDailyLogs(careReceiverId: string): Promise<DailyLogWithRelations[]> {
  const supabase = await createClient();

  const { data } = await supabase
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
    .limit(30);

  return data || [];
}

export default async function DailyLogsPage({ params }: PageProps) {
  const { id } = await params;
  const [receiver, logs] = await Promise.all([
    getReceiver(id),
    getDailyLogs(id),
  ]);

  if (!receiver) {
    notFound();
  }

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="flex items-center justify-between">
        <div>
          <Button variant="ghost" size="sm" asChild className="mb-2">
            <Link href={`/dashboard/receivers/${id}`}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              {receiver.name}さんの詳細に戻る
            </Link>
          </Button>
          <h1 className="text-2xl font-bold">日記一覧</h1>
          <p className="text-muted-foreground">{receiver.name}さんの介護記録</p>
        </div>
      </div>

      {/* グラフ */}
      <MoodChart logs={logs} title="過去30日間の状態推移" />

      {/* タイムライン */}
      <div>
        <h2 className="text-lg font-semibold mb-4">記録一覧</h2>
        <LogTimeline logs={logs} />
      </div>
    </div>
  );
}
