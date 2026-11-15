# ADR 0001: Web-first mit Expo

Status: angenommen (2026-11-15)

## Kontext

Das Lernkonzept soll ohne App-Store-Aufwand verprobt werden. Native Apps sind eine
mögliche, spätere Option.

## Entscheidung

- MVP als Web-App (PWA), gebaut mit Expo SDK 58, TypeScript (strict) und Expo Router.
- Routen liegen im Ordner `app/` im Projektwurzelverzeichnis, Code unter `src/`
  (Alias `@/` zeigt auf `src/`).
- Web-Ausgabe statisch (`web.output: "static"`), damit sie ohne Server gehostet werden kann.
- Tests mit Jest (`jest-expo`) und React Native Testing Library, Lint mit ESLint
  (`eslint-config-expo`) und Prettier.

## Konsequenzen

- Eine Codebasis für Web und spätere native Apps.
- Die Lernlogik in `src/engine` bleibt UI-frei und separat testbar.
- `scripts/validate-content.js` ist in Phase 0 ein Stub in JavaScript (kein `@types/node`
  nötig); es wird mit dem Zod-Schema in Phase 1 ersetzt.
