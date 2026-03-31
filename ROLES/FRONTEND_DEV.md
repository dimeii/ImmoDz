# Frontend Developer — ImmoDz

## 🎯 Role Summary

Responsable de l'expérience utilisateur, composants React, styles Tailwind, et interactions côté client. Crée des UIs réactives, accessibles et performantes.

---

## 📋 Responsabilités

- ✅ Implémenter des composants React/TypeScript
- ✅ Concevoir et maintenir le système de design (Tailwind)
- ✅ Gérer état client (React hooks, SWR)
- ✅ Intégrer avec API backend
- ✅ Optimiser performance frontend (Lighthouse)
- ✅ Assurer accessibilité (a11y, WCAG 2.1)
- ✅ Tester composants (unit + E2E)
- ✅ Responsive design (mobile-first)

---

## 🎨 Design System & Tailwind

### Colors
```css
primary: blue-600 (#2563eb)  /* Actions, highlights */
success: green-600           /* Approvals, done */
warning: amber-500           /* Caution, pending */
danger: red-600              /* Errors, delete */
gray: gray-*                 /* Neutral, text */
```

### Spacing
```
sm: 0.5rem (8px)
md: 1rem (16px)
lg: 1.5rem (24px)
xl: 2rem (32px)
```

### Typography
```
h1: text-3xl font-bold
h2: text-2xl font-semibold
h3: text-xl font-semibold
body: text-base
small: text-sm
```

### Components Patterns
```typescript
// Button
<button className="rounded-md bg-primary-600 px-4 py-2 text-white hover:bg-primary-700 transition-colors">
  Label
</button>

// Input
<input className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm" />

// Card
<div className="rounded-lg border bg-white shadow-sm">
  {children}
</div>
```

---

## 🔄 Component Development Workflow

### Phase 1 : Design
- [ ] Lire spec PM (acceptance criteria, wireframe)
- [ ] Identifier composition (parent + children)
- [ ] Sketcher layout (grid/flex)
- [ ] Valider avec designer (Figma)

### Phase 2 : Implementation
- [ ] Créer folder `/components/[feature]/`
- [ ] Implémenter component principal
- [ ] Ajouter sous-composants réutilisables
- [ ] Ajouter Tailwind styles
- [ ] Ajouter TypeScript props + types

### Phase 3 : Interactivity
- [ ] État local (useState)
- [ ] Effects (useEffect pour fetch, cleanup)
- [ ] SWR pour API calls
- [ ] Form validation (Zod)
- [ ] Error states

### Phase 4 : Testing
- [ ] Unit tests (@testing-library/react)
- [ ] Snapshot tests
- [ ] Integration tests (avec API mocks)
- [ ] E2E tests (user flows)

### Phase 5 : Optimization
- [ ] Code splitting (lazy load si needed)
- [ ] Memoization (React.memo, useMemo si needed)
- [ ] Image optimization (next/image)
- [ ] Lighthouse audit

---

## 📁 Component Architecture

```
src/components/
├── ui/                      /* Éléments de base réutilisables */
│   ├── Button.tsx
│   ├── Input.tsx
│   ├── Card.tsx
│   ├── Modal.tsx
│   ├── Navbar.tsx
│   └── SearchFilters.tsx
├── forms/                   /* Formulaires */
│   ├── ListingForm.tsx      /* Créer/éditer annonce */
│   ├── PhotoUploadDnD.tsx
│   └── ProfileForm.tsx
├── annonces/                /* Features annonces */
│   ├── AnnonceCard.tsx
│   ├── AnnonceList.tsx
│   └── PhotoGallery.tsx
├── map/                     /* Carte interactive */
│   ├── MapView.tsx
│   ├── MapPin.tsx
│   └── ClusterPin.tsx
├── dashboard/               /* Dashboard pages */
│   ├── MyListingsTable.tsx
│   ├── MessagesLog.tsx
│   └── ProfileForm.tsx
└── providers/               /* Context providers */
    └── SessionProvider.tsx
```

---

## 🎯 Current Pages Status

### Implemented ✅
- `/` — Homepage avec carte + liste + filtres
- `/annonces/[id]` — Fiche annonce + photos + contact form
- `/login` — Form connexion
- `/register` — Form inscription
- `/recherche` — Redirects vers `/`

### Todo 🔨
- `/annonces/nouvelle` — Form créer annonce
- `/annonces/[id]/edit` — Form éditer annonce
- `/dashboard` — Dashboard utilisateur (3 onglets)
- `/agence` — Gestion agence (DIRECTOR)
- `/admin` — Admin panel (ADMIN)

---

## 🧠 State Management

### Local State (useState)
```typescript
const [filters, setFilters] = useState<Record<string, string>>({});
const [isLoading, setIsLoading] = useState(false);
```

### API Data Fetching (SWR)
```typescript
const { data, isLoading, error } = useSWR('/api/annonces', fetcher);
```

### Session/Auth (NextAuth)
```typescript
const { data: session } = useSession();
if (!session) redirect('/login');
```

### Form State (React Hook Form + Zod)
```typescript
const { register, handleSubmit, formState: { errors } } = useForm<ListingInput>({
  resolver: zodResolver(createListingSchema),
});
```

---

## 🎨 Responsive Design Checklist

- [ ] Mobile-first (write mobile, then add breakpoints)
- [ ] Tested sur viewport widths : 320px, 640px, 1024px, 1280px
- [ ] Touch-friendly (buttons ≥ 44x44px)
- [ ] Images responsive (srcset, next/image)
- [ ] Readable text (16px+ pour body, good contrast)
- [ ] Readable links (underlined or color-contrasted)

### Tailwind Breakpoints
```
sm: 640px   (tablets)
md: 768px   (small desktop)
lg: 1024px  (desktop)
xl: 1280px  (large screens)
```

---

## ♿ Accessibility Checklist

- [ ] Semantic HTML (button, nav, main, etc.)
- [ ] ARIA labels (aria-label, aria-describedby)
- [ ] Keyboard navigation (tab, enter, escape)
- [ ] Focus indicators (visible outline)
- [ ] Color contrast (WCAG AA minimum)
- [ ] Image alt text (descriptive)
- [ ] Form labels associated (htmlFor)
- [ ] Error messages linked (aria-invalid)
- [ ] Skip links (mobile)

```typescript
// Good
<button aria-label="Open menu" onClick={toggle}>
  <MenuIcon />
</button>

<input
  aria-label="Search annonces"
  aria-describedby="search-help"
  placeholder="Titre, localisation..."
/>
<p id="search-help">Séparer les termes par des espaces</p>

// Bad
<div onClick={toggle}>Menu</div>  // Not keyboard accessible
<img src="logo.png" />              // No alt text
```

---

## 📊 Performance Optimization

### Image Optimization
```typescript
import Image from 'next/image';

<Image
  src={photoUrl}
  alt="Listing photo"
  width={400}
  height={300}
  priority={isAboveFold}
/>

// Cloudinary transforms
const thumb = `${url}?w=400&h=300&c=fill&g=auto`;
```

### Code Splitting
```typescript
const AdminPanel = dynamic(() => import('@/components/admin/AdminPanel'), {
  loading: () => <Spinner />,
});
```

### Memoization
```typescript
const AnnonceCard = React.memo(({ listing }) => {
  return <div>{listing.title}</div>;
});

const expensive = useMemo(() => computeHeavyData(data), [data]);
```

### Lighthouse Targets
- Performance: ≥ 80
- Accessibility: ≥ 90
- Best Practices: ≥ 85
- SEO: ≥ 90

---

## 🧪 Testing Requirements

### Unit Tests (Jest + React Testing Library)
```typescript
describe('AnnonceCard', () => {
  it('renders title and price', () => {
    render(<AnnonceCard listing={mockListing} />);
    expect(screen.getByText('Title')).toBeInTheDocument();
    expect(screen.getByText(/100,000 DA/)).toBeInTheDocument();
  });

  it('navigates to detail on click', () => {
    render(<AnnonceCard listing={mockListing} />);
    fireEvent.click(screen.getByRole('button'));
    expect(router.push).toHaveBeenCalledWith('/annonces/123');
  });
});
```

### E2E Tests (Playwright)
```typescript
test('user can search and filter listings', async ({ page }) => {
  await page.goto('/');
  await page.click('[data-testid="filter-transaction-sale"]');
  await page.fill('[data-testid="filter-wilaya"]', '16'); // Alger
  await page.click('[data-testid="toggle-list-view"]');
  await expect(page.locator('[data-testid="listing-card"]').first()).toBeVisible();
});
```

---

## 📋 Definition of Done (Frontend)

- [ ] Component implémenté (structure + styles)
- [ ] Responsive (mobile + desktop)
- [ ] Accessible (a11y checklist passée)
- [ ] TypeScript sans erreurs
- [ ] Unit tests (coverage ≥ 80%)
- [ ] E2E tests pour user flows
- [ ] Lighthouse ≥ 80 (perf, a11y, etc.)
- [ ] API integrated (SWR, error handling)
- [ ] Loading + error states
- [ ] Code review passée
- [ ] Storybook story (si component réutilisable)
- [ ] Documentation (props, usage examples)

---

## 🎬 Common Patterns

### Formulaire avec validation
```typescript
export function ListingForm() {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(createListingSchema),
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div>
        <label htmlFor="title">Titre</label>
        <input {...register('title')} />
        {errors.title && <p className="text-red-600">{errors.title.message}</p>}
      </div>
    </form>
  );
}
```

### Fetch data avec SWR
```typescript
export function ListingsList() {
  const { data, isLoading, error } = useSWR('/api/annonces', fetcher);

  if (isLoading) return <Spinner />;
  if (error) return <Error message={error.message} />;

  return (
    <div className="grid grid-cols-3">
      {data.annonces.map((l) => <AnnonceCard key={l.id} listing={l} />)}
    </div>
  );
}
```

### Conditionally show content
```typescript
const { data: session } = useSession();

{session?.user?.role === 'ADMIN' && (
  <Link href="/admin">Admin Panel</Link>
)}
```

---

## 🛠️ Commands

```bash
# Dev & build
npm run dev                    # Dev server on :3000
npm run build                  # Production build
npm start                      # Run production build

# Testing
npm run test                   # Jest
npm run test:watch             # Watch mode
npm run test:e2e               # Playwright
npm run test:coverage          # Coverage report

# Linting
npm run lint                   # ESLint
npx tsc --noEmit               # TypeScript check

# Storybook (optional)
npm run storybook              # Dev on :6006
npm run storybook:build        # Build static
```

---

## 📚 Component API Template

```typescript
/**
 * AnnonceCard — Displays a single listing card
 *
 * @example
 * <AnnonceCard
 *   id="123"
 *   title="Appartement 2ch à Alger"
 *   price={50000}
 *   transactionType="RENT"
 *   wilaya="Alger"
 *   thumbnail="https://..."
 * />
 */

interface AnnonceCardProps {
  id: string;
  title: string;
  price: number;
  transactionType: 'RENT' | 'SALE';
  propertyType: string;
  surface?: number | null;
  rooms?: number | null;
  wilaya: string;
  thumbnail?: string | null;
}

export default function AnnonceCard(props: AnnonceCardProps) {
  // Component code
}
```

---

## 💡 Code Style & Conventions

1. **Components** : PascalCase, one per file
2. **Props** : Destructure when reasonable, use interfaces
3. **Hooks** : Extract custom hooks for reusable logic
4. **CSS** : Utility-first Tailwind, avoid custom CSS
5. **Naming** : Descriptive names (SearchFilters not SF)
6. **Comments** : Explain WHY, not WHAT
7. **Imports** : Absolute paths (@/components/*)
8. **Error Boundaries** : Wrap routes/pages

---

**Owner** : Frontend Developer
**Last Updated** : 31 mars 2026
