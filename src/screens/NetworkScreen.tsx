import Feather from '@expo/vector-icons/Feather';
import { useFocusEffect } from 'expo-router';
import { useCallback, useMemo, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View, useColorScheme, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NetworkGraph, type GraphHandle } from '../components/graph/NetworkGraph';
import { PersonSheet } from '../components/person/PersonSheet';
import { AppHeader } from '../components/ui/AppHeader';
import { IconButton } from '../components/ui/IconButton';
import { NetworkFilters } from '../components/ui/NetworkFilters';
import { demoCategories, demoPeople, demoRelationships } from '../data/demo-network';
import { buildGraphLayout } from '../services/graph-layout';
import { searchPeople } from '../services/search';
import { useGraphStore } from '../stores/graph.store';
import { fonts, useTheme } from '../theme/tokens';
import type { Viewport } from '../types/network';

export default function NetworkScreen() {
  const theme = useTheme();
  const dark = useColorScheme() === 'dark';
  const { height, width } = useWindowDimensions();
  const compact = height < 600;
  const wideCompact = compact && width >= 680;
  const graph = useRef<GraphHandle>(null);
  const [sheetPersonId, setSheetPersonId] = useState<string | null>(null);
  const [viewport, setViewport] = useState<Viewport | null>(null);
  const { query, categoryId, favoritesOnly, mode, setMode, selectedPersonId, selectPerson, focusRequest, consumeFocusRequest, clearFilters } = useGraphStore();
  const layout = useMemo(() => buildGraphLayout(demoPeople, demoCategories, demoRelationships, mode), [mode]);
  const matches = useMemo(() => searchPeople(demoPeople, demoCategories, query, categoryId, favoritesOnly), [query, categoryId, favoritesOnly]);
  const matchingIds = useMemo(() => matches.map((person) => person.id), [matches]);
  const matchingCount = matches.filter((person) => !person.isSelf).length;
  const filtered = !!query || !!categoryId || favoritesOnly;
  useFocusEffect(useCallback(() => {
    const handle = graph.current;
    if (handle && focusRequest && consumeFocusRequest(focusRequest.revision)) {
      handle.focus(focusRequest.personId);
    }
  }, [focusRequest, consumeFocusRequest]));
  function select(personId: string | null) {
    selectPerson(personId);
    setSheetPersonId(personId);
  }
  function focus(personId: string) {
    setSheetPersonId(null);
    selectPerson(personId);
    graph.current?.focus(personId);
  }
  return <SafeAreaView edges={['top', 'left', 'right']} style={[styles.screen, { backgroundColor: theme.background }]}>
    <AppHeader title="Menschen verbinden." subtitle="Dein Netzwerk. Deine Perspektive." compact={compact} />
    <NetworkFilters compact={compact} />
    <View style={[styles.canvasContainer, { borderTopColor: theme.border }]}>
      <NetworkGraph ref={graph} people={demoPeople} categories={demoCategories} relationships={demoRelationships}
        layout={layout} matchingIds={matchingIds} selectedPersonId={selectedPersonId} dark={dark}
        onSelectPerson={select} onFocusPerson={(id) => { selectPerson(id); setSheetPersonId(null); }}
        onLongPressPerson={select} onViewportChange={setViewport} />
      <View pointerEvents="box-none" style={[styles.canvasHeader, compact && styles.canvasHeaderCompact]}>
        <View style={[styles.modeControl, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          {([{ key: 'categories', name: 'Kategorien', icon: 'grid' }, { key: 'network', name: 'Beziehungen', icon: 'share-2' }] as const).map((item) => <Pressable key={item.key}
            onPress={() => setMode(item.key)} accessibilityRole="button" accessibilityState={{ selected: mode === item.key }}
            style={[styles.mode, { backgroundColor: mode === item.key ? theme.accentSoft : 'transparent' }]}>
            <Feather name={item.icon} size={14} color={mode === item.key ? theme.accent : theme.secondary} />
            <Text style={[styles.modeText, { color: mode === item.key ? theme.accent : theme.secondary }]}>{item.name}</Text>
          </Pressable>)}
        </View>
      </View>
      {filtered && <View pointerEvents="box-none" style={[styles.resultContainer, wideCompact && styles.resultContainerCompact]}>
        <View style={[styles.result, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <Text accessibilityLiveRegion="polite" style={[styles.resultText, { color: theme.text }]}>{matchingCount === 0 ? 'Keine passenden Personen' : `${matchingCount} ${matchingCount === 1 ? 'Person' : 'Personen'} gefunden`}</Text>
          <Pressable accessibilityRole="button" accessibilityLabel="Alle Filter zurücksetzen" onPress={clearFilters} style={styles.resultClear}><Feather name="x" size={16} color={theme.accent} /></Pressable>
        </View>
      </View>}
      <View pointerEvents="box-none" style={[styles.canvasFooter, compact && styles.canvasFooterCompact]}>
        <View style={styles.demoNote}>
          <View style={[styles.demoBadge, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <View style={[styles.statusDot, { backgroundColor: theme.accent }]} /><Text style={[styles.demoText, { color: theme.secondary }]}>DEMO · 30 PERSONEN</Text>
          </View>
          {!compact && <Text style={[styles.hint, { color: theme.secondary }]}>Antippen, um mehr zu erfahren.{ '\n' }Doppeltippen, um zu fokussieren.</Text>}
        </View>
        <View style={[styles.controls, compact && styles.controlsCompact]}>
          <IconButton icon="plus" label="Netzwerk vergrößern" onPress={() => graph.current?.zoom(1.3)} />
          <Text accessibilityLabel={`Zoom ${Math.round((viewport?.scale ?? 1) * 100)} Prozent`} style={[styles.zoomValue, { color: theme.secondary }]}>{viewport ? `${Math.round(viewport.scale * 100)}%` : '…'}</Text>
          <IconButton icon="minus" label="Netzwerk verkleinern" onPress={() => graph.current?.zoom(1 / 1.3)} />
          {!compact && <View style={{ height: 4 }} />}
          <IconButton icon="maximize" label="Gesamtes Netzwerk zentrieren" onPress={() => { graph.current?.reset(); selectPerson(null); }} />
        </View>
      </View>
    </View>
    <PersonSheet person={demoPeople.find((person) => person.id === sheetPersonId) ?? null} people={demoPeople} categories={demoCategories}
      relationships={demoRelationships} onClose={() => setSheetPersonId(null)} onSelectPerson={select} onFocus={focus} />
  </SafeAreaView>;
}
const styles = StyleSheet.create({
  screen: { flex: 1 }, canvasContainer: { flex: 1, minHeight: 0, borderTopWidth: 1, overflow: 'hidden' },
  canvasHeader: { position: 'absolute', top: 16, left: 20, right: 20, alignItems: 'flex-start' },
  canvasHeaderCompact: { top: 10 },
  modeControl: { flexDirection: 'row', borderRadius: 14, padding: 4, borderWidth: 1 },
  mode: { flexDirection: 'row', alignItems: 'center', gap: 6, minHeight: 36, paddingHorizontal: 12, borderRadius: 10 },
  modeText: { fontFamily: fonts.semiBold, fontSize: 11 },
  canvasFooter: { position: 'absolute', left: 20, right: 20, bottom: 18, flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', gap: 8 },
  canvasFooterCompact: { bottom: 10, alignItems: 'center' },
  demoNote: { flex: 1, alignItems: 'flex-start' }, demoBadge: { borderRadius: 8, borderWidth: 1, paddingHorizontal: 10, paddingVertical: 7, flexDirection: 'row', gap: 6, alignItems: 'center' },
  statusDot: { width: 5, height: 5, borderRadius: 3 }, demoText: { fontFamily: fonts.bold, fontSize: 9, letterSpacing: 1 },
  hint: { fontFamily: fonts.regular, fontSize: 10, lineHeight: 17, marginTop: 9 }, controls: { alignItems: 'center', gap: 3 },
  controlsCompact: { flexDirection: 'row', gap: 8 },
  zoomValue: { fontFamily: fonts.medium, fontSize: 10, paddingVertical: 3 },
  resultContainer: { position: 'absolute', top: 73, left: 20, right: 20, alignItems: 'flex-start' },
  resultContainerCompact: { top: 10, left: undefined, alignItems: 'flex-end' },
  result: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: 12, paddingLeft: 12 },
  resultText: { fontFamily: fonts.semiBold, fontSize: 12 }, resultClear: { padding: 13 },
});
