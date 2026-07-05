'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, Loader2, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { createClient } from '@/lib/supabase/client';

// メールのリセットリンク（?code=...）から遷移するパスワード再設定ページ。
// createBrowserClient が code をセッションに自動交換するため、
// セッション確立を待ってから updateUser でパスワードを更新する。
export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [sessionState, setSessionState] = useState<'checking' | 'ready' | 'invalid'>('checking');

  useEffect(() => {
    const supabase = createClient();

    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setSessionState('ready');
        return;
      }
      // コード交換の完了を少し待つ
      const { data: { subscription } } = supabase.auth.onAuthStateChange((event, newSession) => {
        if (newSession) {
          setSessionState('ready');
          subscription.unsubscribe();
        }
      });
      setTimeout(() => {
        subscription.unsubscribe();
        setSessionState((prev) => (prev === 'checking' ? 'invalid' : prev));
      }, 3000);
    };

    checkSession();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError('パスワードは8文字以上で入力してください');
      return;
    }
    if (password !== confirmPassword) {
      setError('パスワードが一致しません');
      return;
    }

    setIsLoading(true);
    try {
      const supabase = createClient();
      const { error: updateError } = await supabase.auth.updateUser({ password });
      if (updateError) throw updateError;

      // 再設定後は一度サインアウトし、新しいパスワードでログインし直してもらう
      await supabase.auth.signOut();
      setIsSuccess(true);
    } catch {
      setError('パスワードの更新に失敗しました。リンクの有効期限が切れている可能性があります');
    } finally {
      setIsLoading(false);
    }
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
              🔑
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-gray-800">
            パスワード再設定
          </CardTitle>
          <CardDescription className="text-gray-600">
            新しいパスワードを設定してください
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-4">
          {isSuccess ? (
            <div className="space-y-4 text-center">
              <div className="flex justify-center">
                <CheckCircle2 className="h-12 w-12 text-teal-600" />
              </div>
              <p className="text-gray-700">
                パスワードを更新しました。
                <br />
                新しいパスワードでログインしてください。
              </p>
              <Button
                className="w-full bg-teal-600 hover:bg-teal-700 text-white"
                onClick={() => router.push('/login')}
              >
                ログイン画面へ
              </Button>
            </div>
          ) : sessionState === 'invalid' ? (
            <div className="space-y-4">
              <div className="p-3 rounded-md bg-red-50 border border-red-200 flex items-start gap-2">
                <AlertTriangle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-600">
                  リンクが無効か、有効期限が切れています。
                  ログイン画面から再度「パスワードを忘れた方」をお試しください。
                </p>
              </div>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => router.push('/login')}
              >
                ログイン画面へ戻る
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password" className="text-gray-700">
                  新しいパスワード
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="8文字以上"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10"
                    autoComplete="new-password"
                    disabled={isLoading || sessionState === 'checking'}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-gray-700">
                  新しいパスワード（確認）
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pl-10"
                    autoComplete="new-password"
                    disabled={isLoading || sessionState === 'checking'}
                  />
                </div>
              </div>

              {error && (
                <div className="p-3 rounded-md bg-red-50 border border-red-200 flex items-start gap-2">
                  <AlertTriangle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              <Button
                type="submit"
                className="w-full bg-teal-600 hover:bg-teal-700 text-white"
                disabled={isLoading || sessionState === 'checking'}
              >
                {isLoading || sessionState === 'checking' ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {sessionState === 'checking' ? '確認中...' : '更新中...'}
                  </>
                ) : (
                  'パスワードを更新'
                )}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
