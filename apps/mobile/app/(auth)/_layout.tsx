import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function AuthLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#0d9488',
        tabBarInactiveTintColor: '#6b7280',
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
        tabBarStyle: {
          height: 88,
          paddingTop: 8,
          paddingBottom: 28,
          backgroundColor: '#fff',
          borderTopWidth: 1,
          borderTopColor: '#e5e7eb',
        },
        tabBarIconStyle: {
          marginBottom: 0,
        },
        headerStyle: {
          backgroundColor: '#0d9488',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: '600',
          fontSize: 18,
        },
      }}
    >
      <Tabs.Screen
        name="home/index"
        options={{
          title: 'ホーム',
          headerTitle: 'つなぐケア',
          tabBarIcon: ({ focused, color }) => (
            <Ionicons
              name={focused ? 'home' : 'home-outline'}
              size={28}
              color={color}
            />
          ),
          tabBarAccessibilityLabel: 'ホーム画面',
        }}
      />
      <Tabs.Screen
        name="log/index"
        options={{
          title: '日記',
          headerTitle: '今日の日記',
          tabBarIcon: ({ focused, color }) => (
            <Ionicons
              name={focused ? 'create' : 'create-outline'}
              size={28}
              color={color}
            />
          ),
          tabBarAccessibilityLabel: '日記入力画面',
        }}
      />
      <Tabs.Screen
        name="log/history"
        options={{
          href: null, // タブバーに表示しない
          headerTitle: '過去の日記',
        }}
      />
      <Tabs.Screen
        name="feedback/index"
        options={{
          title: 'ほんね',
          headerTitle: 'ほんね投函',
          tabBarIcon: ({ focused, color }) => (
            <Ionicons
              name={focused ? 'chatbubble-ellipses' : 'chatbubble-ellipses-outline'}
              size={28}
              color={color}
            />
          ),
          tabBarAccessibilityLabel: 'ほんね投函画面',
        }}
      />
      <Tabs.Screen
        name="feedback/history"
        options={{
          href: null, // タブバーに表示しない
          headerTitle: '過去の投函',
        }}
      />
      <Tabs.Screen
        name="profile/index"
        options={{
          title: '設定',
          headerTitle: 'プロフィール・設定',
          tabBarIcon: ({ focused, color }) => (
            <Ionicons
              name={focused ? 'person' : 'person-outline'}
              size={28}
              color={color}
            />
          ),
          tabBarAccessibilityLabel: 'プロフィール・設定画面',
        }}
      />
    </Tabs>
  );
}
