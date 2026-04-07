import { cn } from '@/lib/utils';

interface ScoreIndicatorProps {
  label: string;
  score: number | null | undefined;
  size?: 'sm' | 'md' | 'lg';
  icon?: string;
  showScore?: boolean;
}

// スコアに応じた絵文字を取得
function getScoreEmoji(score: number): string {
  if (score <= 2) return '😟';
  if (score === 3) return '😐';
  return '😊';
}

export function ScoreIndicator({
  label,
  score,
  size = 'md',
  icon,
  showScore = true,
}: ScoreIndicatorProps) {
  const getScoreColor = (value: number | null | undefined) => {
    if (value == null) return 'bg-gray-100 text-gray-400';
    if (value <= 2) return 'bg-red-50 text-red-600';
    if (value === 3) return 'bg-yellow-50 text-yellow-600';
    return 'bg-green-50 text-green-600';
  };

  const sizeClasses = {
    sm: 'p-1.5 sm:p-2 text-xs',
    md: 'p-3 text-sm',
    lg: 'p-4 text-base',
  };

  const emojiSizes = {
    sm: 'text-lg sm:text-xl',
    md: 'text-xl',
    lg: 'text-2xl',
  };

  // 表示する絵文字を決定
  const displayEmoji = score != null ? getScoreEmoji(score) : icon || '➖';

  return (
    <div
      className={cn(
        'flex flex-col items-center rounded-lg',
        getScoreColor(score),
        sizeClasses[size]
      )}
    >
      <span className="text-gray-500 text-xs mb-1">{label}</span>
      <span className={emojiSizes[size]}>{displayEmoji}</span>
      {showScore && score != null && (
        <span className="text-xs font-medium mt-0.5">{score}/5</span>
      )}
    </div>
  );
}

interface ScoreBarProps {
  label: string;
  score: number | null | undefined;
  maxScore?: number;
}

export function ScoreBar({ label, score, maxScore = 5 }: ScoreBarProps) {
  const percentage = score ? (score / maxScore) * 100 : 0;

  const getBarColor = (value: number | null | undefined) => {
    if (!value) return 'bg-gray-200';
    if (value <= 2) return 'bg-red-500';
    if (value === 3) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  return (
    <div className="space-y-1">
      <div className="flex justify-between text-sm">
        <span className="text-gray-500">{label}</span>
        <span className="font-medium">{score ?? '-'}</span>
      </div>
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={cn('h-full rounded-full transition-all', getBarColor(score))}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
