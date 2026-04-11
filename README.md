# VitaLink

Patient-controlled health record app prototype. Upload records, view a structured medical timeline, generate doctor-ready visit summaries.

## Run

```bash
npm install
npx expo start --web
```

Press `i` for iOS Simulator, `a` for Android Emulator, or scan the QR code with Expo Go.

## Structure

```
app/              ← Expo Router screens (9 files)
  _layout.tsx
  upload.tsx
  summary.tsx
  (tabs)/
    _layout.tsx
    index.tsx      ← Home dashboard
    timeline.tsx
    records.tsx
    visit.tsx      ← Visit preparation
    profile.tsx

components/       ← Reusable UI (4 files)
  UI.tsx           ← Card, Badge, Button, StatCard, PillFilter, Disclaimer, Empty
  TimelineCard.tsx
  DocCard.tsx
  SummaryParts.tsx ← Section, CondRow, MedRow, AllergyRow, LabRow, EncRow, QRow, GapRow

lib/              ← Data layer (3 files)
  types.ts         ← All TypeScript types
  theme.ts         ← Colors, spacing, helpers
  store.ts         ← Zustand store + seed data + mock extraction
```

## Demo (3 min)

1. **Home** — Stats, abnormal labs alert, recent timeline, "Prepare for Visit" CTA
2. **Timeline** — 5 years of history, filter pills, search, year grouping, milestone markers, provenance badges
3. **Upload** — Quick demo uploads simulate extraction with ~1.5s delay, new events appear in timeline
4. **Summary** — Full doctor summary: allergies, conditions, meds, abnormal labs, encounters, procedures, patient questions, gaps. Toggle clinician/patient view. Share via native share sheet
5. **Profile** — Demographics, settings, privacy section, demo badge
