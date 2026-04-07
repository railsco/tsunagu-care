'use client';

import { useState, useEffect } from 'react';
import { Check, User, Calendar, MessageSquare, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { formatDate } from '@/lib/utils';
import {
  feedbackCategoryLabels,
  feedbackStatusLabels,
  type FeedbackWithRelations,
  type FeedbackCategoryType,
  type FeedbackStatusType,
} from '@tsunagu-care/shared';

// カテゴリ別の色定義
const CATEGORY_COLORS: Record<FeedbackCategoryType, string> = {
  service: 'bg-blue-100 text-blue-700',
  schedule: 'bg-purple-100 text-purple-700',
  cost: 'bg-orange-100 text-orange-700',
  communication: 'bg-green-100 text-green-700',
  other: 'bg-gray-100 text-gray-700',
};

// ステータスに応じたBadgeのバリアント
const STATUS_VARIANTS: Record<FeedbackStatusType, 'destructive' | 'warning' | 'success'> = {
  unread: 'destructive',
  read: 'warning',
  addressed: 'success',
};

interface FeedbackDetailDialogProps {
  feedback: FeedbackWithRelations | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateStatus: (
    feedbackId: string,
    status: FeedbackStatusType,
    managerNotes?: string
  ) => Promise<void>;
}

export function FeedbackDetailDialog({
  feedback,
  isOpen,
  onClose,
  onUpdateStatus,
}: FeedbackDetailDialogProps) {
  const [managerNotes, setManagerNotes] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // フィードバックが変更されたらメモをリセット
  useEffect(() => {
    if (feedback) {
      setManagerNotes(feedback.manager_notes || '');
    }
  }, [feedback]);

  if (!feedback) return null;

  const categoryColor = CATEGORY_COLORS[feedback.category as FeedbackCategoryType] || CATEGORY_COLORS.other;
  const statusVariant = STATUS_VARIANTS[feedback.status as FeedbackStatusType];

  const handleMarkAsRead = async () => {
    if (feedback.status === 'unread') {
      setIsUpdating(true);
      try {
        await onUpdateStatus(feedback.id, 'read');
      } finally {
        setIsUpdating(false);
      }
    }
  };

  const handleMarkAsAddressed = async () => {
    setIsUpdating(true);
    try {
      await onUpdateStatus(feedback.id, 'addressed', managerNotes);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSaveNotes = async () => {
    setIsSaving(true);
    try {
      // メモのみ保存（ステータスは変更しない）
      await onUpdateStatus(feedback.id, feedback.status as FeedbackStatusType, managerNotes);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold flex items-center gap-2">
            💬 フィードバック詳細
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 pt-4">
          {/* バッジ */}
          <div className="flex items-center gap-2 flex-wrap">
            <Badge className={categoryColor}>
              {feedbackCategoryLabels[feedback.category as FeedbackCategoryType]}
            </Badge>
            <Badge variant={statusVariant}>
              {feedbackStatusLabels[feedback.status as FeedbackStatusType]}
            </Badge>
            {feedback.is_anonymous && (
              <Badge variant="outline" className="bg-gray-50">
                匿名
              </Badge>
            )}
          </div>

          {/* メタ情報 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-gray-400" />
              <span className="text-gray-600">
                投稿日: {formatDate(feedback.created_at, 'yyyy年M月d日 HH:mm')}
              </span>
            </div>
            {feedback.care_receiver && (
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-gray-400" />
                <span className="text-gray-600">
                  利用者: {feedback.care_receiver.name}
                </span>
              </div>
            )}
            {!feedback.is_anonymous && feedback.family_member && (
              <div className="flex items-center gap-2 sm:col-span-2">
                <User className="h-4 w-4 text-gray-400" />
                <span className="text-gray-600">
                  投稿者: {feedback.family_member.name}（{feedback.family_member.relation}）
                </span>
              </div>
            )}
          </div>

          {/* フィードバック内容 */}
          <div>
            <Label className="text-sm font-medium mb-2 block text-gray-700">
              内容
            </Label>
            <div className="p-4 bg-white border border-gray-200 rounded-lg">
              <p className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed">
                {feedback.content}
              </p>
            </div>
          </div>

          {/* 対応メモ */}
          <div>
            <Label htmlFor="manager-notes" className="text-sm font-medium mb-2 block text-gray-700">
              ケアマネの対応メモ
            </Label>
            <Textarea
              id="manager-notes"
              placeholder="対応内容や確認事項を記録してください..."
              value={managerNotes}
              onChange={(e) => setManagerNotes(e.target.value)}
              className="min-h-[120px] resize-none"
              disabled={isUpdating}
            />
            {/* メモ保存ボタン（対応済みでない場合のみ表示） */}
            {feedback.status !== 'addressed' && managerNotes !== (feedback.manager_notes || '') && (
              <div className="mt-2 flex justify-end">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSaveNotes}
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      保存中...
                    </>
                  ) : (
                    'メモを保存'
                  )}
                </Button>
              </div>
            )}
          </div>

          {/* 対応済み情報 */}
          {feedback.status === 'addressed' && feedback.addressed_at && (
            <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 p-3 rounded-lg">
              <Check className="h-4 w-4" />
              <span>
                {formatDate(feedback.addressed_at, 'yyyy年M月d日 HH:mm')} に対応済み
              </span>
            </div>
          )}

          {/* ステータス変更ボタン */}
          {feedback.status !== 'addressed' && (
            <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
              {feedback.status === 'unread' && (
                <Button
                  variant="outline"
                  onClick={handleMarkAsRead}
                  disabled={isUpdating}
                  className="flex-1"
                >
                  {isUpdating ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <MessageSquare className="h-4 w-4 mr-2" />
                  )}
                  確認済みにする
                </Button>
              )}
              <Button
                onClick={handleMarkAsAddressed}
                disabled={isUpdating}
                className="flex-1 bg-teal-600 hover:bg-teal-700"
              >
                {isUpdating ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Check className="h-4 w-4 mr-2" />
                )}
                対応済みにする
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

// 旧FeedbackDetail（Card版）も維持（必要に応じて使用）
interface FeedbackDetailProps {
  feedback: FeedbackWithRelations;
  onUpdateStatus: (
    feedbackId: string,
    status: FeedbackStatusType,
    managerNotes?: string
  ) => Promise<void>;
}

export function FeedbackDetail({ feedback, onUpdateStatus }: FeedbackDetailProps) {
  const [managerNotes, setManagerNotes] = useState(feedback.manager_notes || '');
  const [isUpdating, setIsUpdating] = useState(false);

  const categoryColor = CATEGORY_COLORS[feedback.category as FeedbackCategoryType] || CATEGORY_COLORS.other;
  const statusVariant = STATUS_VARIANTS[feedback.status as FeedbackStatusType];

  const handleMarkAsRead = async () => {
    if (feedback.status === 'unread') {
      setIsUpdating(true);
      try {
        await onUpdateStatus(feedback.id, 'read');
      } finally {
        setIsUpdating(false);
      }
    }
  };

  const handleMarkAsAddressed = async () => {
    setIsUpdating(true);
    try {
      await onUpdateStatus(feedback.id, 'addressed', managerNotes);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="space-y-6 p-6 bg-white rounded-lg border">
      {/* ヘッダー */}
      <div>
        <h3 className="text-lg font-bold mb-3">💬 フィードバック詳細</h3>
        <div className="flex items-center gap-2 flex-wrap">
          <Badge className={categoryColor}>
            {feedbackCategoryLabels[feedback.category as FeedbackCategoryType]}
          </Badge>
          <Badge variant={statusVariant}>
            {feedbackStatusLabels[feedback.status as FeedbackStatusType]}
          </Badge>
          {feedback.is_anonymous && (
            <Badge variant="outline" className="bg-gray-50">
              匿名
            </Badge>
          )}
        </div>
      </div>

      {/* メタ情報 */}
      <div className="grid grid-cols-2 gap-4 text-sm bg-gray-50 p-4 rounded-lg">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-gray-400" />
          <span>投稿日: {formatDate(feedback.created_at, 'yyyy年M月d日 HH:mm')}</span>
        </div>
        {feedback.care_receiver && (
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-gray-400" />
            <span>利用者: {feedback.care_receiver.name}</span>
          </div>
        )}
        {!feedback.is_anonymous && feedback.family_member && (
          <div className="flex items-center gap-2 col-span-2">
            <User className="h-4 w-4 text-gray-400" />
            <span>
              投稿者: {feedback.family_member.name}（{feedback.family_member.relation}）
            </span>
          </div>
        )}
      </div>

      {/* 内容 */}
      <div>
        <Label className="text-sm font-medium mb-2 block">内容</Label>
        <div className="p-4 bg-gray-50 rounded-lg">
          <p className="text-sm whitespace-pre-wrap">{feedback.content}</p>
        </div>
      </div>

      {/* 対応メモ */}
      <div>
        <Label htmlFor="manager-notes" className="text-sm font-medium mb-2 block">
          対応メモ
        </Label>
        <Textarea
          id="manager-notes"
          placeholder="対応内容や確認事項を記録..."
          value={managerNotes}
          onChange={(e) => setManagerNotes(e.target.value)}
          className="min-h-[100px]"
          disabled={feedback.status === 'addressed'}
        />
      </div>

      {/* 対応済み情報 */}
      {feedback.status === 'addressed' && feedback.addressed_at && (
        <div className="flex items-center gap-2 text-sm text-green-600">
          <Check className="h-4 w-4" />
          <span>
            {formatDate(feedback.addressed_at, 'yyyy年M月d日 HH:mm')} に対応済み
          </span>
        </div>
      )}

      {/* アクションボタン */}
      {feedback.status !== 'addressed' && (
        <div className="flex gap-3">
          {feedback.status === 'unread' && (
            <Button
              variant="outline"
              onClick={handleMarkAsRead}
              disabled={isUpdating}
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              確認済みにする
            </Button>
          )}
          <Button
            onClick={handleMarkAsAddressed}
            disabled={isUpdating}
            className="bg-teal-600 hover:bg-teal-700"
          >
            <Check className="h-4 w-4 mr-2" />
            対応済みにする
          </Button>
        </div>
      )}
    </div>
  );
}
