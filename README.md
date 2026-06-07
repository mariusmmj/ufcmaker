# UFC Card Maker

A custom UFC event card builder with real-time hype scoring, drag-and-drop reordering, and division-based fighter matching.

## Features

- **Fighter Selection**: Choose from a database of real UFC fighters or create custom fighters
- **Division Matching**: Automatically lock fighter divisions to prevent mismatches (optional)
- **Hype Score System**: Dynamic scoring based on fighter rank, record, and title fights
- **Drag & Drop**: Reorder fights on the main card and prelims
- **Title Fight Toggle**: Mark fights as title bouts (5 rounds)
- **Dark Mode**: Toggle between light and dark themes
- **Event Customization**: Edit event name and browse multiple theme templates
- **Card Stats**: View total fights, title bouts, combined records, and dominant weight class

## Tech Stack

- **React 18** with TypeScript
- **Tailwind CSS** for styling
- **dnd-kit** for drag-and-drop functionality
- **Vite** for fast development and building

## Getting Started

### Install Dependencies
```sh
npm install
```

### Development
```sh
npm run dev
```

### Build
```sh
npm run build
```

### Preview Build
```sh
npm run preview
```

## Project Structure

```
src/
├── components/
│   ├── CardStats.tsx       # Event statistics display
│   ├── DivisionBadge.tsx   # Division badge component
│   ├── FightRow.tsx        # Individual fight row
│   └── FighterModal.tsx    # Fighter selection modal
├── data/
│   └── fighters.json       # UFC fighter database
├── types/
│   └── index.ts            # TypeScript type definitions
├── utils/
│   └── hypeScore.ts        # Hype scoring algorithm
├── constants.ts            # App constants and configs
├── App.tsx                 # Main app component
├── main.tsx                # Entry point
└── index.css               # Global styles
```

## Key Features Explained

### Hype Score Algorithm
Points are awarded based on:
- **Fighter Rank**: Champions (+5), Top 5 (+5), Top 15 (+3)
- **Record**: 15+ wins (+2), 10+ wins (+1)
- **Title Fights**: +10 points each

Raw score is scaled to 0-5 stars and rounded to nearest half-star.

### Division Locking
When you add the first fighter to a bout, their division is locked. The second fighter must be from the same division (unless "No Division Restrictions" is enabled).

### Drag & Drop
- Main Event (M1) and Co-Main Event (M2) are pinned and cannot be reordered
- All other main card and prelim fights can be freely reordered
- Uses keyboard support for accessibility

## Customization

### Adding Fighters
Edit fighters.json to add or modify fighters.

### Themes
Available themes in constants.ts:
- **Default**: Standard UFC colors
- **UFC 300**: Gold accent theme
- **Noche UFC**: Green/Red/White theme

### Styling
CSS variables in index.css control the entire color scheme and can be overridden per theme.

## Browser Support

Modern browsers with ES2020+ support (Chrome, Firefox, Safari, Edge)