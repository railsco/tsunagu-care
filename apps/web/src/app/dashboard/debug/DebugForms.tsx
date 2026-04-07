'use client';

import { useState } from 'react';
import { createDailyLog, createFeedback } from './actions';

interface CareReceiver {
  id: string;
  name: string;
  care_level: string | null;
}

interface DebugFormsProps {
  careReceivers: CareReceiver[];
  careManagerId: string;
}

export default function DebugForms({ careReceivers, careManagerId }: DebugFormsProps) {
  // 日記フォーム
  const [selectedReceiverId, setSelectedReceiverId] = useState(careReceivers[0]?.id || '');
  const [mood, setMood] = useState(4);
  const [appetite, setAppetite] = useState(3);
  const [sleepQuality, setSleepQuality] = useState(4);
  const [activityLevel, setActivityLevel] = useState(3);
  const [notes, setNotes] = useState('デバッグテスト - 今日は調子が良いです');
  const [logStatus, setLogStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [logMessage, setLogMessage] = useState('');

  // フィードバックフォーム
  const [fbReceiverId, setFbReceiverId] = useState(careReceivers[0]?.id || '');
  const [fbCategory, setFbCategory] = useState('service');
  const [fbContent, setFbContent] = useState('デバッグテスト - サービスについてのフィードバック');
  const [fbAnonymous, setFbAnonymous] = useState(true);
  const [fbStatus, setFbStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [fbMessage, setFbMessage] = useState('');

  // 日記作成
  const handleCreateDailyLog = async () => {
    if (!selectedReceiverId) {
      setLogMessage('利用者を選択してください');
      setLogStatus('error');
      return;
    }

    setLogStatus('loading');

    const result = await createDailyLog({
      careReceiverId: selectedReceiverId,
      mood,
      appetite,
      sleepQuality,
      activityLevel,
      notes,
    });

    if (result.success) {
      setLogMessage(result.message || '作成しました');
      setLogStatus('success');
    } else {
      setLogMessage(`エラー: ${result.error}`);
      setLogStatus('error');
    }
  };

  // フィードバック作成
  const handleCreateFeedback = async () => {
    if (!fbReceiverId) {
      setFbMessage('利用者を選択してください');
      setFbStatus('error');
      return;
    }

    setFbStatus('loading');

    const result = await createFeedback({
      careReceiverId: fbReceiverId,
      category: fbCategory,
      content: fbContent,
      isAnonymous: fbAnonymous,
    });

    if (result.success) {
      setFbMessage(result.message || '作成しました');
      setFbStatus('success');
    } else {
      setFbMessage(`エラー: ${result.error}`);
      setFbStatus('error');
    }
  };

  const categoryLabels: Record<string, string> = {
    service: 'サービス内容',
    schedule: 'スケジュール',
    cost: '費用・料金',
    communication: 'コミュニケーション',
    other: 'その他',
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* 日記作成フォーム */}
      <div className="bg-white border rounded-lg p-4">
        <h2 className="font-semibold text-lg mb-4 text-blue-700">📝 日記作成テスト</h2>

        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">利用者</label>
            <select
              value={selectedReceiverId}
              onChange={(e) => setSelectedReceiverId(e.target.value)}
              className="w-full px-3 py-2 border rounded-md text-sm"
            >
              {careReceivers.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name} ({r.care_level || '未設定'})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">気分 (1-5)</label>
              <input
                type="number"
                min={1}
                max={5}
                value={mood}
                onChange={(e) => setMood(Number(e.target.value))}
                className="w-full px-3 py-2 border rounded-md text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">食欲 (1-5)</label>
              <input
                type="number"
                min={1}
                max={5}
                value={appetite}
                onChange={(e) => setAppetite(Number(e.target.value))}
                className="w-full px-3 py-2 border rounded-md text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">睡眠 (1-5)</label>
              <input
                type="number"
                min={1}
                max={5}
                value={sleepQuality}
                onChange={(e) => setSleepQuality(Number(e.target.value))}
                className="w-full px-3 py-2 border rounded-md text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">活動 (1-5)</label>
              <input
                type="number"
                min={1}
                max={5}
                value={activityLevel}
                onChange={(e) => setActivityLevel(Number(e.target.value))}
                className="w-full px-3 py-2 border rounded-md text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">メモ</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 border rounded-md text-sm"
              rows={2}
            />
          </div>

          <button
            onClick={handleCreateDailyLog}
            disabled={logStatus === 'loading'}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 text-sm font-medium"
          >
            {logStatus === 'loading' ? '作成中...' : '日記を作成'}
          </button>

          {logMessage && (
            <p className={`text-sm p-2 rounded ${
              logStatus === 'success' ? 'bg-green-50 text-green-700' :
              logStatus === 'error' ? 'bg-red-50 text-red-700' : ''
            }`}>
              {logMessage}
            </p>
          )}
        </div>
      </div>

      {/* フィードバック作成フォーム */}
      <div className="bg-white border rounded-lg p-4">
        <h2 className="font-semibold text-lg mb-4 text-purple-700">💬 フィードバック作成テスト</h2>

        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">利用者</label>
            <select
              value={fbReceiverId}
              onChange={(e) => setFbReceiverId(e.target.value)}
              className="w-full px-3 py-2 border rounded-md text-sm"
            >
              {careReceivers.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name} ({r.care_level || '未設定'})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">カテゴリ</label>
            <select
              value={fbCategory}
              onChange={(e) => setFbCategory(e.target.value)}
              className="w-full px-3 py-2 border rounded-md text-sm"
            >
              {Object.entries(categoryLabels).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">内容</label>
            <textarea
              value={fbContent}
              onChange={(e) => setFbContent(e.target.value)}
              className="w-full px-3 py-2 border rounded-md text-sm"
              rows={3}
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="anonymous"
              checked={fbAnonymous}
              onChange={(e) => setFbAnonymous(e.target.checked)}
              className="rounded"
            />
            <label htmlFor="anonymous" className="text-sm text-gray-700">匿名で投稿</label>
          </div>

          <button
            onClick={handleCreateFeedback}
            disabled={fbStatus === 'loading'}
            className="w-full px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50 text-sm font-medium"
          >
            {fbStatus === 'loading' ? '作成中...' : 'フィードバックを作成'}
          </button>

          {fbMessage && (
            <p className={`text-sm p-2 rounded ${
              fbStatus === 'success' ? 'bg-green-50 text-green-700' :
              fbStatus === 'error' ? 'bg-red-50 text-red-700' : ''
            }`}>
              {fbMessage}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
