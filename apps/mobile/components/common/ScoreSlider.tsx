import { useEffect } from 'react';
import { View, Text, Pressable } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

type ScoreCategory = 'mood' | 'appetite' | 'sleep' | 'activity';

interface ScoreSliderProps {
  label: string;
  category: ScoreCategory;
  value: number;
  onChange: (value: number) => void;
}

const categoryConfig: Record<ScoreCategory, {
  icon: string;
  emojis: string[];
  labels: string[];
}> = {
  mood: {
    icon: '😊',
    emojis: ['😢', '😕', '😐', '🙂', '😊'],
    labels: ['とても悪い', '悪い', 'ふつう', '良い', 'とても良い'],
  },
  appetite: {
    icon: '🍽️',
    emojis: ['🍽️', '🍽️', '🍽️', '🍽️', '🍽️'],
    labels: ['ほぼ食べない', '少なめ', 'ふつう', 'よく食べた', 'たくさん食べた'],
  },
  sleep: {
    icon: '😴',
    emojis: ['😫', '😩', '😐', '😌', '😴'],
    labels: ['ほぼ眠れず', '浅い', 'ふつう', 'よく眠れた', 'ぐっすり'],
  },
  activity: {
    icon: '🏃',
    emojis: ['🛋️', '🚶', '🚶‍♂️', '🏃', '🏃‍♂️'],
    labels: ['ほぼ動かず', '少し', 'ふつう', 'よく動いた', 'とても活発'],
  },
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

function ScoreButton({
  score,
  emoji,
  isSelected,
  accessibilityLabel,
  onPress,
}: {
  score: number;
  emoji: string;
  isSelected: boolean;
  accessibilityLabel: string;
  onPress: () => void;
}) {
  const scale = useSharedValue(isSelected ? 1.15 : 0.85);
  const bgOpacity = useSharedValue(isSelected ? 1 : 0);

  useEffect(() => {
    scale.value = withSpring(isSelected ? 1.15 : 0.85, {
      damping: 12,
      stiffness: 150,
    });
    bgOpacity.value = withSpring(isSelected ? 1 : 0);
  }, [isSelected]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const bgStyle = useAnimatedStyle(() => ({
    opacity: bgOpacity.value,
  }));

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  return (
    <View className="flex-1 items-center justify-center">
      <AnimatedPressable
        style={animatedStyle}
        className="w-14 h-14 items-center justify-center"
        onPress={handlePress}
        accessibilityLabel={accessibilityLabel}
        accessibilityRole="button"
        accessibilityState={{ selected: isSelected }}
      >
        {/* 選択時の背景円 */}
        <Animated.View
          style={bgStyle}
          className="absolute w-14 h-14 rounded-full bg-primary-100"
        />
        <Text
          className="text-3xl"
          style={{ opacity: isSelected ? 1 : 0.4 }}
        >
          {emoji}
        </Text>
      </AnimatedPressable>
    </View>
  );
}

export function ScoreSlider({
  label,
  category,
  value,
  onChange,
}: ScoreSliderProps) {
  const config = categoryConfig[category];
  const currentLabel = config.labels[value - 1] || 'ふつう';

  return (
    <View className="mb-5">
      {/* ラベルと現在の選択状態 */}
      <View className="flex-row items-center justify-between mb-2">
        <Text className="text-lg font-semibold text-gray-800">
          {config.icon} {label}
        </Text>
        <View className="bg-primary-50 px-3 py-1 rounded-full">
          <Text className="text-sm font-medium text-primary-700">
            {currentLabel}
          </Text>
        </View>
      </View>

      {/* スコアボタン */}
      <View className="flex-row bg-gray-50 rounded-2xl py-2">
        {[1, 2, 3, 4, 5].map((score) => (
          <ScoreButton
            key={score}
            score={score}
            emoji={config.emojis[score - 1]}
            isSelected={value === score}
            accessibilityLabel={`${label} 5段階中${score} ${config.labels[score - 1]}`}
            onPress={() => onChange(score)}
          />
        ))}
      </View>

      {/* スケール表示 */}
      <View className="flex-row justify-between mt-1 px-2">
        <Text className="text-xs text-gray-400">{config.labels[0]}</Text>
        <Text className="text-xs text-gray-400">{config.labels[4]}</Text>
      </View>
    </View>
  );
}
