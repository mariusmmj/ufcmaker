# UFC Card Maker

![UFC Card Maker](https://img.shields.io/badge/Status-Production%20Ready-success) ![React](https://img.shields.io/badge/React-18-blue) ![TypeScript](https://img.shields.io/badge/TypeScript-5.2-blue) ![Zustand](https://img.shields.io/badge/Zustand-State-orange)

A professional, interactive web application that allows users to build custom UFC event fight cards. Built with modern web technologies, it features drag-and-drop reordering, division-based matchmaking, detailed fight predictions, title fight banners, side-by-side fighter comparisons, and the ability to instantly share or export fight cards.

---

## Key Features

- **Interactive Fight Builder**: Choose from an extensive database of real UFC fighters. The system automatically enforces weight class restrictions (unless bypassed with the unrestricted toggle).
- **Tale of the Tape Matchup Modal**: Click the "VS" button on any matchup to open a comprehensive side-by-side comparison modal displaying records, ages, win method breakdowns (KO/TKO, Submissions, Decisions), and full-body fighter imagery.
- **Interactive Pick'em Mode & Detailed Predictions**: Switch into Pick'em mode to predict fight outcomes. Pick a winner, specify the method of victory (KO/TKO, Submission, Decision), and select the exact round (R1 to R5 or Decision). Picks are highlighted directly on the card.
- **Title Fight Types & Distinct Banners**: Mark any bout as a 5-round title fight with specialized visual banners:
  - Undisputed World Title: Gold gradient banner.
  - Interim Title: Gold and silver gradient banner.
  - BMF Title: Silver and black gradient banner.
- **Fighter Search & Quick Filters**: Search through fighters by name or weight class, or quickly filter contenders using chips: Champions, Top 5, Undefeated, KO Artists, and Submission Experts. Results are automatically sorted by rank.
- **Fighter Info Popout**: Click any fighter's photo on the card to inspect their fighter card, age, divisional rank, and statistical breakdown.
- **Champion Recognition**: Universal gold styling and gradients highlight reigning champions across the card, fighter picker, and info modals.
- **Drag & Drop Interface**: Seamlessly reorder the main card and prelims using `@dnd-kit/core` with smooth animations.
- **Shareable URLs**: The app uses `lz-string` to compress the entire state of your custom card (including matchups and predictions) into the URL query parameters. Anyone opening the link will see the exact card and picks you created.
- **High-Resolution Image Export**: Export your completed fight card as a clean, high-resolution PNG image ready for social media or group chats.
- **Card History & Saving**: Save multiple custom cards locally with name validation, duplicate checks, confirmation toasts, and an easy card reset button.
- **Dark & Light Mode**: Complete theme support utilizing custom CSS variables and responsive design across desktop and mobile screens.

---

## Tech Stack

- **Framework**: React 18
- **Language**: TypeScript
- **State Management**: Zustand
- **Styling**: Tailwind CSS, CSS Variables
- **Build Tool**: Vite
- **Utilities**: `dnd-kit` (drag and drop), `html-to-image` (PNG export), `lz-string` (URL state compression)

---

## Getting Started

To run this project locally:

### 1. Clone & Install
```bash
git clone https://github.com/your-username/ufc-card-maker.git
cd ufc-card-maker
npm install
```

### 2. Run the Development Server
```bash
npm run dev
```

### 3. Build for Production
```bash
npm run build
```
The optimized bundle will be generated in the `dist` folder.

---

## Architecture & Design Decisions

### 1. Centralized State Management (Zustand)
All fight data, modal states, card configurations, and prediction selections are managed via a centralized Zustand store in `src/store/useStore.ts`. This architecture provides predictable state mutations, instant UI reactivity, and clean separation between presentation and business logic.

### 2. Stateless URL Sharing
To enable frictionless sharing without requiring a backend database or user accounts, the application state is serialized and compressed using LZ-based URI compression (`lz-string`). The Zustand store automatically parses and hydrates state from the URL on page load, preserving fight matchups, title designations, and user predictions.

### 3. Type Safety
The application is strictly typed using TypeScript interfaces across fighters, fight slots, title designations, and pick predictions. This guarantees runtime safety and simplifies data transformations across components.