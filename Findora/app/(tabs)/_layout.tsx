import React from 'react';
import { Tabs } from 'expo-router';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';

function CustomTabBar({ state, descriptors, navigation }: any) {
  return (
    <View style={styles.tabBarWrapper}>
      <View style={styles.tabBarContainer}>
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
            index: { active: 'home', inactive: 'home-outline' },
            feedScreen: { active: 'grid', inactive: 'grid-outline' },
            profile: { active: 'person', inactive: 'person-outline' },
            settings: { active: 'settings', inactive: 'settings-outline' },
          };

          const icons = iconMap[route.name];
          const icon = icons ? (isFocused ? icons.active : icons.inactive) : 'ellipse-outline';

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
                color={isFocused ? '#6C5CE7' : '#333'}
              />
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

export default function TabLayout() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#6C5CE7' }}>
      <StatusBar style="light" />
      <Tabs
        tabBar={(props) => <CustomTabBar {...props} />}
        screenOptions={{
          headerShown: false,
          headerStyle: { backgroundColor: '#fff' },
          headerTintColor: '#6C5CE7',
          headerTitleStyle: { fontWeight: 'bold' },
        }}
      >
        <Tabs.Screen name="index" options={{ title: 'Home' }} />
        <Tabs.Screen name="feedScreen" options={{ title: 'Items' }} />
        <Tabs.Screen name="shareItem" options={{ title: 'Share' }} />
         <Tabs.Screen name="profile" options={{ title:'Profile' }} />
        <Tabs.Screen name="settings" options={{ title: 'Settings' }} />
       
      </Tabs>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  tabBarWrapper: {
    position: 'absolute',
    bottom: 2,
    alignItems: 'center',
  },
  tabBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingHorizontal: 20,
    paddingVertical: 14,
    width: '100%',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 8,
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