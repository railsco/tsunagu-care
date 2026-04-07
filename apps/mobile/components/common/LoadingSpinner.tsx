import { View, ActivityIndicator, Text } from 'react-native';

interface LoadingSpinnerProps {
  message?: string;
  size?: 'small' | 'large';
}

export function LoadingSpinner({ 
  message = '読み込み中...', 
  size = 'large' 
}: LoadingSpinnerProps) {
  return (
    <View className="flex-1 items-center justify-center bg-white">
      <ActivityIndicator size={size} color="#0d9488" />
      {message && (
        <Text className="mt-4 text-base text-gray-600">{message}</Text>
      )}
    </View>
  );
}
