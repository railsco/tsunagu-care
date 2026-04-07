import { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { signIn } from '@/lib/auth';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const passwordInputRef = useRef<TextInput>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const showError = (message: string) => {
    setError(message);
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.delay(4000),
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => setError(null));
  };

  const handleLogin = async () => {
    // バリデーション
    if (!email.trim()) {
      showError('メールアドレスを入力してください');
      return;
    }
    if (!password.trim()) {
      showError('パスワードを入力してください');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await signIn(email.trim(), password);
      // 認証成功後は _layout.tsx の useProtectedRoute で (auth)/home にリダイレクト
    } catch (err) {
      console.error('Login error:', err);

      let errorMessage = 'メールアドレスまたはパスワードが正しくありません';

      if (err instanceof Error) {
        const msg = err.message;

        if (msg.includes('Invalid login credentials')) {
          errorMessage = 'メールアドレスまたはパスワードが正しくありません';
        } else if (msg.includes('Email not confirmed')) {
          errorMessage = 'メールアドレスが確認されていません。確認メールをご確認ください';
        } else if (msg.includes('Too many requests')) {
          errorMessage = 'ログイン試行回数が多すぎます。しばらく経ってから再度お試しください';
        } else if (msg.includes('ケアマネージャー向け') || msg.includes('Webアプリ')) {
          // ケアマネがモバイルアプリにログインしようとした場合
          errorMessage = msg;
        } else if (msg.includes('登録されていません') || msg.includes('お問い合わせ')) {
          // どちらのテーブルにも登録されていない場合
          errorMessage = msg;
        }
      }

      showError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <LoadingSpinner message="ログイン中..." />;
  }

  return (
    <SafeAreaView className="flex-1 bg-primary-500">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View className="flex-1 justify-center px-6 py-8">
            {/* ロゴ・タイトル */}
            <View className="items-center mb-10">
              <View className="w-20 h-20 bg-white/20 rounded-full items-center justify-center mb-4">
                <Ionicons name="heart" size={40} color="#fff" />
              </View>
              <Text className="text-4xl font-bold text-white tracking-wide">
                つなぐケア
              </Text>
              <Text className="text-xl text-primary-100 mt-2 font-medium">
                ご家族向け
              </Text>
            </View>

            {/* エラーバナー */}
            {error && (
              <Animated.View
                style={{ opacity: fadeAnim }}
                className="bg-red-500 rounded-xl px-4 py-3 mb-4 flex-row items-center"
              >
                <Ionicons name="alert-circle" size={24} color="#fff" />
                <Text className="text-white text-base font-medium ml-2 flex-1">
                  {error}
                </Text>
                <Pressable
                  onPress={() => setError(null)}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  accessibilityLabel="エラーを閉じる"
                >
                  <Ionicons name="close" size={20} color="#fff" />
                </Pressable>
              </Animated.View>
            )}

            {/* ログインフォーム */}
            <View className="bg-white rounded-3xl p-6 shadow-xl">
              <Text className="text-2xl font-bold text-gray-800 mb-6 text-center">
                ログイン
              </Text>

              {/* メールアドレス */}
              <View className="mb-5">
                <Text className="text-base font-semibold text-gray-700 mb-2">
                  メールアドレス
                </Text>
                <View className="flex-row items-center bg-gray-50 border border-gray-200 rounded-2xl overflow-hidden">
                  <View className="pl-4">
                    <Ionicons name="mail-outline" size={22} color="#6b7280" />
                  </View>
                  <TextInput
                    className="flex-1 h-14 px-3 text-lg text-gray-900"
                    placeholder="example@email.com"
                    placeholderTextColor="#9ca3af"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoComplete="email"
                    autoCorrect={false}
                    returnKeyType="next"
                    onSubmitEditing={() => passwordInputRef.current?.focus()}
                    accessibilityLabel="メールアドレス入力欄"
                    accessibilityHint="ログイン用のメールアドレスを入力してください"
                  />
                </View>
              </View>

              {/* パスワード */}
              <View className="mb-8">
                <Text className="text-base font-semibold text-gray-700 mb-2">
                  パスワード
                </Text>
                <View className="flex-row items-center bg-gray-50 border border-gray-200 rounded-2xl overflow-hidden">
                  <View className="pl-4">
                    <Ionicons name="lock-closed-outline" size={22} color="#6b7280" />
                  </View>
                  <TextInput
                    ref={passwordInputRef}
                    className="flex-1 h-14 px-3 text-lg text-gray-900"
                    placeholder="パスワードを入力"
                    placeholderTextColor="#9ca3af"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                    autoComplete="password"
                    returnKeyType="done"
                    onSubmitEditing={handleLogin}
                    accessibilityLabel="パスワード入力欄"
                    accessibilityHint="ログイン用のパスワードを入力してください"
                  />
                  <Pressable
                    onPress={() => setShowPassword(!showPassword)}
                    className="pr-4 h-14 justify-center"
                    accessibilityLabel={showPassword ? 'パスワードを隠す' : 'パスワードを表示'}
                  >
                    <Ionicons
                      name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                      size={22}
                      color="#6b7280"
                    />
                  </Pressable>
                </View>
              </View>

              {/* ログインボタン */}
              <Pressable
                className="w-full h-14 bg-primary-600 rounded-2xl items-center justify-center active:bg-primary-700 shadow-md"
                onPress={handleLogin}
                accessibilityLabel="ログインボタン"
                accessibilityRole="button"
                accessibilityHint="タップしてログインします"
              >
                <Text className="text-xl font-bold text-white">
                  ログイン
                </Text>
              </Pressable>
            </View>

            {/* フッター */}
            <View className="mt-8 items-center">
              <Text className="text-base text-primary-100 text-center leading-6">
                ケアマネージャーから届いた{'\n'}
                招待メールをご確認ください
              </Text>
            </View>

            {/* スペーサー（キーボード対応） */}
            <View className="h-8" />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
