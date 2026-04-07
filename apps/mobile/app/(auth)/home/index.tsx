import { View, Text, Pressable, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import { useAuth } from '@/hooks/useAuth';
import { useCareReceiver } from '@/hooks/useCareReceiver';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';

export default function HomeScreen() {
  const router = useRouter();
  const { careReceiver, isLoading: isAuthLoading } = useAuth();
  const { recentLogs, isLoadingLogs } = useCareReceiver();

  if (isAuthLoading) {
    return <LoadingSpinner />;
  }

  const today = new Date();
  const formattedDate = format(today, 'M月d日（E）', { locale: ja });

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={['bottom']}>
      <ScrollView className="flex-1" contentContainerStyle={{ padding: 16 }}>
        {/* 日付表示 */}
        <View className="mb-6">
          <Text className="text-2xl font-bold text-gray-800">
            {formattedDate}
          </Text>
          {careReceiver && (
            <Text className="text-lg text-gray-600 mt-1">
              {careReceiver.name}さんの記録
            </Text>
          )}
        </View>

        {/* クイックアクション */}
        <View className="flex-row gap-4 mb-6">
          <Pressable
            className="flex-1 bg-primary-600 rounded-2xl p-5 items-center active:bg-primary-700"
            onPress={() => router.push('/(auth)/log')}
            accessibilityLabel="今日の日記を書く"
            accessibilityRole="button"
          >
            <View className="w-14 h-14 bg-white/20 rounded-full items-center justify-center mb-3">
              <Ionicons name="create" size={28} color="#fff" />
            </View>
            <Text className="text-lg font-bold text-white">
              今日の日記
            </Text>
            <Text className="text-base text-primary-100 mt-1">
              を書く
            </Text>
          </Pressable>

          <Pressable
            className="flex-1 bg-amber-500 rounded-2xl p-5 items-center active:bg-amber-600"
            onPress={() => router.push('/(auth)/feedback')}
            accessibilityLabel="ほんねを投函する"
            accessibilityRole="button"
          >
            <View className="w-14 h-14 bg-white/20 rounded-full items-center justify-center mb-3">
              <Ionicons name="chatbubble-ellipses" size={28} color="#fff" />
            </View>
            <Text className="text-lg font-bold text-white">
              ほんね
            </Text>
            <Text className="text-base text-amber-100 mt-1">
              を投函
            </Text>
          </Pressable>
        </View>

        {/* 最近の日記 */}
        <View className="bg-white rounded-2xl p-5 shadow-sm">
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-xl font-bold text-gray-800">
              最近の日記
            </Text>
            <Pressable
              onPress={() => router.push('/(auth)/log/history')}
              accessibilityLabel="過去の日記一覧を見る"
              accessibilityRole="button"
            >
              <Text className="text-base text-primary-600 font-medium">
                すべて見る
              </Text>
            </Pressable>
          </View>

          {isLoadingLogs ? (
            <View className="py-8">
              <LoadingSpinner size="small" message="読み込み中..." />
            </View>
          ) : recentLogs.length === 0 ? (
            <View className="py-8 items-center">
              <Ionicons name="document-text-outline" size={48} color="#9ca3af" />
              <Text className="text-base text-gray-500 mt-3 text-center">
                まだ日記がありません{'\n'}
                今日の出来事を記録しましょう
              </Text>
            </View>
          ) : (
            <View className="gap-3">
              {recentLogs.slice(0, 3).map((log) => (
                <View
                  key={log.id}
                  className="bg-gray-50 rounded-xl p-4"
                >
                  <Text className="text-base font-medium text-gray-700 mb-1">
                    {format(new Date(log.log_date), 'M月d日（E）', { locale: ja })}
                  </Text>
                  <Text className="text-base text-gray-600" numberOfLines={2}>
                    {log.notes || '記録なし'}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
