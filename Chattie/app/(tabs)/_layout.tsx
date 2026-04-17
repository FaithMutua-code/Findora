import React from 'react';
import { Drawer } from 'expo-router/drawer';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import {
  DrawerContentScrollView,
  DrawerItem,
} from '@react-navigation/drawer';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

function CustomDrawerContent(props: any) {
  const menuItems = [
    { label: 'Dashboard', route: 'index', icon: 'home' },
    { label: 'Home', route: 'home', icon: 'grid' },
    { label: 'Settings', route: 'settings', icon: 'settings' },
  ];

  return (
    <DrawerContentScrollView {...props} style={styles.drawer}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.appName}>Lost & Found</Text>
        <Text style={styles.tagline}>Find what you lost, and get found!</Text>
      </View>

      {/* Menu Items */}
      {menuItems.map((item, index) => (
        <DrawerItem
          key={index}
          label={item.label}
          labelStyle={styles.label}
          onPress={() => props.navigation.navigate(item.route)}
          icon={({ size }) => (
            <Ionicons name={item.icon as any} size={size} color="#6C5CE7" />
          )}
        />
      ))}
    </DrawerContentScrollView>
  );
}

export default function DrawerLayout() {
  return (
    <GestureHandlerRootView style={styles.container}>
      <Drawer
        drawerContent={(props) => <CustomDrawerContent {...props} />}
        screenOptions={{
          headerStyle: { backgroundColor: '#fff' },
          headerTintColor: '#6C5CE7',
          headerTitleStyle: { fontWeight: 'bold' },
          drawerActiveTintColor: '#6C5CE7',
          drawerInactiveTintColor: '#333',
          drawerStyle: { backgroundColor: '#fff' },
        }}
      >
        <Drawer.Screen name="index" options={{ title: 'Dashboard' }} />
        <Drawer.Screen name="home" />
        <Drawer.Screen name="settings" />
      </Drawer>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  drawer: {
    backgroundColor: '#fff',
  },
  header: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  appName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#000',
  },
  tagline: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  label: {
    fontWeight: '600',
    color: '#333',
  },
});