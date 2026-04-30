// utils/ThemeContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useColorScheme } from 'react-native';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  isDark: boolean;
  colors: typeof darkColors;
}

const lightColors = {
  background: '#f0eeff',
  card: '#ffffff',
  text: '#1a1040',
  subtext: '#7c6fa0',
  border: '#e4dff7',
  input: '#faf9ff',
  placeholder: '#c4bce8',
  icon: '#a89fd0',
  tabBar: '#ffffff',
  header: '#ffffff',
  blob1: '#8b7ff0',
  blob2: '#A29BFE',
  blob3: '#261E63',
};

const darkColors = {
  background: '#0f0a1e',
  card: '#1a1035',
  text: '#f0eeff',
  subtext: '#a89fd0',
  border: '#2d2060',
  input: '#150d30',
  placeholder: '#5a4a8a',
  icon: '#7c6fa0',
  tabBar: '#120c28',
  header: '#120c28',
  blob1: '#4a3f8f',
  blob2: '#6C5CE7',
  blob3: '#4a3f8f',
};

export const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const systemScheme = useColorScheme();

  // ✅ Initialize from system scheme immediately — no flash
  const [theme, setTheme] = useState<Theme>(systemScheme === 'dark' ? 'dark' : 'light');

  // Load saved user preference on start
  useEffect(() => {
    const loadTheme = async () => {
      const saved = await AsyncStorage.getItem('theme');
      if (saved === 'dark' || saved === 'light') {
        // User has manually set a preference — respect it
        setTheme(saved);
      }
      // If no saved preference, keep the system scheme (already set in useState)
    };
    loadTheme();
  }, []);

  // ✅ Also react if system scheme changes and user has no saved preference
  useEffect(() => {
    const syncWithSystem = async () => {
      const saved = await AsyncStorage.getItem('theme');
      if (!saved && systemScheme) {
        setTheme(systemScheme === 'dark' ? 'dark' : 'light');
      }
    };
    syncWithSystem();
  }, [systemScheme]);

  const toggleTheme = async () => {
    const next = theme === 'light' ? 'dark' : 'light';
    setTheme(next);
    await AsyncStorage.setItem('theme', next);
  };

  return (
    <ThemeContext.Provider value={{
      theme,
      toggleTheme,
      isDark: theme === 'dark',
      colors: theme === 'dark' ? darkColors : lightColors,
    }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('Must be inside ThemeProvider');
  return context;
};