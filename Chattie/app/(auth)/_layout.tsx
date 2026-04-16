import { Stack } from 'expo-router';

export default function AuthLayout() {
  return (
    <Stack>
      <Stack.Screen 
        name="login" // 
        options={{ 
          headerTitle: "Login",
          headerBackTitle: "Back", 
        }} 
      />
       <Stack.Screen 
        name="register" 
        options={{ 
          headerTitle: "Register",
          headerBackTitle: "Back",
        }} 
      />
    </Stack>

  );
}