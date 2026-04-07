// ============================================
// 定数のエクスポート
// types/constants.ts からの再エクスポート
// ============================================

export {
  // 介護レベル
  CARE_LEVELS,
  CARE_LEVEL_DESCRIPTIONS,
  type CareLevelType,

  // 続柄
  RELATION_OPTIONS,
  type RelationType,

  // 性別
  GENDER_OPTIONS,
  GENDER_LABELS,
  type GenderType,

  // 家族権限
  FAMILY_ROLE_OPTIONS,
  FAMILY_ROLE_LABELS,
  type FamilyRoleType,

  // 事業所プラン
  ORGANIZATION_PLAN_OPTIONS,
  ORGANIZATION_PLAN_LABELS,
  type OrganizationPlanType,

  // 入力制限
  MAX_PHOTO_COUNT,
  MAX_NOTES_LENGTH,
  MAX_CONCERNS_LENGTH,
  MAX_FEEDBACK_LENGTH,
  MAX_SURVEY_COMMENT_LENGTH,

  // 表示設定
  DEFAULT_PAGE_SIZE,
  DAILY_LOG_DAYS_TO_SHOW,
  CHART_DAYS_TO_SHOW,

  // バリデーション
  PHONE_REGEX,
  EMAIL_REGEX,

  // よく使う疾患
  COMMON_CONDITIONS,
} from '../types/constants';

// ============================================
// daily-log.ts からのラベル再エクスポート
// ============================================
export {
  moodLabels,
  moodEmojis,
  appetiteLabels,
  appetiteEmojis,
  sleepQualityLabels,
  sleepQualityEmojis,
  activityLevelLabels,
  activityLevelEmojis,
} from '../types/daily-log';

// ============================================
// feedback.ts からのラベル再エクスポート
// ============================================
export {
  feedbackCategoryLabels,
  feedbackCategoryDescriptions,
  feedbackCategoryIcons,
  FEEDBACK_CATEGORIES,
  feedbackStatusLabels,
  feedbackStatusColors,
  feedbackStatusIcons,
  FEEDBACK_STATUSES,
} from '../types/feedback';

// ============================================
// 後方互換性のためのエイリアス
// ============================================

// 旧名称のエクスポート（非推奨）
export { RELATION_OPTIONS as COMMON_RELATIONS } from '../types/constants';
export { moodLabels as MOOD_SCORE_LABELS } from '../types/daily-log';
export { appetiteLabels as APPETITE_SCORE_LABELS } from '../types/daily-log';
export { sleepQualityLabels as SLEEP_SCORE_LABELS } from '../types/daily-log';
export { activityLevelLabels as ACTIVITY_SCORE_LABELS } from '../types/daily-log';
export { feedbackCategoryLabels as FEEDBACK_CATEGORY_LABELS } from '../types/feedback';
export { feedbackStatusLabels as FEEDBACK_STATUS_LABELS } from '../types/feedback';

// 汎用スコアラベル
export const SCORE_LABELS: Record<number, string> = {
  1: 'とても悪い',
  2: 'やや悪い',
  3: 'ふつう',
  4: 'やや良い',
  5: 'とても良い',
} as const;
