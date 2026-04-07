import { useState, useCallback } from 'react';
import { View, Text, ScrollView, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withDelay,
  runOnJS,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { LogForm } from '@/components/log/LogForm';
import { useCareReceiver } from '@/hooks/useCareReceiver';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';

import type { ScoreValue } from '@tsunagu-care/shared';

type LogData = {
  log_date: string;
  mood: number;
  appetite: number;
  sleep_quality: number;
  activity_level: number;
  notes: string;
  concerns: string;
  photo_urls: string[];
};

const uploadPhotos = async (localUris: string[]): Promise<string[]> => {
  const urls: string[] = [];
  for (const uri of localUris) {
    const filename = `${Date.now()}_${Math.random().toString(36).slice(2)}.jpg`;
    const path = `daily-logs/${filename}`;

    const response = await fetch(uri);
    const blob = await response.blob();

    const { error } = await supabase.storage
      .from('photos')
      .upload(path, blob, { contentType: 'image/jpeg' });

    if (error) {
      console.error('Photo upload failed:', error);
      continue;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('photos')
      .getPublicUrl(path);

    urls.push(publicUrl);
  }
  return urls;
};

export default function LogScreen() {
  const { careReceiver, familyMember } = useAuth();
  const { createLog, fetchRecentLogs } = useCareReceiver();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [formKey, setFormKey] = useState(0); // フォームリセット用

  // アニメーション
  const successScale = useSharedValue(0);
  const successOpacity = useSharedValue(0);

  const successAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: successScale.value }],
    opacity: successOpacity.value,
  }));

  const showSuccessAnimation = useCallback(() => {
    setShowSuccess(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    successScale.value = withSequence(
      withSpring(1.2, { damping: 8, stiffness: 200 }),
      withSpring(1, { damping: 10 })
    );
    successOpacity.value = withSpring(1);

    // 2秒後にフェードアウト
    successOpacity.value = withDelay(
      2000,
      withSpring(0, {}, () => {
        runOnJS(setShowSuccess)(false);
        runOnJS(setFormKey)((prev: number) => prev + 1); // フォームリセット
      })
    );
  }, []);

  const checkExistingLog = async (logDate: string): Promise<boolean> => {
    if (!careReceiver?.id) return false;

    const { data } = await supabase
      .from('daily_logs')
      .select('id')
      .eq('care_receiver_id', careReceiver.id)
      .eq('log_date', logDate)
      .single();

    return !!data;
  };

  const handleSubmit = async (data: LogData) => {
    if (!careReceiver) {
      Alert.alert('エラー', '利用者情報が見つかりません');
      return;
    }

    // 同日の記録があるかチェック
    const hasExisting = await checkExistingLog(data.log_date);

    if (hasExisting) {
      Alert.alert(
        '上書き確認',
        '今日の記録は既に存在します。上書きしますか？',
        [
          { text: 'キャンセル', style: 'cancel' },
          {
            text: '上書きする',
            style: 'destructive',
            onPress: () => saveLog(data, true),
          },
        ]
      );
      return;
    }

    await saveLog(data, false);
  };

  const saveLog = async (data: LogData, isUpdate: boolean) => {
    if (!careReceiver) return;

    setIsSubmitting(true);
    try {
      // メモとconcernsを結合してnotesに保存
      const combinedNotes = [
        data.notes,
        data.concerns ? `【気になること】${data.concerns}` : '',
      ].filter(Boolean).join('\n\n');

      // Upload photos to Supabase Storage and get public URLs
      const photoUrls = data.photo_urls.length > 0
        ? await uploadPhotos(data.photo_urls)
        : [];

      const logPayload = {
        care_receiver_id: careReceiver.id,
        family_member_id: familyMember?.id ?? null,
        log_date: data.log_date,
        mood: data.mood as ScoreValue,
        appetite: data.appetite as ScoreValue,
        sleep_quality: data.sleep_quality as ScoreValue,
        activity_level: data.activity_level as ScoreValue,
        notes: combinedNotes,
        concerns: data.concerns || null,
        photo_urls: photoUrls,
      };

      if (isUpdate) {
        // UPSERT: 既存の記録を更新
        const { error } = await supabase
          .from('daily_logs')
          .upsert(logPayload, {
            onConflict: 'care_receiver_id,log_date',
          });

        if (error) throw error;
      } else {
        // 新規作成
        await createLog(logPayload);
      }

      // 最新のログを再取得
      await fetchRecentLogs();

      // サクセスアニメーション表示
      showSuccessAnimation();
    } catch (error) {
      console.error('Failed to save log:', error);
      Alert.alert('エラー', '記録の保存に失敗しました');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={['bottom']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
        keyboardVerticalOffset={100}
      >
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <LogForm
            key={formKey}
            careReceiverName={careReceiver?.name}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
          />
        </ScrollView>
      </KeyboardAvoidingView>

      {/* サクセスオーバーレイ */}
      {showSuccess && (
        <View className="absolute inset-0 items-center justify-center bg-black/30">
          <Animated.View
            style={successAnimatedStyle}
            className="bg-white rounded-3xl p-8 items-center shadow-2xl mx-8"
          >
            <View className="w-20 h-20 bg-green-100 rounded-full items-center justify-center mb-4">
              <Ionicons name="checkmark-circle" size={48} color="#22c55e" />
            </View>
            <Text className="text-2xl font-bold text-gray-800 mb-2">
              記録しました！
            </Text>
            <Text className="text-base text-gray-500 text-center">
              {careReceiver?.name}さんの今日の様子を{'\n'}保存しました
            </Text>
          </Animated.View>
        </View>
      )}
    </SafeAreaView>
  );
}
