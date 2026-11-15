# Fortschritt

Aktuelle Phase: **1 – Klick-Prototyp**
Nächste Aufgabe: Plan für Phase 1 vorlegen (Zod-Schema für Kurse, Lektionen, Karten)

## Phasen (Details in docs/plan.md, Abschnitt Iterationsplan)

| Phase | Ziel | Definition of Done | Status |
| --- | --- | --- | --- |
| 0 Fundament | Projekt, Tooling, CI | App läuft im Browser und per Link auf dem Handy | fertig (2026-11-15) |
| 1 Klick-Prototyp | 1 Kurs, 3 Lektionen, Lektion-Player | Lernkonzept selbst getestet | als Nächstes |
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
- [ ] Zod-Schema für Kurse, Lektionen, Karten (inkl. depth, sources)
- [ ] Beispielkurs „Antike“ mit 3 Lektionen als JSON
- [ ] Lernpfad-Screen
- [ ] Lektion-Player: Erklärkarte, Multiple Choice, Wahr/Falsch, Lückentext
- [ ] Feedback-Panel mit Begründung und Quellen-Link

## Entscheidungslog
| Datum | Entscheidung | Begründung |
| --- | --- | --- |
| 2026-11-14 | MVP als Web-App (PWA), Expo als Basis | Konzept ohne Store verproben, native Apps später möglich |
| 2026-11-15 | Projekt liegt unter C:devwissen-app, Name `wissen-app`; Routen in `app/` | OneDrive vertrug sich nicht mit node_modules; Struktur laut plan.md (ADR 0001) |
| 2026-11-15 | Handy-Test in Phase 0 über Dev-Server im WLAN, kein Hosting | Hosting kommt mit der Web-Beta |
| 2026-11-15 | `validate:content` vorerst JS-Stub (`scripts/validate-content.js`) | Vermeidet `@types/node`; Umstellung auf TS mit Zod in Phase 1 |

## Backlog (Ideen für später)
-
