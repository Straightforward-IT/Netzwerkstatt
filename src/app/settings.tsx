import Feather from '@expo/vector-icons/Feather';
import { router } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { IconButton } from '../components/ui/IconButton';
import { fonts, useTheme } from '../theme/tokens';

export default function SettingsScreen() {
  const theme = useTheme();
  return <SafeAreaView style={[styles.screen, { backgroundColor: theme.background }]}><ScrollView contentContainerStyle={styles.content}>
    <View style={styles.header}><Text style={[styles.eyebrow, { color: theme.accent }]}>NETZWERKSTATT · 0.1</Text><IconButton icon="x" label="Info schließen" onPress={() => router.canGoBack() ? router.back() : router.replace('/')} /></View>
    <View style={[styles.mark, { backgroundColor: theme.accentSoft }]}><Feather name="aperture" size={36} color={theme.accent} /></View>
    <Text accessibilityRole="header" style={[styles.title, { color: theme.text }]}>Ein Platz für{ '\n' }deine Menschen.</Text>
    <Text style={[styles.description, { color: theme.secondary }]}>Ein persönliches Netzwerk beginnt mit Verbindungen. Dieser erste Prototyp macht sie sichtbar und erkundbar.</Text>
    <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
      <Feather name="compass" color={theme.accent} size={22} /><Text style={[styles.cardTitle, { color: theme.text }]}>Graph-Prototyp · MVP 0</Text>
      <Text style={[styles.body, { color: theme.secondary }]}>30 erfundene Personen, vier Lebensbereiche und ihre Beziehungen. Alle Kontakte sind Demodaten. Änderungen an Suche und Ansicht gelten nur für diese Sitzung.</Text>
    </View>
    <Text style={[styles.sectionTitle, { color: theme.text }]}>So findest du dich zurecht</Text>
    {[
      ['move', 'Verschieben', 'Ziehe mit einem Finger über das Netzwerk.'],
      ['maximize-2', 'Vergrößern', 'Ziehe zwei Finger auseinander oder nutze + und −.'],
      ['user', 'Person kennenlernen', 'Tippe eine Person an, um ihr Profil zu öffnen.'],
      ['crosshair', 'Perspektive wechseln', 'Doppeltippe eine Person zum Fokussieren. Doppeltippe freie Fläche für die Gesamtansicht.'],
      ['search', 'Zusammenhänge finden', 'Suche nach Namen, Skills, Firmen oder Notizen. Direkte Verbindungen bleiben dezent sichtbar.'],
    ].map(([icon, title, description]) => <View key={title} style={styles.instruction}><Feather name={icon as 'move'} size={20} color={theme.accent} /><View style={{ flex: 1 }}><Text style={[styles.instructionTitle, { color: theme.text }]}>{title}</Text><Text style={[styles.body, { color: theme.secondary }]}>{description}</Text></View></View>)}
    <View style={[styles.card, { backgroundColor: theme.accentSoft, borderColor: theme.accentSoft }]}><Text style={[styles.cardTitle, { color: theme.text }]}>Als Nächstes: dein lokales Netzwerk</Text><Text style={[styles.body, { color: theme.secondary }]}>Nach dem Gestentest auf Android folgen Personen anlegen und bearbeiten, Beziehungen und lokale Speicherung mit SQLite. Google-Kontaktimport und Termine kommen in späteren Schritten.</Text></View>
    <Text style={[styles.footer, { color: theme.secondary }]}>Ohne Konto. Ohne Tracking. Mit Raum für Menschen.</Text>
  </ScrollView></SafeAreaView>;
}
const styles = StyleSheet.create({
  screen: { flex: 1 }, content: { padding: 24, width: '100%', maxWidth: 660, alignSelf: 'center' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 25 }, eyebrow: { fontFamily: fonts.bold, fontSize: 10, letterSpacing: 1.6 },
  mark: { width: 76, height: 76, borderRadius: 25, alignItems: 'center', justifyContent: 'center', marginBottom: 24 },
  title: { fontFamily: fonts.bold, fontSize: 34, letterSpacing: -1.3, lineHeight: 43 }, description: { fontFamily: fonts.regular, fontSize: 14, lineHeight: 24, marginTop: 17, marginBottom: 25 },
  card: { padding: 22, borderWidth: 1, borderRadius: 22, marginBottom: 26, gap: 10 }, cardTitle: { fontFamily: fonts.bold, fontSize: 15 }, body: { fontFamily: fonts.regular, fontSize: 12, lineHeight: 21 },
  sectionTitle: { fontFamily: fonts.bold, fontSize: 18, marginBottom: 22 }, instruction: { flexDirection: 'row', gap: 16, marginBottom: 23 }, instructionTitle: { fontFamily: fonts.semiBold, fontSize: 13, marginBottom: 5 }, footer: { fontFamily: fonts.medium, fontSize: 11, textAlign: 'center', marginBottom: 10 },
});
