import { createClient } from './supabase/client';
import type { CareManager } from '@tsunagu-care/shared';

export type UserRole = 'care_manager' | 'family' | 'unknown';

export interface RoleCheckResult {
  role: UserRole;
  careManager?: CareManager;
  error?: string;
}

/**
 * ユーザーのロールを判定する
 * - care_managersテーブルにauth_idがあれば「ケアマネ」
 * - family_membersテーブルにauth_idがあれば「家族」
 * - どちらにもなければエラー
 */
export async function checkUserRole(authId: string): Promise<RoleCheckResult> {
  const supabase = createClient();

  // まずケアマネテーブルをチェック
  const { data: careManager, error: cmError } = await supabase
    .from('care_managers')
    .select('*')
    .eq('auth_id', authId)
    .single();

  if (careManager && !cmError) {
    return {
      role: 'care_manager',
      careManager,
    };
  }

  // 次に家族メンバーテーブルをチェック
  const { data: familyMember, error: fmError } = await supabase
    .from('family_members')
    .select('*')
    .eq('user_id', authId)
    .single();

  if (familyMember && !fmError) {
    return {
      role: 'family',
      error: 'このアカウントは家族向けです。モバイルアプリをご利用ください。',
    };
  }

  // どちらにもなければエラー
  return {
    role: 'unknown',
    error: 'アカウントが登録されていません。管理者にお問い合わせください。',
  };
}

/**
 * ログイン処理
 */
export async function signIn(email: string, password: string) {
  const supabase = createClient();

  const { data, error: authError } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (authError) {
    throw authError;
  }

  if (!data.user) {
    throw new Error('ログインに失敗しました');
  }

  // ロール判定
  const roleResult = await checkUserRole(data.user.id);

  if (roleResult.role !== 'care_manager') {
    // ケアマネ以外はログアウトさせる
    await supabase.auth.signOut();
    throw new Error(roleResult.error || 'このアカウントではログインできません');
  }

  return {
    user: data.user,
    session: data.session,
    careManager: roleResult.careManager!,
  };
}

/**
 * ログアウト処理
 */
export async function signOut() {
  const supabase = createClient();
  const { error } = await supabase.auth.signOut();
  if (error) {
    throw error;
  }
}

/**
 * 現在のセッションを取得
 */
export async function getSession() {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  return session;
}

/**
 * 現在のユーザーを取得
 */
export async function getUser() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

/**
 * ケアマネ情報を取得
 */
export async function getCareManagerByAuthId(authId: string): Promise<CareManager | null> {
  const supabase = createClient();

  const { data } = await supabase
    .from('care_managers')
    .select('*')
    .eq('auth_id', authId)
    .single();

  return data;
}
