import { Tabs } from 'expo-router';
import React from 'react';

import { HapticTab } from '@/components/haptic-tab';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: false,
        tabBarButton: HapticTab,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused }) => <Ionicons size={28} name={focused ? 'home' : 'home-outline'} color={color} />,
        }}
      />
      <Tabs.Screen
        name="exams"
        options={{
          title: 'Exams',
          tabBarIcon: ({ color, focused }) => <Ionicons size={28} name={focused ? 'newspaper' : 'newspaper-outline'} color={color} />,
        }}
      />
      <Tabs.Screen
        name="exercises"
        options={{
          title: 'Exercises',
          tabBarIcon: ({ color, focused }) => <Ionicons size={28} name={focused ? 'book' : 'book-outline'} color={color} />,
        }}
      />
      <Tabs.Screen
        name="upload"
        options={{
          title: 'Upload',
          tabBarIcon: ({ color, focused }) => <Ionicons size={28} name={focused ? 'attach' : 'attach-outline'} color={color} />,
        }}
      />
    </Tabs>
  );
}
