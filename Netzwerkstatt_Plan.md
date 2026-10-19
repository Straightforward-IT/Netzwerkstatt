# Netzwerkstatt

> **Working Title:** Netzwerkstatt  
> **Plattform:** Android first  
> **Architektur:** React Native + Expo + TypeScript  
> **Produktart:** Private, local-first Personal Network Manager  
> **Status:** Product & Architecture Plan v0.1

---

## 1. Produktidee

**Netzwerkstatt** ist eine persönliche App, die das eigene soziale und praktische Netzwerk nicht als endlose Kontaktliste, sondern als **visuellen Graphen / Mindmap** darstellt.

Das Kernproblem: Mit wachsendem persönlichen, beruflichen und sozialen Umfeld wird es schwer, wichtige Kontakte im Blick zu behalten:

- Wer gehört eigentlich zu welchem Teil meines Lebens?
- Über wen kenne ich eine Person?
- Wann hatte ich zuletzt Kontakt?
- Welche Kontaktdaten oder Social-Media-Accounts gehören zu ihr?
- Wer kann bei einem bestimmten Thema helfen?
- Mit wem habe ich etwas geplant?
- Welche Kontakte will ich bewusst pflegen?

Netzwerkstatt soll genau diese Informationen **visuell, schnell und ohne CRM-Gefühl** zugänglich machen.

Der Nutzer selbst bildet den Mittelpunkt des Graphen. Personen, Gruppen und später eventuell Organisationen werden darum angeordnet und über Beziehungen miteinander verbunden.

---

# 2. Produktprinzipien

## 2.1 Local First

Die Netzwerkdaten sollen im MVP primär **lokal auf dem Gerät** gespeichert werden.

Vorteile:

- hohe Privatsphäre
- schnelle Bedienung
- offline nutzbar
- kein eigener Backend-Zwang
- kein unnötiges Konto-/Server-Setup für eine private App
- deutlich kleinerer Angriffsvektor

Ein Cloud-Backend kann später für Backup oder mehrere Geräte ergänzt werden.

## 2.2 Kein Kontakt-Müll

Google-Kontakte oder Gerätekontakte dürfen **nicht automatisch komplett importiert** werden.

Stattdessen:

1. Google verbinden
2. Kontaktliste laden
3. suchen / filtern
4. Kontakte bewusst auswählen
5. nur ausgewählte Kontakte in Netzwerkstatt übernehmen

Das verhindert, dass hunderte irrelevante Telefonnummern, alte Kontakte oder automatische Google-Einträge den Graphen zerstören.

## 2.3 Graph First

Der Graph ist nicht nur ein Gimmick, sondern die primäre Sicht auf das Netzwerk.

Die App muss deshalb besonders gut können:

- flüssiges Panning
- Pinch-to-Zoom
- Fokus auf Personen
- Cluster / Kategorien
- Beziehungen anzeigen
- schnell filtern
- Detailinformationen öffnen, ohne die Graph-Orientierung zu verlieren

## 2.4 Nicht zu einem privaten Salesforce werden

Netzwerkstatt soll kein überladenes CRM sein.

Informationen müssen nur gespeichert werden, wenn sie im Alltag einen echten Nutzen haben.

**Priorität:**
Visuelle Orientierung → Beziehungen → Kontaktaufnahme → Erinnerung → Kontext.

---

# 3. Kern-Use-Cases

## UC-01 – Netzwerk ansehen

Beim Öffnen der App sieht der Nutzer sein persönliches Netzwerk als Graph.

Im Zentrum:

**Ich**

Darum beispielsweise:

- Familie
- Freunde
- Arbeit
- Handwerker & Skills
- Finanzen & Recht
- Nachbarschaft
- Hobby / Sport
- Online / Gaming

Kontakte erscheinen als Nodes innerhalb dieser Bereiche.

---

## UC-02 – Person finden

Suche nach:

- Name
- Spitzname
- Firma
- Kategorie
- Tag
- Skill
- Telefonnummer
- Social Handle
- Notiz

Beispiele:

> „Wer war nochmal Elektriker?“

> „Wen kenne ich bei Firma X?“

> „Wie hieß nochmal der Freund von Alex, der Kameras macht?“

---

## UC-03 – Beziehung nachvollziehen

Eine Person kann mit anderen Personen verbunden werden.

Beispiel:

```text
Ich
 └── Alex
      └── kennt
           └── Max
                └── arbeitet bei
                     └── Firma X
```

Oder Familie:

```text
Großmutter
   │
   ├── Mutter
   │    ├── Ich
   │    └── Schwester
   │
   └── Onkel
```

---

## UC-04 – Kontakt aufnehmen

Aus dem Personenprofil direkt:

- anrufen
- SMS
- E-Mail
- Instagram öffnen
- Snapchat öffnen
- Discord Handle kopieren / öffnen
- Steam Profil öffnen
- WhatsApp / Signal / Telegram optional
- Website öffnen

---

## UC-05 – Verabredung erstellen

Aus einem Kontakt heraus:

**„Termin mit Person erstellen“**

Beispiel:

```text
Person: Max Mustermann
Titel: Bier trinken
Datum: 24.09.2026
Zeit: 19:00
Ort: ...
Kalender: Netzwerkstatt
```

Der Termin wird lokal mit der Person verknüpft und optional mit Google Calendar synchronisiert.

---

## UC-06 – Beziehung pflegen

Ein Kontakt kann enthalten:

- letzter persönlicher Kontakt
- letzter digitaler Kontakt
- nächster geplanter Termin
- manuelle Erinnerung
- wichtige Notiz

Optional später:

> „Seit 4 Monaten keinen Kontakt mit Alex.“

Dabei sollte Netzwerkstatt keine künstliche Bewertung von Freundschaften vornehmen. Es zeigt Fakten und Erinnerungen, keine dubiosen „Friendship Scores“.

---

# 4. Informationsmodell

## 4.1 Person

Jede Person ist ein eigener Node.

### Grunddaten

```ts
Person {
  id: UUID
  firstName: string
  lastName?: string
  nickname?: string

  avatarUri?: string

  birthday?: Date
  notes?: string

  favorite: boolean
  archived: boolean

  createdAt: Date
  updatedAt: Date
}
```

---

## 4.2 Kontaktwege

Nicht als starre Felder modellieren, sondern flexibel.

```ts
ContactMethod {
  id: UUID
  personId: UUID

  type:
    | "phone"
    | "email"
    | "instagram"
    | "snapchat"
    | "discord"
    | "steam"
    | "whatsapp"
    | "signal"
    | "telegram"
    | "website"
    | "other"

  label?: string
  value: string
  url?: string

  preferred: boolean
}
```

Damit können Personen auch mehrere Telefonnummern, Discord-Accounts oder E-Mail-Adressen haben.

---

# 5. Kategorien

Eine Person sollte **nicht exakt einer Kategorie** gehören müssen.

Beispiel:

> Ein Freund arbeitet gleichzeitig als Elektriker.

Deshalb:

- Kategorien / Gruppen = grobe Lebensbereiche
- Tags = flexible Eigenschaften
- Skills = Fähigkeiten
- Beziehungen = Verbindung zwischen Nodes

---

## 5.1 Sinnvolle Standardkategorien

### Familie

Besonderheit: Kann zusätzlich als Stammbaum dargestellt werden.

Beziehungstypen:

- Elternteil
- Kind
- Geschwister
- Partner
- Ehepartner
- Großeltern
- Enkel
- Onkel / Tante
- Cousin / Cousine
- sonstige Familie

---

### Freunde

Optional später Untergruppen:

- eng
- Bekannte
- Schulfreunde
- Uni
- ehemalige Kollegen
- Freundeskreis X

Diese Unterteilung sollte aber **nicht voreingestellt aufgezwungen** werden.

---

### Arbeit & Beruf

Beispiele:

- Kollegen
- ehemalige Kollegen
- Geschäftskontakte
- Kunden
- Dienstleister
- Branchenkontakte
- Recruiter
- Mentoren

---

### Handwerker & Skills

Sehr nützliche Kategorie für ein reales persönliches Netzwerk.

Beispiele:

- Elektriker
- Sanitär
- Maler
- Tischler
- KFZ
- Fahrrad
- IT
- Netzwerk
- Veranstaltungstechnik
- Foto / Video
- Design
- Programmierung

Skills sollten besser als Tags modelliert werden:

```text
Max
├── Kategorie: Freunde
└── Skills:
    ├── Elektrik
    ├── Smart Home
    └── Netzwerktechnik
```

Dadurch muss Max nicht künstlich in „Handwerker“ verschoben werden.

---

### Finanzen & Recht

Beispiele:

- Bank
- Versicherung
- Steuerberatung
- Rechtsanwalt
- Makler
- Finanzberatung

---

### Gesundheit

Optional:

- Hausarzt
- Zahnarzt
- Physiotherapie
- Apotheke
- sonstige medizinische Ansprechpartner

Hier besonders vorsichtig mit Notizen und sensiblen Informationen umgehen.

---

### Nachbarschaft & Lokal

Beispiele:

- Nachbarn
- Hausverwaltung
- Vermieter
- lokale Ansprechpartner
- Hausmeister

---

### Hobby & Vereine

Beispiele:

- Sport
- Musik
- Gaming
- Verein
- Community
- Ehrenamt

---

### Online & Gaming

Gerade bei Discord, Steam usw. relevant.

Bei manchen Kontakten existiert möglicherweise:

- kein echter Name
- keine Telefonnummer
- nur Username / Handle

Das Datenmodell muss das erlauben.

---

### Bildung

- Schule
- Universität
- Dozenten
- ehemalige Kommilitonen
- Weiterbildung

---

### Reisen & International

Kontakte, die hauptsächlich an Orten oder Reisen hängen.

Später eventuell interessant für eine Kartenansicht.

---

# 6. Tags statt Kategorienexplosion

Eigene Tags:

```text
#Elektriker
#Berlin
#Eventtechnik
#Steuer
#Gaming
#Fotografie
#Notfall
#Uni
```

Eine Person kann beliebig viele Tags besitzen.

### Beispiel

```text
Alex
Kategorie:
  Freunde

Tags:
  #Gaming
  #Berlin
  #IT
  #Server
```

Das ist deutlich flexibler als zwanzig starre Kategorien.

---

# 7. Beziehungen

Beziehungen sind **Edges** zwischen Nodes.

```ts
Relationship {
  id: UUID

  sourcePersonId: UUID
  targetPersonId: UUID

  type: RelationshipType

  label?: string

  strength?: "close" | "normal" | "loose"

  since?: Date
  until?: Date

  notes?: string

  createdAt: Date
  updatedAt: Date
}
```

Beziehungstypen:

```text
family
friend
partner
colleague
former_colleague
knows
introduced_by
works_with
works_for
service_provider
neighbor
mentor
other
```

Für Familie zusätzliche semantische Typen:

```text
parent_of
child_of
sibling_of
spouse_of
```

Einige Beziehungen sind symmetrisch:

```text
friend
sibling
colleague
```

Andere gerichtet:

```text
parent_of
introduced_by
works_for
```

Diese Unterscheidung sollte bereits im Datenmodell sauber erfolgen.

---

# 8. Graph UX

## 8.1 Grundansicht

Startansicht:

```text
                 Familie
               ○   ○   ○
                  \ | /
                   \|/

Freunde ○ ○ ───── [ICH] ───── ○ ○ Arbeit
          \         |              /
           ○        |             ○
                    |
              ○  Skills  ○
```

Der Graph darf nicht versuchen, jederzeit **alle Kontakte gleichzeitig** lesbar darzustellen.

Das würde bereits bei 100 Personen unbrauchbar.

Stattdessen werden abhängig von Zoom, Filtern und Fokus nur relevante Informationen hervorgehoben.

---

## 8.2 Gesten

### One Finger Drag

Canvas verschieben.

### Pinch

Zoom.

### Tap Node

Person auswählen.

### Double Tap Node

Person fokussieren und Graph um diese Person herum neu zentrieren.

### Long Press Node

Quick Actions:

- bearbeiten
- Beziehung hinzufügen
- Termin erstellen
- Erinnerung erstellen
- archivieren

### Tap Empty Space

Auswahl aufheben.

### Double Tap Empty Space

Graph auf Gesamtansicht zurücksetzen.

---

# 9. Node Design

Ein Kontakt sollte zunächst kompakt dargestellt werden:

```text
╭─────────────╮
│    Avatar   │
│    Alex     │
╰─────────────╯
```

Je nach Zoom-Level werden Details progressiv eingeblendet.

### Zoom weit draußen

Nur:

- Avatar / Initialen
- Farbe / Gruppenzugehörigkeit

### Normal

- Avatar
- Vorname
- ggf. Nachname

### Nah

- Name
- Kategorie
- wichtige Tags
- nächster Termin / Reminder-Indikator

Dadurch bleibt der Graph auch bei vielen Kontakten übersichtlich.

---

# 10. Cluster

Kontakte können visuell nach Kategorien gruppiert werden.

Beispiel:

```text
Familie
[ Mutter ] [ Vater ] [ Schwester ]

Freunde
[ Alex ] [ Max ] [ Lisa ]

Arbeit
[ Anna ] [ Tom ]
```

Die Cluster sind **keine festen Boxen**, sondern räumliche Bereiche.

Optionale Modi:

1. **Network Mode**
   - Beziehungen bestimmen Positionen.

2. **Category Mode**
   - Kategorie bestimmt Cluster.

3. **Family Mode**
   - Stammbaumlayout.

4. später **Timeline Mode**
   - Kontakte nach Zeitpunkt des Kennenlernens.

---

# 11. Graph Rendering

## Empfehlung

Nicht versuchen, die Kernansicht mit normalen React-Native-Views zu bauen.

### Rendering

**@shopify/react-native-skia**

für:

- Nodes
- Edges
- Labels
- große Canvas-Fläche

### Gesten

**react-native-gesture-handler**

für:

- Pan
- Pinch
- Tap
- Long Press

### Animation

**react-native-reanimated**

für:

- Zoom
- Panning
- Fokuswechsel
- Node Transitions

### Layout Engine

Initial:

- eigener radialer / clusterbasierter Algorithmus

Später:

- Force Directed Layout, beispielsweise auf Basis von `d3-force`

Wichtig: Die physikalische Force-Simulation sollte nicht permanent laufen. Positionen nach einer Layoutberechnung speichern und nur bei strukturellen Änderungen neu berechnen.

---

# 12. Detailansicht einer Person

Beim Tippen auf einen Node öffnet sich zunächst ein Bottom Sheet.

Beispiel:

```text
────────────────────────
Alex Mustermann
Freunde · Berlin

📞 +49 ...
✉️ alex@...
◎ Instagram
◉ Discord
🎮 Steam

Skills
IT · Server · Netzwerk

Beziehungen
→ Max
→ Lisa
→ Tom

Letzter Kontakt
12.09.2026

Nächster Termin
24.09.2026 · Bier trinken

[ Kontaktieren ]
[ Termin ]
[ Mehr ]
────────────────────────
```

Das Sheet kann erweitert werden und anschließend eine vollständige Detailseite öffnen.

Dadurch verlässt der Nutzer nicht bei jedem Tap den Graphen.

---

# 13. App Navigation

Die App sollte bewusst wenige Hauptbereiche besitzen.

Empfehlung:

```text
┌──────────────────────────────┐
│                              │
│            GRAPH             │
│                              │
├──────────────────────────────┤
│ Netzwerk | Personen | Termine│
└──────────────────────────────┘
```

## Tab 1 – Netzwerk

Primäre Graphansicht.

## Tab 2 – Personen

Klassische Liste.

Notwendig, weil ein Graph nicht für jede Aufgabe die effizienteste UI ist.

Features:

- Suche
- Filter
- alphabetisch
- Favoriten
- Kategorien
- Tags
- zuletzt kontaktiert

## Tab 3 – Termine

- kommende Verabredungen
- Follow-ups
- Erinnerungen
- letzter Kontakt

## Settings

Über Avatar / Icon im Header:

- Google Verbindung
- Kontaktimport
- Kalender
- Kategorien
- Tags
- Datenschutz
- Backup
- App Lock
- Darstellung

---

# 14. Suche & Filter

Die Suche gehört prominent direkt über den Graphen.

Beispiel:

```text
🔍 Name, Skill, Firma, Tag...
```

Filter-Chips:

```text
[ Alle ] [ Freunde ] [ Familie ] [ Arbeit ] [ Skills ]
```

Zusätzliche Filter:

- Favoriten
- Kontakt länger als X Tage her
- Termin vorhanden
- Skill
- Stadt
- Kategorie
- Tag

Beim Filtern sollten irrelevante Nodes nicht zwingend komplett verschwinden.

Besser:

- Matches = 100 % sichtbar
- direkte Verbindungen = leicht sichtbar
- Rest = stark ausgeblendet

Dadurch bleibt der Kontext im Graph erhalten.

---

# 15. Google Integration

Google sollte im MVP **nicht zwingend der Login der App** sein.

Die App ist privat und local-first.

Deshalb:

```text
Netzwerkstatt
    │
    ├── lokale App-Daten
    │
    └── Google verbinden
          ├── Kontakte
          └── Kalender
```

Das reduziert technische Abhängigkeiten und hält die App auch ohne Internet nutzbar.

---

# 16. Google Authentication

Empfehlung:

**Native Google Sign-In**

Expo unterstützt aktuelle native Google-Sign-In-Libraries über Development Builds.

Google OAuth Tokens dürfen nicht unverschlüsselt in AsyncStorage gespeichert werden.

Verwenden:

```text
expo-secure-store
```

für:

- Access Token
- Refresh Token, falls benötigt
- OAuth Session Informationen

---

# 17. Google Contacts

Google Contacts werden über die **Google People API** gelesen.

Für den MVP ausschließlich:

```text
https://www.googleapis.com/auth/contacts.readonly
```

Kein Schreibzugriff.

Das reicht zum:

- Anzeigen
- Durchsuchen
- Auswählen
- Importieren

von Google-Kontakten.

## Import Flow

```text
Google verbinden
      │
      ▼
Kontakte laden
      │
      ▼
┌───────────────────────┐
│ 🔍 Kontakte suchen    │
│                       │
│ ☐ Alex                │
│ ☑ Max                 │
│ ☐ Lisa                │
│ ☑ Anna                │
└───────────────────────┘
      │
      ▼
2 Kontakte importieren
      │
      ▼
Kategorie / Tags wählen
      │
      ▼
Graph
```

**Keine automatische Speicherung aller abgerufenen Google-Kontakte.**

Nur ausgewählte Kontakte werden in der lokalen Datenbank persistiert.

---

# 18. Google Contact Mapping

```ts
ExternalContactSource {
  id: UUID

  personId: UUID

  provider: "google"

  externalResourceName: string
  externalEtag?: string

  lastSyncedAt?: Date
}
```

Damit kann ein Netzwerkstatt-Kontakt später wieder seinem Google-Pendant zugeordnet werden.

### Importierbare Felder

- Name
- Profilbild
- Telefonnummern
- E-Mail-Adressen
- Geburtstag
- Organisation
- URLs
- ggf. Adressen

Die App muss beim Import anzeigen, welche Informationen übernommen werden.

---

# 19. Google Contacts Synchronisation

Im MVP nicht automatisch alles synchronisieren.

Besser:

```text
Google Contacts
      │
      │ nur ausgewählte Kontakte
      ▼
Netzwerkstatt
```

Später:

### Pull Sync

Bei bereits importierten Personen prüfen:

- Telefonnummer geändert?
- neue E-Mail?
- Profilbild geändert?

Der Nutzer entscheidet bei Konflikten.

### Kein automatisches Push im MVP

Änderungen aus Netzwerkstatt werden zunächst **nicht zurück in Google Contacts geschrieben**.

Das verhindert:

- versehentliches Überschreiben
- komplizierte Konflikte
- zusätzlichen OAuth-Schreibzugriff

---

# 20. Termine & Google Calendar

Netzwerkstatt führt ein eigenes lokales Terminmodell.

```ts
InteractionEvent {
  id: UUID

  title: string

  startsAt: Date
  endsAt?: Date

  location?: string
  notes?: string

  type:
    | "meeting"
    | "call"
    | "birthday"
    | "follow_up"
    | "reminder"
    | "other"

  googleCalendarEventId?: string

  createdAt: Date
  updatedAt: Date
}
```

Personen werden separat verknüpft:

```ts
EventPerson {
  eventId: UUID
  personId: UUID
}
```

Dadurch kann ein Termin mehrere Kontakte betreffen.

---

# 21. Kalenderstrategie

Empfehlung:

Bei Aktivierung der Google-Calendar-Integration optional einen eigenen Kalender anlegen:

```text
Netzwerkstatt
```

Vorteile:

- alle von der App erstellten Termine klar getrennt
- leichter löschbar
- einfachere Synchronisation
- weniger Risiko, andere Kalendereinträge anzufassen

Alternativ kann der Nutzer seinen primären Kalender auswählen.

### Sync

```text
Netzwerkstatt Event
       ⇅
Google Calendar Event
```

Gespeichert werden:

- lokale Event-ID
- Google Calendar ID
- Google Event ID
- letzter Sync-Zeitpunkt

---

# 22. Interaktionen / Kontakt-Historie

Langfristig ist das wahrscheinlich eines der wertvollsten Features.

```ts
Interaction {
  id: UUID
  personId: UUID

  type:
    | "meeting"
    | "call"
    | "message"
    | "event"
    | "other"

  occurredAt: Date
  note?: string
}
```

Damit kann die App anzeigen:

```text
Alex

Letzter Kontakt:
12.09.2026

Historie:
12.09. Treffen
05.08. Telefonat
19.06. Geburtstag
```

Wichtig:

Nicht versuchen, Messenger automatisch auszulesen.

Kontakt-Historie zunächst:

- manuell
- aus Netzwerkstatt-Terminen
- optional später aus expliziten Integrationen

---

# 23. Erinnerungen

Beispiel:

```text
Alex
[ In 2 Monaten erinnern ]
```

oder:

```text
Follow-up
15.10.2026
```

Später optional:

```text
Kontakt seit 90 Tagen nicht aktualisiert
```

Die App sollte aber niemals suggerieren:

> „Diese Freundschaft ist schlecht.“

Sie stellt Informationen bereit, bewertet Beziehungen aber nicht.

---

# 24. Datenbank

## Empfehlung

**SQLite**

über:

```text
expo-sqlite
```

Optional mit:

```text
Drizzle ORM
```

Vorteile:

- relationales Modell passt perfekt zum Graph
- offline
- schnell
- migrationsfähig
- komplexe Suchen möglich
- Beziehungen sauber modellierbar

---

# 25. Datenbankschema

Kern:

```text
persons
contact_methods
categories
person_categories
tags
person_tags
skills
person_skills
relationships
events
event_people
interactions
external_sources
reminders
settings
```

---

## persons

```text
id
first_name
last_name
nickname
avatar_uri
birthday
notes
favorite
archived
created_at
updated_at
```

## categories

```text
id
name
icon
sort_order
```

## person_categories

```text
person_id
category_id
```

## tags

```text
id
name
```

## person_tags

```text
person_id
tag_id
```

## skills

```text
id
name
```

## person_skills

```text
person_id
skill_id
level?
notes?
```

## relationships

```text
id
source_person_id
target_person_id
type
label
strength
since
until
notes
```

## graph_positions

```text
person_id
layout
x
y
updated_at
```

Das Speichern der Positionen ist wichtig.

Der Graph soll nicht bei jedem Start komplett anders aussehen.

---

# 26. Datenschutz & Sicherheit

Die Daten in Netzwerkstatt sind hochgradig persönlich.

Deshalb:

## Lokal speichern

Default.

## Secrets

OAuth Tokens:

```text
expo-secure-store
```

## App Lock

Optional:

- Fingerabdruck
- Face Unlock
- Geräte-PIN

über lokale Authentifizierung.

## Datenbankverschlüsselung

Phase 2:

**SQLCipher**

Expo SQLite unterstützt SQLCipher in Development/Production Builds.

Für das erste technische MVP kann zunächst normales SQLite genutzt werden, solange keine echte langfristige Datensammlung erfolgt.

Vor produktiver Nutzung sollte lokale Datenbankverschlüsselung geprüft werden.

## Kein Analytics-Zwang

Für eine private App:

- kein Google Analytics
- kein Meta SDK
- kein Tracking
- keine unnötigen Crash-Daten

---

# 27. React-Native-Architektur

```text
React Native
│
├── Expo
│
├── TypeScript
│
├── Expo Router
│
├── SQLite
│   └── Drizzle ORM
│
├── Zustand
│
├── React Native Skia
├── Gesture Handler
├── Reanimated
│
├── Google Integration
│   ├── Google Sign-In
│   ├── People API
│   └── Calendar API
│
└── Native Features
    ├── SecureStore
    ├── Notifications
    ├── Local Authentication
    └── Linking
```

---

# 28. State Management

Empfehlung:

**Zustand**

Nur für UI-/Session-State.

Beispiele:

```text
selectedPersonId
activeFilters
graphViewport
graphMode
currentCategory
googleConnectionState
```

Persistente Geschäftsdaten gehören **nicht primär in Zustand**, sondern SQLite.

---

# 29. Projektstruktur

```text
src/
│
├── app/
│   ├── _layout.tsx
│   ├── index.tsx
│   │
│   ├── network/
│   ├── people/
│   ├── events/
│   └── settings/
│
├── components/
│   ├── graph/
│   │   ├── NetworkGraph.tsx
│   │   ├── GraphNode.tsx
│   │   ├── GraphEdge.tsx
│   │   ├── GraphCluster.tsx
│   │   └── GraphControls.tsx
│   │
│   ├── person/
│   ├── event/
│   └── ui/
│
├── db/
│   ├── schema.ts
│   ├── migrations/
│   ├── queries/
│   └── database.ts
│
├── features/
│   ├── contacts/
│   ├── relationships/
│   ├── graph/
│   ├── events/
│   ├── reminders/
│   └── search/
│
├── integrations/
│   └── google/
│       ├── auth.ts
│       ├── people.ts
│       ├── calendar.ts
│       └── mapping.ts
│
├── services/
│   ├── graph-layout.ts
│   ├── search.ts
│   └── notifications.ts
│
├── stores/
│   ├── graph.store.ts
│   └── session.store.ts
│
├── types/
│
└── utils/
```

---

# 30. UI Design

## Stil

- minimalistisch
- große freie Flächen
- keine permanent sichtbaren Toolbars
- dezente Kanten im Graph
- Fokus auf Avatare / Personen
- wenig Text in der Übersicht
- Informationen erst bei Interaktion aufklappen

## Farbkonzept

Kategorien können Akzentfarben erhalten.

Aber:

**Nicht jeden Node komplett bunt machen.**

Besser:

```text
neutraler Node
+ kleiner Category Ring
+ dezente Edge-Farbe
```

Sonst sieht der Graph schnell wie ein Organigramm aus 2008 aus.

---

# 31. Graph Toolbar

Schwebende kompakte Controls:

```text
[ 🔍 ]   [ Filter ]   [ ◎ Zentrieren ]
```

Optional:

```text
[ Netzwerk ▼ ]
```

Modus:

- Netzwerk
- Kategorien
- Familie

---

# 32. Empty State

Erster Start:

```text
             ◎

      Dein Netzwerk beginnt hier.

   Füge die ersten Personen hinzu
   oder importiere ausgewählte
   Google-Kontakte.

   [ Person hinzufügen ]

   [ Google Kontakte auswählen ]
```

Kein leerer technischer Canvas.

---

# 33. Onboarding

## Screen 1

**Dein persönliches Netzwerk.**

Kurze Erklärung.

## Screen 2

**Privat auf deinem Gerät.**

Erklärung Local First.

## Screen 3

Optionen:

```text
[ Erste Person hinzufügen ]

[ Google Kontakte verbinden ]

[ Später ]
```

Google ist optional.

---

# 34. MVP

Der größte Fehler wäre, sofort Google Sync, Family Tree, Kalender, Graph Engine, Reminder und Cloud gleichzeitig zu bauen.

Deshalb strikt stufenweise.

---

## MVP 0 – Graph Prototype

Ziel:

Beweisen, dass die zentrale UX funktioniert.

Features:

- React Native / Expo Projekt
- Graph Canvas
- 20 Mock-Personen
- Nodes
- Edges
- Pan
- Zoom
- Tap
- Fokus
- Category Cluster

**Noch keine Datenbank.**

Erfolgskriterium:

> Der Graph fühlt sich auf dem Handy gut an.

Wenn der Graph nervt, ist die gesamte App-Idee gefährdet.

---

## MVP 1 – Local Network

Features:

- SQLite
- Personen anlegen
- Personen bearbeiten
- Kategorien
- Tags
- Skills
- Beziehungen
- Graph Position Persistence
- Personenliste
- Suche
- Filter
- Favoriten

Jetzt ist die App bereits lokal sinnvoll nutzbar.

---

## MVP 2 – Contact Import

Features:

- Google verbinden
- People API
- Kontakt-Auswahl
- selektiver Import
- Google Mapping
- erneuter Pull einzelner Kontakte

Noch kein Schreibzugriff auf Google Contacts.

---

## MVP 3 – Termine

Features:

- lokale Termine
- Person ↔ Termin
- Reminder
- kommende Termine
- lokale Notifications
- Google Calendar Integration
- eigener Netzwerkstatt-Kalender

---

## MVP 4 – Family View

Features:

- Parent / Child / Sibling / Partner Beziehungen
- dediziertes Stammbaumlayout
- Wechsel zwischen:

```text
Network
Category
Family
```

---

## MVP 5 – Relationship Memory

Features:

- Interaction History
- letzter Kontakt
- Notizen
- Follow-up
- intelligente Filter

Beispiel:

```text
Zeige Freunde,
die ich seit > 90 Tagen
nicht gesehen habe.
```

---

# 35. Spätere Features

## Organisation Nodes

Neben Personen:

```text
Person
Organization
Place
Group
```

Beispiel:

```text
Ich
 └── Anna
      └── arbeitet bei
           └── Firma X
```

---

## Orte

```text
Berlin
Hamburg
London
```

Kontakte könnten optional geografisch gruppiert werden.

---

## Network Paths

Sehr interessantes Feature:

> „Wie kenne ich diese Person eigentlich?“

```text
Ich
→ Alex
→ Lisa
→ Tom
```

---

## Einführungshistorie

Speichern:

```text
Tom
kennengelernt über:
Alex

am:
03.06.2024

Kontext:
Geburtstag Lisa
```

---

## Smart Search

Später lokale semantische Suche:

> „Wer könnte mir bei einer kaputten Steckdose helfen?“

Ergebnis:

```text
Max
Skill: Elektrik
Beziehung: Freund
```

Das sollte vorzugsweise lokal funktionieren und nicht ungefragt sämtliche privaten Kontaktdaten an einen Cloud-LLM-Anbieter schicken.

---

## Network Statistics

Zurückhaltend einsetzen.

Sinnvoll:

- Anzahl Kontakte
- Kategorien
- letzte neue Kontakte
- offene Follow-ups

Nicht sinnvoll:

- „Freundschaftsqualität 74 %“
- „Networking Score“
- künstliche soziale Rankings

---

## Backup

Später:

### Option A

verschlüsselte lokale Exportdatei

```text
netzwerkstatt-backup.nwk
```

### Option B

verschlüsseltes Google Drive Backup

### Option C

eigener Sync-Service

Für eine Ein-Personen-App reicht zunächst A vollkommen aus.

---

# 36. Was bewusst NICHT in Version 1 gehört

- eigener Server
- eigener Benutzeraccount
- Passwortsystem
- Social Network
- automatische Kontaktbewertung
- Messenger-Auslesen
- Instagram Scraping
- Snapchat Scraping
- Discord Scraping
- automatische Steam-Datensammlung
- KI-Assistent
- Web-App
- komplexe Collaboration
- Play-Store-Veröffentlichung
- vollständiger bidirektionaler Google-Contacts-Sync

Das sind alles mögliche spätere Erweiterungen, aber für den Kern zunächst Ballast.

---

# 37. Technische Kernentscheidungen

| Bereich | Entscheidung |
|---|---|
| Plattform | Android first |
| Framework | React Native |
| Runtime / Tooling | Expo |
| Sprache | TypeScript |
| Navigation | Expo Router |
| Graph | React Native Skia |
| Gestures | React Native Gesture Handler |
| Animation | React Native Reanimated |
| Persistenz | Expo SQLite |
| ORM | Drizzle |
| UI State | Zustand |
| Auth | Google optional |
| Contacts | Google People API |
| Calendar | Google Calendar API |
| Secrets | Expo SecureStore |
| App Lock | Local Authentication |
| Notifications | Expo Notifications |
| Backend | zunächst keiner |
| Cloud Sync | später |
| Distribution | lokale APK / Development Build |

---

# 38. Expo Development Strategy

Da Google Native Sign-In und später SQLCipher native Komponenten benötigen können, sollte nicht dauerhaft nur mit **Expo Go** gearbeitet werden.

Empfehlung:

```text
Expo
  +
Development Build
```

Entwicklungsablauf:

```bash
npx create-expo-app@latest netzwerkstatt
cd netzwerkstatt

npx expo run:android
```

Später APK:

```bash
eas build -p android
```

oder lokaler Android Build.

Die App wird anschließend direkt auf dem eigenen Android-Gerät installiert.

---

# 39. Performanceziele

Der Graph muss das Herzstück bleiben.

Ziele:

### 100 Kontakte

vollständig flüssig.

### 500 Kontakte

weiterhin flüssiges Panning und Zooming.

### 1.000 Kontakte

Graph muss noch bedienbar sein, auch wenn Details nur gefiltert / gestuft angezeigt werden.

Daraus folgt:

- Canvas Rendering statt hunderte komplexe React Views
- Labels abhängig vom Zoom
- Nodes außerhalb des Viewports nicht unnötig detailliert rendern
- Graph Layout nicht bei jedem Frame berechnen
- Positionen persistieren
- Interaktionsanimationen auf UI Thread

---

# 40. Wichtigste Produktentscheidung

Netzwerkstatt darf nicht versuchen, das komplette Adressbuch hübscher darzustellen.

Das wäre nur eine weitere Kontakte-App.

Der eigentliche Wert ist:

```text
Kontakt
   +
Beziehung
   +
Kontext
   +
Kategorie
   +
Skills
   +
Zeit
   +
Visualisierung
```

Dadurch beantwortet Netzwerkstatt nicht nur:

> „Wie erreiche ich Max?“

sondern:

> „Wer ist Max, woher kenne ich ihn, mit wem hängt er zusammen, was kann er, wann hatten wir zuletzt Kontakt und was haben wir als Nächstes geplant?“

Das ist der eigentliche Produktkern.

---

# 41. Empfohlener erster Development Sprint

## Schritt 1 – Repository

```text
netzwerkstatt
```

React Native + Expo + TypeScript.

## Schritt 2 – Design Tokens

Definieren:

- Hintergrund
- Text
- Cards
- Kategorien
- Spacing
- Radius
- Typography
- Dark Mode

## Schritt 3 – Graph Sandbox

Eigene Screen:

```text
/dev/graph
```

mit Mockdaten.

## Schritt 4 – Gestures

Implementieren:

- Pan
- Zoom
- Tap
- Double Tap
- Focus Node

## Schritt 5 – Layout

Mock-Kategorien:

```text
Familie
Freunde
Arbeit
Skills
```

mit etwa 30 Nodes.

## Schritt 6 – Bottom Sheet

Tap auf Node:

```text
Avatar
Name
Kategorie
Kontaktmethoden
Skills
Beziehungen
```

## Schritt 7 – Erst danach Datenbank

Wenn sich die Graph-UX bewährt:

SQLite + echtes Datenmodell implementieren.

---

# 42. Definition of Done für den ersten Prototyp

Der Prototyp ist erfolgreich, wenn auf einem echten Android-Smartphone:

- der Graph sofort verständlich ist
- Pinch-to-Zoom sauber funktioniert
- Panning ohne Ruckeln funktioniert
- Nodes leicht antippbar sind
- ein Kontakt fokussiert werden kann
- Beziehungen erkennbar sind
- Kategorien visuell erkennbar sind
- die Ansicht bei 30–50 Kontakten nicht chaotisch wirkt
- ein Kontaktprofil ohne kompletten Screenwechsel erreichbar ist

Erst wenn diese Punkte funktionieren, lohnt es sich, Import und Synchronisation zu bauen.

---

# 43. Offene Produktfragen

Diese Entscheidungen können während des Prototypings getestet werden:

1. Ist **„Ich“** dauerhaft der zentrale Node oder kann jede Person zum temporären Zentrum werden?
2. Sollen Kategorien als feste räumliche Cluster sichtbar sein?
3. Wie stark sollen echte Beziehungen das automatische Layout beeinflussen?
4. Soll der Nutzer Nodes manuell verschieben können?
5. Bleiben manuelle Positionen dauerhaft bestehen?
6. Wie werden Kontakte angezeigt, die mehreren Kategorien angehören?
7. Soll der Stammbaum ein eigener Modus oder ein eigener Screen sein?
8. Wie stark soll „letzter Kontakt“ im Hauptgraph sichtbar sein?
9. Sind Organisationen bereits früh als eigene Nodes sinnvoll?
10. Soll es zusätzlich einen „Close Circle“ unabhängig von Kategorien geben?

---

# 44. Meine Empfehlung zu den offenen Fragen

Für den ersten Prototyp:

```text
Ich = Default Center
Person = kann temporär fokussiert werden

Kategorien = Cluster

Mehrfachkategorien = erlaubt

Tags = unbegrenzt

Manuelles Node Dragging = ja

Positionen = speichern

Family Tree = eigener Graph Mode

Organisation Nodes = später

Last Contact = nicht permanent im Node anzeigen

Close Circle = Favorit / Priorität statt eigener Kategorie
```

Damit bleibt das Modell flexibel, ohne den ersten Build zu überladen.

---

# 45. Quellen / technische Referenzen

Stand der technischen Planung: September 2026.

- Expo Authentication: https://docs.expo.dev/develop/authentication/
- Expo Google Authentication: https://docs.expo.dev/guides/google-authentication/
- Expo AuthSession: https://docs.expo.dev/versions/latest/sdk/auth-session/
- Expo SQLite: https://docs.expo.dev/versions/latest/sdk/sqlite/
- Expo React Native Skia: https://docs.expo.dev/versions/latest/sdk/skia/
- Expo Gesture Handler: https://docs.expo.dev/versions/latest/sdk/gesture-handler/
- Expo Reanimated: https://docs.expo.dev/versions/latest/sdk/reanimated/
- Google People API — Contacts: https://developers.google.com/people/api/rest/v1/people.connections/list
- Google OAuth Scopes: https://developers.google.com/identity/protocols/oauth2/scopes
- Google Calendar API — Events: https://developers.google.com/workspace/calendar/api/v3/reference/events

---

# 46. Kurzfassung

**Netzwerkstatt** sollte zunächst eine extrem gute persönliche Netzwerkvisualisierung sein.

Nicht:

> „Wir bauen eine Kontakte-App und machen später einen Graphen drauf.“

Sondern:

> **„Wir bauen einen hervorragenden interaktiven persönlichen Graphen und hängen daran genau die Kontaktfunktionen, die diesen Graphen nützlich machen.“**

Empfohlene Reihenfolge:

```text
Graph UX
   ↓
lokale Personen + Beziehungen
   ↓
Suche / Kategorien / Skills
   ↓
Google Kontaktimport
   ↓
Termine + Reminder
   ↓
Google Calendar
   ↓
Family Tree
   ↓
Relationship History
   ↓
Backup / Multi Device
```

Der wichtigste technische Proof-of-Concept ist deshalb **nicht Google OAuth**, sondern der Graph auf einem echten Android-Gerät.
