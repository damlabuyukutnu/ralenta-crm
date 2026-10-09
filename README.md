# Ralenta

Ralenta is a CRM and sales pipeline application for a small sales team. It covers lead management, contacts, companies, a drag-and-drop sales pipeline, follow-up activities, and sales analytics — built as a front-end portfolio project.

**Live demo:** not deployed yet.

## How this app stores data

Ralenta does not use a backend, database, or authentication provider. All data lives in the browser's `localStorage`:

- On first load, the app seeds a realistic demo dataset (companies, contacts, leads, opportunities, activities).
- Every create, edit, delete, and pipeline stage change is written straight to `localStorage` and survives page refreshes.
- Data is scoped to the browser you're using. It is **not** synced across devices, browsers, or users, and is **not** sent to any server.
- Clearing your browser's site data removes it. Using the "Reset demo data" action in the sidebar restores the original seed dataset at any time.

The "Admin" / "Sales Representative" roles and the account switcher in the sidebar are a **UI simulation only**. There is no authentication, no access control, and no real security boundary — switching users is just a convenience for exploring how the app's role-aware UI (like the Team page) looks for each persona.

## Features

- **Overview** — live counts, won revenue, conversion rate, pipeline-by-stage breakdown, a revenue chart, upcoming follow-ups, and a recent activity feed, all computed from the current data.
- **Leads** — search, filter by status/source/owner, create/edit/delete, a detail page, and a "Convert to contact" action that creates a contact (and company, if provided) from a lead.
- **Contacts** — search, filter by company, create/edit/delete, and a detail page with linked company, opportunities, and activities.
- **Companies** — search, create/edit/delete, and a detail page with linked contacts and opportunities.
- **Pipeline** — a six-stage Kanban board (New, Qualified, Proposal, Negotiation, Won, Lost) with native drag-and-drop and a menu-based "Move to" fallback for touch devices; create/edit/delete opportunities; a detail page with full activity history.
- **Activities** — calls, meetings, emails, tasks, and notes, filterable by All / Upcoming / Overdue / Completed, with a one-click complete toggle and a link back to whichever lead, contact, company, or opportunity they're attached to.
- **Analytics** — leads by source, opportunities by stage, won vs. lost, and revenue over a selectable date range, with honest empty states instead of misleading zero-based percentages.
- Responsive layout (desktop, tablet, mobile), accessible form labels and dialogs, confirmation prompts before every delete, and toast notifications for success/error feedback.

## Tech stack

- [Next.js](https://nextjs.org) (App Router) + [React](https://react.dev) + [TypeScript](https://www.typescriptlang.org)
- [Tailwind CSS](https://tailwindcss.com) for styling
- [React Hook Form](https://react-hook-form.com) + [Zod](https://zod.dev) for form state and validation
- [Recharts](https://recharts.org) for charts
- [Lucide React](https://lucide.dev) for icons
- Browser `localStorage`, wrapped in a small `useSyncExternalStore`-based store — no database, backend, or API layer

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). No environment variables or external services are required — the app seeds itself on first load.

## Project structure

```
src/
  app/(dashboard)/        Route group for every dashboard page (overview, leads, contacts, companies, pipeline, activities, analytics, team)
  components/ui/          Reusable primitives (button, input, dialog, table, toast, ...)
  components/layout/      App shell, sidebar, topbar, user/role switcher
  components/<feature>/   Forms and feature-specific pieces (leads, contacts, companies, pipeline, activities, overview)
  lib/data/               Seed data, the localStorage store, CRUD functions, and computed metrics
  lib/validations/        Zod schemas for every form
  lib/types/crm.ts        Shared TypeScript types for every entity
```

## Deploying to Vercel

The app is a standard Next.js project with no environment variables to configure:

1. Push this repository to GitHub.
2. Import it into [Vercel](https://vercel.com/new).
3. Deploy — there is nothing else to set up, since there is no database or auth provider in the loop.

After deploying, add the live URL to this README.

## Checklist

**Implemented and tested in this build:**
- Full CRUD for leads, contacts, companies, and opportunities, backed by `localStorage`
- Lead-to-contact conversion
- Drag-and-drop pipeline with a click-based fallback for touch devices
- Activity tracking with completion state and overdue/upcoming filtering
- Dashboard metrics and analytics computed from live data, with empty/zero-data states
- Responsive layout from mobile to desktop
- Demo role switcher and a one-click demo data reset

**Explicitly out of scope for this build:**
- Any real backend, database, or authentication — this is a front-end-only demo
- Multi-device or multi-browser data sync
- Enforced, server-verified permissions tied to the Admin/Sales Representative roles
