# Fortschritt

Aktuelle Phase: **1 – Klick-Prototyp**
Nächste Aufgabe: Nutzer testet den Prototyp (Lernpfad, 3 Lektionen) und prüft die Fakten der Antike-Karten; danach Bestätigung von Phase 1

## Phasen (Details in docs/plan.md, Abschnitt Iterationsplan)

| Phase | Ziel | Definition of Done | Status |
| --- | --- | --- | --- |
| 0 Fundament | Projekt, Tooling, CI | App läuft im Browser und per Link auf dem Handy | fertig (2026-11-15) |
| 1 Klick-Prototyp | 1 Kurs, 3 Lektionen, Lektion-Player | Lernkonzept selbst getestet | umgesetzt, Test durch Nutzer offen |
| 2 Lernengine | Fortschritt, FSRS, Fehler-Runde, PWA | 2 Wochen selbst genutzt | offen |
| 3 Inhalte & Bilder | Supabase, Directus, Bildfragen | 3 Bereiche, Bildfragen laufen | offen |
| 4 Konten & Sync | Login, geräteübergreifender Fortschritt | Handy und Tablet synchron | offen |
| 5 Web-Beta | Öffentlicher Link, Feedback, Datenschutz | 20+ aktive Testnutzer | offen |
| 6 Native Apps (optional) | App Stores | wird später entschieden | – |

## Phase 0 – Fundament
- [x] Expo-Projekt (SDK 58, TypeScript strict, Expo Router), Web als Hauptziel
- [x] Ordnerstruktur laut docs/plan.md (app/, src/engine, src/content, src/db, src/components, src/theme, content/, scripts/, docs/)
- [x] ESLint, Prettier, Jest, npm-Skripte (lint, typecheck, test, validate:content)
- [x] GitHub-Repo und GitHub-Actions-CI (lint, typecheck, test)
- [x] Platzhalter-Startseite läuft mit `npm run web` und im Handy-Browser

## Phase 1 – Klick-Prototyp
- [x] Zod-Schema für Kurse, Lektionen, Karten (inkl. depth, sources)
- [x] Beispielkurs „Antike“ mit 3 Lektionen als JSON (alle Karten `draft`, Fakten-Review durch den Nutzer offen)
- [x] Lernpfad-Screen (Lektion-Route ist noch ein Platzhalter mit „Abschließen“-Knopf)
- [x] Lektion-Player: Erklärkarte, Multiple Choice, Wahr/Falsch, Lückentext
- [x] Feedback-Panel mit Begründung und Quellen-Link

## Entscheidungslog
| Datum | Entscheidung | Begründung |
| --- | --- | --- |
| 2026-11-14 | MVP als Web-App (PWA), Expo als Basis | Konzept ohne Store verproben, native Apps später möglich |
| 2026-11-15 | Projekt liegt unter C:\dev\wissen-app, Name `wissen-app`; Routen in `app/` | OneDrive vertrug sich nicht mit node_modules; Struktur laut plan.md (ADR 0001) |
| 2026-11-15 | Handy-Test in Phase 0 über Dev-Server im WLAN, kein Hosting | Hosting kommt mit der Web-Beta |
| 2026-11-15 | `validate:content` bleibt ein JS-Skript (`scripts/validate-content.js`), das das TS-Schema direkt lädt | Vermeidet `@types/node` und einen Build-Schritt |
| 2026-11-15 | Phase 1 in vier Schritten/PRs: Schema, Inhalt, Lernpfad, Lektion-Player; Design-Mock-up auf später verschoben | Kleine Schritte; Optik erst nach dem Konzepttest |
| 2026-11-15 | Inhalte unter content/<kurs>/course.json und content/<kurs>/lessons/<lektion>.json; Schema inkl. Querprüfungen in einer Datei (src/content/schema.ts) | Skript lädt TS direkt per Node, ohne Build-Schritt oder @types/node |
| 2026-11-15 | zod und (ab Lernpfad) zustand freigegeben | Rückfrage beantwortet |
| 2026-11-27 | Routen: `app/(tabs)/…` für die Tabs, `app/lesson/[id]` als Vollbild außerhalb der Tabs; Lektionen werden linear freigeschaltet (Konzept-Voraussetzungen erst später) | Entspricht plan.md; einfachste Regel für den Prototyp |
| 2026-11-27 | Fortschritt in Phase 1 nur im Arbeitsspeicher (zustand, `src/state`), Persistenz folgt in Phase 2 über `src/db` | Keine Phase-2-Arbeit vorgezogen |
| 2026-11-28 | Vertiefungskarten (`deep`) laufen nicht im Lektionsablauf, sondern klappen am Lektionsende unter „Mehr erfahren“ auf; Lektion gilt als abgeschlossen, sobald die letzte Karte durch ist | Entspricht plan.md (Vertiefung optional); einfachste Regel |
| 2026-11-28 | Lektion-Player hält seinen Zustand lokal (useState) und nutzt reine Funktionen aus `src/engine/lesson-session.ts` | Logik testbar ohne React |

## Backlog (Ideen für später)
- Bei falscher Antwort erklären, warum die gewählte Option nicht stimmt (braucht pro Option einen Hinweis im Schema)
- Tablet-Layout im Player: Erklärung und Frage nebeneinander (Wireframe in plan.md)
- Fehler-Runde am Lektionsende (Phase 2)
- Vertiefungskarten als Fragen (aktuell nur Erklärkarten im „Mehr erfahren“)
- Visuelles Design / Design-Mock-up (bewusst nach hinten geschoben)
- Echte Tab-Icons (aktuell Standard-Pfeile)
