import type { CareLevel } from '../types/database';

// --------------------------------------------
// 要介護度のグループ判定
// --------------------------------------------

export type CareLevelGroup = 'support' | 'care1-2' | 'care3-5';

const CARE_LEVEL_GROUP_MAP: Record<CareLevel, CareLevelGroup> = {
  要支援1: 'support',
  要支援2: 'support',
  要介護1: 'care1-2',
  要介護2: 'care1-2',
  要介護3: 'care3-5',
  要介護4: 'care3-5',
  要介護5: 'care3-5',
};

/**
 * 要介護度をUI表示用のグループに分類する
 * （バッジ色分け・一覧フィルターで共用）
 */
export function getCareLevelGroup(
  careLevel: CareLevel | string | null | undefined
): CareLevelGroup | null {
  if (!careLevel) return null;
  return CARE_LEVEL_GROUP_MAP[careLevel as CareLevel] ?? null;
}

/**
 * 日付を日本語形式でフォーマット
 */
export function formatDateJa(date: Date): string {
  return new Intl.DateTimeFormat('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);
}

/**
 * 日付を YYYY-MM-DD 形式でフォーマット
 */
export function formatDateISO(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * 年齢を計算
 */
export function calculateAge(birthDate: Date): number {
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }

  return age;
}

/**
 * 値が空でないかチェック
 */
export function isNotEmpty<T>(value: T | null | undefined): value is T {
  return value !== null && value !== undefined;
}

/**
 * 配列を指定したキーでグループ化
 */
export function groupBy<T, K extends string | number>(
  array: T[],
  keyFn: (item: T) => K
): Record<K, T[]> {
  return array.reduce((result, item) => {
    const key = keyFn(item);
    if (!result[key]) {
      result[key] = [];
    }
    result[key].push(item);
    return result;
  }, {} as Record<K, T[]>);
}
