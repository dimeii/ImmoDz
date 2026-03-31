# Frontend Design Skill Guide

Patterns et best practices pour le développement frontend ImmoDz.

---

## 🎨 Design System Tokens

### Colors
```typescript
const colors = {
  primary: {
    50: "#eff6ff",
    600: "#2563eb",   // Main action color
    700: "#1d4ed8",   // Hover state
  },
  success: "#10b981",
  warning: "#f59e0b",
  danger: "#ef4444",
  gray: {
    50: "#f9fafb",
    100: "#f3f4f6",
    500: "#6b7280",
    900: "#111827",
  }
};
```

### Typography
```typescript
const typography = {
  h1: "text-3xl font-bold",      // Page titles
  h2: "text-2xl font-semibold",  // Section headings
  h3: "text-xl font-semibold",   // Subsections
  body: "text-base",              // Regular text
  small: "text-sm text-gray-600", // Secondary text
  tiny: "text-xs text-gray-500",  // Labels
};
```

### Spacing
```
xs: 0.25rem (4px)
sm: 0.5rem (8px)
md: 1rem (16px)
lg: 1.5rem (24px)
xl: 2rem (32px)
2xl: 3rem (48px)
```

---

## 🧩 Component Patterns

### Button Variants
```typescript
// Primary (main action)
<button className="bg-primary-600 text-white hover:bg-primary-700 px-4 py-2 rounded-md transition-colors">
  Action
</button>

// Secondary (alternative)
<button className="bg-gray-100 text-gray-900 hover:bg-gray-200 px-4 py-2 rounded-md">
  Cancel
</button>

// Danger (destructive)
<button className="bg-red-600 text-white hover:bg-red-700 px-4 py-2 rounded-md">
  Delete
</button>

// Disabled
<button disabled className="bg-gray-300 text-gray-500 cursor-not-allowed px-4 py-2 rounded-md">
  Disabled
</button>
```

### Input Fields
```typescript
// Text input
<input
  type="text"
  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-600"
  placeholder="Placeholder text"
/>

// With label + error
<div>
  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
    Email
  </label>
  <input
    id="email"
    type="email"
    className="w-full px-3 py-2 border border-red-300 rounded-md focus:ring-2 focus:ring-red-500"
    aria-invalid="true"
    aria-describedby="email-error"
  />
  <p id="email-error" className="text-sm text-red-600 mt-1">
    Invalid email format
  </p>
</div>
```

### Card Component
```typescript
// Basic card
<div className="rounded-lg border border-gray-200 bg-white shadow-sm p-4">
  <h3 className="font-semibold text-gray-900">Card Title</h3>
  <p className="text-gray-600 mt-2">Card content goes here</p>
</div>

// Hoverable card (listing)
<div className="rounded-lg border border-gray-200 bg-white shadow-sm hover:shadow-md transition-shadow cursor-pointer">
  <img className="w-full h-48 object-cover rounded-t-lg" src="..." alt="..." />
  <div className="p-4">
    <h3 className="font-semibold">Listing Title</h3>
    <p className="text-primary-600 font-bold mt-1">50,000 DA</p>
  </div>
</div>
```

---

## 🎯 Layout Patterns

### Two-column (sidebar + content)
```typescript
<div className="flex h-screen">
  <aside className="w-80 border-r bg-gray-50 p-4 overflow-y-auto">
    {/* Sidebar */}
  </aside>
  <main className="flex-1 overflow-y-auto">
    {/* Main content */}
  </main>
</div>
```

### Grid responsive
```typescript
// Auto-responsive grid
<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
  {items.map(item => <Card key={item.id} {...item} />)}
</div>
```

### Flex center
```typescript
// Vertical + horizontal center
<div className="flex items-center justify-center h-64">
  <Spinner />
</div>
```

---

## 📱 Responsive Breakpoints

```
Default (mobile)  : 0px+
sm (tablet)       : 640px+
md (small desktop): 768px+
lg (desktop)      : 1024px+
xl (large)        : 1280px+
```

Usage:
```typescript
// Mobile: 1 column, tablet+: 2 columns, desktop+: 3
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
```

---

## ♿ Accessibility Checklist

- [ ] Semantic HTML (`<button>`, `<nav>`, `<main>`, not `<div>`)
- [ ] ARIA labels (`aria-label`, `aria-describedby`)
- [ ] Keyboard navigation (tab, enter, escape)
- [ ] Focus indicators (visible outline)
- [ ] Color contrast (WCAG AA ≥ 4.5:1 for text)
- [ ] Alt text on images
- [ ] Form labels linked with `htmlFor`
- [ ] Error messages associated with inputs

**Good Example:**
```typescript
<button
  aria-label="Open navigation menu"
  onClick={toggleMenu}
  className="focus:outline-none focus:ring-2 focus:ring-primary-600"
>
  <MenuIcon />
</button>

<input
  aria-label="Search listings"
  aria-describedby="search-help"
  placeholder="Search..."
/>
<p id="search-help" className="text-sm text-gray-500">
  Enter property type, location, or price range
</p>
```

---

## 🚀 Performance Optimizations

### Image Optimization
```typescript
import Image from 'next/image';

// ✅ Optimized
<Image
  src={photoUrl}
  alt="Listing photo"
  width={400}
  height={300}
  priority={isAboveFold}
  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
/>

// Cloudinary transform
const thumb = `${url}?w=400&h=300&c=fill&g=auto&q=auto&f=auto`;
```

### Code Splitting
```typescript
const AdminPanel = dynamic(
  () => import('@/components/admin/AdminPanel'),
  { loading: () => <Spinner /> }
);
```

### Memoization
```typescript
// Prevent unnecessary re-renders
const ListingCard = React.memo(({ listing }) => (
  <div>{listing.title}</div>
));

// Expensive computation
const results = useMemo(() => computeSearch(query, filters), [query, filters]);
```

---

## 🧪 Component Testing

### Unit Test Pattern
```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { AnnonceCard } from '@/components/annonces/AnnonceCard';

describe('AnnonceCard', () => {
  const mockListing = {
    id: '1',
    title: 'Apt 2ch',
    price: 50000,
    transactionType: 'RENT',
    propertyType: 'APARTMENT',
    wilaya: 'Alger',
  };

  it('renders title and price', () => {
    render(<AnnonceCard {...mockListing} />);
    expect(screen.getByText('Apt 2ch')).toBeInTheDocument();
    expect(screen.getByText('50,000 DA/mois')).toBeInTheDocument();
  });

  it('is accessible', () => {
    const { container } = render(<AnnonceCard {...mockListing} />);
    expect(container.querySelector('button')).toHaveClass('focus:ring-2');
  });
});
```

---

## 🎨 Dark Mode (Optional, Future)

When implementing dark mode:
```typescript
// src/app/globals.css
@media (prefers-color-scheme: dark) {
  :root {
    @apply bg-gray-950 text-white;
  }
}

// Component
<div className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
  Content
</div>
```

---

## 📚 Common UI States

### Loading State
```typescript
{isLoading ? (
  <div className="flex items-center justify-center h-64">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
  </div>
) : (
  <div>{children}</div>
)}
```

### Empty State
```typescript
<div className="flex flex-col items-center justify-center h-64 bg-gray-50 rounded-lg">
  <p className="text-lg font-medium text-gray-600">No listings found</p>
  <p className="text-sm text-gray-500 mt-1">Try adjusting your filters</p>
</div>
```

### Error State
```typescript
{error && (
  <div className="rounded-lg bg-red-50 border border-red-200 p-4 text-red-700">
    <p className="font-medium">Error loading listings</p>
    <p className="text-sm mt-1">{error.message}</p>
    <button
      onClick={retry}
      className="text-red-700 underline hover:text-red-900 text-sm mt-2"
    >
      Try again
    </button>
  </div>
)}
```

---

## 🔗 Useful Tools

- **Tailwind Play** : https://play.tailwindcss.com/
- **Tailwind UI** : https://tailwindui.com/ (free components)
- **Headless UI** : https://headlessui.com/ (accessible components)
- **Radix UI** : https://www.radix-ui.com/ (alternative)

---

**Last Updated** : 31 mars 2026
