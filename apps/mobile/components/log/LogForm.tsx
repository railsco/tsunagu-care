import { useState } from 'react';
import { View, Text, TextInput, Pressable, ActivityIndicator } from 'react-native';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import { ScoreSlider } from '@/components/common/ScoreSlider';
import { PhotoPicker } from '@/components/common/PhotoPicker';

const MAX_NOTES_LENGTH = 1000;
const MAX_CONCERNS_LENGTH = 1000;

interface LogFormProps {
  careReceiverName?: string;
  onSubmit: (data: {
    log_date: string;
    mood: number;
    appetite: number;
    sleep_quality: number;
    activity_level: number;
    notes: string;
    concerns: string;
    photo_urls: string[];
  }) => void;
  initialData?: {
    mood?: number;
    appetite?: number;
    sleep_quality?: number;
    activity_level?: number;
    notes?: string;
    concerns?: string;
    photo_urls?: string[];
  };
  isSubmitting?: boolean;
}

export function LogForm({
  careReceiverName,
  onSubmit,
  initialData,
  isSubmitting = false,
}: LogFormProps) {
  const today = new Date();

  // スコア（デフォルト3 = ふつう）
  const [moodScore, setMoodScore] = useState(initialData?.mood || 3);
  const [appetiteScore, setAppetiteScore] = useState(initialData?.appetite || 3);
  const [sleepScore, setSleepScore] = useState(initialData?.sleep_quality || 3);
  const [activityScore, setActivityScore] = useState(initialData?.activity_level || 3);

  // テキスト入力
  const [notes, setNotes] = useState(initialData?.notes || '');
  const [concerns, setConcerns] = useState(initialData?.concerns || '');

  // 写真
  const [photos, setPhotos] = useState<string[]>(initialData?.photo_urls || []);

  const handleNotesChange = (text: string) => {
    if (text.length <= MAX_NOTES_LENGTH) {
      setNotes(text);
    }
  };

  const handleConcernsChange = (text: string) => {
    if (text.length <= MAX_CONCERNS_LENGTH) {
      setConcerns(text);
    }
  };

  const handleSubmit = () => {
    onSubmit({
      log_date: format(today, 'yyyy-MM-dd'),
      mood: moodScore,
      appetite: appetiteScore,
      sleep_quality: sleepScore,
      activity_level: activityScore,
      notes: notes.trim(),
      concerns: concerns.trim(),
      photo_urls: photos,
    });
  };

  return (
    <View className="pb-4">
      {/* ヘッダー: 利用者名 + 日付 */}
      <View className="bg-white rounded-2xl p-5 shadow-sm mb-4">
        <Text className="text-2xl font-bold text-gray-800 text-center">
          今日の
          <Text className="text-primary-600">
            {careReceiverName || '利用者'}さん
          </Text>
          の様子
        </Text>
        <Text className="text-lg text-gray-500 text-center mt-2">
          {format(today, 'M月d日（E）', { locale: ja })}
        </Text>
      </View>

      {/* スコア入力セクション */}
      <View className="bg-white rounded-2xl p-5 shadow-sm mb-4">
        <Text className="text-xl font-bold text-gray-800 mb-4">
          今日の様子を教えてください
        </Text>
        <Text className="text-base text-gray-500 mb-4">
          それぞれの項目をタップで選んでください
        </Text>

        <ScoreSlider
          label="気分"
          category="mood"
          value={moodScore}
          onChange={setMoodScore}
        />

        <ScoreSlider
          label="食欲"
          category="appetite"
          value={appetiteScore}
          onChange={setAppetiteScore}
        />

        <ScoreSlider
          label="睡眠"
          category="sleep"
          value={sleepScore}
          onChange={setSleepScore}
        />

        <ScoreSlider
          label="活動量"
          category="activity"
          value={activityScore}
          onChange={setActivityScore}
        />
      </View>

      {/* 自由記述セクション */}
      <View className="bg-white rounded-2xl p-5 shadow-sm mb-4">
        <Text className="text-xl font-bold text-gray-800 mb-4">
          📝 メモ（任意）
        </Text>

        {/* 今日のメモ */}
        <View className="mb-5">
          <View className="flex-row items-center justify-between mb-2">
            <Text className="text-base font-semibold text-gray-700">
              今日のメモ
            </Text>
            <Text className={`text-sm ${notes.length > MAX_NOTES_LENGTH * 0.9 ? 'text-orange-500' : 'text-gray-400'}`}>
              {notes.length}/{MAX_NOTES_LENGTH}
            </Text>
          </View>
          <TextInput
            className="w-full min-h-[100px] p-4 bg-gray-50 border border-gray-200 rounded-xl text-base text-gray-900"
            placeholder="今日あったことを自由にメモ..."
            placeholderTextColor="#9ca3af"
            value={notes}
            onChangeText={handleNotesChange}
            multiline
            textAlignVertical="top"
            accessibilityLabel="今日のメモ入力欄"
            accessibilityHint="今日あったことを自由に記入してください"
          />
        </View>

        {/* 気になること */}
        <View>
          <View className="flex-row items-center justify-between mb-2">
            <Text className="text-base font-semibold text-gray-700">
              気になること
            </Text>
            <Text className={`text-sm ${concerns.length > MAX_CONCERNS_LENGTH * 0.9 ? 'text-orange-500' : 'text-gray-400'}`}>
              {concerns.length}/{MAX_CONCERNS_LENGTH}
            </Text>
          </View>
          <TextInput
            className="w-full min-h-[100px] p-4 bg-amber-50 border border-amber-200 rounded-xl text-base text-gray-900"
            placeholder="体調の変化や心配事があれば..."
            placeholderTextColor="#9ca3af"
            value={concerns}
            onChangeText={handleConcernsChange}
            multiline
            textAlignVertical="top"
            accessibilityLabel="気になること入力欄"
            accessibilityHint="体調の変化や心配事があれば記入してください"
          />
        </View>
      </View>

      {/* 写真セクション */}
      <View className="bg-white rounded-2xl p-5 shadow-sm mb-6">
        <Text className="text-xl font-bold text-gray-800 mb-4">
          📷 写真（任意）
        </Text>
        <PhotoPicker
          photos={photos}
          onPhotosChange={setPhotos}
          maxPhotos={3}
        />
      </View>

      {/* 送信ボタン */}
      <Pressable
        className={`w-full h-16 rounded-2xl items-center justify-center shadow-lg flex-row ${
          isSubmitting ? 'bg-gray-400' : 'bg-primary-600 active:bg-primary-700'
        }`}
        onPress={handleSubmit}
        disabled={isSubmitting}
        accessibilityLabel="記録する"
        accessibilityRole="button"
        accessibilityState={{ disabled: isSubmitting }}
      >
        {isSubmitting && (
          <ActivityIndicator size="small" color="#fff" style={{ marginRight: 8 }} />
        )}
        <Text className="text-xl font-bold text-white">
          {isSubmitting ? '保存中...' : '記録する'}
        </Text>
      </Pressable>
    </View>
  );
}
