import { supabase } from './supabase';
import type { FamilyMember, CareReceiver } from '@tsunagu-care/shared';

export type UserRole = 'care_manager' | 'family' | 'unknown';

export interface RoleCheckResult {
  role: UserRole;
  data: unknown;
}

/**
 * ユーザーのロールを判定する
 * care_managersテーブルにauth_idがあれば「ケアマネ」
 * family_membersテーブルにauth_idがあれば「家族」
 */
export async function checkUserRole(authId: string): Promise<RoleCheckResult> {
  // まずケアマネテーブルをチェック
  const { data: careManager } = await supabase
    .from('care_managers')
    .select('id, name')
    .eq('auth_id', authId)
    .single();

  if (careManager) {
    return { role: 'care_manager', data: careManager };
  }

  // 次に家族テーブルをチェック
  const { data: familyMember } = await supabase
    .from('family_members')
    .select(`
      *,
      care_receiver:care_receivers (
        id,
        name,
        care_level,
        birth_date
      )
    `)
    .eq('auth_id', authId)
    .single();

  if (familyMember) {
    return { role: 'family', data: familyMember };
  }

  return { role: 'unknown', data: null };
}

/**
 * ロール判定付きサインイン
 * 家族メンバーのみログイン可能
 */
export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    throw error;
  }

  if (!data.user) {
    throw new Error('ユーザー情報の取得に失敗しました');
  }

  // ロール判定
  const roleCheck = await checkUserRole(data.user.id);

  if (roleCheck.role === 'care_manager') {
    // ケアマネはWebアプリを使うべき
    await supabase.auth.signOut();
    throw new Error('ケアマネージャー向けはWebアプリをご利用ください');
  }

  if (roleCheck.role === 'unknown') {
    // どちらのテーブルにも登録されていない
    await supabase.auth.signOut();
    throw new Error('このアカウントは登録されていません。ケアマネージャーにお問い合わせください');
  }

  // 家族メンバーとしてログイン成功
  return {
    session: data.session,
    user: data.user,
    familyMember: roleCheck.data,
  };
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) {
    throw error;
  }
}

export async function getCurrentUser() {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error) {
    throw error;
  }
  return user;
}

/**
 * auth_idから家族メンバー情報を取得
 */
export async function getFamilyMemberByAuthId(authId: string) {
  const { data, error } = await supabase
    .from('family_members')
    .select(`
      *,
      care_receiver:care_receivers (
        id,
        name,
        care_level,
        birth_date
      )
    `)
    .eq('auth_id', authId)
    .single();

  if (error) {
    throw error;
  }

  return data as unknown as FamilyMember & {
    care_receiver: Pick<CareReceiver, 'id' | 'name' | 'care_level' | 'birth_date'> | null;
  };
}

// 後方互換のためのエイリアス
export const getFamilyMember = getFamilyMemberByAuthId;
