'use client';

import { useEffect, useState } from 'react';
import { Loader2, User, Phone } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { createClient } from '@/lib/supabase/client';
import { useAuthStore } from '@/stores/authStore';

export default function SettingsPage() {
  const { careManager, setCareManager } = useAuthStore();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (careManager) {
      setName(careManager.name);
      setPhone(careManager.phone ?? '');
    }
  }, [careManager]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!careManager) return;

    if (!name.trim()) {
      toast.error('氏名を入力してください');
      return;
    }

    setIsSaving(true);
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('care_managers')
        .update({ name: name.trim(), phone: phone.trim() || null })
        .eq('id', careManager.id)
        .select()
        .single();

      if (error) throw error;

      setCareManager(data);
      toast.success('プロフィールを更新しました');
    } catch {
      toast.error('更新に失敗しました。時間をおいて再度お試しください');
    } finally {
      setIsSaving(false);
    }
  };

  if (!careManager) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">設定</h1>

      <Card className="bg-white max-w-lg">
        <CardHeader>
          <CardTitle className="text-lg">プロフィール</CardTitle>
          <CardDescription>担当者情報を編集できます</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-gray-700">
                氏名
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="pl-10"
                  disabled={isSaving}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone" className="text-gray-700">
                電話番号
              </Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="phone"
                  type="tel"
                  placeholder="090-0000-0000"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="pl-10"
                  disabled={isSaving}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-gray-700">メールアドレス</Label>
              <Input value={careManager.email} disabled className="bg-gray-50 text-gray-500" />
              <p className="text-xs text-gray-500">
                メールアドレスの変更は管理者にお問い合わせください
              </p>
            </div>

            <Button
              type="submit"
              className="bg-teal-600 hover:bg-teal-700 text-white"
              disabled={isSaving}
            >
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  保存中...
                </>
              ) : (
                '保存する'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
