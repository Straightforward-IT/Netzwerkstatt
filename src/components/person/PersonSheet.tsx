import Feather from '@expo/vector-icons/Feather';
import React, { useEffect } from 'react';
import {
  Keyboard,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { fonts, radius, Theme, useTheme } from '../../theme/tokens';
import {
  Category,
  ContactMethod,
  getPersonName,
  Person,
  Relationship,
  relationshipTypeMetadata,
} from '../../types/network';
import { PersonAvatar } from './PersonAvatar';

export interface PersonSheetProps {
  person: Person | null;
  people: Person[];
  categories: Category[];
  relationships: Relationship[];
  onClose: () => void;
  onFocus: (personId: string) => void;
  onSelectPerson: (personId: string) => void;
}

const contactMetadata: Record<ContactMethod['type'], { label: string; icon: keyof typeof Feather.glyphMap }> = {
  phone: { label: 'Telefon', icon: 'phone' },
  email: { label: 'E-Mail', icon: 'mail' },
  instagram: { label: 'Instagram', icon: 'instagram' },
  discord: { label: 'Discord', icon: 'message-circle' },
  website: { label: 'Website', icon: 'globe' },
};

export function PersonSheet({
  person,
  people,
  categories,
  relationships,
  onClose,
  onFocus,
  onSelectPerson,
}: PersonSheetProps) {
  const theme = useTheme();
  const styles = createStyles(theme);
  const { height, width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const name = person ? getPersonName(person) : '';
  const personId = person?.id;
  useEffect(() => {
    if (personId) Keyboard.dismiss();
  }, [personId]);
  const personCategories = person
    ? categories.filter((category) => person.categoryIds.includes(category.id))
    : [];
  const connections = person
    ? relationships.flatMap((relationship) => {
        const isSource = relationship.sourcePersonId === person.id;
        if (!isSource && relationship.targetPersonId !== person.id) return [];
        const otherId = isSource ? relationship.targetPersonId : relationship.sourcePersonId;
        const otherPerson = people.find((candidate) => candidate.id === otherId);
        if (!otherPerson) return [];
        const metadata = relationshipTypeMetadata[relationship.type];
        return [{
          relationship,
          otherPerson,
          description: isSource ? metadata.label : metadata.inverseLabel,
        }];
      })
    : [];

  return (
    <Modal
      visible={person !== null}
      transparent
      animationType="slide"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Personendetails schließen"
          onPress={onClose}
          style={styles.backdrop}
        />
        {person && (
          <View
            accessibilityViewIsModal
            style={[
              styles.sheet,
              { maxHeight: height * 0.78, width: width >= 680 ? 620 : '100%' },
            ]}
          >
            <View style={styles.handle} />
            <View style={styles.topBar}>
              <Text style={styles.eyebrow}>PERSON IM NETZWERK</Text>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Personendetails schließen"
                onPress={onClose}
                style={({ pressed }) => [styles.closeButton, pressed && styles.pressed]}
              >
                <Feather name="x" size={20} color={theme.secondary} />
              </Pressable>
            </View>

            <ScrollView
              key={person.id}
              style={styles.scroll}
              contentContainerStyle={styles.content}
              showsVerticalScrollIndicator
              keyboardShouldPersistTaps="handled"
            >
              <View style={styles.profile}>
                <PersonAvatar person={person} categories={categories} size={84} />
                <View style={styles.profileText}>
                  <Text accessibilityRole="header" style={styles.name}>{name}</Text>
                  {person.nickname && person.nickname !== name && (
                    <Text selectable style={styles.nickname}>{person.nickname}</Text>
                  )}
                  {person.isSelf && <Text style={styles.subtitle}>Das bist du · Mittelpunkt deines Netzwerks</Text>}
                  {person.company && <Text style={styles.subtitle}>{person.company}</Text>}
                  {person.city && (
                    <View style={styles.location}>
                      <Feather name="map-pin" size={13} color={theme.secondary} />
                      <Text style={styles.subtitle}>{person.city}</Text>
                    </View>
                  )}
                </View>
                {person.favorite && <Feather name="star" size={18} color={theme.accent} accessibilityLabel="Favorit" />}
              </View>

              {personCategories.length > 0 && (
                <View style={styles.pills}>
                  {personCategories.map((category) => (
                    <View key={category.id} style={styles.categoryPill}>
                      <View style={[styles.categoryDot, { backgroundColor: category.color }]} />
                      <Text style={styles.categoryText}>{category.name}</Text>
                    </View>
                  ))}
                </View>
              )}

              {person.notes && (
                <View style={styles.note}>
                  <Feather name="align-left" size={17} color={theme.secondary} />
                  <Text selectable style={styles.noteText}>{person.notes}</Text>
                </View>
              )}

              {person.contactMethods.length > 0 && (
                <View style={styles.section}>
                  <Text accessibilityRole="header" style={styles.sectionTitle}>Kontakt</Text>
                  <View style={styles.contactCard}>
                    {person.contactMethods.map((contact, index) => {
                      const metadata = contactMetadata[contact.type];
                      return (
                        <View key={contact.id} style={[styles.contactRow, index > 0 && styles.rowBorder]}>
                          <View style={styles.contactIcon}>
                            <Feather name={metadata.icon} size={17} color={theme.accent} />
                          </View>
                          <View style={styles.flex}>
                            <Text style={styles.contactLabel}>{contact.label || metadata.label}</Text>
                            <Text selectable style={styles.contactValue}>{contact.value}</Text>
                          </View>
                        </View>
                      );
                    })}
                  </View>
                </View>
              )}

              {person.skills.length > 0 && (
                <View style={styles.section}>
                  <Text accessibilityRole="header" style={styles.sectionTitle}>Kenntnisse & Interessen</Text>
                  <View style={styles.pills}>
                    {person.skills.map((skill) => (
                      <View key={skill} style={styles.skillPill}><Text style={styles.skillText}>{skill}</Text></View>
                    ))}
                  </View>
                </View>
              )}

              {person.tags.length > 0 && (
                <View style={styles.section}>
                  <Text accessibilityRole="header" style={styles.sectionTitle}>Tags</Text>
                  <View style={styles.pills}>
                    {person.tags.map((tag) => <Text key={tag} style={styles.tag}>#{tag.replace(/^#/, '')}</Text>)}
                  </View>
                </View>
              )}

              <View style={styles.section}>
                <View style={styles.sectionHeading}>
                  <Text accessibilityRole="header" style={styles.sectionTitle}>Verbindungen</Text>
                  <Text style={styles.count}>{connections.length}</Text>
                </View>
                {connections.length === 0 ? (
                  <Text style={styles.emptyText}>Für diese Person sind noch keine Verbindungen hinterlegt.</Text>
                ) : (
                  <View style={styles.connections}>
                    {connections.map(({ relationship, otherPerson, description }, index) => (
                      <Pressable
                        key={relationship.id}
                        accessibilityRole="button"
                        accessibilityLabel={`${name} ${description} ${getPersonName(otherPerson)}. Person anzeigen.`}
                        onPress={() => onSelectPerson(otherPerson.id)}
                        style={({ pressed }) => [styles.connectionRow, index > 0 && styles.rowBorder, pressed && styles.pressed]}
                      >
                        <PersonAvatar person={otherPerson} categories={categories} size={42} />
                        <View style={styles.flex}>
                          <Text style={styles.relationshipLabel}>{description}</Text>
                          <Text style={styles.connectionName}>{getPersonName(otherPerson)}</Text>
                          {relationship.label && relationship.label !== description && (
                            <Text style={styles.contactLabel}>{relationship.label}</Text>
                          )}
                        </View>
                        <Feather name="chevron-right" size={19} color={theme.secondary} />
                      </Pressable>
                    ))}
                  </View>
                )}
              </View>

              <View style={styles.demoHint}>
                <Feather name="info" size={14} color={theme.secondary} />
                <Text style={styles.demoText}>Beispielprofil mit fiktiven Daten. Kontaktdaten dienen nur der Vorschau.</Text>
              </View>
            </ScrollView>

            <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 18) }]}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`${name} im Netzwerk fokussieren`}
                onPress={() => onFocus(person.id)}
                style={({ pressed }) => [styles.focusButton, pressed && styles.pressed]}
              >
                <Feather name="crosshair" size={19} color={theme.onAccent} />
                <Text style={styles.focusButtonText}>Im Netzwerk fokussieren</Text>
              </Pressable>
            </View>
          </View>
        )}
      </View>
    </Modal>
  );
}

function createStyles(theme: Theme) {
  return StyleSheet.create({
    overlay: { flex: 1, justifyContent: 'flex-end', alignItems: 'center' },
    backdrop: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, backgroundColor: theme.backdrop },
    sheet: { backgroundColor: theme.surface, borderTopLeftRadius: 28, borderTopRightRadius: 28, overflow: 'hidden', flexShrink: 1 },
    handle: { width: 34, height: 4, borderRadius: 2, backgroundColor: theme.border, alignSelf: 'center', marginTop: 10 },
    topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingLeft: 24, paddingRight: 12, paddingTop: 2 },
    eyebrow: { fontFamily: fonts.semiBold, fontSize: 10, letterSpacing: 1.6, color: theme.secondary },
    closeButton: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center', borderRadius: radius.pill },
    scroll: { flexShrink: 1 },
    content: { paddingHorizontal: 24, paddingTop: 8, paddingBottom: 22, gap: 22 },
    profile: { flexDirection: 'row', alignItems: 'center', gap: 16 },
    profileText: { flex: 1, gap: 3 },
    name: { color: theme.text, fontFamily: fonts.bold, fontSize: 24, lineHeight: 31, letterSpacing: -0.7 },
    nickname: { color: theme.accent, fontFamily: fonts.medium, fontSize: 14 },
    subtitle: { color: theme.secondary, fontFamily: fonts.regular, fontSize: 12, lineHeight: 19 },
    location: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    pills: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    categoryPill: { flexDirection: 'row', alignItems: 'center', gap: 7, paddingHorizontal: 11, paddingVertical: 7, borderWidth: 1, borderColor: theme.border, borderRadius: radius.pill },
    categoryDot: { width: 7, height: 7, borderRadius: 4 },
    categoryText: { color: theme.text, fontFamily: fonts.medium, fontSize: 12 },
    note: { flexDirection: 'row', alignItems: 'flex-start', backgroundColor: theme.background, borderRadius: radius.md, padding: 14, gap: 10 },
    noteText: { flex: 1, color: theme.secondary, fontFamily: fonts.regular, fontSize: 13, lineHeight: 21 },
    section: { gap: 10 },
    sectionTitle: { color: theme.text, fontFamily: fonts.semiBold, fontSize: 14 },
    sectionHeading: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    count: { color: theme.secondary, fontFamily: fonts.medium, fontSize: 11, backgroundColor: theme.surfaceMuted, borderRadius: 10, paddingHorizontal: 7, paddingVertical: 2 },
    contactCard: { borderWidth: 1, borderColor: theme.border, borderRadius: radius.md, overflow: 'hidden' },
    contactRow: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 13 },
    rowBorder: { borderTopWidth: 1, borderTopColor: theme.border },
    contactIcon: { width: 34, height: 34, borderRadius: 12, backgroundColor: theme.accentSoft, alignItems: 'center', justifyContent: 'center' },
    flex: { flex: 1, gap: 3 },
    contactLabel: { color: theme.secondary, fontFamily: fonts.regular, fontSize: 11, lineHeight: 16 },
    contactValue: { color: theme.text, fontFamily: fonts.medium, fontSize: 13, lineHeight: 19 },
    skillPill: { backgroundColor: theme.accentSoft, borderRadius: radius.sm, paddingHorizontal: 11, paddingVertical: 7 },
    skillText: { color: theme.accent, fontFamily: fonts.medium, fontSize: 12 },
    tag: { color: theme.secondary, fontFamily: fonts.medium, fontSize: 12, lineHeight: 20 },
    connections: { borderWidth: 1, borderColor: theme.border, borderRadius: radius.md, overflow: 'hidden' },
    connectionRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 12, paddingVertical: 13, minHeight: 68 },
    relationshipLabel: { color: theme.secondary, fontFamily: fonts.regular, fontSize: 11, lineHeight: 16 },
    connectionName: { color: theme.text, fontFamily: fonts.semiBold, fontSize: 13, lineHeight: 20 },
    emptyText: { color: theme.secondary, fontFamily: fonts.regular, fontSize: 13, lineHeight: 21 },
    demoHint: { flexDirection: 'row', alignItems: 'flex-start', gap: 7, paddingTop: 3 },
    demoText: { flex: 1, color: theme.secondary, fontFamily: fonts.regular, fontSize: 11, lineHeight: 17 },
    footer: { paddingHorizontal: 24, paddingTop: 14, borderTopWidth: 1, borderTopColor: theme.border, backgroundColor: theme.surface },
    focusButton: { backgroundColor: theme.accent, borderRadius: radius.md, paddingVertical: 16, paddingHorizontal: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, minHeight: 52 },
    focusButtonText: { color: theme.onAccent, fontFamily: fonts.semiBold, fontSize: 14, flexShrink: 1 },
    pressed: { opacity: 0.68 },
  });
}
