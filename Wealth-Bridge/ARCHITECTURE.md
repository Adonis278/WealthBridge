# 🧩 Component Architecture Guide

## Project Structure

```
WealthBridge/
├── app/                          # Next.js 15 App Router pages
│   ├── layout.tsx                # Root layout with Navbar & FallingLeaves
│   ├── page.tsx                  # Home/Landing page
│   ├── globals.css               # Global styles & Tailwind directives
│   ├── education/page.tsx        # Financial Education Hub
│   ├── credit-builder/page.tsx   # Credit Builder Dashboard
│   ├── investing/page.tsx        # Smart Investing Simulator
│   ├── navigator/page.tsx        # AI Wealth Navigator
│   ├── mentorship/page.tsx       # Mentorship Hub
│   └── achievements/page.tsx     # Achievements & Leaderboard
├── components/
│   ├── Navbar.tsx                # Main navigation component
│   └── FallingLeaves.tsx         # Animated background effect
├── public/                       # Static assets
├── tailwind.config.ts            # Tailwind + custom theme
├── tsconfig.json                 # TypeScript configuration
└── package.json                  # Dependencies
```

## 🎨 Design System

### Colors (Tailwind Extended)
```typescript
// tailwind.config.ts
colors: {
  primary: "#C85C0E",      // Pumpkin Orange - buttons, highlights
  secondary: "#8B4513",    // Chestnut Brown - nav, text
  accent: "#F2C57C",       // Golden Wheat - icons, accents
  background: "#FFF8E7",   // Cream Beige - page backgrounds
  darkwood: "#6A4E23",     // Dark Wood - dividers, headers
  amber: "#FFAC4A",        // Amber Glow - hover states
}
```

### Gradients
```css
bg-gradient-fall       /* Amber to Orange */
bg-gradient-sunset     /* Amber → Orange → Brown */
```

### Typography
```typescript
font-sans    // Poppins - body text
font-serif   // Merriweather - headings
```

## 🧩 Reusable Components

### 1. Navbar Component
**Location**: `components/Navbar.tsx`

**Features**:
- Client-side navigation with `usePathname()`
- Active route highlighting
- Responsive design with mobile menu
- Icon + label navigation items

**Usage**:
```tsx
// Already included in layout.tsx
import Navbar from "@/components/Navbar";
```

### 2. FallingLeaves Component
**Location**: `components/FallingLeaves.tsx`

**Features**:
- 15 animated leaf elements
- Random positioning and timing
- Infinite loop animation
- Non-interactive (pointer-events-none)

**Technical Details**:
- Uses Framer Motion for animations
- Animates y-position, x-position, rotation, and opacity
- Each leaf has unique duration and delay

## 📄 Page Components

### Home Page (`app/page.tsx`)
**Sections**:
1. Hero section with gradient background
2. Features grid (3 cards)
3. Mission statement
4. CTA section

**Key Elements**:
- `motion.div` for animations
- `Link` components for navigation
- Icon components from `react-icons`

### Education Page (`app/education/page.tsx`)
**State Management**:
```typescript
const [modules, setModules] = useState<Module[]>([...])
const [showQuiz, setShowQuiz] = useState(false)
const [quizScore, setQuizScore] = useState<number | null>(null)
```

**Interactive Features**:
- Lesson completion tracking
- Progress bar calculations
- Modal quiz system
- Dynamic score generation

### Credit Builder (`app/credit-builder/page.tsx`)
**Data Visualization**:
- Credit score display with color coding
- Factor breakdown with progress bars
- Task completion interface
- Expert tips section

**Helper Functions**:
```typescript
const getScoreColor = (score: number) => {...}
const getStatusColor = (status: string) => {...}
```

### Investing Simulator (`app/investing/page.tsx`)
**Complex State**:
```typescript
interface Portfolio {
  [key: string]: {
    shares: number;
    avgPrice: number;
  };
}
```

**Features**:
- Real-time portfolio calculations
- Buy/Sell transactions
- Modal trading interface
- Virtual currency system

**Key Functions**:
```typescript
calculatePortfolioValue()
calculatePortfolioGainLoss()
handleBuy(stock: Stock)
handleSell(stock: Stock)
```

### Navigator (AI Chat) (`app/navigator/page.tsx`)
**Chat System**:
```typescript
interface Message {
  id: number;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}
```

**Features**:
- Message history
- Bot response logic
- Quick response buttons
- Streak & points tracking
- Achievement display

### Mentorship Hub (`app/mentorship/page.tsx`)
**Filtering System**:
```typescript
const filteredMentors = selectedCategory === 'all'
  ? mentors
  : mentors.filter((mentor) => 
      mentor.expertise.includes(selectedCategory)
    );
```

**Features**:
- Grid layout with cards
- Filter by expertise
- Modal for mentor details
- Scheduling interface

### Achievements Page (`app/achievements/page.tsx`)
**Gamification Elements**:
- Points system
- Level progression
- Achievement unlocking
- Leaderboard
- Tree growth visualization

**Components**:
1. User stats cards
2. Unlocked achievements grid
3. Locked achievements grid
4. Autumn tree visualization
5. Leaderboard sidebar

## 🎭 Animation Patterns

### Framer Motion Usage

**Page Load Animations**:
```tsx
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.8 }}
>
```

**Scroll-Triggered**:
```tsx
<motion.div
  initial={{ opacity: 0 }}
  whileInView={{ opacity: 1 }}
  viewport={{ once: true }}
>
```

**Staggered Children**:
```tsx
{items.map((item, index) => (
  <motion.div
    key={index}
    initial={{ opacity: 0, y: 30 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.1 }}
  >
))}
```

## 🎨 Styling Patterns

### Frosted Glass Effect
```tsx
className="frosted-glass rounded-2xl p-8 shadow-xl"
```

Defined in `globals.css`:
```css
.frosted-glass {
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.3);
}
```

### Gradient Buttons
```tsx
className="bg-primary hover:bg-amber text-white font-bold py-4 px-8 rounded-full"
```

### Card Hover Effects
```tsx
className="transform hover:scale-105 transition-all"
```

## 🔧 TypeScript Interfaces

### Common Interfaces
```typescript
// Lesson
interface Lesson {
  id: number;
  title: string;
  completed: boolean;
  locked: boolean;
}

// Stock
interface Stock {
  id: string;
  name: string;
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
}

// Mentor
interface Mentor {
  id: number;
  name: string;
  title: string;
  expertise: string[];
  rating: number;
  sessions: number;
  availability: string;
  bio: string;
  image: string;
}

// Achievement
interface Achievement {
  id: number;
  name: string;
  description: string;
  icon: any;
  unlocked: boolean;
  points: number;
  category: string;
}
```

## 🚀 Performance Tips

1. **Client Components**: All interactive pages use `'use client'` directive
2. **Lazy Loading**: Images and heavy components can be lazy-loaded
3. **Memoization**: Consider using `useMemo` for expensive calculations
4. **Code Splitting**: Next.js automatically splits code by route

## 🎯 Best Practices Implemented

1. **TypeScript**: Full type safety across the app
2. **Component Composition**: Reusable components (Navbar, FallingLeaves)
3. **State Management**: Local state with `useState` hooks
4. **Responsive Design**: Tailwind breakpoints (sm, md, lg, xl)
5. **Accessibility**: Semantic HTML and ARIA labels
6. **SEO**: Metadata in layout.tsx
7. **Performance**: Next.js optimization out of the box

## 🔄 Adding New Pages

1. Create new folder in `app/` directory
2. Add `page.tsx` file
3. Use `'use client'` if interactive
4. Add route to Navbar component
5. Follow existing animation patterns
6. Use design system colors and components

Example:
```tsx
// app/new-feature/page.tsx
'use client';

import React from 'react';
import { motion } from 'framer-motion';

export default function NewFeaturePage() {
  return (
    <div className="min-h-screen bg-background py-12">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-5xl font-bold text-secondary mb-4 font-serif">
            New Feature
          </h1>
        </motion.div>
      </div>
    </div>
  );
}
```

---

**This architecture supports easy scaling and feature additions!** 🚀
