import Feather from '@expo/vector-icons/Feather';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PersonAvatar } from '../../components/person/PersonAvatar';
import { PersonSheet } from '../../components/person/PersonSheet';
import { AppHeader } from '../../components/ui/AppHeader';
import { NetworkFilters } from '../../components/ui/NetworkFilters';
import { demoPeople, demoCategories, demoRelationships } from '../../data/demo-network';
import { searchPeople } from '../../services/search';
import { useGraphStore } from '../../stores/graph.store';
import { fonts, useTheme } from '../../theme/tokens';
import { getPersonName } from '../../types/network';

export default function PeopleScreen() {
  const theme = useTheme();
  const { query, categoryId, favoritesOnly, clearFilters, requestFocus } = useGraphStore();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const people = useMemo(() => searchPeople(demoPeople, demoCategories, query, categoryId, favoritesOnly)
    .filter((person) => !person.isSelf).sort((a, b) => getPersonName(a).localeCompare(getPersonName(b), 'de')), [query, categoryId, favoritesOnly]);
  return <SafeAreaView edges={['top', 'left', 'right']} style={[styles.screen, { backgroundColor: theme.background }]}>
    <AppHeader title="Dein Kreis." subtitle="Die Menschen hinter den Verbindungen." />
    <NetworkFilters />
    <View style={styles.listHeader}><Text style={[styles.count, { color: theme.secondary }]}>{people.length} {people.length === 1 ? 'PERSON' : 'PERSONEN'}</Text><Text style={[styles.sort, { color: theme.secondary }]}>A–Z · Demodaten</Text></View>
    <FlatList data={people} keyExtractor={(person) => person.id} contentContainerStyle={styles.list} keyboardShouldPersistTaps="handled"
      ItemSeparatorComponent={() => <View style={{ height: 9 }} />}
      renderItem={({ item: person }) => <Pressable onPress={() => setSelectedId(person.id)} accessibilityRole="button" accessibilityLabel={`Profil von ${getPersonName(person)} öffnen`}
        style={({ pressed }) => [styles.row, { backgroundColor: theme.surface, borderColor: theme.border, opacity: pressed ? 0.7 : 1 }]}>
        <PersonAvatar person={person} categories={demoCategories} size={48} />
        <View style={styles.rowText}>
          <View style={styles.rowTitle}><Text numberOfLines={1} style={[styles.name, { color: theme.text }]}>{getPersonName(person)}</Text>{person.favorite && <Feather name="star" size={13} color={theme.accent} />}</View>
          <Text numberOfLines={1} style={[styles.meta, { color: theme.secondary }]}>{[demoCategories.find((category) => category.id === person.categoryIds[0])?.name, person.skills[0] || person.company || person.city].filter(Boolean).join(' · ')}</Text>
        </View>
        <Feather name="chevron-right" size={17} color={theme.secondary} />
      </Pressable>}
      ListEmptyComponent={<View style={styles.empty}><Feather name="search" size={34} color={theme.secondary} /><Text style={[styles.emptyTitle, { color: theme.text }]}>Noch kein Treffer.</Text><Text style={[styles.emptyText, { color: theme.secondary }]}>Versuche einen Namen, Skill oder Tag.{ '\n' }Zum Beispiel „Elektrik“ oder „Gaming“.</Text><Pressable accessibilityRole="button" onPress={clearFilters} style={[styles.reset, { backgroundColor: theme.accentSoft }]}><Text style={[styles.resetText, { color: theme.accent }]}>Filter zurücksetzen</Text></Pressable></View>} />
    <PersonSheet person={demoPeople.find((person) => person.id === selectedId) ?? null} people={demoPeople} categories={demoCategories} relationships={demoRelationships}
      onClose={() => setSelectedId(null)} onSelectPerson={setSelectedId} onFocus={(id) => { setSelectedId(null); requestFocus(id); router.navigate('/'); }} />
  </SafeAreaView>;
}
const styles = StyleSheet.create({
  screen: { flex: 1 }, listHeader: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 24, paddingTop: 5, paddingBottom: 14 },
  count: { fontFamily: fonts.bold, fontSize: 10, letterSpacing: 1.3 }, sort: { fontFamily: fonts.regular, fontSize: 10 },
  list: { paddingHorizontal: 20, paddingBottom: 24 }, row: { padding: 14, borderWidth: 1, borderRadius: 18, flexDirection: 'row', alignItems: 'center', gap: 12 },
  rowText: { flex: 1 }, rowTitle: { flexDirection: 'row', alignItems: 'center', gap: 8 }, name: { flexShrink: 1, fontFamily: fonts.bold, fontSize: 14 }, meta: { fontFamily: fonts.regular, fontSize: 11, marginTop: 5 },
  empty: { paddingVertical: 50, alignItems: 'center' }, emptyTitle: { fontFamily: fonts.bold, fontSize: 22, marginTop: 18 }, emptyText: { fontFamily: fonts.regular, fontSize: 13, lineHeight: 22, textAlign: 'center', marginTop: 10 },
  reset: { paddingHorizontal: 20, paddingVertical: 14, borderRadius: 16, marginTop: 22 }, resetText: { fontFamily: fonts.semiBold, fontSize: 13 },
});
