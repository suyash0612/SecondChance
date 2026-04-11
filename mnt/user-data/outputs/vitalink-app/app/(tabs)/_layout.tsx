import React from "react";
import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { C, F } from "../../lib/theme";

export default function TabLayout() {
  return (
    <Tabs screenOptions={{
      tabBarActiveTintColor: C.pri, tabBarInactiveTintColor: C.t3,
      tabBarStyle: { backgroundColor: C.card, borderTopColor: C.brdLt, paddingTop: 4, height: 85 },
      tabBarLabelStyle: { fontSize: F.xs, fontWeight: "500" },
      headerStyle: { backgroundColor: C.bgDark }, headerTintColor: C.tInv,
      headerTitleStyle: { fontWeight: "700", fontSize: 18 }, headerShadowVisible: false,
    }}>
      <Tabs.Screen name="index" options={{ title: "Home", headerTitle: "VitaLink", tabBarIcon: ({ color, size }) => <Ionicons name="home-outline" size={size} color={color} /> }} />
      <Tabs.Screen name="timeline" options={{ title: "Timeline", tabBarIcon: ({ color, size }) => <Ionicons name="git-branch-outline" size={size} color={color} /> }} />
      <Tabs.Screen name="records" options={{ title: "Records", tabBarIcon: ({ color, size }) => <Ionicons name="folder-outline" size={size} color={color} /> }} />
      <Tabs.Screen name="visit" options={{ title: "Visit Prep", tabBarIcon: ({ color, size }) => <Ionicons name="clipboard-outline" size={size} color={color} /> }} />
      <Tabs.Screen name="profile" options={{ title: "Profile", tabBarIcon: ({ color, size }) => <Ionicons name="person-outline" size={size} color={color} /> }} />
    </Tabs>
  );
}
