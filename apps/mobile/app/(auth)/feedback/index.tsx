import { useState, useCallback } from 'react';
import { View, Text, ScrollView, Alert, Pressable, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
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
import { FeedbackForm } from '@/components/feedback/FeedbackForm';
import { useCareReceiver } from '@/hooks/useCareReceiver';
import type { FeedbackCategory } from '@tsunagu-care/shared';

type FeedbackData = {
  category: FeedbackCategory;
  content: string;
  is_anonymous: boolean;
};

export default function FeedbackScreen() {
  const router = useRouter();
  const { createFeedback } = useCareReceiver();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [formKey, setFormKey] = useState(0);

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

    // 2.5秒後にフェードアウト
    successOpacity.value = withDelay(
      2500,
      withSpring(0, {}, () => {
        runOnJS(setShowSuccess)(false);
        runOnJS(setFormKey)((prev: number) => prev + 1);
      })
    );
  }, []);

  const handleSubmit = (data: FeedbackData) => {
    // 送信確認ダイアログ
    Alert.alert(
      '送信確認',
      'この内容でケアマネさんに送りますか？',
      [
        { text: 'いいえ', style: 'cancel' },
        {
          text: 'はい',
          onPress: () => submitFeedback(data),
        },
      ]
    );
  };

  const submitFeedback = async (data: FeedbackData) => {
    setIsSubmitting(true);
    try {
      await createFeedback(data);
      showSuccessAnimation();
    } catch (error) {
      console.error('Failed to create feedback:', error);
      Alert.alert('エラー', '送信に失敗しました。もう一度お試しください。');
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
          {/* ヘッダー */}
          <View className="bg-primary-600 rounded-2xl p-6 mb-4 shadow-lg">
            <View className="flex-row items-center mb-2">
              <View className="w-10 h-10 bg-white/20 rounded-full items-center justify-center mr-3">
                <Ionicons name="chatbubble-ellipses" size={20} color="#fff" />
              </View>
              <Text className="text-2xl font-bold text-white">
                ケアマネさんに伝えたいこと
              </Text>
            </View>
            <Text className="text-base text-primary-100 ml-13">
              直接言いづらいことも、ここから伝えられます。
            </Text>
          </View>

          {/* フォーム */}
          <FeedbackForm
            key={formKey}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
          />

          {/* 過去の投稿リンク */}
          <Pressable
            className="flex-row items-center justify-center mt-4 py-4"
            onPress={() => router.push('/(auth)/feedback/history')}
            accessibilityLabel="過去の投稿を見る"
            accessibilityRole="button"
          >
            <Ionicons name="time-outline" size={20} color="#6b7280" />
            <Text className="text-base text-gray-600 ml-2 underline">
              過去の投稿を見る
            </Text>
            <Ionicons name="chevron-forward" size={16} color="#6b7280" style={{ marginLeft: 4 }} />
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* サクセスオーバーレイ */}
      {showSuccess && (
        <View className="absolute inset-0 items-center justify-center bg-black/30">
          <Animated.View
            style={successAnimatedStyle}
            className="bg-white rounded-3xl p-8 items-center shadow-2xl mx-8"
          >
            <View className="w-20 h-20 bg-primary-100 rounded-full items-center justify-center mb-4">
              <Ionicons name="paper-plane" size={40} color="#0d9488" />
            </View>
            <Text className="text-2xl font-bold text-gray-800 mb-2">
              送信しました
            </Text>
            <Text className="text-base text-gray-500 text-center">
              ケアマネさんが確認します。{'\n'}
              ご連絡をお待ちください。
            </Text>
          </Animated.View>
        </View>
      )}
    </SafeAreaView>
  );
}
