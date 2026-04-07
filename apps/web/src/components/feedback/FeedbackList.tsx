'use client';

import { useState, useMemo } from 'react';
import { MessageSquare, Filter } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { formatRelativeDate } from '@/lib/utils';
import {
  feedbackCategoryLabels,
  feedbackStatusLabels,
  type FeedbackWithRelations,
  type FeedbackCategoryType,
  type FeedbackStatusType,
} from '@tsunagu-care/shared';
import { cn } from '@/lib/utils';

// カテゴリ別の色定義
const CATEGORY_COLORS: Record<FeedbackCategoryType, string> = {
  service: 'bg-blue-100 text-blue-700 hover:bg-blue-100',
  schedule: 'bg-purple-100 text-purple-700 hover:bg-purple-100',
  cost: 'bg-orange-100 text-orange-700 hover:bg-orange-100',
  communication: 'bg-green-100 text-green-700 hover:bg-green-100',
  other: 'bg-gray-100 text-gray-700 hover:bg-gray-100',
};

// フィルターオプション
type CategoryFilter = 'all' | FeedbackCategoryType;
type StatusFilter = 'all' | FeedbackStatusType;

const CATEGORY_FILTER_OPTIONS: { value: CategoryFilter; label: string }[] = [
  { value: 'all', label: '全て' },
  { value: 'service', label: 'サービス' },
  { value: 'schedule', label: 'スケジュール' },
  { value: 'cost', label: '費用' },
  { value: 'communication', label: 'コミュニケーション' },
  { value: 'other', label: 'その他' },
];

const STATUS_FILTER_OPTIONS: { value: StatusFilter; label: string }[] = [
  { value: 'all', label: '全て' },
  { value: 'unread', label: '未読' },
  { value: 'read', label: '確認済' },
  { value: 'addressed', label: '対応済' },
];

interface FeedbackListProps {
  feedbacks: FeedbackWithRelations[];
  isLoading?: boolean;
  onSelect?: (feedback: FeedbackWithRelations) => void;
  selectedId?: string;
}

export function FeedbackList({
  feedbacks,
  isLoading,
  onSelect,
  selectedId,
}: FeedbackListProps) {
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');

  // フィルタリング
  const filteredFeedbacks = useMemo(() => {
    return feedbacks.filter((feedback) => {
      const matchesCategory =
        categoryFilter === 'all' || feedback.category === categoryFilter;
      const matchesStatus =
        statusFilter === 'all' || feedback.status === statusFilter;
      return matchesCategory && matchesStatus;
    });
  }, [feedbacks, categoryFilter, statusFilter]);

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <FeedbackItemSkeleton key={i} />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* フィルター */}
      <div className="space-y-3">
        {/* カテゴリフィルター */}
        <div className="flex items-center gap-2 flex-wrap">
          <Filter className="h-4 w-4 text-gray-400" />
          <span className="text-sm text-gray-500 mr-1">カテゴリ:</span>
          {CATEGORY_FILTER_OPTIONS.map((option) => (
            <Button
              key={option.value}
              variant={categoryFilter === option.value ? 'default' : 'outline'}
              size="sm"
              className={cn(
                'h-7 text-xs',
                categoryFilter === option.value && 'bg-teal-600 hover:bg-teal-700'
              )}
              onClick={() => setCategoryFilter(option.value)}
            >
              {option.label}
            </Button>
          ))}
        </div>

        {/* ステータスフィルター */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="w-4" />
          <span className="text-sm text-gray-500 mr-1">ステータス:</span>
          {STATUS_FILTER_OPTIONS.map((option) => (
            <Button
              key={option.value}
              variant={statusFilter === option.value ? 'default' : 'outline'}
              size="sm"
              className={cn(
                'h-7 text-xs',
                statusFilter === option.value && 'bg-teal-600 hover:bg-teal-700'
              )}
              onClick={() => setStatusFilter(option.value)}
            >
              {option.label}
            </Button>
          ))}
        </div>
      </div>

      {/* 件数表示 */}
      <div className="text-sm text-gray-500">
        {filteredFeedbacks.length}件のフィードバック
        {(categoryFilter !== 'all' || statusFilter !== 'all') && (
          <span className="ml-2">
            （全{feedbacks.length}件中）
          </span>
        )}
      </div>

      {/* リスト */}
      {filteredFeedbacks.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <MessageSquare className="h-12 w-12 text-gray-300 mb-4" />
          <p className="text-lg font-medium text-gray-500">
            {feedbacks.length === 0
              ? 'フィードバックがありません'
              : '条件に一致するフィードバックがありません'}
          </p>
          {feedbacks.length > 0 && (
            <Button
              variant="link"
              className="mt-2 text-teal-600"
              onClick={() => {
                setCategoryFilter('all');
                setStatusFilter('all');
              }}
            >
              フィルターをクリア
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredFeedbacks.map((feedback) => (
            <FeedbackItem
              key={feedback.id}
              feedback={feedback}
              isSelected={selectedId === feedback.id}
              onClick={() => onSelect?.(feedback)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

interface FeedbackItemProps {
  feedback: FeedbackWithRelations;
  isSelected?: boolean;
  onClick?: () => void;
}

// ステータスに応じたBadgeのバリアント
const STATUS_VARIANTS: Record<FeedbackStatusType, 'destructive' | 'warning' | 'success'> = {
  unread: 'destructive',
  read: 'warning',
  addressed: 'success',
};

function FeedbackItem({ feedback, isSelected, onClick }: FeedbackItemProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const categoryColor = CATEGORY_COLORS[feedback.category as FeedbackCategoryType] || CATEGORY_COLORS.other;
  const statusVariant = STATUS_VARIANTS[feedback.status as FeedbackStatusType];

  // コンテンツが3行を超えるか判定（約150文字を目安）
  const isLongContent = feedback.content.length > 150;

  const handleClick = () => {
    onClick?.();
  };

  const handleExpandToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsExpanded(!isExpanded);
  };

  return (
    <Card
      className={cn(
        'cursor-pointer transition-all hover:shadow-md',
        isSelected && 'ring-2 ring-teal-500',
        feedback.status === 'unread' && 'border-l-4 border-l-red-500'
      )}
      onClick={handleClick}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            {/* ヘッダー */}
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <Badge className={categoryColor}>
                {feedbackCategoryLabels[feedback.category as FeedbackCategoryType]}
              </Badge>
              <Badge variant={statusVariant}>
                {feedbackStatusLabels[feedback.status as FeedbackStatusType]}
              </Badge>
              {feedback.is_anonymous && (
                <Badge variant="outline" className="text-xs bg-gray-50">
                  匿名
                </Badge>
              )}
            </div>

            {/* 内容 */}
            <div className="mb-2">
              <p
                className={cn(
                  'text-sm text-gray-700',
                  !isExpanded && 'line-clamp-3'
                )}
              >
                {feedback.content}
              </p>
              {isLongContent && (
                <button
                  onClick={handleExpandToggle}
                  className="text-xs text-teal-600 hover:text-teal-700 mt-1 font-medium"
                >
                  {isExpanded ? '閉じる' : '続きを読む'}
                </button>
              )}
            </div>

            {/* フッター */}
            <div className="flex items-center gap-4 text-xs text-gray-500 flex-wrap">
              <span>{formatRelativeDate(feedback.created_at)}</span>
              {feedback.care_receiver && (
                <span>利用者: {feedback.care_receiver.name}</span>
              )}
              {!feedback.is_anonymous && feedback.family_member && (
                <span>
                  {feedback.family_member.name}（{feedback.family_member.relation}）
                </span>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function FeedbackItemSkeleton() {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="space-y-3">
          <div className="flex gap-2">
            <Skeleton className="h-5 w-20" />
            <Skeleton className="h-5 w-16" />
          </div>
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <div className="flex gap-4">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-3 w-24" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
