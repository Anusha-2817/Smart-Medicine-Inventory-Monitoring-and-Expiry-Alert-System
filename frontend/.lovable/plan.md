
## Goal

Build a marketing landing page (`/`) and a Dashboard (`/dashboard`) for the Smart Medicine Inventory & Expiry Alert System. Take structural and polish cues from vengilabs.in (large hero, sectioned scroll, confident typography, generous spacing, smooth motion) but with a distinct healthcare-grade visual identity — NOT dark/neon/agency.

## Theme (different from vengilabs.in)

- **Palette — "Pharma Navy + Mint"**
  - Background: near-white off-cream `oklch(0.985 0.005 100)`
  - Foreground/primary: deep navy `oklch(0.22 0.05 250)`
  - Accent: emerald/mint `oklch(0.72 0.16 165)`
  - Soft surface: pale mint `oklch(0.97 0.02 165)`
  - Warning/expiry: amber + red tokens for status pills
- **Typography**: Display — `Instrument Serif` for headlines (editorial, trustworthy); Body — `Inter` for UI. Loaded via `<link>` in `__root.tsx`.
- **Mood**: clinical confidence, calm, premium SaaS — not playful, not dark.
- All tokens live in `src/styles.css` under `@theme` + `:root` (oklch only).

## Page 1 — Landing (`/`)

Vengilabs-style rhythm, healthcare content:

1. **Sticky top nav** — wordmark "MediStock" left, links (Product, Dashboard, Features, Contact), CTA "Open dashboard".
2. **Hero** — oversized serif headline ("Inventory intelligence for modern pharmacies"), supporting paragraph, two CTAs (Open Dashboard → `/dashboard`, See features). Subtle floating mock KPI cards on the right (Total Medicines, Expiring 30d, Low Stock) with soft shadow + gradient blob behind.
3. **Marquee / trust strip** — fake pharmacy chain logos in muted mono.
4. **Feature grid** — 6 capability cards mapped to backend modules: Batch tracking, Expiry alerts, Stock movements, Supplier mgmt, Purchase orders, Import/Export. Each: lucide icon, title, 1-line description.
5. **Big quote / pull statement** section — large serif quote about reducing expired stock.
6. **"Built for the pharmacy workflow"** — alternating image/text rows (zigzag): 3 rows showing Dashboard preview, Alerts preview, Stock movements preview (rendered mock UI screenshots inside rounded device frames, not real images).
7. **Stats band** — 4 large numbers (e.g., "0 expired SKUs missed", "12 modules", "Real-time alerts", "CSV + XLSX I/O").
8. **CTA footer band** — "Ready to see it live?" → Dashboard button.
9. **Footer** — minimal, columns for Product / Company / Legal, copyright.

Motion: gentle fade-up on scroll using framer-motion (already-compatible, install if needed); subtle hover lifts on cards. No heavy WebGL.

## Page 2 — Dashboard (`/dashboard`)

Sidebar shell + dashboard content (mock data, no backend):

- **Layout**: Shadcn `Sidebar` (collapsible icon) on the left listing all 12 modules from the PDF (Dashboard, Medicines, Inventory, Stock Movements, Suppliers, Purchase Orders, Alerts, Notifications, Import/Export, Reports, Users, Settings). Only Dashboard route is functional; other links route to `/dashboard` for now (clearly visible in sidebar so the full IA is shown).
- **Top bar**: SidebarTrigger, page title "Dashboard", search input (visual), user avatar.
- **KPI Cards** (6, per PDF): Total Medicines 1,250 · Total Batches 3,420 · Low Stock 17 · Expiring 30d 45 · Expired 8 · Suppliers 32. Each card: label, big number, small delta, lucide icon, soft tinted background per category (mint for healthy, amber for warning, red for expired).
- **Charts row** (using `recharts` — already in shadcn ecosystem):
  - Bar — Stock Distribution by medicine (top 8).
  - Line — Expiry Trend by month (next 6 months).
  - Pie — Supplier Contribution.
- **Recent Activity panel** — vertical timeline list with icon + type pill (Medicine Created, Stock Added, Stock Removed, Alert Generated, PO Created), timestamp, actor.
- **Expiry severity legend** at the bottom showing SAFE/WARNING/CRITICAL/EXPIRED pills matching the PDF color spec.

All data is hardcoded in a `src/lib/mock-dashboard.ts` file.

## Technical Section

### Files to create

```
src/styles.css                          (extend @theme with navy/mint tokens, fonts)
src/routes/__root.tsx                   (add <link> tags for Instrument Serif + Inter)
src/routes/index.tsx                    (replace placeholder → full landing)
src/routes/dashboard.tsx                (layout w/ SidebarProvider + <Outlet/>)
src/routes/dashboard.index.tsx          (Dashboard content: KPIs, charts, activity)
src/components/site/Navbar.tsx
src/components/site/Footer.tsx
src/components/site/HeroFloatingCards.tsx
src/components/site/FeatureGrid.tsx
src/components/site/ZigzagShowcase.tsx
src/components/site/StatsBand.tsx
src/components/site/CtaBand.tsx
src/components/app/AppSidebar.tsx
src/components/app/KpiCard.tsx
src/components/app/StockDistributionChart.tsx
src/components/app/ExpiryTrendChart.tsx
src/components/app/SupplierPieChart.tsx
src/components/app/RecentActivity.tsx
src/lib/mock-dashboard.ts
```

### Dependencies

- `framer-motion` (install via `bun add framer-motion`) — scroll fade-ups.
- `recharts` — likely already present via shadcn `chart.tsx`; verify and skip install if so.

### Routing notes

- `dashboard.tsx` is the layout (renders `<SidebarProvider>` + `<Outlet/>`); `dashboard.index.tsx` is the `/dashboard` leaf. Sidebar links for non-built modules point to `/dashboard` (same href) so they don't 404; this is acceptable for the demo.
- Each route sets its own `head()` with unique title/description/og.

### Out of scope (deferred)

- Other 11 module pages (Medicines, Inventory, Stock Movements, etc.) — sidebar shows them but they aren't built.
- Auth, Lovable Cloud, real data, CSV import logic.
- Real images (no `lov-image-placeholder` blocks needed — mock UI is rendered in DOM, not generated images).

## Deliverable

A polished landing page + a fully populated mock Dashboard, both navigable, both responsive, both reflecting the navy/mint healthcare theme — visually clearly distinct from vengilabs.in's dark agency look but matching its rhythm and polish bar.
