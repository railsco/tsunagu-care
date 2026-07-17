import { View, Text, Image } from 'react-native';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import { getScoreEmoji } from '@tsunagu-care/shared';

interface LogCardProps {
  log: {
    id: string;
    log_date: string;
    mood: number | null;
    appetite: number | null;
    sleep_quality: number | null;
    activity_level: number | null;
    notes: string | null;
    photo_urls: string[] | null;
  };
}

const scoreColors = [
  'bg-red-100 text-red-600',
  'bg-orange-100 text-orange-600',
  'bg-yellow-100 text-yellow-600',
  'bg-lime-100 text-lime-600',
  'bg-green-100 text-green-600',
];

function ScoreBadge({
  label,
  score,
}: {
  label: string;
  score: number | null;
}) {
  if (score === null) return null;

  const emoji = getScoreEmoji(score);
  const colorClass = scoreColors[score - 1] || scoreColors[2];

  return (
    <View className={`flex-row items-center px-3 py-1.5 rounded-full ${colorClass}`}>
      <Text className="text-sm mr-1">{emoji}</Text>
      <Text className="text-sm font-medium">{label}</Text>
    </View>
  );
}

export function LogCard({ log }: LogCardProps) {
  const date = new Date(log.log_date);
  const formattedDate = format(date, 'M月d日（E）', { locale: ja });

  return (
    <View className="bg-white rounded-2xl p-5 shadow-sm">
      {/* 日付 */}
      <Text className="text-lg font-bold text-gray-800 mb-3">
        {formattedDate}
      </Text>

      {/* スコアバッジ */}
      <View className="flex-row flex-wrap gap-2 mb-3">
        <ScoreBadge label="体調" score={log.mood} />
        <ScoreBadge label="食事" score={log.appetite} />
        <ScoreBadge label="睡眠" score={log.sleep_quality} />
        <ScoreBadge label="活動" score={log.activity_level} />
      </View>

      {/* メモ */}
      {log.notes && (
        <Text className="text-base text-gray-700 mb-3">
          {log.notes}
        </Text>
      )}

      {/* 写真 */}
      {log.photo_urls && log.photo_urls.length > 0 && (
        <View className="flex-row gap-2">
          {log.photo_urls.map((uri, index) => (
            <Image
              key={index}
              source={{ uri }}
              className="w-20 h-20 rounded-lg"
              accessibilityLabel={`添付写真 ${index + 1}`}
            />
          ))}
        </View>
      )}
    </View>
  );
}
