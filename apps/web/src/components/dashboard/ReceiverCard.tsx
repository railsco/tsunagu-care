'use client';

import Link from 'next/link';
import { AlertTriangle, MessageSquare } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatRelativeDate } from '@/lib/utils';
import { getCareLevelGroup } from '@tsunagu-care/shared';
import type { ReceiverWithStats } from '@/app/dashboard/page';

interface ReceiverCardProps {
  receiver: ReceiverWithStats;
}

// 要介護度の色を取得
function getCareLevelStyle(careLevel: string | null): { bg: string; text: string } {
  switch (getCareLevelGroup(careLevel)) {
    case 'support':
      return { bg: 'bg-green-100', text: 'text-green-700' };
    case 'care1-2':
      return { bg: 'bg-yellow-100', text: 'text-yellow-700' };
    case 'care3-5':
      return { bg: 'bg-red-100', text: 'text-red-700' };
    default:
      return { bg: 'bg-gray-100', text: 'text-gray-600' };
  }
}

// スコアから絵文字を取得
function getMoodEmoji(mood: number | null): { emoji: string; color: string } {
  if (mood === null) return { emoji: '➖', color: 'text-gray-400' };

  if (mood <= 2) {
    return { emoji: '😟', color: 'text-red-500' };
  }
  if (mood === 3) {
    return { emoji: '😐', color: 'text-yellow-500' };
  }
  return { emoji: '😊', color: 'text-green-500' };
}

// 最終投稿からの日数を計算
function getDaysSinceLog(logDate: string | null): number | null {
  if (!logDate) return null;

  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const log = new Date(logDate);
  log.setHours(0, 0, 0, 0);
  return Math.floor((now.getTime() - log.getTime()) / (1000 * 60 * 60 * 24));
}

export function ReceiverCard({ receiver }: ReceiverCardProps) {
  const careLevelStyle = getCareLevelStyle(receiver.care_level);
  const moodInfo = getMoodEmoji(receiver.latest_log?.mood ?? null);
  const daysSinceLog = getDaysSinceLog(receiver.latest_log?.log_date ?? null);
  const isLogOverdue = daysSinceLog !== null && daysSinceLog >= 3;

  // 表示する疾患（最大2つ）
  const displayConditions = receiver.conditions?.slice(0, 2) || [];

  return (
    <Link href={`/dashboard/receivers/${receiver.id}`}>
      <Card className="p-5 hover:shadow-md transition-shadow cursor-pointer bg-white h-full">
        <div className="space-y-4">
          {/* 上部: 名前とスコア */}
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              {/* 利用者名 */}
              <h3 className="text-lg font-bold text-gray-900">{receiver.name}</h3>

              {/* 要介護度バッジ */}
              {receiver.care_level && (
                <span
                  className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${careLevelStyle.bg} ${careLevelStyle.text}`}
                >
                  {receiver.care_level}
                </span>
              )}
            </div>

            {/* 気分スコア（絵文字表示） */}
            <div className="flex flex-col items-center">
              <span className={`text-2xl ${moodInfo.color}`}>{moodInfo.emoji}</span>
              {receiver.latest_log?.mood != null && (
                <span className="text-xs text-gray-400 mt-0.5">
                  {receiver.latest_log.mood}/5
                </span>
              )}
            </div>
          </div>

          {/* 疾患タグ */}
          {displayConditions.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {displayConditions.map((condition, index) => (
                <Badge
                  key={index}
                  variant="outline"
                  className="text-xs bg-gray-50 text-gray-600 border-gray-200"
                >
                  {condition}
                </Badge>
              ))}
              {receiver.conditions && receiver.conditions.length > 2 && (
                <span className="text-xs text-gray-400">
                  +{receiver.conditions.length - 2}
                </span>
              )}
            </div>
          )}

          {/* 下部: 最終記録日と未読フィードバック */}
          <div className="flex items-center justify-between pt-2 border-t border-gray-100">
            {/* 最終投稿日 */}
            <div className="flex items-center gap-1.5 text-sm">
              {isLogOverdue && (
                <AlertTriangle className="h-4 w-4 text-orange-500" />
              )}
              <span className={isLogOverdue ? 'text-orange-600 font-medium' : 'text-gray-500'}>
                {receiver.latest_log
                  ? formatRelativeDate(receiver.latest_log.log_date)
                  : '記録なし'}
              </span>
            </div>

            {/* 未読フィードバック数 */}
            {receiver.unread_feedback_count > 0 && (
              <div className="flex items-center gap-1 text-sm">
                <MessageSquare className="h-4 w-4 text-red-500" />
                <span className="bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center">
                  {receiver.unread_feedback_count}
                </span>
              </div>
            )}
          </div>
        </div>
      </Card>
    </Link>
  );
}
