'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Mail, Lock, Loader2, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { signIn } from '@/lib/auth';
import { useAuthStore } from '@/stores/authStore';

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const rawRedirect = searchParams.get('redirect') || '/dashboard';
  const redirect = rawRedirect.startsWith('/') && !rawRedirect.startsWith('//') ? rawRedirect : '/dashboard';

  const { setUser, setCareManager } = useAuthStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string; auth?: string }>({});

  const validateForm = (): boolean => {
    const newErrors: { email?: string; password?: string } = {};

    if (!email) {
      newErrors.email = 'メールアドレスを入力してください';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = '有効なメールアドレスを入力してください';
    }

    if (!password) {
      newErrors.password = 'パスワードを入力してください';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      // ロール判定付きログイン
      const { user, careManager } = await signIn(email, password);

      // ストアに保存
      setUser(user);
      setCareManager(careManager);

      // リダイレクト
      router.push(redirect);
      router.refresh();
    } catch (error) {
      let errorMessage = 'ログインに失敗しました';

      if (error instanceof Error) {
        const msg = error.message;

        if (msg.includes('Invalid login credentials')) {
          errorMessage = 'メールアドレスまたはパスワードが正しくありません';
        } else if (msg.includes('Email not confirmed')) {
          errorMessage = 'メールアドレスが確認されていません。確認メールをご確認ください';
        } else if (msg.includes('Too many requests')) {
          errorMessage = 'ログイン試行回数が多すぎます。しばらく経ってから再度お試しください';
        } else if (msg.includes('家族向け') || msg.includes('モバイルアプリ')) {
          errorMessage = msg;
        } else if (msg.includes('登録されていません')) {
          errorMessage = msg;
        } else {
          errorMessage = msg;
        }
      }

      setErrors({ auth: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = () => {
    alert('パスワードリセット機能は現在準備中です。\n管理者にお問い合わせください。');
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ backgroundColor: '#F0F9F6' }}
    >
      <Card className="w-full max-w-md bg-white rounded-lg shadow-md">
        <CardHeader className="text-center pb-2">
          <div className="flex justify-center mb-4">
            <div className="flex items-center justify-center h-16 w-16 rounded-2xl bg-teal-50 text-4xl">
              🤝
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-gray-800">
            つなぐケア
          </CardTitle>
          <CardDescription className="text-gray-600">
            ケアマネージャー向け管理画面
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* メールアドレス */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-700">
                メールアドレス
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="example@email.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errors.email) {
                      setErrors((prev) => ({ ...prev, email: undefined }));
                    }
                  }}
                  className={`pl-10 ${errors.email ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                  autoComplete="email"
                  disabled={isLoading}
                />
              </div>
              {errors.email && (
                <p className="text-sm text-red-500">{errors.email}</p>
              )}
            </div>

            {/* パスワード */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-gray-700">
                パスワード
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errors.password) {
                      setErrors((prev) => ({ ...prev, password: undefined }));
                    }
                  }}
                  className={`pl-10 ${errors.password ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                  autoComplete="current-password"
                  disabled={isLoading}
                />
              </div>
              {errors.password && (
                <p className="text-sm text-red-500">{errors.password}</p>
              )}
            </div>

            {/* 認証エラー */}
            {errors.auth && (
              <div className="p-3 rounded-md bg-red-50 border border-red-200 flex items-start gap-2">
                <AlertTriangle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-600">{errors.auth}</p>
              </div>
            )}

            {/* ログインボタン */}
            <Button
              type="submit"
              className="w-full bg-teal-600 hover:bg-teal-700 text-white"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ログイン中...
                </>
              ) : (
                'ログイン'
              )}
            </Button>
          </form>

          {/* パスワードを忘れた方リンク */}
          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={handleForgotPassword}
              className="text-sm text-teal-600 hover:text-teal-700 hover:underline"
              disabled={isLoading}
            >
              パスワードを忘れた方
            </button>
          </div>

          {/* 注意事項 */}
          <div className="mt-6 p-3 rounded-md bg-amber-50 border border-amber-200">
            <p className="text-xs text-amber-700 text-center">
              ※ご家族の方はモバイルアプリをご利用ください
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
