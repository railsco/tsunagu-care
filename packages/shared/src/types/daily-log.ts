// ============================================
// DailyLog スコア関連の型とラベル
// ============================================

import type { ScoreValue } from './database';

// スコア値（1〜5）
export type MoodLevel = 1 | 2 | 3 | 4 | 5;
export type AppetiteLevel = 1 | 2 | 3 | 4 | 5;
export type SleepQualityLevel = 1 | 2 | 3 | 4 | 5;
export type ActivityLevel = 1 | 2 | 3 | 4 | 5;

// --------------------------------------------
// 汎用スコア絵文字（項目共通のバッジ表示用）
// --------------------------------------------
export const scoreEmojis: Record<ScoreValue, string> = {
  1: '😢',
  2: '😕',
  3: '😐',
  4: '🙂',
  5: '😊',
} as const;

export function getScoreEmoji(score: number | null | undefined): string {
  if (score == null) return '➖';
  return scoreEmojis[score as ScoreValue] ?? '😐';
}

// --------------------------------------------
// 気分（Mood）ラベル
// --------------------------------------------
export const moodLabels: Record<MoodLevel, string> = {
  1: 'とても悪い',
  2: 'やや悪い',
  3: 'ふつう',
  4: 'やや良い',
  5: 'とても良い',
} as const;

export const moodEmojis: Record<MoodLevel, string> = {
  1: '😢',
  2: '😟',
  3: '😐',
  4: '🙂',
  5: '😊',
} as const;

// --------------------------------------------
// 食欲（Appetite）ラベル
// --------------------------------------------
export const appetiteLabels: Record<AppetiteLevel, string> = {
  1: 'ほとんど食べない',
  2: 'やや少なめ',
  3: 'ふつう',
  4: 'やや多め',
  5: 'とてもよく食べる',
} as const;

export const appetiteEmojis: Record<AppetiteLevel, string> = {
  1: '🍽️',
  2: '🥄',
  3: '🍚',
  4: '🍱',
  5: '🍛',
} as const;

// --------------------------------------------
// 睡眠の質（Sleep Quality）ラベル
// --------------------------------------------
export const sleepQualityLabels: Record<SleepQualityLevel, string> = {
  1: 'ほとんど眠れない',
  2: 'あまり眠れない',
  3: 'ふつう',
  4: 'よく眠れた',
  5: 'ぐっすり眠れた',
} as const;

export const sleepQualityEmojis: Record<SleepQualityLevel, string> = {
  1: '😫',
  2: '😩',
  3: '😴',
  4: '💤',
  5: '🌙',
} as const;

// --------------------------------------------
// 活動量（Activity Level）ラベル
// --------------------------------------------
export const activityLevelLabels: Record<ActivityLevel, string> = {
  1: 'ほとんど動かない',
  2: 'やや少なめ',
  3: 'ふつう',
  4: 'やや多め',
  5: 'とても活発',
} as const;

export const activityLevelEmojis: Record<ActivityLevel, string> = {
  1: '🛋️',
  2: '🚶',
  3: '🚶‍♂️',
  4: '🏃',
  5: '🏃‍♂️',
} as const;

// --------------------------------------------
// ユーティリティ関数
// --------------------------------------------

/**
 * スコアからラベルを取得
 */
export function getMoodLabel(score: MoodLevel | null | undefined): string {
  return score ? moodLabels[score] : '未入力';
}

export function getAppetiteLabel(score: AppetiteLevel | null | undefined): string {
  return score ? appetiteLabels[score] : '未入力';
}

export function getSleepQualityLabel(score: SleepQualityLevel | null | undefined): string {
  return score ? sleepQualityLabels[score] : '未入力';
}

export function getActivityLevelLabel(score: ActivityLevel | null | undefined): string {
  return score ? activityLevelLabels[score] : '未入力';
}

/**
 * スコアから絵文字を取得
 */
export function getMoodEmoji(score: MoodLevel | null | undefined): string {
  return score ? moodEmojis[score] : '➖';
}

export function getAppetiteEmoji(score: AppetiteLevel | null | undefined): string {
  return score ? appetiteEmojis[score] : '➖';
}

export function getSleepQualityEmoji(score: SleepQualityLevel | null | undefined): string {
  return score ? sleepQualityEmojis[score] : '➖';
}

export function getActivityLevelEmoji(score: ActivityLevel | null | undefined): string {
  return score ? activityLevelEmojis[score] : '➖';
}

/**
 * スコアの色を取得（Tailwind CSS クラス用）
 */
export function getScoreColor(score: number | null | undefined): string {
  if (score == null) return 'gray';
  if (score <= 2) return 'red';
  if (score === 3) return 'yellow';
  return 'green';
}

/**
 * スコアをパーセンテージに変換（グラフ表示用）
 */
export function scoreToPercentage(score: number | null | undefined): number {
  if (score == null) return 0;
  return (score / 5) * 100;
}
