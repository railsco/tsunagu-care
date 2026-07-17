'use client';

import { useState, useMemo } from 'react';
import { Search, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ReceiverCard } from './ReceiverCard';
import { getCareLevelGroup } from '@tsunagu-care/shared';
import type { ReceiverWithStats } from '@/app/dashboard/page';

type CareLevelFilter = 'all' | 'support' | 'care1-2' | 'care3-5';

const CARE_LEVEL_FILTERS: { value: CareLevelFilter; label: string }[] = [
  { value: 'all', label: '全て' },
  { value: 'support', label: '要支援' },
  { value: 'care1-2', label: '要介護1-2' },
  { value: 'care3-5', label: '要介護3-5' },
];

function matchesCareLevelFilter(careLevel: string | null, filter: CareLevelFilter): boolean {
  if (filter === 'all') return true;
  return getCareLevelGroup(careLevel) === filter;
}

interface ReceiverListProps {
  receivers: ReceiverWithStats[];
  isLoading?: boolean;
}

export function ReceiverList({ receivers, isLoading }: ReceiverListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [careLevelFilter, setCareLevelFilter] = useState<CareLevelFilter>('all');

  // フィルタリングされた利用者リスト
  const filteredReceivers = useMemo(() => {
    return receivers.filter((receiver) => {
      // 名前検索
      const matchesSearch =
        searchQuery === '' ||
        receiver.name.toLowerCase().includes(searchQuery.toLowerCase());

      // 要介護度フィルター
      const matchesCareLevel = matchesCareLevelFilter(receiver.care_level, careLevelFilter);

      return matchesSearch && matchesCareLevel;
    });
  }, [receivers, searchQuery, careLevelFilter]);

  // アラート（低スコア or 3日以上未投稿）がある利用者を先頭に
  const sortedReceivers = useMemo(() => {
    const now = new Date();
    return [...filteredReceivers].sort((a, b) => {
      const aHasAlert = getAlertLevel(a, now);
      const bHasAlert = getAlertLevel(b, now);
      return bHasAlert - aHasAlert;
    });
  }, [filteredReceivers]);

  if (isLoading) {
    return <ReceiverListSkeleton />;
  }

  return (
    <div className="space-y-4">
      {/* 検索とフィルター */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* 検索バー */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder="名前で検索..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* 要介護度フィルター */}
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-gray-400 hidden sm:block" />
          <div className="flex gap-1 flex-wrap">
            {CARE_LEVEL_FILTERS.map((filter) => (
              <Button
                key={filter.value}
                variant={careLevelFilter === filter.value ? 'default' : 'outline'}
                size="sm"
                onClick={() => setCareLevelFilter(filter.value)}
                className={
                  careLevelFilter === filter.value
                    ? 'bg-teal-600 hover:bg-teal-700 text-white'
                    : 'hover:bg-gray-100'
                }
              >
                {filter.label}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* フィルター結果の件数 */}
      {(searchQuery || careLevelFilter !== 'all') && (
        <p className="text-sm text-gray-500">
          {sortedReceivers.length}件の結果
          {searchQuery && <span>（「{searchQuery}」で検索）</span>}
        </p>
      )}

      {/* 利用者グリッド */}
      {sortedReceivers.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="text-4xl mb-4">🔍</div>
          <p className="text-lg font-medium text-gray-600">
            {receivers.length === 0
              ? '担当利用者がいません'
              : '検索条件に一致する利用者がいません'}
          </p>
          {receivers.length > 0 && (
            <Button
              variant="link"
              onClick={() => {
                setSearchQuery('');
                setCareLevelFilter('all');
              }}
              className="text-teal-600 mt-2"
            >
              フィルターをクリア
            </Button>
          )}
        </div>
      ) : (
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {sortedReceivers.map((receiver) => (
            <ReceiverCard key={receiver.id} receiver={receiver} />
          ))}
        </div>
      )}
    </div>
  );
}

// アラートレベルを算出（高いほど優先）
function getAlertLevel(receiver: ReceiverWithStats, now: Date): number {
  let level = 0;

  // 未読フィードバックがある
  if (receiver.unread_feedback_count > 0) {
    level += 2;
  }

  // 低スコア
  if (receiver.latest_log?.mood && receiver.latest_log.mood <= 2) {
    level += 3;
  }

  // 3日以上未投稿
  if (receiver.latest_log) {
    const daysSinceLog = Math.floor(
      (now.getTime() - new Date(receiver.latest_log.log_date).getTime()) / (1000 * 60 * 60 * 24)
    );
    if (daysSinceLog >= 3) {
      level += 1;
    }
  } else {
    // 記録なし
    level += 1;
  }

  return level;
}

function ReceiverListSkeleton() {
  return (
    <div className="space-y-4">
      {/* 検索バーのスケルトン */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Skeleton className="h-10 flex-1" />
        <div className="flex gap-1">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-9 w-20" />
          ))}
        </div>
      </div>

      {/* カードグリッドのスケルトン */}
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(6)].map((_, i) => (
          <ReceiverCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

function ReceiverCardSkeleton() {
  return (
    <div className="rounded-xl border bg-white p-5 space-y-4">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <Skeleton className="h-6 w-28" />
          <Skeleton className="h-5 w-16" />
        </div>
        <Skeleton className="h-8 w-8 rounded-full" />
      </div>
      <div className="flex gap-2">
        <Skeleton className="h-6 w-16 rounded-full" />
        <Skeleton className="h-6 w-20 rounded-full" />
      </div>
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-16" />
      </div>
    </div>
  );
}
