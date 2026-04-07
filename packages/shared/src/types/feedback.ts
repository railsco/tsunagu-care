// ============================================
// Feedback 関連の型とラベル
// ============================================

// --------------------------------------------
// カテゴリ型とラベル
// --------------------------------------------
export type FeedbackCategoryType = 'service' | 'schedule' | 'cost' | 'communication' | 'other';

export const feedbackCategoryLabels: Record<FeedbackCategoryType, string> = {
  service: 'サービス内容',
  schedule: 'スケジュール',
  cost: '費用・料金',
  communication: '連絡・コミュニケーション',
  other: 'その他',
} as const;

export const feedbackCategoryDescriptions: Record<FeedbackCategoryType, string> = {
  service: 'デイサービス、訪問介護、リハビリなどのサービス内容について',
  schedule: '訪問時間、送迎時間、サービス頻度などについて',
  cost: '介護費用、自己負担額、料金に関すること',
  communication: 'ケアマネージャーや事業所との連絡について',
  other: '上記以外のご意見・ご要望',
} as const;

export const feedbackCategoryIcons: Record<FeedbackCategoryType, string> = {
  service: '🏥',
  schedule: '📅',
  cost: '💰',
  communication: '💬',
  other: '📝',
} as const;

// カテゴリ一覧（順序保証）
export const FEEDBACK_CATEGORIES: FeedbackCategoryType[] = [
  'service',
  'schedule',
  'cost',
  'communication',
  'other',
] as const;

// --------------------------------------------
// ステータス型とラベル
// --------------------------------------------
export type FeedbackStatusType = 'unread' | 'read' | 'addressed';

export const feedbackStatusLabels: Record<FeedbackStatusType, string> = {
  unread: '未読',
  read: '確認済み',
  addressed: '対応済み',
} as const;

export const feedbackStatusColors: Record<FeedbackStatusType, string> = {
  unread: 'red',
  read: 'yellow',
  addressed: 'green',
} as const;

export const feedbackStatusIcons: Record<FeedbackStatusType, string> = {
  unread: '🔴',
  read: '🟡',
  addressed: '🟢',
} as const;

// ステータス一覧（順序保証）
export const FEEDBACK_STATUSES: FeedbackStatusType[] = [
  'unread',
  'read',
  'addressed',
] as const;

// --------------------------------------------
// ユーティリティ関数
// --------------------------------------------

/**
 * カテゴリからラベルを取得
 */
export function getFeedbackCategoryLabel(category: FeedbackCategoryType): string {
  return feedbackCategoryLabels[category];
}

/**
 * ステータスからラベルを取得
 */
export function getFeedbackStatusLabel(status: FeedbackStatusType): string {
  return feedbackStatusLabels[status];
}

/**
 * カテゴリからアイコンを取得
 */
export function getFeedbackCategoryIcon(category: FeedbackCategoryType): string {
  return feedbackCategoryIcons[category];
}

/**
 * ステータスからアイコンを取得
 */
export function getFeedbackStatusIcon(status: FeedbackStatusType): string {
  return feedbackStatusIcons[status];
}

/**
 * 未読かどうかを判定
 */
export function isUnread(status: FeedbackStatusType): boolean {
  return status === 'unread';
}

/**
 * 対応済みかどうかを判定
 */
export function isAddressed(status: FeedbackStatusType): boolean {
  return status === 'addressed';
}
