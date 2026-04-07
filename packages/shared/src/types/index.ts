// ============================================
// 型定義のエクスポート
// ============================================

// Supabaseデータベース型
export * from './database';

// DailyLog スコア関連
export * from './daily-log';

// Feedback 関連
export * from './feedback';

// 定数
export * from './constants';

// ============================================
// アプリケーション用インターフェース（camelCase）
// クライアントサイドで使用する型定義
// ============================================

// API レスポンス
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// ページネーション
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

// フィルター・ソート用
export interface DailyLogFilters {
  careReceiverId?: string;
  familyMemberId?: string;
  startDate?: string;
  endDate?: string;
}

export interface FeedbackFilters {
  careReceiverId?: string;
  category?: string;
  status?: string;
  isAnonymous?: boolean;
}

export interface SortOption {
  field: string;
  direction: 'asc' | 'desc';
}
