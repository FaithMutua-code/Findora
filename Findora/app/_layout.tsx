import { Stack, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { AuthContext, AuthProvider } from "../utils/AuthContext";
import { useContext, useEffect } from "react";
import { View, ActivityIndicator } from "react-native";
import * as Linking from 'expo-linking';

function RootLayoutNav() {
  const context = useContext(AuthContext);
  const authData = context?.authData;
  const isLoading = context?.isLoading;
  const router =useRouter()

  useEffect(()=>{
    const subscription = Linking.addEventListener('url',({url})=>{
      handleDeepLink(url);
    })
      Linking.getInitialURL().then(url =>{
    if(url) handleDeepLink(url)
});
return()=>subscription.remove()
  },[]);

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

  // Wait for AsyncStorage to load before deciding route
  if (isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: "#0f172a", justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  return (
    <>
      <StatusBar style="light" backgroundColor="#6C5CE7" />
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
      <RootLayoutNav />
    </AuthProvider>
  );
}