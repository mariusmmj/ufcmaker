# UFC Card Maker

![UFC Card Maker](https://img.shields.io/badge/Status-Production%20Ready-success) ![React](https://img.shields.io/badge/React-18-blue) ![TypeScript](https://img.shields.io/badge/TypeScript-5.2-blue) ![Zustand](https://img.shields.io/badge/Zustand-State-orange)

A professional, interactive web application that allows users to build custom UFC event fight cards. Built with modern web technologies, it features drag-and-drop reordering, division-based matchmaking, and the ability to instantly share or export fight cards.

---

## Key Features

- **Interactive Fight Builder**: Choose from a database of real UFC fighters. The system automatically enforces weight class restrictions (unless bypassed).
- **Global State Management**: Powered by **Zustand** for lightning-fast, predictable state updates across the app.
- **Drag & Drop Interface**: Seamlessly reorder the main card and prelims using `@dnd-kit/core` with smooth animations.
- **Shareable URLs**: The app uses `lz-string` to compress the entire state of your custom card into the URL. Send the link to a friend, and they will see the exact card you built!
- **High-Quality Export**: Leveraging `html-to-image`, users can take a high-resolution screenshot of their completed card with a single click.
- **Dark/Light Mode**: Full theme support utilizing CSS variables and Tailwind CSS.
- **Champion Highlighting**: Distinctive gold styling and background radiants for champions on the card.
- **Card History**: Save locally and retrieve multiple custom cards via a history modal.

---

## Tech Stack

- **Framework**: React 18
- **Language**: TypeScript
- **State Management**: Zustand
- **Styling**: Tailwind CSS
- **Build Tool**: Vite
- **Utilities**: `dnd-kit` (drag & drop), `html-to-image` (export), `lz-string` (URL state compression)

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

### 1. Centralized State (Zustand)
Initially, state was managed via prop-drilling and `useState` inside the root component. This was refactored into a centralized `useStore.ts` using Zustand. This separation of concerns means the React components now only handle the view layer, while the store handles complex business logic (e.g., parsing URL parameters, enforcing weight divisions, and calculating stats).

### 2. URL State Encoding
To allow users to share their fight cards without requiring a backend database, the app implements a stateless sharing mechanism. When a user clicks "Share", the JSON state of the card is compressed using LZ-based compression (`lz-string`) and appended to the URL query string. On initial load, the Zustand store intercepts this URL parameter, decompresses it, and hydrates the application state.

### 3. Strict Type Safety
The entire application is strictly typed using TypeScript. Interfaces for `Fighter`, `FightSlot`, and the `FightsMap` prevent runtime errors and ensure that the matching algorithm safely handles edge cases (e.g., cross-divisional catchweights).

---

## License

This project is open-source and available under the [MIT License](LICENSE).