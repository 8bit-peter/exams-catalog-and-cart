# Blood Exam Catalog & Cart

A Nuxt 3 e-commerce application for browsing and purchasing blood exams with advanced filtering, sorting, and shopping cart functionality.

## Features

- **Catalog Page (`/`)**

  - Multi-criteria filtering (Category, Price Range, Fasting Required, Result Time)
  - Multiple sorting options (Price, Popularity, Result Time)
  - Visual badges for "Fasting Required" and "24h Results"
  - Responsive grid layout

- **Shopping Cart (`/cart`)**

  - Add, remove, and update quantities
  - Bundle discount: 10% off any 3 exams from the 'Basic' category
  - Detailed checkout summary with discount breakdown
  - SSR-safe localStorage persistence

- **Accessibility**
  - Full keyboard navigation
  - ARIA labels on all interactive elements
  - Screen reader announcements for cart updates
  - Semantic HTML structure

## Setup

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

1. Install dependencies:

```bash
npm install
```

2. Start the development server:

```bash
npm run dev
```

3. Open your browser and navigate to `http://localhost:3000`

### Build for Production

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## Testing

Run unit tests:

```bash
npm test
```

The test suite includes:

- Bundle discount calculation tests (5 test cases)
- Cart operations tests (6 test cases)

## Project Structure

```
├── assets/
│   └── css/
│       └── main.css          # Global styles
├── composables/
│   └── useExams.ts           # Composable for loading exam data
├── pages/
│   ├── index.vue            # Catalog page with filters and sorting
│   └── cart.vue             # Shopping cart page
├── public/
│   └── exams.json           # Seed data (35 exam objects)
├── stores/
│   ├── cart.ts              # Pinia store for cart state management
│   └── __tests__/
│       └── cart.test.ts     # Unit tests for cart logic
├── app.vue                  # Root component
├── nuxt.config.ts           # Nuxt configuration
└── package.json             # Dependencies and scripts
```

## Design Decisions

### State Management

- **Pinia Store**: Used for cart state management with SSR-safe localStorage persistence
- **useState**: Used for exam data caching across the application
- **Hydration Pattern**: Cart store uses a `hydrate()` method called on client mount to prevent hydration mismatches

### Bundle Discount Logic

The bundle discount rule states: "Any 3 exams from the 'Basic' category get a 10% discount."

Implementation details:

- Discount applies to sets of 3 Basic category exams
- Each set of 3 receives a 10% discount on those 3 items
- Partial sets (e.g., 5 Basic exams) receive discount only on complete sets of 3
- Non-Basic category exams are not eligible for this discount

Example:

- 3 Basic exams → 1 discount (10% off all 3)
- 6 Basic exams → 2 discounts (10% off all 6)
- 5 Basic exams → 1 discount (10% off 3, 2 at full price)

### SSR-Safe localStorage

To prevent hydration mismatches:

1. Cart state is initialized as empty on the server
2. `hydrate()` method is called in `onMounted()` hook (client-only)
3. All localStorage operations are guarded with `typeof window !== 'undefined'` checks
4. Store uses `_hydrated` flag to prevent multiple hydration attempts

### Accessibility

- All interactive elements have proper ARIA labels
- Form controls are properly labeled with `<label>` elements
- Screen reader announcements for cart updates using `role="status"` and `aria-live="polite"`
- Keyboard navigation support throughout
- Semantic HTML (header, nav, main, aside, article)
- Focus indicators on all interactive elements

### Styling

- CSS custom properties for theming
- Mobile-first responsive design
- Consistent spacing and typography scale
- Accessible color contrast ratios

## Technical Stack

- **Framework**: Nuxt 3 with SSR
- **State Management**: Pinia
- **Styling**: Vanilla CSS with custom properties + SCSS inside components
- **Testing**: Vitest
- **TypeScript**: Full type safety

## Assumptions

1. **Data Source**: Exams data is loaded from a static JSON file (`/public/exams.json`)
2. **Discount Calculation**: Discount is applied to the first N sets of 3 Basic exams (order doesn't affect total discount amount)
3. **Cart Persistence**: Cart state persists across page refreshes using localStorage
4. **Browser Support**: Modern browsers with ES6+ support and localStorage API
