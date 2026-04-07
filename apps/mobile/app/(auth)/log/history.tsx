import { View, Text, FlatList, Pressable, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useCareReceiver } from '@/hooks/useCareReceiver';
import { LogCard } from '@/components/log/LogCard';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';

export default function LogHistoryScreen() {
  const { recentLogs, isLoadingLogs, fetchRecentLogs } = useCareReceiver();

  if (isLoadingLogs && recentLogs.length === 0) {
    return <LoadingSpinner />;
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={['bottom']}>
      <FlatList
        data={recentLogs}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16 }}
        refreshControl={
          <RefreshControl
            refreshing={isLoadingLogs}
            onRefresh={fetchRecentLogs}
            tintColor="#0d9488"
          />
        }
        ListEmptyComponent={
          <View className="items-center py-12">
            <Ionicons name="document-text-outline" size={64} color="#9ca3af" />
            <Text className="text-lg text-gray-500 mt-4 text-center">
              まだ日記がありません
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <View className="mb-4">
            <LogCard log={item} />
          </View>
        )}
        ItemSeparatorComponent={() => <View className="h-2" />}
      />
    </SafeAreaView>
  );
}
