import type { Category, Person, Relationship, RelationshipType } from '../types/network';

export const SELF_ID = 'ich';

export const demoCategories: Category[] = [
  { id: 'familie', name: 'Familie', color: '#D28A64' },
  { id: 'freunde', name: 'Freunde', color: '#738DCC' },
  { id: 'arbeit', name: 'Arbeit', color: '#8C9B75' },
  { id: 'skills', name: 'Skills', color: '#B28BB9' },
];

type DemoPerson = Pick<Person, 'id' | 'firstName' | 'categoryIds'> & Partial<Person>;

function contact(person: DemoPerson): Person {
  return {
    tags: [],
    skills: [],
    favorite: false,
    city: 'Hamburg',
    contactMethods: [{ id: `${person.id}-mail`, type: 'email', value: `${person.id}@example.com`, label: 'Demo-Adresse' }],
    ...person,
  };
}

/** Fictional, in-memory sample data. example.com addresses never identify real contacts. */
export const demoPeople: Person[] = [
  contact({ id: SELF_ID, firstName: 'Ich', isSelf: true, categoryIds: [], contactMethods: [], notes: 'Der Mittelpunkt deines persönlichen Netzwerks.' }),
  contact({ id: 'sabine', firstName: 'Sabine', lastName: 'Lindner', nickname: 'Mama', categoryIds: ['familie'], favorite: true, tags: ['Garten', 'Kochen'], skills: ['Gärtnern'], notes: 'Probiert gerne neue Rezepte aus. Sonntags ist Zeit für einen langen Spaziergang.' }),
  contact({ id: 'thomas', firstName: 'Thomas', lastName: 'Lindner', nickname: 'Papa', categoryIds: ['familie', 'skills'], favorite: true, tags: ['Radfahren'], skills: ['Fahrradreparatur', 'Holzarbeiten'], notes: 'Kennt jede schöne Radstrecke an der Elbe.' }),
  contact({ id: 'lena', firstName: 'Lena', lastName: 'Lindner', categoryIds: ['familie', 'freunde'], favorite: true, tags: ['Schwester', 'Klettern'], skills: ['Illustration'], notes: 'Unsere nächste gemeinsame Idee: ein Wochenende in den Bergen.' }),
  contact({ id: 'helga', firstName: 'Helga', lastName: 'Bergmann', nickname: 'Oma', city: 'Lüneburg', categoryIds: ['familie'], tags: ['Familiengeschichten'], skills: ['Backen'], notes: 'Hat das Familienalbum und die besten Geschichten dazu.' }),
  contact({ id: 'jens', firstName: 'Jens', lastName: 'Bergmann', categoryIds: ['familie'], tags: ['Onkel', 'Segeln'], skills: ['Segeln'], notes: 'Organisiert den jährlichen Familienausflug.' }),
  contact({ id: 'katrin', firstName: 'Katrin', lastName: 'Bergmann', categoryIds: ['familie'], tags: ['Tante', 'Bücher'], skills: ['Sprachen'], notes: 'Hat immer eine gute Buchempfehlung.' }),
  contact({ id: 'jonas', firstName: 'Jonas', lastName: 'Bergmann', city: 'Bremen', categoryIds: ['familie', 'freunde'], tags: ['Cousin', 'Musik'], skills: ['Gitarre'], notes: 'Spielt in einer kleinen Band.' }),
  contact({ id: 'mira', firstName: 'Mira', lastName: 'Bergmann', city: 'Kiel', categoryIds: ['familie'], tags: ['Cousine', 'Meer'], skills: ['Biologie'], notes: 'Am liebsten draußen und am Wasser.' }),
  contact({ id: 'alex', firstName: 'Alex', lastName: 'Winter', categoryIds: ['freunde', 'skills'], favorite: true, tags: ['Gaming', 'Uni'], skills: ['IT', 'Server', 'Netzwerk'], notes: 'Seit dem Studium befreundet. Hat mir Max auf Lisas Geburtstag vorgestellt.' }),
  contact({ id: 'marie', firstName: 'Marie', lastName: 'Sommer', categoryIds: ['freunde'], favorite: true, tags: ['Laufen', 'Kaffee'], skills: ['Organisation'], notes: 'Unser fester Lauftreff ist am Stadtpark.' }),
  contact({ id: 'felix', firstName: 'Felix', lastName: 'Wendt', categoryIds: ['freunde'], tags: ['Schulfreunde', 'Bouldern'], skills: ['Klettern'], notes: 'Kennt die guten Boulderhallen in der Umgebung.' }),
  contact({ id: 'lisa', firstName: 'Lisa', lastName: 'Krüger', categoryIds: ['freunde', 'arbeit'], tags: ['Design', 'Spieleabend'], skills: ['Produktdesign'], company: 'Studio Morgen', notes: 'Gastgeberin unserer Spieleabende. Mit Anna an einem Designprojekt gearbeitet.' }),
  contact({ id: 'max', firstName: 'Max', lastName: 'Kühn', categoryIds: ['freunde', 'skills'], tags: ['Smart Home', 'Nachbarschaft'], skills: ['Elektrik', 'Elektriker', 'Netzwerktechnik'], notes: 'Über Alex kennengelernt. Guter Ansprechpartner für die neue Beleuchtung.' }),
  contact({ id: 'niko', firstName: 'Niko', lastName: 'Brandt', city: 'Berlin', categoryIds: ['freunde'], tags: ['Fotografie', 'Reisen'], skills: ['Kameras', 'Foto', 'Video'], notes: 'Hat beim letzten Urlaub tolle Fotos gemacht.' }),
  contact({ id: 'nina', firstName: 'Nina', lastName: 'Seidel', categoryIds: ['freunde'], tags: ['Nachbarschaft', 'Yoga'], skills: ['Yoga'], notes: 'Wohnt zwei Straßen weiter. Wir tauschen gerne Pflanzen.' }),
  contact({ id: 'pixelpilot', firstName: '', nickname: 'Pixelpilot', categoryIds: ['freunde'], tags: ['Gaming', 'Online'], skills: ['Level Design'], city: undefined, contactMethods: [{ id: 'pixelpilot-discord', type: 'discord', value: 'demo_pixelpilot', label: 'Fiktiver Discord-Handle' }], notes: 'Aus unserer Koop-Runde. Wir kennen uns ausschließlich über den Handle.' }),
  contact({ id: 'anna', firstName: 'Anna', lastName: 'Peters', company: 'Studio Morgen', categoryIds: ['arbeit', 'freunde'], favorite: true, tags: ['Produkt', 'Team'], skills: ['Produktstrategie'], notes: 'Bringt Struktur in neue Ideen. Über Lisa kennengelernt.' }),
  contact({ id: 'tom', firstName: 'Tom', lastName: 'Albers', company: 'Studio Morgen', categoryIds: ['arbeit'], tags: ['Entwicklung', 'Team'], skills: ['TypeScript', 'Programmierung'], notes: 'Arbeitet mit Anna am neuen Produkt.' }),
  contact({ id: 'sofia', firstName: 'Sofia', lastName: 'Neumann', company: 'Nordlicht Kollektiv', categoryIds: ['arbeit', 'skills'], tags: ['Design'], skills: ['UX', 'Research'], notes: 'Kennt sich gut mit Nutzerinterviews aus.' }),
  contact({ id: 'david', firstName: 'David', lastName: 'Fischer', company: 'Hafenlabor', categoryIds: ['arbeit'], tags: ['Frühere Kollegen'], skills: ['Projektleitung'], notes: 'Wir haben gemeinsam die erste Version des Portals umgesetzt.' }),
  contact({ id: 'lea', firstName: 'Lea', lastName: 'Hansen', company: 'Hafenlabor', categoryIds: ['arbeit'], tags: ['Kommunikation'], skills: ['Text', 'Redaktion'], notes: 'Findet klare Worte für komplizierte Themen.' }),
  contact({ id: 'ben', firstName: 'Ben', lastName: 'Roth', company: 'Werkraum Digital', categoryIds: ['arbeit'], tags: ['Mentor'], skills: ['Softwarearchitektur'], notes: 'Guter Gesprächspartner für technische Grundsatzfragen.' }),
  contact({ id: 'paula', firstName: 'Paula', lastName: 'Voss', company: 'Werkraum Digital', categoryIds: ['arbeit'], tags: ['Community'], skills: ['Veranstaltungen', 'Moderation'], notes: 'Organisiert das monatliche Community-Treffen.' }),
  contact({ id: 'erik', firstName: 'Erik', lastName: 'Böhm', company: 'Werkbank West', categoryIds: ['skills'], tags: ['Handwerk'], skills: ['Tischler', 'Möbelbau'], notes: 'Über Max kennengelernt. Baut Möbel aus wiederverwendetem Holz.' }),
  contact({ id: 'jule', firstName: 'Jule', lastName: 'Martens', categoryIds: ['skills', 'freunde'], tags: ['Foto', 'Kreativ'], skills: ['Fotografie', 'Portraits'], notes: 'Kann beim nächsten Teamfoto helfen.' }),
  contact({ id: 'oskar', firstName: 'Oskar', lastName: 'Becker', company: 'Radraum', categoryIds: ['skills'], tags: ['Fahrrad'], skills: ['Fahrradreparatur', 'Mechanik'], notes: 'Hat Thomas beim Wiederaufbau des alten Rennrads geholfen.' }),
  contact({ id: 'tessa', firstName: 'Tessa', lastName: 'Franke', categoryIds: ['skills'], tags: ['Garten', 'Nachbarschaft'], skills: ['Pflanzen', 'Landschaftsgestaltung'], notes: 'Weiß, welche Pflanzen auf dem Balkon gut wachsen.' }),
  contact({ id: 'moritz', firstName: 'Moritz', lastName: 'Engel', company: 'Klangkante', categoryIds: ['skills', 'arbeit'], tags: ['Events', 'Musik'], skills: ['Veranstaltungstechnik', 'Ton', 'Licht'], notes: 'Hat beim Sommerfest die Technik übernommen.' }),
  contact({ id: 'amira', firstName: 'Amira', lastName: 'Yilmaz', categoryIds: ['skills'], tags: ['Kreativ', 'Sprachen'], skills: ['Übersetzung', 'Türkisch', 'Englisch'], notes: 'Über Sofia kennengelernt. Unterstützt bei mehrsprachigen Texten.' }),
  contact({ id: 'sven', firstName: 'Sven', lastName: 'Möller', company: 'Farbwerk', categoryIds: ['skills'], tags: ['Handwerk'], skills: ['Maler', 'Renovierung'], notes: 'Hat bei der Renovierung von Lisas Wohnung geholfen.' }),
];

function edge(sourcePersonId: string, targetPersonId: string, type: RelationshipType, extra: Partial<Relationship> = {}): Relationship {
  return { id: `${sourcePersonId}-${type}-${targetPersonId}`, sourcePersonId, targetPersonId, type, ...extra };
}

export const demoRelationships: Relationship[] = [
  edge('sabine', SELF_ID, 'parent_of'),
  edge('thomas', SELF_ID, 'parent_of'),
  edge('sabine', 'lena', 'parent_of'),
  edge('thomas', 'lena', 'parent_of'),
  edge('sabine', 'thomas', 'spouse_of'),
  edge('helga', 'sabine', 'parent_of'),
  edge('helga', 'jens', 'parent_of'),
  edge('jens', 'katrin', 'spouse_of'),
  edge('jens', 'jonas', 'parent_of'),
  edge('katrin', 'mira', 'parent_of'),
  edge(SELF_ID, 'lena', 'sibling_of'),
  edge(SELF_ID, 'jonas', 'family', { label: 'Cousins' }),
  ...['alex', 'marie', 'felix', 'lisa', 'max', 'niko', 'pixelpilot'].map((id) => edge(SELF_ID, id, 'friend')),
  edge(SELF_ID, 'nina', 'neighbor'),
  edge('alex', 'max', 'friend'),
  edge('max', 'alex', 'introduced_by', { since: '2024-06-03', notes: 'Alex stellte Max auf Lisas Geburtstag vor.' }),
  edge('lisa', 'marie', 'friend'),
  edge('niko', 'jule', 'works_with', { label: 'Fotoprojekte' }),
  edge('pixelpilot', 'alex', 'friend', { label: 'Koop-Runde' }),
  ...['anna', 'tom', 'sofia', 'lea', 'paula'].map((id) => edge(SELF_ID, id, 'colleague')),
  edge(SELF_ID, 'david', 'former_colleague'),
  edge('ben', SELF_ID, 'mentor'),
  edge('anna', 'lisa', 'introduced_by', { since: '2025-03-12', notes: 'Lisa brachte uns bei einem Design-Workshop zusammen.' }),
  edge('anna', 'tom', 'colleague'),
  edge('david', 'lea', 'colleague'),
  edge('ben', 'paula', 'colleague'),
  edge('erik', 'max', 'introduced_by', { notes: 'Max empfahl Erik für das Bücherregal.' }),
  edge('erik', SELF_ID, 'service_provider', { label: 'Möbelbau' }),
  edge(SELF_ID, 'jule', 'friend'),
  edge('oskar', 'thomas', 'service_provider', { label: 'Fahrradwerkstatt' }),
  edge(SELF_ID, 'oskar', 'knows'),
  edge(SELF_ID, 'tessa', 'neighbor'),
  edge('tessa', 'sabine', 'friend', { label: 'Gartenrunde' }),
  edge('moritz', 'paula', 'works_with', { label: 'Community-Sommerfest' }),
  edge('moritz', SELF_ID, 'service_provider'),
  edge('amira', 'sofia', 'introduced_by', { notes: 'Sofia stellte Amira bei einem Projekttreffen vor.' }),
  edge('amira', SELF_ID, 'works_with'),
  edge('sven', 'lisa', 'service_provider', { label: 'Renovierung' }),
  edge('sven', SELF_ID, 'knows'),
];
