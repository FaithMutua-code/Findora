import { Link } from "expo-router";
import { Text, View } from "react-native";

export default function Index() {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Text>Index</Text>
      <Link href="/(tabs)">Go to Tabs</Link>
      <Link href="/(auth)/login">Go to Login</Link>
      <Link href="/(auth)/register">Go to Register</Link>
    </View>
  );
}