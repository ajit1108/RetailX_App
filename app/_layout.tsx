import { Stack } from "expo-router";
import { Drawer } from "expo-router/drawer";
export default function Layout() {
  return <Stack screenOptions={{ headerShown: false }} />;
  <Drawer screenOptions={{ headerShown: false }}>
      <Drawer.Screen name="(tabs)" options={{ title: "Dashboard" }} />
      <Drawer.Screen name="profile" options={{ title: "Profile" }} />
      <Drawer.Screen name="logout" options={{ title: "Logout" }} />
    </Drawer>
}
