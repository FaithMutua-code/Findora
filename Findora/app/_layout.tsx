import { Stack,useSegments, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { AuthContext, AuthProvider } from "../utils/AuthContext";
import { useContext, useEffect } from "react";
import { View, ActivityIndicator } from "react-native";
import * as Linking from 'expo-linking';
import { ThemeProvider } from "@/utils/ThemeContext";

function RootLayoutNav() {
  const context = useContext(AuthContext);
  const authData = context?.authData;
  const isLoading = context?.isLoading;
  const router = useRouter();
  const segments = useSegments();

  // Deep link handler
  useEffect(() => {
    const subscription = Linking.addEventListener('url', ({ url }) => {
      handleDeepLink(url);
    });
    Linking.getInitialURL().then(url => {
      if (url) handleDeepLink(url);
    });
    return () => subscription.remove();
  }, );

  // Auth redirect
  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === '(auth)';
   

    if (!authData?.token && !inAuthGroup) {
      router.replace('/(auth)/login');
    } else if (authData?.token && inAuthGroup ) {
      router.replace('/(tabs)');
    }
  }, [authData?.token, isLoading]);

  const handleDeepLink = (url: string) => {
    const { path } = Linking.parse(url);
    if (path?.startsWith('items/')) {
      const id = path.split('/')[1];
      router.push({
        pathname: '/(tabs)/feedScreen',
        params: { highlightId: id },
      });
    }
  };

  if (isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: "#0f172a", justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  return (
    <>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false }}>
        {authData?.token == null ? (
          <>
            <Stack.Screen name="index" />
            <Stack.Screen name="(auth)" />
          </>
        ) : (
          <>
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="chat/[userId]" />
            <Stack.Screen name="items/[id]" options={{ headerShown: false }} />
          </>
        )}
      </Stack>
    </>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <ThemeProvider>
      <RootLayoutNav />
      </ThemeProvider>
    </AuthProvider>
  );
}