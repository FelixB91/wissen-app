# Allgemeinwissen-App – Technischer Plan & Umsetzungsfahrplan

Stand: 14.11.2026

## Zusammenfassung & Leitprinzipien

Empfehlung: Der MVP ist eine **Web-App (PWA)**, die im Browser läuft und sich auf Smartphone und Tablet wie eine App auf den Homescreen legen lässt – ohne App Store, Gebühren oder Review. Gebaut wird trotzdem mit Expo (React Native, TypeScript), damit native Apps später ohne Neuentwicklung möglich bleiben. Inhalte starten als JSON und wandern ab Phase 3 in eine Datenbank mit Redaktionsoberfläche; Bilder kommen über ein CDN und werden lokal zwischengespeichert.

Leitprinzipien für alle Entscheidungen:

- **Allgemeinwissen, kein Fachstudium:** Jede Lektion beantwortet „Was sollte ein gebildeter Mensch darüber wissen?“ – mit spannendem Einstieg, knappem Kernwissen und optionaler Vertiefung.
- **Jede Antwort wird erklärt und belegt:** Begründung plus direkter Link zur Quelle, z. B. zum Wikipedia-Artikel.
- **Lernen, abfragen, wiederholen:** Fehler kommen erneut, Gelerntes wird per Spaced Repetition gefestigt.
- **Inhalt getrennt vom Code:** Neue Lektionen und Bilder kommen ohne App-Update hinzu.
- **Klein starten, Web zuerst:** Jedes Inkrement ist im Browser testbar; eine Store-Veröffentlichung ist eine spätere, optionale Entscheidung.

| Bereich | Entscheidung | Warum |
| --- | --- | --- |
| App-Framework | Expo SDK 58 (React Native 0.88), TypeScript; zuerst als Web-App ausgeliefert | Eine Codebasis; native iOS-/Android-Apps später ohne Neuentwicklung |
| Auslieferung MVP | Progressive Web App (PWA) mit Web-Manifest und Service Worker, gehostet auf EAS Hosting oder Vercel | Läuft per Link auf jedem Gerät, installierbar auf dem Homescreen, offline nutzbar, kein Store nötig |
| Navigation | Expo Router | Dateibasiertes Routing, echte URLs im Web |
| UI & Styling | React-Native-Komponenten + eigene Design-Tokens (NativeWind optional) | Einheitliches Aussehen, responsive Layouts für Tablets |
| App-Zustand | Zustand (State) + TanStack Query (Server-Daten) | Wenig Boilerplate, gut für Claude Code nachvollziehbar |
| Lokaler Fortschritt | Eigene Speicher-Schnittstelle; im Web IndexedDB (z. B. Dexie), nativ später expo-sqlite | Stabil im Browser; Wechsel auf nativ ohne Umbau der Lernlogik |
| Backend | Supabase (Postgres, Auth, Storage), Region EU/Frankfurt | Ab Phase 3 für Inhalte und Bilder, ab Phase 4 für Konten |
| Redaktion | Directus als Oberfläche auf der Supabase-Datenbank (Einstieg: Supabase Studio) | Lektionen anlegen, prüfen und freigeben ohne Code |
| Bilder | Supabase Storage hinter CDN, WebP/AVIF in mehreren Größen | Kleine Downloads, lokal zwischengespeichert |
| Wiederholungslogik | FSRS-Algorithmus (Bibliothek ts-fsrs) | Moderner Nachfolger von SM-2, wie in Anki |
| Inhalte | Phase 1–2: JSON im Repo; ab Phase 3: Datenbank. Ein Zod-Schema prüft beides | Schneller Start, später skalierbare Pflege |
| Tests | Jest + React Native Testing Library; später Playwright oder Maestro (E2E) | Lernengine vollständig per Unit-Test abgesichert |
| Build & Release | Web: `expo export` + Hosting; native Builds über EAS erst bei Bedarf | Kein Store-Aufwand, solange das Konzept verprobt wird |

Stünde fest, dass es nie native Apps geben soll, wäre ein reiner Web-Stack (z. B. Next.js) etwas schlanker. Expo hält die Tür zu den Stores offen und kostet im Web-MVP kaum Mehraufwand – deshalb bleibt es die Empfehlung.

## Technologie-Stack & Architektur

Lernlogik und Fortschritt laufen auf dem Gerät; Inhalte und Bilder kommen vom Server und werden zwischengespeichert. So funktionieren die ersten Prototypen ganz ohne Server, und die App bleibt auch offline (U-Bahn, Flugzeug) nutzbar, ohne riesig zu werden.

Architektur im Überblick:

- **Web-App (PWA, Expo) – später auch nativ**
  - Screens und Navigation (Expo Router: Lernpfad, Lektion, Wiederholen, Profil)
  - **Lernengine (reines TypeScript):** Lektionsablauf, FSRS, Mastery, Freischaltung
  - Lokaler Speicher (IndexedDB): Fortschritt, Inhalts- und Bild-Cache
- **Supabase (Region EU)** – Sync mit der App, offline-first
  - Auth (E-Mail, später Apple/Google)
  - Postgres mit Row Level Security: Inhalte und Fortschritt
  - Storage + CDN: Bilder in mehreren Größen
- **Redaktion: Directus + KI-Entwürfe**
  - Phase 1–2: JSON im Repo, in die App gebündelt
  - ab Phase 3: Entwurf → Prüfung → Veröffentlichung in der Datenbank

Die Lernengine ist das Herzstück: ein UI-unabhängiges TypeScript-Modul, das sich vollständig per Unit-Test prüfen lässt. Im MVP läuft alles als Web-App im Browser; native Builds über EAS (Expo Application Services) kommen erst, wenn eine Store-Veröffentlichung ansteht – auch dann ohne eigenen Mac.

Projektstruktur:

```
wissen-app/
├── app/                 # Screens (Expo Router): (tabs)/lernen, wiederholen, entdecken, profil; lesson/[id]
├── src/
│   ├── engine/          # Lernlogik, UI-unabhängig, voll getestet
│   ├── content/         # Laden der Inhalte + Zod-Schemas
│   ├── db/              # Speicher-Schnittstelle (Web: IndexedDB, nativ: SQLite)
│   ├── components/      # UI-Bausteine: Karte, Antwortknopf, Fortschrittsbalken
│   ├── theme/           # Design-Tokens: Farben, Typografie, Abstände
│   └── sync/            # ab Phase 4: Abgleich mit Supabase
├── content/             # Kurse als JSON, eine Datei pro Lektion
├── scripts/             # validate-content.ts, import-content.ts
├── docs/                # dieser Plan, progress.md, Architekturentscheidungen (adr/)
└── CLAUDE.md            # Regeln für Claude Code
```

### Bilder und größere Datenmengen

„Offline-first“ heißt hier: Lernlogik und Fortschritt liegen auf dem Gerät, Inhalte und Bilder aber nicht vollständig. Sie werden vom Server geladen und gezielt zwischengespeichert – so bleibt die App klein und funktioniert trotzdem offline.

- **Speicherort:** Bilder liegen in Supabase Storage und werden über ein CDN ausgeliefert; die Karte enthält nur die Bild-ID.
- **Größen und Formate:** jedes Bild in 2–3 Breiten (z. B. 480, 960, 1600 px) als WebP oder AVIF; das Gerät lädt die passende Größe. Ein Fragebild fürs Smartphone liegt typischerweise bei 50–150 KB.
- **Vorladen:** Startet eine Lektion, lädt die App die Bilder der folgenden Karten vorab; im WLAN optional auch die nächste Lektion.
- **Zwischenspeicher:** im Web per Service Worker (Cache Storage), nativ über expo-image; mit Obergrenze (z. B. 200 MB), bei der die am längsten ungenutzten Bilder zuerst gelöscht werden.
- **Offline-Pakete (später):** einen ganzen Kurs gezielt herunterladen, etwa für Reisen.
- **Rechenbeispiel:** 1.000 Bildfragen à 100 KB ergeben rund 100 MB – zu viel für ein App-Paket, aber unproblematisch als nachgeladener Cache.
- **Bildquellen:** Wikimedia Commons (freie Lizenzen, Urheber und Lizenz als Pflichtfelder) sowie eigene oder KI-generierte Illustrationen; die Namensnennung erscheint unter dem Bild.
- **Achtung Safari:** Safari löscht gespeicherte Daten einer Website, wenn sie sieben Tage lang bei laufender Safari-Nutzung nicht besucht wurde; für auf dem Homescreen installierte Web-Apps gilt das nicht ([WebKit](https://webkit.org/blog/10218/full-third-party-cookie-blocking-and-more/)). Daher zeigt die App einen Installationshinweis, und ab Phase 4 wird der Fortschritt im Konto gesichert.

## Datenhaltung & Inhaltsmodell

Der Kern des Modells ist das **Konzept**: ein Thema in Allgemeinwissen-Größe – etwa „Die Römische Republik“, nicht „Die Konsulatsverfassung im Detail“. Lektionen vermitteln Konzepte, Karten fragen sie ab, und die Wiederholung plant pro Konzept. Jede Karte trägt zusätzlich eine Tiefenstufe, damit Kernwissen, Vertiefung und spannende Fakten getrennt bleiben (siehe Anwendungslogik).

Inhaltshierarchie: **Wissensbereich** (Geschichte) → **Kurs** (Antike) → **Einheit** (Römisches Reich) → **Lektion** (Von der Republik zum Kaiserreich, 5–10 Minuten) → **Karten** (Erklärung oder Frage). Quer dazu verknüpft der Konzeptgraph Inhalte auch über Bereiche hinweg, etwa Aufklärung (Geschichte) mit Newton (Physik).

### Inhaltsdaten (statisch, versioniert)

| Tabelle | Wichtige Felder | Zweck |
| --- | --- | --- |
| domains | id, title, icon, color | Wissensbereiche, z. B. Geschichte, Biologie, Kunst |
| courses | id, domain_id, title, level, order | Kurs innerhalb eines Bereichs |
| units | id, course_id, title, order | Thematischer Abschnitt im Lernpfad |
| lessons | id, unit_id, title, order, est_minutes | Eine Lerneinheit mit Karten-Abfolge |
| concepts | id, title, summary, domain_id | Wissensbaustein, Einheit der Wiederholung |
| concept_prerequisites | concept_id, requires_id | Konzeptgraph: was vorher verstanden sein muss |
| cards | id, lesson_id, type, concept_ids, payload (JSON), explanation, depth, sources (Liste), media_id, review_status | Erklär- oder Fragekarte inkl. Begründung und Quelle |
| media | id, url, alt_text, license, credit | Bilder und Illustrationen mit Lizenzangabe |

### Nutzerdaten (veränderlich, pro Person)

| Tabelle | Wichtige Felder | Zweck |
| --- | --- | --- |
| profiles | user_id, display_name, daily_goal, interests | Einstellungen und Interessen aus dem Onboarding |
| lesson_progress | user_id, lesson_id, completed_at, score | Welche Lektionen abgeschlossen sind |
| concept_state | user_id, concept_id, stability, difficulty, due_at, reps, lapses, mastery | FSRS-Zustand und Beherrschungsgrad je Konzept |
| review_log | id, user_id, card_id, rating, answered_at, duration_ms | Unveränderliches Protokoll jeder Antwort |
| streaks | user_id, current, longest, last_active_date | Tagesserie und Tagesziel |

### Beispiel einer Karte (JSON im Repository)

```json
{
  "id": "hist-rom-republik-003",
  "type": "multiple_choice",
  "depth": "core",
  "concepts": ["rom-republik"],
  "prompt": "Welche Staatsform löste in Rom um 509 v. Chr. das Königtum ab?",
  "options": ["Republik", "Kaiserreich", "Tyrannis", "Attische Demokratie"],
  "answer": 0,
  "explanation": "Nach der Vertreibung des letzten Königs regierten zwei jährlich gewählte Konsuln. Die Machtteilung sollte eine neue Alleinherrschaft verhindern.",
  "sources": [
    {
      "title": "Römische Republik – Wikipedia",
      "url": "https://de.wikipedia.org/wiki/R%C3%B6mische_Republik",
      "kind": "wikipedia"
    }
  ],
  "review_status": "published",
  "media": null
}
```

### Regeln für Speicherung und Abgleich

- **Phase 1–2:** Inhalte liegen als JSON im Repo und werden in die App gebündelt; Fortschritt nur lokal im Browser (IndexedDB).
- **Ab Phase 3:** Die Datenbank ist die Quelle der Wahrheit. Die App lädt veröffentlichte Inhalte kursweise als Content-Paket mit Versionsnummer, speichert sie zwischen und holt später nur Änderungen nach.
- **Abgleich:** `review_log` ist append-only und wird zusammengeführt; `concept_state` wird daraus neu berechnet. So gehen bei Nutzung auf zwei Geräten keine Antworten verloren.
- **Sicherheit:** Row Level Security in Postgres – jede Person liest und schreibt nur eigene Nutzerdaten; veröffentlichte Inhalte sind für alle lesbar, Entwürfe nur für die Redaktion.

### Inhalte dauerhaft pflegen

JSON trägt etwa bis zum ersten Kurs. Danach sichern drei Dinge den Nachschub: eine Datenbank als Quelle, eine Redaktionsoberfläche mit Freigabe-Workflow und ein fester Ablauf von der Idee bis zur veröffentlichten Lektion.

1. **Redaktionsplan:** Themenliste je Bereich (Kurs → Einheiten → Lektionen) als Backlog, priorisiert nach Interesse und Nutzer-Feedback.
2. **KI-Entwurf:** Ein Skript lässt Claude zu einem Lektionsthema Erklärkarten, Fragen, Begründungen und Quellenlinks entwerfen – nach festen Inhaltsrichtlinien (Tiefenstufen, höchstens drei neue Konzepte). Das Ergebnis landet als `draft` in der Datenbank.
3. **Prüfung in Directus:** Du (später ggf. weitere Redakteure) prüfst Fakten gegen die Quelle, kürzt, ergänzt Bilder und setzt den Status von `in_review` auf `published`.
4. **Automatische Checks:** Schema, Pflichtfelder, erreichbare Quellen-Links und keine verwaisten Konzepte – vor jeder Veröffentlichung.
5. **Auslieferung:** Die App erkennt beim Start eine neue Content-Version und lädt nur geänderte Lektionen – ohne App-Update.
6. **Rückkanal:** „Fehler melden“ und „Zu detailliert“ an jeder Karte erzeugen Einträge in Directus; Abbruchraten pro Lektion zeigen, wo nachgebessert werden muss.

Der Umzug von JSON in die Datenbank erfolgt einmalig per Import-Skript. Das Zod-Schema bleibt der gemeinsame Vertrag zwischen Redaktion und App.

### Quellen direkt öffnen

- Jede Karte hat eine Liste `sources` (Titel, URL, Art); mindestens eine Quelle ist Pflicht.
- Im Feedback-Panel steht unter der Begründung „Mehr dazu auf Wikipedia ↗“. Im Web öffnet sich ein neuer Tab; in einer späteren nativen App ein In-App-Browser (expo-web-browser), aus dem man mit einem Tipp zurückkommt.
- Optional zeigt die App vorher eine Kurzvorschau (Titel, Einleitung, Bild) über die Wikipedia-REST-API, ohne die Lektion zu verlassen.
- Am Lektionsende listet „Weiterlesen“ alle Quellen der Lektion – wer tiefer einsteigen will, findet dort das Detailwissen, das bewusst nicht in der Lektion steht.
- Ein wöchentlicher Link-Check in der CI meldet tote Links.

## High-Level-Struktur & Mock-ups

Die App hat vier Tabs und einen Vollbild-Lektionsmodus. Auf Tablets wird die Tab-Leiste zur Seitenleiste, und Erklärung und Frage können nebeneinander stehen.

| Tab / Bereich | Inhalt | Ab Phase |
| --- | --- | --- |
| Lernen (Start) | Lernpfad des aktiven Kurses: Einheiten und Lektionen als Pfad, gesperrt / offen / abgeschlossen | 1 |
| Lektion (Vollbild) | Karten nacheinander: Erklärung → Frage → Feedback mit Begründung → Abschluss | 1 |
| Wiederholen | Tägliche Wiederholungsrunde aus fälligen Konzepten, Anzahl als Badge | 2 |
| Entdecken | Alle Wissensbereiche und Kurse, später eine Wissenskarte (Konzeptgraph) | 3 |
| Profil | Tagesziel, Serie, gemeisterte Konzepte je Bereich, Einstellungen, Konto | 2 (Konto ab 4) |
| Onboarding | Interessen wählen, Tagesziel festlegen, optional Einstufungsquiz | 3 |

### Wireframe: Lernpfad (Smartphone)

```
┌──────────────────────────────┐
│ Geschichte · Antike    🔥 4    │
│ Tagesziel ██████░░░░ 6/10 min    │
├──────────────────────────────┤
│ Einheit 2: Römisches Reich      │
│   (✓) Gründungsmythos & Könige  │
│    │                             │
│   (●) Die Republik   [Starten]   │
│    │                             │
│   (○) Punische Kriege   🔒       │
│    │                             │
│   (○) Caesar & Kaiserzeit 🔒     │
├──────────────────────────────┤
│ Lernen  Wiederholen(7) Entdecken Profil │
└──────────────────────────────┘
```

### Wireframe: Lektion – Frage und Feedback

```
┌──────────────────────────────┐       ┌──────────────────────────────┐
│ ✕  ███████░░░░░  4/9          │       │ ✕  ███████░░░░░  4/9          │
│                              │       │                              │
│ Welche Staatsform löste um   │       │ ✓ Richtig: Republik          │
│ 509 v. Chr. das Königtum ab? │  ──▶  │                              │
│                              │       │ Warum? Zwei jährlich gewählte │
│ [ Republik           ]       │       │ Konsuln teilten sich die     │
│ [ Kaiserreich        ]       │       │ Macht – eine neue Allein-    │
│ [ Tyrannis           ]       │       │ herrschaft sollte verhindert │
│ [ Attische Demokratie ]      │       │ werden.                      │
│                              │       │ Quelle: Wikipedia öffnen ↗   │
│        [ Prüfen ]            │       │        [ Weiter ]            │
└──────────────────────────────┘       └──────────────────────────────┘
```

Das Feedback erscheint als Panel von unten und zeigt immer die Begründung – auch bei richtiger Antwort. Ein Tipp auf den Quellen-Link öffnet den Wikipedia-Artikel (im Web in einem neuen Tab), optional vorher mit Kurzvorschau.

### Wireframe: Erklärkarte (Tablet, quer)

```
┌────────────────────────────────────────────────────────────┐
│ ✕  ███░░░░░░░░░  2/9                                        │
│ ┌─────────────────────────┐   LERNE                          │
│ │                         │   Die Römische Republik          │
│ │   Illustration          │   509 v. Chr. vertrieben die Römer │
│ │   (ab Phase 3)          │   ihren König. Fortan regierten  │
│ │                         │   zwei Konsuln für je ein Jahr … │
│ └─────────────────────────┘   Merke: Machtteilung statt      │
│                               Alleinherrschaft      [ Weiter ]│
└────────────────────────────────────────────────────────────┘
```

Diese Skizzen legen nur Inhalt und Anordnung fest. Visuelles Design (Farben, Typografie, Illustrationsstil) entsteht als eigenes Design-Mock-up vor Phase 1.

## Anwendungslogik

Jede Lektion folgt dem Muster **erklären → üben → begründen → festigen**; danach übernimmt die Wiederholungsplanung pro Konzept. Die gesamte Logik lebt in `src/engine` als reine Funktionen ohne UI-Bezug.

### Ablauf einer Lektion

1. **Aufhänger:** eine überraschende Frage oder ein „Wusstest du?“-Fakt weckt Neugier.
2. **Kernwissen:** 1–3 Erklärkarten mit höchstens drei neuen Konzepten, jeweils mit einem „Merke“-Satz.
3. **Übung:** 5–8 Fragen zu genau diesen Konzepten, vom Wiedererkennen (Multiple Choice) zum aktiven Abrufen (Lückentext, Reihenfolge).
4. **Feedback:** richtig/falsch plus Begründung und Link zur Quelle; bei falscher Antwort zusätzlich, warum die gewählte Option nicht stimmt.
5. **Fehler-Runde:** Falsch beantwortete Fragen kommen am Ende der Lektion erneut, in anderer Form; zusätzlich landen sie bevorzugt in der nächsten Wiederholung.
6. **Abschluss:** Zusammenfassung, Bezug zu heute, optionale Vertiefung und „Weiterlesen“; die Konzepte gehen in die Wiederholungsplanung.

### Fragetypen

| Typ | Beispiel | Prüft | Ab Phase |
| --- | --- | --- | --- |
| Multiple Choice | Welche Staatsform folgte auf das Königtum? | Wiedererkennen | 1 |
| Wahr/Falsch mit Begründung | „Die Konsuln regierten auf Lebenszeit.“ – falsch, weil … | Verständnis, Fehlvorstellungen | 1 |
| Lückentext (Auswahl) | Rom wurde von zwei ___ regiert. | Aktiver Abruf | 1 |
| Zuordnen | Epoche ↔ Ereignis, Organ ↔ Funktion | Zusammenhänge | 2 |
| Reihenfolge / Zeitstrahl | Ereignisse chronologisch ordnen | Einordnung, Kausalität | 2 |
| Schätzfrage | Wie viele Jahre bestand die Republik? (Schieberegler) | Größenordnungen | 3 |
| Bildfrage / Hotspot | Von welchem Baum stammt dieses Blatt? | Visuelles Wissen | 3 |

### Wiederholung und Beherrschung

- **Planung:** FSRS berechnet pro Konzept Stabilität, Schwierigkeit und nächstes Fälligkeitsdatum.
- **Bewertung automatisch aus der Antwort:** falsch = „nochmal“, richtig aber langsam = „schwer“, richtig = „gut“, richtig und schnell = „leicht“. Keine Selbsteinschätzung nötig.
- **Tägliche Runde:** fällige Konzepte, je Konzept eine passende Karte (wechselnder Fragetyp), standardmäßig höchstens 20 pro Tag.
- **Beherrschungsstufen je Konzept:** Neu → Gelernt (Lektion abgeschlossen) → Gefestigt (mehrfach richtig wiederholt) → Gemeistert (lange Stabilität). Konkrete Schwellenwerte werden in Phase 2 mit echten Daten justiert.
- **Freischaltung:** Eine Lektion öffnet sich, wenn ihre Vorgänger-Lektion abgeschlossen ist und alle vorausgesetzten Konzepte mindestens „Gelernt“ sind.
- **Einstufung (ab Phase 3):** Ein kurzes Quiz pro Kurs überspringt Einheiten, deren Konzepte schon sitzen.

### Motivation – bewusst sparsam

Tagesziel in Minuten, Tagesserie und XP für Lektionen und Wiederholungen. Bewusst nicht: Herzen oder Leben, die das Lernen bei Fehlern blockieren – Fehler sind hier Lernanlässe, kein Strafgrund.

### Balance: Allgemeinwissen statt Fachstudium

Die App vermittelt, was ein neugieriger, gebildeter Mensch über ein Thema wissen sollte – nicht, was eine Fachprüfung verlangt. Dafür hat jede Karte eine Tiefenstufe; die Regeln darunter gelten als Inhaltsrichtlinie, auch für Claudes Entwürfe.

| Tiefenstufe | Inhalt | Beispiel Römische Republik | In der Wiederholung? |
| --- | --- | --- | --- |
| Aufhänger (`hook`) | Überraschender Fakt oder Frage zum Einstieg | Rom wählte rund 500 Jahre lang jedes Jahr zwei neue Konsuln – warum? | Nein |
| Kernwissen (`core`) | Was man wissen sollte; Pflichtteil jeder Lektion | Republik ab 509 v. Chr., Konsuln und Senat, Ende mit Augustus | Ja |
| Vertiefung (`deep`) | Optional per „Mehr erfahren“ | Ämterlaufbahn (cursus honorum), Volkstribune | Nur wenn aufgerufen |
| Weiterlesen | Quellenlinks am Lektionsende | Wikipedia-Artikel zur Römischen Republik | – |

- **Umfang:** höchstens drei neue Konzepte und 5–10 Minuten pro Lektion; ein Kurs als Überblick mit etwa 15–25 Lektionen.
- **Relevanz:** Jede Lektion endet mit einem Bezug zu heute, z. B. Senat und Gewaltenteilung.
- **Zahlen und Namen** nur, wenn sie Orientierung geben (Ankerdaten), nicht als Selbstzweck.
- **Voraussetzungen nur grob:** Der Lernpfad ist überwiegend linear; der Konzeptgraph dient vor allem Querverweisen und der Wiederholung.
- **Messen statt raten:** „Zu detailliert“-Rückmeldungen und Abbruchraten pro Lektion zeigen, wo gekürzt werden muss.

## Iterationsplan

Der MVP kommt komplett ohne App Store aus: Alle sechs Phasen enden in einer Web-App, die per Link auf Laptop, Smartphone und Tablet läuft. Erster echter Meilenstein ist Phase 1, ein klickbarer Prototyp zum Selbstausprobieren; erst wenn eine Phase ihre Definition of Done erfüllt, beginnt die nächste.

| Phase | Inhalt | Definition of Done |
| --- | --- | --- |
| 0 Fundament | Expo-Projekt (Web zuerst), Repo, CLAUDE.md, Lint, Tests, CI auf GitHub | App läuft im Browser und per Link auf dem Handy |
| 1 Klick-Prototyp | 1 Kurs mit 3 Lektionen als JSON, Lektion-Player mit 3 Fragetypen, Erklärung + Quellen-Link | Lernkonzept selbst getestet |
| 2 Lernengine | Fortschritt lokal gespeichert, FSRS, Fehler wiederholen, PWA (installierbar, offline) | 2 Wochen selbst genutzt |
| 3 Inhalte & Bilder | Inhalte + Bilder in Supabase, Redaktion mit Directus, KI-Entwürfe mit Prüf-Workflow | 3 Bereiche, Bildfragen laufen |
| 4 Konten & Sync | Supabase Auth (E-Mail-Login), Fortschritt auf allen Geräten, Sicherung gegen Datenverlust | Handy und Tablet synchron |
| 5 Web-Beta (PWA) | Öffentlicher Link, Testnutzer, Datenschutz und Impressum, Fehler melden, Statistik | 20+ aktive Testnutzer |

Phase 0–2 brauchen keinen Server; Supabase kommt mit Inhalten und Bildern in Phase 3, Konten in Phase 4. Native Apps in den Stores sind eine spätere, optionale Phase 6 – sie nutzt denselben Code und wird erst angegangen, wenn das Konzept in der Web-Beta trägt. Vor Phase 1 lohnt ein kurzes visuelles Design-Mock-up, damit der Prototyp nicht im Standard-Look entsteht.

## Anleitung: Umsetzung mit Claude Code

Arbeitsprinzip: Du entscheidest *was* gebaut wird und prüfst das Ergebnis; Claude Code plant, schreibt Code und Tests und führt sie aus. Jedes Feature läuft im gleichen Zyklus auf einem eigenen Git-Branch. Der aktuelle Stand wird in `docs/progress.md` gepflegt.

### Einmalige Einrichtung (Phase 0)

- [ ] Node.js (aktuelle LTS), Git und VS Code installieren; Konten bei GitHub und Expo (expo.dev) anlegen.
- [ ] Leeren Ordner `wissen-app` anlegen, Startpaket (CLAUDE.md, docs/, .claude/) hineinkopieren, darin `claude` starten.
- [ ] Erster Auftrag an Claude Code (siehe Prompt 0 unten); danach GitHub-Repo verbinden und pushen.
- [ ] Optional: Expo bietet eigene Agent-Skills für Coding-Agents an (`npx @expo/agent-cli`); prüfen, ob sie die Arbeit mit Expo-APIs verbessern.

### Der Zyklus pro Feature

1. **Branch anlegen:** `git switch -c feature/lesson-player`.
2. **Planen lassen:** `/naechster-schritt` oder Plan-Modus (Shift+Tab); Plan lesen, korrigieren, freigeben.
3. **Umsetzen:** Claude Code schreibt Code und Tests und führt Lint, Typecheck und Tests selbst aus.
4. **Selbst testen:** `npm run web` im Browser und im Handy-Browser; Auffälligkeiten direkt zurückmelden.
5. **Abschließen:** Commit und Pull Request von Claude Code erstellen lassen, auf GitHub mergen.
6. **Kontext leeren:** `/clear` vor dem nächsten Feature, damit Claude Code fokussiert bleibt.

### Startprompts je Phase

| Phase | Prompt an Claude Code (Kern) |
| --- | --- |
| 0 Fundament | „Lies docs/plan.md. Lege ein Expo-Projekt (SDK 58, TypeScript strict, Expo Router) mit der dort beschriebenen Ordnerstruktur an, Web als Hauptziel. Richte ESLint, Prettier, Jest und eine GitHub-Actions-CI ein. Plane zuerst.“ |
| 1 Klick-Prototyp | „Definiere das Zod-Schema für Kurse, Lektionen und Karten laut Datenmodell (inkl. depth und sources). Lege einen Beispielkurs ‚Antike‘ mit 3 Lektionen an. Baue Lernpfad und Lektion-Player für Erklärkarte, Multiple Choice, Wahr/Falsch und Lückentext inkl. Feedback-Panel mit Quellen-Link.“ |
| 2 Lernengine | „Implementiere src/engine: Lektionsablauf inkl. Fehler-Runde, FSRS-Planung mit ts-fsrs, Beherrschungsstufen, Freischaltung. Test-first. Danach Speicher-Schnittstelle mit IndexedDB (Dexie), Wiederholen-Tab und PWA-Setup (Manifest, Service Worker, Installationshinweis).“ |
| 3 Inhalte & Bilder | „Lege das Supabase-Schema für Inhalte als SQL-Migration an, migriere die JSON-Inhalte per Skript, richte Storage für Bilder ein und lade Content-Pakete versioniert in die App. Ergänze Bildfragen mit Bild-Cache.“ |
| 4 Konten & Sync | „Login per E-Mail über Supabase Auth, RLS-Policies, Sync von review_log und lesson_progress laut Plan.“ |
| 5 Web-Beta | „Datenschutz- und Impressumsseite, ‚Fehler melden‘ und ‚Zu detailliert‘ an jeder Karte, Sentry und datensparsame Statistik, Deployment auf EAS Hosting mit eigener Domain.“ |

### Tipps aus der Praxis

- **Kleine Aufträge:** ein Screen oder ein Engine-Baustein pro Durchlauf; große Aufträge erzeugen schwer prüfbare Diffs.
- **Entscheidungen festhalten:** Architekturentscheidungen als kurze ADR-Datei unter `docs/adr/`.
- **Inhalte mit Claude entwerfen, aber selbst prüfen:** Status bleibt `draft`, bis Fakten und Quelle gegengelesen sind.
- **Fehler mit Kontext melden:** Screenshot oder Fehlermeldung aus der Konsole einfügen statt „geht nicht“.

## Deployment

Für den MVP genügt eine Web-App: kein Store-Konto, keine Gebühren, kein Review, Updates sofort live. Die Store-Wege weiter unten werden erst relevant, wenn eine Veröffentlichung als native App ansteht.

### MVP: Web-App (PWA)

1. **Build:** `npx expo export -p web` erzeugt statische Dateien.
2. **PWA-Bausteine:** Web-Manifest (Name, Icon, Farben) und Service Worker für Offline-Betrieb und Bild-Cache, z. B. mit Workbox.
3. **Hosting:** `eas deploy` (EAS Hosting) oder Vercel; pro Pull Request eine Vorschau-URL zum Testen auf dem Handy.
4. **Domain und HTTPS:** eigene Domain; HTTPS ist für Service Worker Pflicht und bei beiden Anbietern inklusive.
5. **Installation:** Android/Chrome bietet „App installieren“ an, auf iOS geht es über Teilen → „Zum Home-Bildschirm“. Die App zeigt dazu einen kurzen Hinweis.

Grenzen gegenüber nativen Apps: keine Sichtbarkeit in den Stores, Push-Benachrichtigungen auf iOS nur für installierte Web-Apps, und ohne Installation kann Safari lokale Daten löschen. Für die Verprobung des Konzepts fällt das nicht ins Gewicht.

### Später optional: App Stores

Für Android dann mindestens zwei Wochen Testphase einplanen: Neue private Play-Konten müssen vor der Produktion einen geschlossenen Test mit mindestens 12 Testern über 14 Tage durchlaufen ([Google](https://support.google.com/googleplay/android-developer/answer/14151465)).

| Plattform | Weg | Kosten | Besonderheit |
| --- | --- | --- | --- |
| iOS | `eas build -p ios` → `eas submit` → TestFlight → App-Store-Review | Apple Developer Program, ca. 99 USD/Jahr | Kein Mac nötig |
| Android | `eas build -p android` → `eas submit` → interner Test → geschlossener Test → Produktion | Play Console, einmalig ca. 25 USD | 12 Tester / 14 Tage bei neuem Privatkonto |
| Updates | `eas update` für JavaScript- und Inhaltsänderungen | im Expo Free Tier enthalten (Kontingent) | Fehlerbehebungen ohne erneutes Store-Review |

### Release-Checkliste (Web-Beta)

- [ ] Datenschutzerklärung und Impressum (in Deutschland Pflicht)
- [ ] Supabase-Projekt in der EU-Region; Auftragsverarbeitungsvertrag prüfen
- [ ] App-Name, Icon, Manifest, Splashscreen
- [ ] Konto-Löschung in der App, sobald es Konten gibt
- [ ] Crash-Reporting (Sentry) und datensparsame Nutzungsstatistik

## Offene Entscheidungen & Risiken

Das größte Risiko ist nicht die Technik, sondern Menge und Qualität der Inhalte; daher ist der Prüfprozess für Karten von Beginn an Teil der Architektur.

| Risiko | Auswirkung | Gegenmaßnahme |
| --- | --- | --- |
| Fehlerhafte Fakten in KI-entworfenen Inhalten | Vertrauensverlust, falsches Wissen | Pflichtquelle, Prüf-Workflow in Directus, Checks vor Veröffentlichung, „Fehler melden“ an jeder Karte |
| Zu detaillierte, langatmige Lektionen | Langeweile, Abbrüche | Tiefenstufen, höchstens drei Konzepte pro Lektion, „Zu detailliert“-Feedback, Abbruchraten beobachten |
| Inhaltsproduktion zu langsam | App wirkt dünn | Redaktionsplan, KI-Entwürfe, erst einen Bereich tief statt viele flach |
| Browser löscht lokale Daten (Safari) | Verlorener Fortschritt | Installationshinweis für den Homescreen, ab Phase 4 Sicherung im Konto |
| Große Bildmengen | Langsame App, voller Speicher | CDN, mehrere Bildgrößen, Vorladen, Cache mit Obergrenze |
| Bildrechte bei Illustrationen | Abmahnungen | Nur eigene, KI-generierte oder klar lizenzierte Bilder; Urheber und Lizenz als Pflichtfelder |
| Scope Creep | Prototyp wird nie fertig | Jede Phase mit klarer Definition of Done; neue Ideen ins Backlog in docs/progress.md |

### Zu entscheiden

- [ ] Erster Wissensbereich und Kurs für den Prototyp (Vorschlag: Geschichte – Antike, weil gut strukturierbar)
- [ ] Zielgruppe und Mindestalter (bei Kindern strengere Datenschutzpflichten)
- [ ] Arbeitstitel und App-Name (Verfügbarkeit als Domain prüfen)
- [ ] Monetarisierung: kostenlos, Freemium oder Abo – beeinflusst ab Phase 5 Konten und Bezahlung
- [ ] Visueller Stil und Illustrationsstil (Design-Mock-up vor Phase 1)
- [ ] Ob und wann native Apps in die Stores sollen (optionale Phase 6)

### Quellen

- [Expo SDK 58 Release Notes](https://expo.dev/changelog/sdk-58.md) (Oktober 2026, React Native 0.88)
- [Google Play: Testanforderungen für neue private Entwicklerkonten](https://support.google.com/googleplay/android-developer/answer/14151465)
- [WebKit: 7-Tage-Grenze für Website-Speicher in Safari](https://webkit.org/blog/10218/full-third-party-cookie-blocking-and-more/)
