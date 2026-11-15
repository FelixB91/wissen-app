# Fortschritt

Aktuelle Phase: **0 – Fundament**
Nächste Aufgabe: Expo-Projekt anlegen (siehe Phase 0)

## Phasen (Details in docs/plan.md, Abschnitt Iterationsplan)

| Phase | Ziel | Definition of Done | Status |
| --- | --- | --- | --- |
| 0 Fundament | Projekt, Tooling, CI | App läuft im Browser und per Link auf dem Handy | offen |
| 1 Klick-Prototyp | 1 Kurs, 3 Lektionen, Lektion-Player | Lernkonzept selbst getestet | offen |
| 2 Lernengine | Fortschritt, FSRS, Fehler-Runde, PWA | 2 Wochen selbst genutzt | offen |
| 3 Inhalte & Bilder | Supabase, Directus, Bildfragen | 3 Bereiche, Bildfragen laufen | offen |
| 4 Konten & Sync | Login, geräteübergreifender Fortschritt | Handy und Tablet synchron | offen |
| 5 Web-Beta | Öffentlicher Link, Feedback, Datenschutz | 20+ aktive Testnutzer | offen |
| 6 Native Apps (optional) | App Stores | wird später entschieden | – |

## Phase 0 – Fundament
- [ ] Expo-Projekt (SDK 58, TypeScript strict, Expo Router), Web als Hauptziel
- [ ] Ordnerstruktur laut docs/plan.md (app/, src/engine, src/content, src/db, src/components, src/theme, content/, scripts/, docs/)
- [ ] ESLint, Prettier, Jest, npm-Skripte (lint, typecheck, test, validate:content)
- [ ] GitHub-Repo und GitHub-Actions-CI (lint, typecheck, test)
- [ ] Platzhalter-Startseite läuft mit `npm run web` und im Handy-Browser

## Phase 1 – Klick-Prototyp
- [ ] Zod-Schema für Kurse, Lektionen, Karten (inkl. depth, sources)
- [ ] Beispielkurs „Antike“ mit 3 Lektionen als JSON
- [ ] Lernpfad-Screen
- [ ] Lektion-Player: Erklärkarte, Multiple Choice, Wahr/Falsch, Lückentext
- [ ] Feedback-Panel mit Begründung und Quellen-Link

## Entscheidungslog
| Datum | Entscheidung | Begründung |
| --- | --- | --- |
| 2026-11-14 | MVP als Web-App (PWA), Expo als Basis | Konzept ohne Store verproben, native Apps später möglich |

## Backlog (Ideen für später)
-
