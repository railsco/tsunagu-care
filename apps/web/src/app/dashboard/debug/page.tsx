import { getCareManager, createClient } from '@/lib/supabase/server';
import { AlertTriangle, Database, CheckCircle2 } from 'lucide-react';
import { notFound } from 'next/navigation';
import DebugForms from './DebugForms';

export default async function DebugPage() {
  if (process.env.NODE_ENV !== 'development') {
    notFound();
  }

  const careManager = await getCareManager();

  if (!careManager) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <AlertTriangle className="h-12 w-12 text-amber-500" />
        <p className="text-gray-600">ケアマネージャー情報が取得できません</p>
        <p className="text-sm text-gray-500">ログアウトして再度ログインしてください</p>
      </div>
    );
  }

  // サーバーサイドでデータ取得
  const supabase = await createClient();

  const { data: careReceivers, error: receiversError } = await supabase
    .from('care_receivers')
    .select('id, name, care_level')
    .eq('care_manager_id', careManager.id)
    .eq('is_active', true)
    .order('name');

  const { data: dailyLogs, error: logsError } = await supabase
    .from('daily_logs')
    .select('id, care_receiver_id, log_date, mood, appetite, sleep_quality, activity_level, notes')
    .order('created_at', { ascending: false })
    .limit(5);

  const { data: feedbacks, error: feedbacksError } = await supabase
    .from('feedbacks')
    .select('id, care_receiver_id, category, content, is_anonymous, status, created_at')
    .order('created_at', { ascending: false })
    .limit(5);

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Database className="h-8 w-8 text-teal-600" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">デバッグページ</h1>
          <p className="text-sm text-gray-500">サーバーサイドレンダリング版（本番前に削除）</p>
        </div>
      </div>

      {/* ケアマネ情報 */}
      <div className="bg-white border rounded-lg p-4">
        <h2 className="font-semibold text-lg mb-3 flex items-center gap-2">
          <CheckCircle2 className="h-5 w-5 text-green-500" />
          ケアマネージャー情報
        </h2>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div><span className="text-gray-500">ID:</span> {careManager.id}</div>
          <div><span className="text-gray-500">名前:</span> {careManager.name}</div>
          <div><span className="text-gray-500">Email:</span> {careManager.email}</div>
        </div>
      </div>

      {/* 担当利用者 */}
      <div className="bg-white border rounded-lg p-4">
        <h2 className="font-semibold text-lg mb-3">
          担当利用者 ({careReceivers?.length || 0}名)
        </h2>
        {receiversError ? (
          <p className="text-red-500 text-sm">エラー: {receiversError.message}</p>
        ) : careReceivers && careReceivers.length > 0 ? (
          <ul className="space-y-2">
            {careReceivers.map((r: any) => (
              <li key={r.id} className="flex justify-between text-sm bg-gray-50 p-2 rounded">
                <span>{r.name}</span>
                <span className="text-gray-500">{r.care_level || '未設定'}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500 text-sm">利用者なし</p>
        )}
      </div>

      {/* データ作成フォーム */}
      {careReceivers && careReceivers.length > 0 && (
        <DebugForms
          careReceivers={careReceivers}
          careManagerId={careManager.id}
        />
      )}

      {/* 最新の日記 */}
      <div className="bg-white border rounded-lg p-4">
        <h2 className="font-semibold text-lg mb-3">最新の日記データ（5件）</h2>
        {logsError ? (
          <p className="text-red-500 text-sm">エラー: {logsError.message}</p>
        ) : dailyLogs && dailyLogs.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left">
                  <th className="py-2 px-2">日付</th>
                  <th className="py-2 px-2">気分</th>
                  <th className="py-2 px-2">食欲</th>
                  <th className="py-2 px-2">睡眠</th>
                  <th className="py-2 px-2">活動</th>
                </tr>
              </thead>
              <tbody>
                {dailyLogs.map((log: any) => (
                  <tr key={log.id} className="border-b">
                    <td className="py-2 px-2">{log.log_date}</td>
                    <td className="py-2 px-2">{log.mood ?? '-'}</td>
                    <td className="py-2 px-2">{log.appetite ?? '-'}</td>
                    <td className="py-2 px-2">{log.sleep_quality ?? '-'}</td>
                    <td className="py-2 px-2">{log.activity_level ?? '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500 text-sm">データなし</p>
        )}
      </div>

      {/* 最新のフィードバック */}
      <div className="bg-white border rounded-lg p-4">
        <h2 className="font-semibold text-lg mb-3">最新のフィードバック（5件）</h2>
        {feedbacksError ? (
          <p className="text-red-500 text-sm">エラー: {feedbacksError.message}</p>
        ) : feedbacks && feedbacks.length > 0 ? (
          <div className="space-y-2">
            {feedbacks.map((fb: any) => (
              <div key={fb.id} className="bg-gray-50 p-3 rounded text-sm">
                <div className="flex justify-between mb-1">
                  <span className="font-medium">{fb.category}</span>
                  <span className={`px-2 py-0.5 rounded text-xs ${
                    fb.status === 'unread' ? 'bg-red-100 text-red-700' :
                    fb.status === 'read' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-green-100 text-green-700'
                  }`}>
                    {fb.status}
                  </span>
                </div>
                <p className="text-gray-600">{fb.content.slice(0, 50)}...</p>
                <p className="text-xs text-gray-400 mt-1">
                  {fb.created_at.slice(0, 10)} | {fb.is_anonymous ? '匿名' : '記名'}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-sm">データなし</p>
        )}
      </div>

      {/* デバッグ情報 */}
      <div className="bg-gray-100 border rounded-lg p-4 text-xs">
        <h3 className="font-semibold mb-2">デバッグ情報</h3>
        <p>care_manager.id: {careManager.id}</p>
        <p>care_receivers count: {careReceivers?.length || 0}</p>
        <p>daily_logs count: {dailyLogs?.length || 0}</p>
        <p>feedbacks count: {feedbacks?.length || 0}</p>
      </div>
    </div>
  );
}
