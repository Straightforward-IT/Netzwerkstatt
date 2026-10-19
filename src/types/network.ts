export interface Category {
  id: string;
  name: string;
  color: string;
}

export interface ContactMethod {
  id: string;
  type: 'phone' | 'email' | 'instagram' | 'discord' | 'website';
  value: string;
  label?: string;
}

export interface Person {
  id: string;
  /** May be empty for contacts known only by a handle. */
  firstName: string;
  lastName?: string;
  nickname?: string;
  company?: string;
  city?: string;
  notes?: string;
  categoryIds: string[];
  tags: string[];
  skills: string[];
  contactMethods: ContactMethod[];
  favorite: boolean;
  isSelf?: boolean;
}

export type RelationshipType =
  | 'family'
  | 'friend'
  | 'partner'
  | 'colleague'
  | 'former_colleague'
  | 'knows'
  | 'introduced_by'
  | 'works_with'
  | 'works_for'
  | 'service_provider'
  | 'neighbor'
  | 'mentor'
  | 'parent_of'
  | 'child_of'
  | 'sibling_of'
  | 'spouse_of'
  | 'other';

export interface Relationship {
  id: string;
  sourcePersonId: string;
  targetPersonId: string;
  type: RelationshipType;
  label?: string;
  notes?: string;
  since?: string;
}

export interface RelationshipTypeMetadata {
  /** Description when reading source → target. */
  label: string;
  /** Description when reading target → source. */
  inverseLabel: string;
  directed: boolean;
}

export const relationshipTypeMetadata: Record<RelationshipType, RelationshipTypeMetadata> = {
  family: { label: 'Familie', inverseLabel: 'Familie', directed: false },
  friend: { label: 'befreundet mit', inverseLabel: 'befreundet mit', directed: false },
  partner: { label: 'Partner von', inverseLabel: 'Partner von', directed: false },
  colleague: { label: 'Kollegen', inverseLabel: 'Kollegen', directed: false },
  former_colleague: { label: 'frühere Kollegen', inverseLabel: 'frühere Kollegen', directed: false },
  knows: { label: 'kennt', inverseLabel: 'kennt', directed: false },
  introduced_by: { label: 'kennengelernt über', inverseLabel: 'hat vorgestellt', directed: true },
  works_with: { label: 'arbeitet mit', inverseLabel: 'arbeitet mit', directed: false },
  works_for: { label: 'arbeitet für', inverseLabel: 'beauftragt', directed: true },
  service_provider: { label: 'unterstützt', inverseLabel: 'bekommt Unterstützung von', directed: true },
  neighbor: { label: 'Nachbarn', inverseLabel: 'Nachbarn', directed: false },
  mentor: { label: 'begleitet als Mentor', inverseLabel: 'lernt von', directed: true },
  parent_of: { label: 'Elternteil von', inverseLabel: 'Kind von', directed: true },
  child_of: { label: 'Kind von', inverseLabel: 'Elternteil von', directed: true },
  sibling_of: { label: 'Geschwister', inverseLabel: 'Geschwister', directed: false },
  spouse_of: { label: 'verheiratet mit', inverseLabel: 'verheiratet mit', directed: false },
  other: { label: 'verbunden mit', inverseLabel: 'verbunden mit', directed: false },
};

export interface GraphNode {
  personId: string;
  x: number;
  y: number;
}

export interface GraphCluster {
  categoryId: string;
  x: number;
  y: number;
}

export interface GraphLayout {
  nodes: GraphNode[];
  clusters: GraphCluster[];
}

export type GraphMode = 'network' | 'categories';

/** Translation is measured in screen pixels; node positions use world units. */
export interface Viewport {
  x: number;
  y: number;
  scale: number;
}

export interface Point {
  x: number;
  y: number;
}

export function getPersonName(person: Person): string {
  return [person.firstName, person.lastName].filter(Boolean).join(' ').trim()
    || person.nickname
    || person.contactMethods[0]?.value
    || 'Unbenannter Kontakt';
}

export function getPersonInitials(person: Person): string {
  if (person.isSelf) return 'ICH';
  const words = getPersonName(person).replace(/^@/, '').split(/\s+/);
  const first = words[0] ?? '?';
  const last = words[words.length - 1] ?? first;
  return (words.length > 1 ? first.charAt(0) + last.charAt(0) : first.slice(0, 2)).toUpperCase();
}
