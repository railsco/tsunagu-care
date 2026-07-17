import { Alert } from 'react-native';

/**
 * エラーをユーザーに通知する共通ヘルパー。
 * 黙殺（console.errorのみ）を避け、必ず画面上でフィードバックする。
 */
export function showError(message: string, title = 'エラー'): void {
  Alert.alert(title, message);
}

/**
 * 確認ダイアログをPromiseで扱うヘルパー
 */
export function confirmDialog(
  title: string,
  message: string,
  confirmText = 'OK',
  cancelText = 'キャンセル'
): Promise<boolean> {
  return new Promise((resolve) => {
    Alert.alert(title, message, [
      { text: cancelText, style: 'cancel', onPress: () => resolve(false) },
      { text: confirmText, onPress: () => resolve(true) },
    ]);
  });
}
