import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Calendar, MapPin, Users, Phone, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { createClient } from '@/lib/supabase/server';
import { toFeedbackWithRelations } from '@/lib/feedback';
import { LogTimeline } from '@/components/daily-log/LogTimeline';
import { MoodChart } from '@/components/daily-log/MoodChart';
import { FeedbackSection } from '@/components/feedback/FeedbackSection';
import { calculateAge, formatDate } from '@/lib/utils';
import { GENDER_LABELS, FAMILY_ROLE_LABELS } from '@tsunagu-care/shared';
import type {
  CareReceiverWithRelations,
  DailyLogWithRelations,
  FeedbackWithRelations,
} from '@tsunagu-care/shared';

interface PageProps {
  params: Promise<{ id: string }>;
}

// 要介護度の色を取得
function getCareLevelStyle(careLevel: string | null): string {
  if (!careLevel) return 'bg-gray-100 text-gray-600';

  const level = careLevel.toLowerCase();

  if (level.includes('支援')) {
    return 'bg-green-100 text-green-700';
  }
  if (level.includes('介護1') || level.includes('介護2')) {
    return 'bg-yellow-100 text-yellow-700';
  }
  if (level.includes('介護3') || level.includes('介護4') || level.includes('介護5')) {
    return 'bg-red-100 text-red-700';
  }

  return 'bg-gray-100 text-gray-600';
}

async function getReceiver(id: string): Promise<CareReceiverWithRelations | null> {
  const supabase = await createClient();

  const { data } = await supabase
    .from('care_receivers')
    .select(`
      *,
      family_members (*)
    `)
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

export default async function ReceiverDetailPage({ params }: PageProps) {
  const { id } = await params;
  const [receiver, logs, feedbacks] = await Promise.all([
    getReceiver(id),
    getDailyLogs(id),
    getFeedbacks(id),
  ]);

  if (!receiver) {
    notFound();
  }

  const age = receiver.birth_date ? calculateAge(receiver.birth_date) : null;
  const primaryFamily = receiver.family_members?.find((m) => m.is_primary);
  const careLevelStyle = getCareLevelStyle(receiver.care_level);

  return (
    <div className="space-y-6">
      {/* 戻るボタン */}
      <div>
        <Button variant="ghost" size="sm" asChild className="text-gray-600 hover:text-gray-900">
          <Link href="/dashboard">
            <ArrowLeft className="h-4 w-4 mr-2" />
            ダッシュボードに戻る
          </Link>
        </Button>
      </div>

      {/* 利用者情報ヘッダー */}
      <Card className="bg-white">
        <CardHeader className="pb-4">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div>
              <CardTitle className="text-2xl font-bold text-gray-900">
                {receiver.name}
              </CardTitle>
              <div className="flex flex-wrap items-center gap-3 mt-2">
                {age && (
                  <span className="text-gray-600">{age}歳</span>
                )}
                {receiver.gender && (
                  <span className="text-gray-600">
                    {GENDER_LABELS[receiver.gender as keyof typeof GENDER_LABELS]}
                  </span>
                )}
                {receiver.care_level && (
                  <span className={`px-2.5 py-0.5 rounded text-sm font-medium ${careLevelStyle}`}>
                    {receiver.care_level}
                  </span>
                )}
              </div>
            </div>

            {/* 主な家族情報 */}
            {primaryFamily && (
              <div className="flex items-center gap-3 p-3 bg-teal-50 rounded-lg">
                <div className="h-10 w-10 rounded-full bg-teal-100 flex items-center justify-center">
                  <Users className="h-5 w-5 text-teal-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">{primaryFamily.name}</p>
                  <p className="text-sm text-gray-600">
                    {primaryFamily.relation}（主介護者）
                  </p>
                </div>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid gap-4 md:grid-cols-2">
            {/* 生年月日 */}
            {receiver.birth_date && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Calendar className="h-4 w-4 text-gray-400" />
                <span>生年月日: {formatDate(receiver.birth_date, 'yyyy年M月d日')}</span>
              </div>
            )}

            {/* 住所 */}
            {receiver.address && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <MapPin className="h-4 w-4 text-gray-400" />
                <span>{receiver.address}</span>
              </div>
            )}

            {/* 疾患リスト */}
            {receiver.conditions && receiver.conditions.length > 0 && (
              <div className="md:col-span-2">
                <div className="flex flex-wrap gap-2">
                  {receiver.conditions.map((condition, i) => (
                    <Badge
                      key={i}
                      variant="outline"
                      className="bg-gray-50 text-gray-700 border-gray-200"
                    >
                      {condition}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* 備考 */}
            {receiver.notes && (
              <div className="md:col-span-2 p-3 bg-gray-50 rounded-lg text-sm text-gray-700">
                {receiver.notes}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* タブコンテンツ */}
      <Tabs defaultValue="timeline" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-grid">
          <TabsTrigger value="timeline" className="gap-1.5">
            <span className="hidden sm:inline">📅</span> タイムライン
          </TabsTrigger>
          <TabsTrigger value="chart" className="gap-1.5">
            <span className="hidden sm:inline">📊</span> スコア推移
          </TabsTrigger>
          <TabsTrigger value="feedback" className="gap-1.5">
            <span className="hidden sm:inline">💬</span> ほんね投函
          </TabsTrigger>
          <TabsTrigger value="family" className="gap-1.5">
            <span className="hidden sm:inline">👨‍👩‍👧</span> 家族情報
          </TabsTrigger>
        </TabsList>

        {/* タイムライン */}
        <TabsContent value="timeline">
          <LogTimeline logs={logs} />
        </TabsContent>

        {/* スコア推移 */}
        <TabsContent value="chart">
          <MoodChart logs={logs} title="過去30日間のスコア推移" />
        </TabsContent>

        {/* ほんね投函 */}
        <TabsContent value="feedback">
          <Card className="bg-white">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                💬 ほんね投函
                {feedbacks.length > 0 && (
                  <Badge variant="secondary">{feedbacks.length}件</Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <FeedbackSection feedbacks={feedbacks} />
            </CardContent>
          </Card>
        </TabsContent>

        {/* 家族情報 */}
        <TabsContent value="family">
          <Card className="bg-white">
            <CardHeader>
              <CardTitle className="text-lg">👨‍👩‍👧 ご家族一覧</CardTitle>
            </CardHeader>
            <CardContent>
              {receiver.family_members && receiver.family_members.length > 0 ? (
                <div className="grid gap-4 md:grid-cols-2">
                  {receiver.family_members.map((member) => (
                    <div
                      key={member.id}
                      className="p-4 border rounded-lg bg-gray-50 space-y-3"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="h-12 w-12 rounded-full bg-teal-100 flex items-center justify-center">
                            <Users className="h-6 w-6 text-teal-600" />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">{member.name}</p>
                            <p className="text-sm text-gray-600">{member.relation}</p>
                          </div>
                        </div>
                        <div className="flex flex-col gap-1 items-end">
                          {member.is_primary && (
                            <Badge className="bg-teal-600 hover:bg-teal-600 text-white">
                              主介護者
                            </Badge>
                          )}
                          <Badge variant="outline" className="text-xs">
                            {FAMILY_ROLE_LABELS[member.role as keyof typeof FAMILY_ROLE_LABELS] || member.role}
                          </Badge>
                        </div>
                      </div>

                      {/* 連絡先 */}
                      <div className="space-y-1.5 text-sm">
                        <div className="flex items-center gap-2 text-gray-600">
                          <Mail className="h-4 w-4 text-gray-400" />
                          <span>{member.email}</span>
                        </div>
                        {member.phone && (
                          <div className="flex items-center gap-2 text-gray-600">
                            <Phone className="h-4 w-4 text-gray-400" />
                            <span>{member.phone}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Users className="h-12 w-12 text-gray-300 mb-4" />
                  <p className="text-gray-500">登録されているご家族がいません</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
