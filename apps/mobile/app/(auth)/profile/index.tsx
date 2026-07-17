import { View, Text, Pressable, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import { useAuth } from '@/hooks/useAuth';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';

const appVersion = Constants.expoConfig?.version ?? '—';

export default function ProfileScreen() {
  const { user, familyMember, careReceiver, signOut, isLoading } = useAuth();

  const handleSignOut = () => {
    Alert.alert(
      'ログアウト',
      'ログアウトしますか？',
      [
        { text: 'キャンセル', style: 'cancel' },
        {
          text: 'ログアウト',
          style: 'destructive',
          onPress: signOut,
        },
      ]
    );
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={['bottom']}>
      <View className="flex-1 p-4">
        {/* ユーザー情報 */}
        <View className="bg-white rounded-2xl p-5 shadow-sm mb-4">
          <View className="flex-row items-center mb-4">
            <View className="w-16 h-16 bg-primary-100 rounded-full items-center justify-center">
              <Ionicons name="person" size={32} color="#0d9488" />
            </View>
            <View className="ml-4 flex-1">
              <Text className="text-xl font-bold text-gray-800">
                {familyMember?.name || 'ユーザー'}
              </Text>
              <Text className="text-base text-gray-500">
                {user?.email}
              </Text>
            </View>
          </View>

          {careReceiver && (
            <View className="bg-gray-50 rounded-xl p-4">
              <Text className="text-sm text-gray-500 mb-1">
                担当する利用者さま
              </Text>
              <Text className="text-lg font-medium text-gray-800">
                {careReceiver.name}さん
              </Text>
              {careReceiver.care_level && (
                <Text className="text-base text-gray-600 mt-1">
                  {careReceiver.care_level}
                </Text>
              )}
            </View>
          )}
        </View>

        {/* メニュー */}
        {/* 通知設定・ヘルプはプッシュ通知実装（v1.1）と合わせて追加予定 */}
        <View className="bg-white rounded-2xl shadow-sm overflow-hidden mb-4">
          <Pressable
            className="flex-row items-center p-4 active:bg-gray-50"
            accessibilityRole="button"
            accessibilityLabel="アプリについて"
            onPress={() =>
              Alert.alert(
                'つなぐケア',
                `バージョン ${appVersion}\n\nケアマネージャーと利用者家族をつなぐプラットフォームです。`
              )
            }
          >
            <View className="w-10 h-10 bg-purple-100 rounded-full items-center justify-center">
              <Ionicons name="information-circle-outline" size={20} color="#a855f7" />
            </View>
            <Text className="flex-1 ml-3 text-base text-gray-800">
              アプリについて
            </Text>
            <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
          </Pressable>
        </View>

        {/* ログアウト */}
        <Pressable
          className="bg-white rounded-2xl p-4 shadow-sm flex-row items-center justify-center active:bg-gray-50"
          onPress={handleSignOut}
          accessibilityRole="button"
          accessibilityLabel="ログアウト"
        >
          <Ionicons name="log-out-outline" size={20} color="#ef4444" />
          <Text className="ml-2 text-base font-medium text-red-500">
            ログアウト
          </Text>
        </Pressable>

        {/* バージョン情報 */}
        <View className="items-center mt-auto pt-4">
          <Text className="text-sm text-gray-400">
            つなぐケア v{appVersion}
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}
