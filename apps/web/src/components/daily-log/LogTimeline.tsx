'use client';

import { useState } from 'react';
import { Calendar, MessageSquare, AlertCircle, ChevronDown, Image as ImageIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScoreIndicator } from './ScoreIndicator';
import { formatDate, formatRelativeDate } from '@/lib/utils';
import type { DailyLogWithRelations } from '@tsunagu-care/shared';

const INITIAL_DISPLAY_COUNT = 10;
const LOAD_MORE_COUNT = 10;

interface LogTimelineProps {
  logs: DailyLogWithRelations[];
}

export function LogTimeline({ logs }: LogTimelineProps) {
  const [displayCount, setDisplayCount] = useState(INITIAL_DISPLAY_COUNT);

  const displayedLogs = logs.slice(0, displayCount);
  const hasMore = displayCount < logs.length;

  const handleLoadMore = () => {
    setDisplayCount((prev) => Math.min(prev + LOAD_MORE_COUNT, logs.length));
  };

  if (logs.length === 0) {
    return (
      <Card className="bg-white">
        <CardContent className="py-12">
          <div className="flex flex-col items-center justify-center text-center">
            <Calendar className="h-12 w-12 text-gray-300 mb-4" />
            <p className="text-lg font-medium text-gray-500">記録がありません</p>
            <p className="text-sm text-gray-400 mt-1">
              ご家族からの日記投稿をお待ちください
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {displayedLogs.map((log, index) => (
        <LogTimelineItem key={log.id} log={log} isFirst={index === 0} />
      ))}

      {/* もっと見るボタン */}
      {hasMore && (
        <div className="flex justify-center pt-2">
          <Button
            variant="outline"
            onClick={handleLoadMore}
            className="gap-2 text-gray-600 hover:text-gray-900"
          >
            <ChevronDown className="h-4 w-4" />
            もっと見る（残り{logs.length - displayCount}件）
          </Button>
        </div>
      )}
    </div>
  );
}

interface LogTimelineItemProps {
  log: DailyLogWithRelations;
  isFirst?: boolean;
}

function LogTimelineItem({ log, isFirst }: LogTimelineItemProps) {
  return (
    <Card className={`bg-white ${isFirst ? 'ring-2 ring-teal-500' : ''}`}>
      <CardContent className="p-4 sm:p-5">
        {/* 日付・記録者 */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
          <div className="flex items-center gap-2">
            <Badge
              className={
                isFirst
                  ? 'bg-teal-600 hover:bg-teal-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-100'
              }
            >
              {formatRelativeDate(log.log_date)}
            </Badge>
            <span className="text-sm text-gray-500">
              {formatDate(log.log_date, 'yyyy年M月d日(E)')}
            </span>
          </div>
          {log.family_member && (
            <span className="text-sm text-gray-500">
              記録者: {log.family_member.name}（{log.family_member.relation}）
            </span>
          )}
        </div>

        {/* スコア（4項目） */}
        <div className="grid grid-cols-4 gap-2 sm:gap-3 mb-4">
          <ScoreIndicator label="気分" score={log.mood} icon="😊" />
          <ScoreIndicator label="食欲" score={log.appetite} icon="🍚" />
          <ScoreIndicator label="睡眠" score={log.sleep_quality} icon="😴" />
          <ScoreIndicator label="活動" score={log.activity_level} icon="🚶" />
        </div>

        {/* メモ */}
        {log.notes && (
          <div className="flex items-start gap-2 p-3 bg-gray-50 rounded-lg mb-3">
            <MessageSquare className="h-4 w-4 text-gray-400 mt-0.5 shrink-0" />
            <p className="text-sm text-gray-700">{log.notes}</p>
          </div>
        )}

        {/* 気になること */}
        {log.concerns && (
          <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-100 rounded-lg mb-3">
            <AlertCircle className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-medium text-red-700 mb-0.5">気になること</p>
              <p className="text-sm text-red-600">{log.concerns}</p>
            </div>
          </div>
        )}

        {/* 写真サムネイル */}
        {log.photo_urls && log.photo_urls.length > 0 && (
          <div className="flex gap-2 flex-wrap">
            {log.photo_urls.map((url, index) => (
              <div
                key={index}
                className="h-20 w-20 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center overflow-hidden"
              >
                {/* 実際の画像がある場合 */}
                {url.startsWith('http') ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={url}
                    alt={`写真 ${index + 1}`}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex flex-col items-center text-gray-400">
                    <ImageIcon className="h-6 w-6" />
                    <span className="text-xs mt-1">写真{index + 1}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
