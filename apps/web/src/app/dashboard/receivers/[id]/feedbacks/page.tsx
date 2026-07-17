import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase/server';
import { toFeedbackWithRelations } from '@/lib/feedback';
import { FeedbackList } from '@/components/feedback/FeedbackList';
import type { CareReceiver, FeedbackWithRelations } from '@tsunagu-care/shared';

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

async function getFeedbacks(careReceiverId: string): Promise<FeedbackWithRelations[]> {
  const supabase = await createClient();

  // feedbacks_view: 匿名投稿の投稿者情報はデータ層でNULL化される
  const { data } = await supabase
    .from('feedbacks_view')
    .select(`
      *,
      care_receiver:care_receivers (
        id,
        name
      )
    `)
    .eq('care_receiver_id', careReceiverId)
    .order('created_at', { ascending: false });

  return (data || []).map(toFeedbackWithRelations);
}

export default async function ReceiverFeedbacksPage({ params }: PageProps) {
  const { id } = await params;
  const [receiver, feedbacks] = await Promise.all([
    getReceiver(id),
    getFeedbacks(id),
  ]);

  if (!receiver) {
    notFound();
  }

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div>
        <Button variant="ghost" size="sm" asChild className="mb-2">
          <Link href={`/dashboard/receivers/${id}`}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            {receiver.name}さんの詳細に戻る
          </Link>
        </Button>
        <h1 className="text-2xl font-bold">フィードバック一覧</h1>
        <p className="text-muted-foreground">
          {receiver.name}さんに関するご家族からのフィードバック
        </p>
      </div>

      {/* フィードバック一覧 */}
      <FeedbackList feedbacks={feedbacks} />
    </div>
  );
}
