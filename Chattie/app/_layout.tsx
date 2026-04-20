import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { AuthContext, AuthProvider } from "../utils/AuthContext";
import { useContext } from "react";
function RootLayoutNav() {
  const context = useContext(AuthContext);
  const authData = context?.authData;
  return (
    <>
     <StatusBar style="light" backgroundColor="#6C5CE7" />
    <Stack>
      {authData?.token == null ? (
        
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      ) : (
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
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