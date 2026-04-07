import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, parseISO } from 'date-fns';
import { ja } from 'date-fns/locale';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * 日付を日本語形式でフォーマット
 */
export function formatDate(date: string | Date, formatStr: string = 'yyyy年M月d日'): string {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, formatStr, { locale: ja });
}

/**
 * 日付を相対表示（今日、昨日、など）
 */
export function formatRelativeDate(date: string | Date): string {
  const d = typeof date === 'string' ? parseISO(date) : date;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const targetDate = new Date(d);
  targetDate.setHours(0, 0, 0, 0);

  const diffDays = Math.floor((today.getTime() - targetDate.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return '今日';
  if (diffDays === 1) return '昨日';
  if (diffDays === 2) return '一昨日';
  if (diffDays <= 7) return `${diffDays}日前`;

  return formatDate(d, 'M月d日');
}

/**
 * 年齢を計算
 */
export function calculateAge(birthDate: string | Date): number {
  const birth = typeof birthDate === 'string' ? parseISO(birthDate) : birthDate;
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }

  return age;
}

/**
 * スコアに応じた色クラスを返す
 */
export function getScoreColorClass(score: number | null | undefined): string {
  if (score == null) return 'text-gray-400';
  if (score <= 2) return 'text-red-500';
  if (score === 3) return 'text-yellow-500';
  return 'text-green-500';
}

/**
 * スコアに応じた背景色クラスを返す
 */
export function getScoreBgClass(score: number | null | undefined): string {
  if (score == null) return 'bg-gray-100';
  if (score <= 2) return 'bg-red-100';
  if (score === 3) return 'bg-yellow-100';
  return 'bg-green-100';
}
