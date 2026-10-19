import Feather from '@expo/vector-icons/Feather';
import { Tabs } from 'expo-router';
import { fonts, useTheme } from '../../theme/tokens';

export default function TabLayout() {
  const theme = useTheme();
  return <Tabs screenOptions={{ headerShown: false, tabBarActiveTintColor: theme.accent, tabBarInactiveTintColor: theme.secondary,
    tabBarStyle: { backgroundColor: theme.surface, borderTopColor: theme.border, paddingTop: 8 },
    tabBarLabelStyle: { fontFamily: fonts.semiBold, fontSize: 11, paddingTop: 3 },
    sceneStyle: { backgroundColor: theme.background },
  }}>
    <Tabs.Screen name="index" options={{ title: 'Netzwerk', tabBarIcon: ({ color, size }) => <Feather name="share-2" color={color} size={size - 2} /> }} />
    <Tabs.Screen name="people" options={{ title: 'Personen', tabBarIcon: ({ color, size }) => <Feather name="users" color={color} size={size - 2} /> }} />
  </Tabs>;
}
