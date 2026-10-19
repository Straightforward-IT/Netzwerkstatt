import Feather from '@expo/vector-icons/Feather';
import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { fonts, useTheme } from '../../theme/tokens';
import { IconButton } from './IconButton';

export function AppHeader({ title, subtitle, compact = false }: { title: string; subtitle: string; compact?: boolean }) {
  const theme = useTheme();
  return <View style={[styles.header, compact && styles.headerCompact]}>
    <View style={styles.copy}>
      <View style={[styles.brand, compact && styles.brandCompact]}><Feather name="aperture" size={16} color={theme.accent} /><Text style={[styles.brandText, { color: theme.accent }]}>NETZWERKSTATT</Text></View>
      <Text accessibilityRole="header" style={[styles.title, compact && styles.titleCompact, { color: theme.text }]}>{title}</Text>
      {!compact && <Text style={[styles.subtitle, { color: theme.secondary }]}>{subtitle}</Text>}
    </View>
    <IconButton icon="info" label="Über den Prototyp" onPress={() => router.push('/settings')} />
  </View>;
}
const styles = StyleSheet.create({
  header: { paddingHorizontal: 24, paddingTop: 16, paddingBottom: 18, flexDirection: 'row', gap: 12, alignItems: 'center' },
  headerCompact: { paddingHorizontal: 20, paddingTop: 6, paddingBottom: 6 },
  copy: { flex: 1 }, brand: { flexDirection: 'row', gap: 7, alignItems: 'center', marginBottom: 10 },
  brandCompact: { marginBottom: 2 },
  brandText: { fontFamily: fonts.bold, fontSize: 10, letterSpacing: 2.1 },
  title: { fontFamily: fonts.bold, fontSize: 29, letterSpacing: -1.2 },
  titleCompact: { fontSize: 20, letterSpacing: -0.7 },
  subtitle: { fontFamily: fonts.regular, fontSize: 12, marginTop: 5 },
});
