import { Tabs, Stack } from 'expo-router';
import { DemoModeBanner } from '../../components/DemoModeBanner';
import { View } from 'react-native';

export default function TabsLayout() {
  return (
    <View style={{ flex: 1 }}>
      <DemoModeBanner />
      <Tabs screenOptions={{ headerShown: false }}>
        <Tabs.Screen name="index" options={{ title: 'Home' }} />
        <Tabs.Screen name="timeline" options={{ title: 'Timeline' }} />
        <Tabs.Screen name="records" options={{ title: 'Records' }} />
        <Tabs.Screen name="visit" options={{ title: 'Visit' }} />
        <Tabs.Screen name="profile" options={{ title: 'Profile' }} />
      </Tabs>
    </View>
  );
}
