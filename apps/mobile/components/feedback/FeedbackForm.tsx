import { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  Switch,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import type { FeedbackCategory } from '@tsunagu-care/shared';

const MAX_CONTENT_LENGTH = 1000;

interface FeedbackFormProps {
  onSubmit: (data: {
    category: FeedbackCategory;
    content: string;
    is_anonymous: boolean;
  }) => void;
  isSubmitting?: boolean;
}

const categories: { id: FeedbackCategory; label: string; emoji: string }[] = [
  { id: 'service', label: 'サービス', emoji: '🏥' },
  { id: 'schedule', label: 'スケジュール', emoji: '📅' },
  { id: 'cost', label: '費用', emoji: '💰' },
  { id: 'communication', label: 'コミュニケーション', emoji: '💬' },
  { id: 'other', label: 'その他', emoji: '📝' },
];

export function FeedbackForm({ onSubmit, isSubmitting = false }: FeedbackFormProps) {
  const [selectedCategory, setSelectedCategory] = useState<FeedbackCategory | ''>('');
  const [content, setContent] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(true); // デフォルトは匿名ON

  const handleCategorySelect = (categoryId: FeedbackCategory) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedCategory(categoryId);
  };

  const handleContentChange = (text: string) => {
    if (text.length <= MAX_CONTENT_LENGTH) {
      setContent(text);
    }
  };

  const handleToggleAnonymous = (value: boolean) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIsAnonymous(value);
  };

  const handleSubmit = () => {
    if (!selectedCategory || !content.trim()) {
      return;
    }

    onSubmit({
      category: selectedCategory,
      content: content.trim(),
      is_anonymous: isAnonymous,
    });
  };

  const isValid = selectedCategory && content.trim().length > 0;
  const selectedCategoryLabel = categories.find(c => c.id === selectedCategory)?.label || '';

  return (
    <View className="pb-4">
      {/* カテゴリ選択（横スクロールチップ） */}
      <View className="bg-white rounded-2xl p-5 shadow-sm mb-4">
        <Text className="text-lg font-bold text-gray-800 mb-3">
          カテゴリを選んでください
        </Text>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 10 }}
        >
          {categories.map((category) => {
            const isSelected = selectedCategory === category.id;
            return (
              <Pressable
                key={category.id}
                className={`flex-row items-center px-4 py-3 rounded-full border-2 ${
                  isSelected
                    ? 'border-primary-600 bg-primary-50'
                    : 'border-gray-200 bg-gray-50'
                }`}
                onPress={() => handleCategorySelect(category.id)}
                accessibilityLabel={`${category.label}を選択`}
                accessibilityRole="button"
                accessibilityState={{ selected: isSelected }}
              >
                <Text className="text-lg mr-2">{category.emoji}</Text>
                <Text
                  className={`text-base font-medium ${
                    isSelected ? 'text-primary-700' : 'text-gray-600'
                  }`}
                >
                  {category.label}
                </Text>
                {isSelected && (
                  <Ionicons
                    name="checkmark-circle"
                    size={18}
                    color="#0d9488"
                    style={{ marginLeft: 6 }}
                  />
                )}
              </Pressable>
            );
          })}
        </ScrollView>

        {selectedCategory && (
          <View className="mt-3 bg-primary-50 rounded-lg px-3 py-2">
            <Text className="text-sm text-primary-700">
              「{selectedCategoryLabel}」について伝えます
            </Text>
          </View>
        )}
      </View>

      {/* テキスト入力 */}
      <View className="bg-white rounded-2xl p-5 shadow-sm mb-4">
        <View className="flex-row items-center justify-between mb-3">
          <Text className="text-lg font-bold text-gray-800">
            伝えたい内容
          </Text>
          <Text
            className={`text-sm ${
              content.length > MAX_CONTENT_LENGTH * 0.9
                ? 'text-orange-500 font-medium'
                : 'text-gray-400'
            }`}
          >
            {content.length}/{MAX_CONTENT_LENGTH}
          </Text>
        </View>

        <TextInput
          className="w-full min-h-[160px] p-4 bg-gray-50 border border-gray-200 rounded-xl text-base text-gray-900"
          placeholder="感じていることを自由にお書きください..."
          placeholderTextColor="#9ca3af"
          value={content}
          onChangeText={handleContentChange}
          multiline
          textAlignVertical="top"
          accessibilityLabel="伝えたい内容入力欄"
          accessibilityHint="ケアマネさんに伝えたいことを入力してください"
        />
      </View>

      {/* 匿名トグル */}
      <View className="bg-white rounded-2xl p-5 shadow-sm mb-6">
        <View className="flex-row items-center justify-between">
          <View className="flex-1 mr-4">
            <View className="flex-row items-center">
              <Ionicons
                name={isAnonymous ? 'eye-off' : 'eye'}
                size={20}
                color={isAnonymous ? '#0d9488' : '#6b7280'}
              />
              <Text className="text-base font-semibold text-gray-800 ml-2">
                匿名で送る
              </Text>
            </View>
            <Text className="text-sm text-gray-500 mt-1 ml-7">
              {isAnonymous
                ? '名前を伏せてケアマネさんに届きます'
                : 'お名前付きで届きます'}
            </Text>
          </View>
          <Switch
            value={isAnonymous}
            onValueChange={handleToggleAnonymous}
            trackColor={{ false: '#d1d5db', true: '#99f6e4' }}
            thumbColor={isAnonymous ? '#0d9488' : '#f4f4f5'}
            accessibilityLabel={isAnonymous ? '匿名送信オン' : '匿名送信オフ'}
          />
        </View>

        {!isAnonymous && (
          <View className="mt-3 bg-amber-50 rounded-lg px-3 py-2 flex-row items-center">
            <Ionicons name="information-circle" size={16} color="#d97706" />
            <Text className="text-sm text-amber-700 ml-2">
              あなたのお名前がケアマネさんに表示されます
            </Text>
          </View>
        )}
      </View>

      {/* 送信ボタン */}
      <Pressable
        className={`w-full h-16 rounded-2xl items-center justify-center shadow-lg flex-row ${
          isValid && !isSubmitting
            ? 'bg-primary-600 active:bg-primary-700'
            : 'bg-gray-300'
        }`}
        onPress={handleSubmit}
        disabled={!isValid || isSubmitting}
        accessibilityLabel="送信する"
        accessibilityRole="button"
        accessibilityState={{ disabled: !isValid || isSubmitting }}
      >
        {isSubmitting && (
          <ActivityIndicator size="small" color="#fff" style={{ marginRight: 8 }} />
        )}
        <Text
          className={`text-xl font-bold ${
            isValid && !isSubmitting ? 'text-white' : 'text-gray-500'
          }`}
        >
          {isSubmitting ? '送信中...' : '送信する'}
        </Text>
      </Pressable>
    </View>
  );
}
