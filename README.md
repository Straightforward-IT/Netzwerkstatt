# Netzwerkstatt

Android-first Prototyp eines privaten, visuellen Netzwerk-Managers. Umsetzung von **MVP 0 / erstem Development Sprint** aus [Netzwerkstatt_Plan.md](./Netzwerkstatt_Plan.md).

## Aktueller Stand

- React Native, Expo SDK 57, TypeScript und Expo Router.
- Ein Skia-Canvas mit 30 fiktiven Kontakten, „Ich“ und vier Kategorien.
- Deterministische Kategorie- und Beziehungsansichten; mehrere Kategorien pro Person.
- Pan, Pinch-to-Zoom, Zoom-Buttons, Zentrieren, Tap, Double-Tap und Long-Press.
- Profil als Bottom Sheet mit Kontaktwegen, Skills, Tags, Notizen und navigierbaren Beziehungen.
- Personenliste mit gemeinsamer Suche, Kategorien und Favoritenfilter.
- Suche nach Namen, Handles, Firma, Stadt, Kategorien, Tags, Skills, Kontaktwegen und Notizen.
- Helle und dunkle Darstellung entsprechend der Systemeinstellung; gebündelte Schriften.

Alle Kontakte sind **Demodaten**. Kontaktwerte lassen sich auswählen, lösen aber keine Anrufe oder Nachrichten aus. Es gibt noch keine Datenbank, Kontaktbearbeitung, Google-Verbindung, Termine oder dauerhafte Speicherung. Zustand enthält nur UI-Zustand für die laufende Sitzung.

## Starten

Empfohlen: Node.js 24 LTS (siehe `.nvmrc`) und npm. Die aufgelösten Paketversionen stehen in `package-lock.json`.

```bash
npm ci
```

### Android Development Build

Android Studio mit passendem SDK/JDK und einen gestarteten Emulator oder ein per USB verbundenes Android-Gerät mit USB-Debugging bereitstellen. Siehe [Expo: Entwicklungsumgebung einrichten](https://docs.expo.dev/get-started/set-up-your-environment/).

```bash
npm run android
# Bei mehreren Geräten:
npx expo run:android --device
```

Dies erzeugt das native Projekt, baut und installiert die Development-App. Für spätere JS-Änderungen genügt:

```bash
npm start
```

Die generierten Ordner `android/` und `ios/` werden nicht eingecheckt. Native Einstellungen bleiben in `app.json`; nach Änderungen an nativen Abhängigkeiten muss die Development-App neu gebaut werden. `eas.json` enthält zusätzlich Profile für Development- und Preview-APKs; ein Cloud-Build wurde nicht eingerichtet oder gestartet.

### Graph-Vorschau am Rechner

```bash
npm run preview -- --localhost
```

Die Browseransicht dient der Entwicklung und visuellen Kontrolle. Sie verwendet denselben Skia-Graphen mit lokalem CanvasKit. Der npm-Postinstall-Schritt kopiert die passende WASM-Datei nach `public/`; es wird kein CDN benötigt. Eine Browserprüfung ersetzt keinen Gesten- oder Performance-Test auf Android.

- `/`: Netzwerk mit Navigation
- `/people`: durchsuchbare Personenliste
- `/settings`: Informationen und Bedienung
- `/dev/graph`: eigenständige Graph-Sandbox

## Prüfen

```bash
npm run check          # TypeScript und reine Domain-/State-Tests
npm run export:android # Android-JavaScript/Assets bündeln; kein APK-Build
```

Tests decken unter anderem deterministische Layouts, Mindestabstände, gültige Demo-Beziehungen, gerichtete Semantik, kombinierte Suche/Filter, Handle-Kontakte, Koordinatentransformation, Zoom-Grenzen, Treffererkennung, Größenänderungen und einmalige Fokus-Anforderungen ab.

Den konkreten Prüfstand, bekannte Abhängigkeitsmeldungen und den noch offenen Gerätetest enthält [docs/PROTOTYPE_QA.md](./docs/PROTOTYPE_QA.md).

## Aufbau

```text
src/app/               Expo-Router-Screens und Navigation
src/screens/           Zusammengesetzte Graphansicht
src/components/graph/  Skia-Nodes, Kanten, Cluster, Gesten und Viewport
src/components/person/ Profil-Sheet und Avatar
src/components/ui/     Gemeinsame Bedienelemente
src/types/             Plattformunabhängiges Netzwerkmodell
src/data/              Ausschließlich fiktives Demo-Netzwerk
src/services/          Reine Layout-, Such- und Koordinatenfunktionen
src/stores/            Temporärer UI-Zustand
src/theme/             Farben, Abstände, Radien, Typografie
tests/                 Vitest-Tests ohne native Laufzeit
```

Die Layoutberechnung läuft bei einem Moduswechsel, nicht pro Frame. Skia übernimmt die Darstellung; Reanimated hält Pan, Pinch und Fokusanimationen auf dem UI-Thread. Ein Suchfilter lässt direkte Verbindungen sichtbar und blendet übrigen Kontext ab. Gerichtete Beziehungen besitzen ausdrücklich Vorwärts- und Rückwärtsbeschreibungen.

## Nächster Schritt

Zuerst die Graph-UX auf einem echten Android-Gerät anhand der QA-Liste bewerten. Danach folgt MVP 1 mit SQLite, Personen- und Beziehungsbearbeitung, gespeicherten Graphpositionen und echten lokalen Daten. Der Prototyp beansprucht noch keine geprüfte Performance bei 100–1.000 Kontakten.

Technische Referenzen: [Skia mit Expo](https://docs.expo.dev/versions/latest/sdk/skia/), [Reanimated mit Expo](https://docs.expo.dev/versions/latest/sdk/reanimated/), [Skia-Webinitialisierung](https://shopify.github.io/react-native-skia/docs/getting-started/web/).
