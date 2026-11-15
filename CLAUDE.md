# Allgemeinwissen-App

## Kontext
Lern-App für Allgemeinwissen nach dem Duolingo-Prinzip: Wissen schrittweise aufbauen,
jede Antwort erklären und mit Quelle belegen, Gelerntes per Spaced Repetition festigen.
Ziel ist Allgemeinwissen, kein Fachstudium – lieber spannend und knapp als vollständig.

- Gesamtplan (Architektur, Datenmodell, Phasen): docs/plan.md
- Aktueller Stand und nächste Aufgaben: docs/progress.md

Stack: Expo SDK 58, TypeScript (strict), Expo Router, Zustand, IndexedDB (Dexie) hinter
src/db, Zod, ts-fsrs. MVP = Web-App (PWA), native Apps sind optional und später.

## Arbeitsweise (immer einhalten)
1. Zu Beginn jeder Sitzung docs/progress.md lesen; bei Architekturfragen docs/plan.md.
2. Nur an der aktuellen Phase arbeiten. Nichts aus späteren Phasen vorziehen.
   Ideen für später unter "Backlog" in docs/progress.md notieren.
3. Vor der Umsetzung einen kurzen Plan vorlegen und auf Freigabe warten.
4. Kleine Schritte: ein Screen oder ein Engine-Baustein pro Aufgabe, eigener Git-Branch.
5. Nach jeder abgeschlossenen Aufgabe docs/progress.md aktualisieren (abhaken,
   Entscheidungen ins Entscheidungslog, nächste Aufgabe benennen).
6. Eine Phase gilt erst als fertig, wenn ihre Definition of Done erfüllt ist und der
   Nutzer das bestätigt hat.
7. Architekturentscheidungen als kurze ADR unter docs/adr/ festhalten.

## Code-Regeln
- Lernlogik gehört nach src/engine: reine Funktionen, keine React-Imports, immer mit Unit-Tests.
- Speicherzugriff nur über die Schnittstelle in src/db (Web: IndexedDB, später nativ: SQLite).
- Inhalte (Phase 1–2) nur als JSON unter content/, Schema in src/content/schema.ts.
  Nach Änderungen: npm run validate:content.
- Jede Karte braucht eine Tiefenstufe (hook/core/deep) und mindestens eine Quelle (sources).
- UI-Texte auf Deutsch; Code, Bezeichner und Commits auf Englisch.
- Farben, Abstände, Schriftgrößen nur aus src/theme.
- Jede Seite muss im Browser auf Smartphone und Tablet (>= 768 px Breite) funktionieren.
- Vor jedem Abschluss: npm run lint && npm run typecheck && npm test.
- Keine neuen Abhängigkeiten ohne Rückfrage.

## Befehle
npm start | npm run web | npm test | npm run lint | npm run typecheck | npm run validate:content
