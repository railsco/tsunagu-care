import { useState } from 'react';
import { View, Text, Image, Pressable, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import * as FileSystem from 'expo-file-system';
import { Ionicons } from '@expo/vector-icons';

/** 画像の最大サイズ（1MB） */
const MAX_IMAGE_SIZE_BYTES = 1 * 1024 * 1024;

/** リサイズ時の最大幅 */
const MAX_IMAGE_WIDTH = 1200;

/** リサイズ時の最大高さ */
const MAX_IMAGE_HEIGHT = 1200;

interface PhotoPickerProps {
  photos: string[];
  onPhotosChange: (photos: string[]) => void;
  maxPhotos?: number;
}

/**
 * 画像を1MB以下にリサイズする
 * @param uri 元画像のURI
 * @returns リサイズ後の画像URI
 */
async function resizeImageIfNeeded(uri: string): Promise<string> {
  try {
    // ファイルサイズを取得
    const fileInfo = await FileSystem.getInfoAsync(uri);

    // ファイルが存在しない、またはサイズ情報がない場合はそのまま返す
    if (!fileInfo.exists || !('size' in fileInfo)) {
      return uri;
    }

    // 1MB以下ならそのまま返す
    if (fileInfo.size <= MAX_IMAGE_SIZE_BYTES) {
      console.log(`画像サイズ: ${(fileInfo.size / 1024).toFixed(1)}KB - リサイズ不要`);
      return uri;
    }

    console.log(`画像サイズ: ${(fileInfo.size / 1024 / 1024).toFixed(2)}MB - リサイズ開始`);

    // 圧縮率を計算（元サイズから目標サイズへの比率）
    let quality = Math.min(0.8, MAX_IMAGE_SIZE_BYTES / fileInfo.size);

    // リサイズ実行
    const result = await ImageManipulator.manipulateAsync(
      uri,
      [
        {
          resize: {
            width: MAX_IMAGE_WIDTH,
          },
        },
      ],
      {
        compress: quality,
        format: ImageManipulator.SaveFormat.JPEG,
      }
    );

    // リサイズ後のサイズを確認
    const resizedInfo = await FileSystem.getInfoAsync(result.uri);
    if (resizedInfo.exists && 'size' in resizedInfo) {
      console.log(`リサイズ後: ${(resizedInfo.size / 1024).toFixed(1)}KB`);

      // まだ1MB超えていたら、さらに圧縮
      if (resizedInfo.size > MAX_IMAGE_SIZE_BYTES) {
        quality = quality * 0.6;
        const recompressed = await ImageManipulator.manipulateAsync(
          result.uri,
          [],
          {
            compress: quality,
            format: ImageManipulator.SaveFormat.JPEG,
          }
        );
        console.log('追加圧縮を実行しました');
        return recompressed.uri;
      }
    }

    return result.uri;
  } catch (error) {
    console.error('画像リサイズエラー:', error);
    // リサイズに失敗した場合は元の画像を返す
    return uri;
  }
}

export function PhotoPicker({
  photos,
  onPhotosChange,
  maxPhotos = 3,
}: PhotoPickerProps) {
  const [isLoading, setIsLoading] = useState(false);

  /**
   * カメラまたはライブラリから画像を選択する
   * @param useCamera trueならカメラ、falseならライブラリ
   */
  const pickImage = async (useCamera: boolean) => {
    if (photos.length >= maxPhotos) {
      Alert.alert('上限に達しました', `写真は${maxPhotos}枚まで追加できます`);
      return;
    }

    // パーミッションを確認
    if (useCamera) {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('権限が必要です', 'カメラを使用するにはカメラへのアクセスを許可してください。');
        return;
      }
    } else {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('権限が必要です', '写真ライブラリを使用するにはアクセスを許可してください。');
        return;
      }
    }

    setIsLoading(true);
    try {
      const options: ImagePicker.ImagePickerOptions = {
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      };

      const result = useCamera
        ? await ImagePicker.launchCameraAsync(options)
        : await ImagePicker.launchImageLibraryAsync(options);

      if (!result.canceled && result.assets[0]) {
        // 画像を1MB以下にリサイズ
        const resizedUri = await resizeImageIfNeeded(result.assets[0].uri);
        onPhotosChange([...photos, resizedUri]);
      }
    } catch (error) {
      console.error('Image picker error:', error);
      Alert.alert('エラー', '写真の選択に失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * 指定インデックスの写真を削除する
   */
  const removePhoto = (index: number) => {
    const newPhotos = photos.filter((_, i) => i !== index);
    onPhotosChange(newPhotos);
  };

  /**
   * 写真追加方法の選択ダイアログを表示
   */
  const showPickerOptions = () => {
    Alert.alert(
      '写真を追加',
      '写真の追加方法を選択してください',
      [
        { text: 'カメラで撮影', onPress: () => pickImage(true) },
        { text: 'ライブラリから選択', onPress: () => pickImage(false) },
        { text: 'キャンセル', style: 'cancel' },
      ]
    );
  };

  return (
    <View className="mb-5">
      <Text className="text-base font-medium text-gray-700 mb-3">
        写真（任意）
      </Text>

      <View className="flex-row flex-wrap gap-3">
        {/* 既存の写真 */}
        {photos.map((uri, index) => (
          <View key={index} className="relative">
            <Image
              source={{ uri }}
              className="w-24 h-24 rounded-xl"
              accessibilityLabel={`添付写真 ${index + 1}`}
            />
            <Pressable
              className="absolute -top-2 -right-2 w-7 h-7 bg-red-500 rounded-full items-center justify-center"
              onPress={() => removePhoto(index)}
              accessibilityLabel="写真を削除"
              accessibilityRole="button"
            >
              <Ionicons name="close" size={16} color="#fff" />
            </Pressable>
          </View>
        ))}

        {/* 追加ボタン */}
        {photos.length < maxPhotos && (
          <Pressable
            className="w-24 h-24 bg-gray-100 rounded-xl items-center justify-center border-2 border-dashed border-gray-300 active:bg-gray-200"
            onPress={showPickerOptions}
            disabled={isLoading}
            accessibilityLabel="写真を追加"
            accessibilityRole="button"
          >
            <Ionicons
              name={isLoading ? 'hourglass-outline' : 'camera-outline'}
              size={28}
              color="#6b7280"
            />
            <Text className="text-sm text-gray-500 mt-1">
              {isLoading ? '処理中...' : '追加'}
            </Text>
          </Pressable>
        )}
      </View>

      <Text className="text-sm text-gray-500 mt-2">
        {photos.length}/{maxPhotos}枚（1枚あたり最大1MB）
      </Text>
    </View>
  );
}
