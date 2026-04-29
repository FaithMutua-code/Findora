import React from 'react';
import { Tabs } from 'expo-router';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/utils/ThemeContext';

function CustomTabBar({ state, descriptors, navigation }: any) {
  const { colors } = useTheme();

  return (
    <View style={styles.tabBarWrapper}>
      <View style={[styles.tabBarContainer, {
        backgroundColor: colors.tabBar,
        borderTopColor: colors.border,
      }]}>
        {state.routes.map((route: any, index: number) => {
          const { options } = descriptors[route.key];
          if (options.href === null) return null;

          const isFocused = state.index === index;
          const isCenter = route.name === 'shareItem';

          if (isCenter) {
            return (
              <TouchableOpacity
                key={route.key}
                onPress={() => navigation.navigate(route.name)}
                style={styles.centerButton}
                activeOpacity={0.85}
              >
                <Ionicons name="add-circle" size={28} color="#fff" />
              </TouchableOpacity>
            );
          }

          const iconMap: Record<string, { active: any; inactive: any }> = {
            index:      { active: 'home',         inactive: 'home-outline' },
            feedScreen: { active: 'grid',          inactive: 'grid-outline' },
            profile:    { active: 'person',        inactive: 'person-outline' },
            settings:   { active: 'settings',      inactive: 'settings-outline' },
          };

          const icons = iconMap[route.name];
          const icon = icons
            ? isFocused ? icons.active : icons.inactive
            : 'ellipse-outline';

          return (
            <TouchableOpacity
              key={route.key}
              onPress={() => navigation.navigate(route.name)}
              style={styles.tabItem}
              activeOpacity={0.7}
            >
              <Ionicons
                name={icon}
                size={24}
                color={isFocused ? '#6C5CE7' : colors.icon} // ← dynamic icon color
              />
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

export default function TabLayout() {
  const { colors, isDark } = useTheme();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar style={isDark ? 'light' : 'dark'} /> {/* ← dynamic status bar */}
      <Tabs
        tabBar={(props) => <CustomTabBar {...props} />}
        screenOptions={{
          headerShown: false,
          headerStyle: { backgroundColor: colors.header },
          headerTintColor: colors.text,            // ← fixed: was empty
          headerTitleStyle: { fontWeight: 'bold' },
        }}
      >
        <Tabs.Screen name="index"      options={{ title: 'Home' }} />
        <Tabs.Screen name="feedScreen" options={{ title: 'Items' }} />
        <Tabs.Screen name="shareItem"  options={{ title: 'Share' }} />
        <Tabs.Screen name="profile"    options={{ title: 'Profile' }} />
        <Tabs.Screen name="settings"   options={{ title: 'Settings' }} />
      </Tabs>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  tabBarWrapper: {
    position: 'absolute',
    bottom: -4,
    alignItems: 'center',
    width: '100%',
  },
  tabBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
    paddingHorizontal: 20,
    paddingVertical: 14,
    width: '100%',
    justifyContent: 'space-between',
    borderTopWidth: 0.5,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerButton: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#6C5CE7',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -30,
    shadowColor: '#6C5CE7',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.45,
    shadowRadius: 10,
    elevation: 10,
  },
});