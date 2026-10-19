import Feather from '@expo/vector-icons/Feather';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, useWindowDimensions, View } from 'react-native';
import { demoCategories } from '../../data/demo-network';
import { useGraphStore } from '../../stores/graph.store';
import { fonts, useTheme } from '../../theme/tokens';

export function NetworkFilters({ compact = false }: { compact?: boolean }) {
  const theme = useTheme();
  const { width } = useWindowDimensions();
  const inline = compact && width >= 680;
  const { query, setQuery, categoryId, setCategory, favoritesOnly, toggleFavorites } = useGraphStore();
  return <View style={inline && styles.inline}>
    <View style={[styles.search, compact && styles.searchCompact, inline && styles.searchInline, { backgroundColor: theme.surface, borderColor: theme.border }]}>
      <Feather name="search" size={19} color={theme.secondary} />
      <TextInput accessibilityLabel="Personen, Skills und Notizen durchsuchen" placeholder="Name, Skill, Firma …" placeholderTextColor={theme.secondary}
        value={query} onChangeText={setQuery} autoCorrect={false} returnKeyType="search"
        style={[styles.input, compact && styles.inputCompact, { color: theme.text }]} />
      {!!query && <Pressable accessibilityRole="button" accessibilityLabel="Suche löschen" onPress={() => setQuery('')} style={styles.clear}><Feather name="x" size={18} color={theme.secondary} /></Pressable>}
    </View>
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={inline && styles.chipsInlineScroll}
      contentContainerStyle={[styles.chips, compact && styles.chipsCompact, inline && styles.chipsInline]} keyboardShouldPersistTaps="handled">
      {[{ id: null, name: 'Alle', color: theme.accent }, ...demoCategories].map((category) => {
        const active = categoryId === category.id;
        return <Pressable key={category.id ?? 'all'} accessibilityRole="button" accessibilityState={{ selected: active }} onPress={() => setCategory(category.id)}
          style={[styles.chip, compact && styles.chipCompact, { backgroundColor: active ? theme.accent : theme.surface, borderColor: active ? theme.accent : theme.border }]}>
          {category.id && <View style={[styles.dot, { backgroundColor: active ? theme.onAccent : category.color }]} />}
          <Text style={[styles.chipText, { color: active ? theme.onAccent : theme.secondary }]}>{category.name}</Text>
        </Pressable>;
      })}
      <Pressable accessibilityRole="button" accessibilityLabel="Nur Favoriten" accessibilityState={{ selected: favoritesOnly }} onPress={toggleFavorites}
        style={[styles.chip, compact && styles.chipCompact, { backgroundColor: favoritesOnly ? theme.accentSoft : theme.surface, borderColor: theme.border }]}>
        <Feather name="star" size={14} color={theme.accent} /><Text style={[styles.chipText, { color: theme.accent }]}>Favoriten</Text>
      </Pressable>
    </ScrollView>
  </View>;
}
const styles = StyleSheet.create({
  inline: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 20, paddingBottom: 10 },
  search: { marginHorizontal: 24, flexDirection: 'row', alignItems: 'center', paddingLeft: 16, paddingRight: 5, borderWidth: 1, borderRadius: 16, minHeight: 50, gap: 10 },
  searchCompact: { minHeight: 44, marginHorizontal: 20, borderRadius: 14, paddingLeft: 12 },
  searchInline: { marginHorizontal: 0, width: 260, flexShrink: 1 },
  input: { flex: 1, fontFamily: fonts.regular, fontSize: 14, minHeight: 48, paddingVertical: 10 }, clear: { padding: 12 },
  inputCompact: { minHeight: 42, paddingVertical: 6 },
  chips: { paddingHorizontal: 24, paddingTop: 12, paddingBottom: 16, gap: 8 },
  chipsCompact: { paddingHorizontal: 20, paddingTop: 6, paddingBottom: 8, gap: 6 },
  chipsInlineScroll: { flex: 1, minWidth: 0 },
  chipsInline: { paddingHorizontal: 0, paddingTop: 0, paddingBottom: 0 },
  chip: { minHeight: 40, paddingHorizontal: 15, flexDirection: 'row', alignItems: 'center', gap: 7, borderWidth: 1, borderRadius: 30 },
  chipCompact: { minHeight: 44, paddingHorizontal: 12 },
  chipText: { fontFamily: fonts.semiBold, fontSize: 12 }, dot: { width: 6, height: 6, borderRadius: 3 },
});
