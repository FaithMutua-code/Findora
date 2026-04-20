import React from 'react';
import { Tabs } from 'expo-router';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from 'react-native-safe-area-context';
export default function TabLayout() {
  return (
    <>
     <SafeAreaView style={{ flex: 1, backgroundColor: '#6C5CE7' }}>
      <StatusBar style="light" />

      <Tabs
        screenOptions={{
          headerShown: false,
          headerStyle: { backgroundColor: '#fff' },
          headerTintColor: '#6C5CE7',
          headerTitleStyle: { fontWeight: 'bold' },
          tabBarActiveTintColor: '#6C5CE7',
          tabBarInactiveTintColor: '#333',
          tabBarStyle: {
            backgroundColor: '#fff',
            borderTopWidth: 1,
            borderTopColor: '#ddd',
            height: 60,
            paddingBottom: 8,
            paddingTop: 8,
            borderTopEndRadius: 15,
            borderTopStartRadius: 15,
            position: 'absolute',
          },
          tabBarLabelStyle: {
            fontWeight: '600',
            fontSize: 12,
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Home',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="home" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="feedScreen"
          options={{
            title: 'Items',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="grid" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="settings"
          options={{
            title: 'Settings',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="settings" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="shareItem"
          options={{
            title: 'Share',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="add-circle" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
  name="profile"
  options={{
    href: null, // 👈 hides it from tab bar
  }}
/>
      </Tabs>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});