import { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';

interface Feedback {
  id: string;
  category: string;
  content: string;
  is_anonymous: boolean;
  status: string;
  created_at: string;
}

const categoryLabels: Record<string, string> = {
  service: 'サービス',
  schedule: 'スケジュール',
  cost: '費用',
  communication: 'コミュニケーション',
  other: 'その他',
};

const statusLabels: Record<string, { label: string; color: string }> = {
  unread: { label: '未読', color: 'bg-gray-100 text-gray-600' },
  read: { label: '確認済み', color: 'bg-blue-100 text-blue-600' },
  addressed: { label: '対応済み', color: 'bg-green-100 text-green-600' },
};

export default function FeedbackHistoryScreen() {
  const { familyMember } = useAuth();
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchFeedbacks = useCallback(async () => {
    if (!familyMember?.id) return;

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('feedbacks')
        .select('id, category, content, is_anonymous, status, created_at')
        .eq('family_member_id', familyMember.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setFeedbacks(data || []);
    } catch (error) {
      console.error('Failed to fetch feedbacks:', error);
    } finally {
      setIsLoading(false);
    }
  }, [familyMember?.id]);

  useEffect(() => {
    fetchFeedbacks();
  }, [fetchFeedbacks]);

  if (isLoading && feedbacks.length === 0) {
    return <LoadingSpinner />;
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={['bottom']}>
      <FlatList
        data={feedbacks}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16 }}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={fetchFeedbacks}
            tintColor="#0d9488"
          />
        }
        ListEmptyComponent={
          <View className="items-center py-12">
            <Ionicons name="chatbubbles-outline" size={64} color="#9ca3af" />
            <Text className="text-lg text-gray-500 mt-4 text-center">
              まだ投函がありません
            </Text>
          </View>
        }
        renderItem={({ item }) => {
          const status = statusLabels[item.status] || statusLabels.unread;
          return (
            <View className="bg-white rounded-xl p-4 mb-3 shadow-sm">
              <View className="flex-row items-center justify-between mb-2">
                <Text className="text-base font-medium text-gray-700">
                  {categoryLabels[item.category] || item.category}
                </Text>
                <View className={`px-2 py-1 rounded-full ${status.color}`}>
                  <Text className="text-sm font-medium">
                    {status.label}
                  </Text>
                </View>
              </View>
              <Text className="text-base text-gray-800 mb-2">
                {item.content}
              </Text>
              <View className="flex-row items-center justify-between">
                <Text className="text-sm text-gray-500">
                  {format(new Date(item.created_at), 'yyyy年M月d日 HH:mm', { locale: ja })}
                </Text>
                {item.is_anonymous && (
                  <Text className="text-sm text-gray-400">匿名</Text>
                )}
              </View>
            </View>
          );
        }}
      />
    </SafeAreaView>
  );
}
