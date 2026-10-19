# Prüfstand · MVP 0

Stand: 21.09.2026. Dies ist ein technischer Graph-Prototyp mit fiktiven Daten.

## Automatisiert geprüft

- TypeScript: fehlerfrei.
- Vitest: 40 Tests erfolgreich, einschließlich Fokus- und Resize-Regressionen.
- Expo Android-Export: JavaScript/Hermes und Assets erfolgreich gebündelt.
- Expo Web-Export: Entwicklungsvorschau erfolgreich gebündelt; kein Hosting oder Deployment.
- Android Prebuild: natives Projekt aus `app.json` erfolgreich generiert (`--no-install`).
- Expo-Abhängigkeiten: gegen die zum installierten SDK gehörende Versionsmatrix geprüft.

Bundle-Export und Prebuild beweisen keine erfolgreiche native Kompilierung oder APK-Installation.

## In der Browser-Vorschau geprüft

Gleiche Skia-Komponenten via CanvasKit, bei 390 × 844 und 844 × 390 Pixeln; helle und dunkle Darstellung wurden im Verlauf geprüft:

- Graph und Schriften werden gerendert; vier Kategorien und der zentrale Ich-Node sind sichtbar.
- Suche „Elektrik“ findet Max Kühn; derselbe Filter gilt in der Personenliste.
- Profil-Sheet öffnet mit Avatar, Kategorien, Notiz und Kontaktdaten; Inhalt scrollt bei begrenzter Höhe.
- „Im Netzwerk fokussieren“ wechselt aus der Personenliste zum Graphen und zentriert die richtige Person.
- Nach Zentrieren, Tabwechsel und Rückkehr wird eine alte Fokus-Anforderung nicht erneut ausgeführt.
- Zoom-Buttons vergrößern die Canvas-Darstellung.
- Direkter Tap auf den Alex-Node öffnet Alex Winters Profil.
- Drag verschiebt den Graphen; das Schließen des Profils erhält den Kontext.
- Double-Tap fokussiert die Person bei 135 % Zoom, ohne das Profil-Sheet zu öffnen.
- In der Gesamtansicht bleiben Kategoriebezeichnungen lesbar; Personennamen erscheinen beim Heranzoomen.
- Im Querformat bleiben Suche, Filter, Zoom und Zentrieren erreichbar; der Canvas läuft nicht unter die Navigation.
- Eine Beziehung im gescrollten Profil öffnet das nächste Profil wieder am Anfang.

## Bekannte Abhängigkeitsmeldungen

Der Online-Lauf von `npm audit --omit=dev` am 20.09.2026 meldete 14 moderate Einträge, keine hohen oder kritischen. Sie gehen auf zwei transitive Pakete zurück: `uuid` über Xcode-/Expo-Build-Werkzeuge und `decode-uri-component` über die URL-Verarbeitung des Routers. Die vorgeschlagenen erzwungenen Expo-/Router-Downgrades wurden nicht angewendet. Vor einer produktiven Nutzung sind kompatible Upstream-Korrekturen erneut zu prüfen; die ESM-only-Korrektur von `decode-uri-component` ist kein ungeprüfter Ersatz für den hier verwendeten CommonJS-Aufrufer.

Referenzen: [uuid-Advisory](https://github.com/advisories/GHSA-w5hq-g745-h8pq), [decode-uri-component-Advisory](https://github.com/advisories/GHSA-vcc3-ghjq-m6fr).

## Noch auf Android zu prüfen

Auf diesem Entwicklungsrechner waren weder Android SDK/Emulator noch ein verbundenes Testgerät verfügbar. Folgende Punkte sind deshalb ausdrücklich offen:

1. Development Build erstellen und auf einem echten Gerät starten.
2. Einen Finger ziehen, zweiten Finger hinzufügen, pinchen, einen Finger lösen: kein Springen des Graphen; Fokuspunkt bleibt unter den Fingern.
3. Wiederholt pinchen bis zu beiden Zoom-Grenzen; danach weiter pannen.
4. Tap, Double-Tap und Long-Press auf nahe beieinanderliegende Nodes unterscheiden.
5. Freie Fläche antippen: Auswahl aufheben. Freie Fläche doppeltippen: Gesamtansicht.
6. Während Zoom/Fokus die Such-Tastatur öffnen und schließen; Position und Zoom bleiben erhalten.
7. Zwischen Hoch- und Querformat wechseln; Bedienelemente und Profil-Sheet bleiben erreichbar.
8. Profil mit vielen Beziehungen scrollen; Beziehung öffnen; mit Android-Zurück und über den Hintergrund schließen.
9. Große Systemschrift, TalkBack und helle/dunkle Systemdarstellung kontrollieren. Die Personenliste ist die zugängliche Alternative zum Canvas.
10. Flüssigkeit und Antippbarkeit mit 30 Kontakten beurteilen; anschließend gezielt mit 50, 100 und 500 Kontakten messen.

SQLite und Google-Integrationen sind noch nicht Teil dieses Prüfstands. Native Performanceziele aus dem Produktplan gelten noch nicht als erreicht.
