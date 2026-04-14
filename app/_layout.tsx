import React, { useEffect } from "react";
import { Stack, useRouter, useSegments } from "expo-router";
import { useStore } from "../lib/store";

export default function RootLayout() {
  const authUser = useStore((s) => s.authUser);
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    const inTabs = segments[0] === "(tabs)";
    const inAuth = segments[0] === "login" || segments[0] === "signup";

    if (!authUser && inTabs) {
      router.replace("/login");
    } else if (authUser && inAuth) {
      router.replace("/(tabs)");
    }
  }, [authUser, segments]);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="login" />
      <Stack.Screen name="signup" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="upload" options={{ presentation: "modal" }} />
      <Stack.Screen name="summary" options={{ presentation: "modal" }} />
      <Stack.Screen name="record/[id]" />
      <Stack.Screen name="event/[id]" />
    </Stack>
  );
}
