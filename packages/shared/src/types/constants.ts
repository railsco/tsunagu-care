// ============================================
// 共通定数
// ============================================

// --------------------------------------------
// 介護レベル
// --------------------------------------------
export const CARE_LEVELS = [
  '要支援1',
  '要支援2',
  '要介護1',
  '要介護2',
  '要介護3',
  '要介護4',
  '要介護5',
] as const;

export type CareLevelType = (typeof CARE_LEVELS)[number];

// 介護レベルの説明
export const CARE_LEVEL_DESCRIPTIONS: Record<CareLevelType, string> = {
  '要支援1': '日常生活はほぼ自立。介護予防サービスで改善が見込める',
  '要支援2': '日常生活に支援が必要。介護予防サービスで改善が見込める',
  '要介護1': '立ち上がり・歩行が不安定。排泄・入浴に一部介助が必要',
  '要介護2': '立ち上がり・歩行が困難。排泄・入浴に介助が必要',
  '要介護3': '立ち上がり・歩行ができない。排泄・入浴・着替えに全面的な介助が必要',
  '要介護4': '日常生活全般に全面的な介助が必要。認知症に伴う問題行動あり',
  '要介護5': '寝たきり状態。意思の伝達が困難。全面的な介護が必要',
} as const;

// --------------------------------------------
// 続柄オプション
// --------------------------------------------
export const RELATION_OPTIONS = [
  '配偶者',
  '長男',
  '長女',
  '次男',
  '次女',
  '三男',
  '三女',
  '息子',
  '娘',
  '義理の息子',
  '義理の娘',
  '孫',
  '兄弟',
  '姉妹',
  'その他',
] as const;

export type RelationType = (typeof RELATION_OPTIONS)[number];

// --------------------------------------------
// 性別オプション
// --------------------------------------------
export const GENDER_OPTIONS = [
  { value: 'male', label: '男性' },
  { value: 'female', label: '女性' },
  { value: 'other', label: 'その他' },
] as const;

export type GenderType = 'male' | 'female' | 'other';

export const GENDER_LABELS: Record<GenderType, string> = {
  male: '男性',
  female: '女性',
  other: 'その他',
} as const;

// --------------------------------------------
// 家族権限オプション
// --------------------------------------------
export const FAMILY_ROLE_OPTIONS = [
  { value: 'primary', label: '主介護者', description: 'すべての操作が可能。主たる連絡先' },
  { value: 'editor', label: '編集者', description: '記録の閲覧・入力が可能' },
  { value: 'viewer', label: '閲覧者', description: '記録の閲覧のみ可能' },
] as const;

export type FamilyRoleType = 'primary' | 'editor' | 'viewer';

export const FAMILY_ROLE_LABELS: Record<FamilyRoleType, string> = {
  primary: '主介護者',
  editor: '編集者',
  viewer: '閲覧者',
} as const;

// --------------------------------------------
// 事業所プラン
// --------------------------------------------
export const ORGANIZATION_PLAN_OPTIONS = [
  { value: 'free', label: 'フリー', description: '利用者5名まで' },
  { value: 'standard', label: 'スタンダード', description: '利用者30名まで' },
  { value: 'premium', label: 'プレミアム', description: '利用者無制限' },
] as const;

export type OrganizationPlanType = 'free' | 'standard' | 'premium';

export const ORGANIZATION_PLAN_LABELS: Record<OrganizationPlanType, string> = {
  free: 'フリー',
  standard: 'スタンダード',
  premium: 'プレミアム',
} as const;

// --------------------------------------------
// 入力制限
// --------------------------------------------
export const MAX_PHOTO_COUNT = 3;
export const MAX_NOTES_LENGTH = 1000;
export const MAX_CONCERNS_LENGTH = 500;
export const MAX_FEEDBACK_LENGTH = 2000;
export const MAX_SURVEY_COMMENT_LENGTH = 1000;

// --------------------------------------------
// 表示設定
// --------------------------------------------
export const DEFAULT_PAGE_SIZE = 20;
export const DAILY_LOG_DAYS_TO_SHOW = 14;
export const CHART_DAYS_TO_SHOW = 30;

// --------------------------------------------
// バリデーション用正規表現
// --------------------------------------------
export const PHONE_REGEX = /^0\d{1,4}-?\d{1,4}-?\d{3,4}$/;
export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// --------------------------------------------
// よく使う疾患・状態リスト
// --------------------------------------------
export const COMMON_CONDITIONS = [
  '認知症',
  'アルツハイマー型認知症',
  'レビー小体型認知症',
  '脳血管性認知症',
  '高血圧',
  '糖尿病',
  '脳梗塞後遺症',
  '脳出血後遺症',
  'パーキンソン病',
  '骨粗鬆症',
  '変形性膝関節症',
  '変形性腰椎症',
  '慢性心不全',
  '慢性腎臓病',
  '関節リウマチ',
  '白内障',
  '緑内障',
  '難聴',
  'うつ病',
  '統合失調症',
] as const;
