# Dashboard UI Overhaul — Design Document

**Date:** 2026-06-07  
**Status:** Approved  
**Repo:** yetti-clone (Next.js)

---

## Goal

Redesign all dashboard pages to use the new design token system consistently, replace noisy gradient hero banners with clean page headers, fix the hover-expand sidebar, and establish a single repeatable pattern across every page.

---

## Design Language

**Mode:** Light mode only  
**Font:** Inter (already set in layout.tsx)  
**Color tokens:** `bg-background` (#F9FAFB), `bg-surface` (#FFFFFF), `text-text-primary`, `text-text-muted`, `text-brand` (#0F766E), `border-border` (#E5E7EB)  
**Zero raw hex or `slate-*` classes in dashboard pages**

---

## Layout System

### Sidebar
- **Fixed 240px** when expanded, **64px** icon-only when collapsed (toggle button, not hover)
- Mobile: off-canvas drawer with overlay, hamburger toggle
- Active nav item: `bg-brand/10 text-brand` left border indicator `border-l-2 border-brand`
- Inactive: `text-text-muted hover:text-text-primary hover:bg-background`
- Bottom: user avatar + name + sign-out

### Top bar
- Height 56px, `bg-surface border-b border-border`
- Left: mobile hamburger + page breadcrumb (current page name)
- Right: workspace switcher dropdown + notification bell + user avatar

### Content area
- `max-w-[1280px] mx-auto px-6 py-6`
- Mobile: `px-4 py-4`

---

## Page Header Pattern (replaces gradient banners)

Every page uses this exact pattern at the top:

```tsx
<div className="flex items-center justify-between mb-6">
  <div className="flex items-center gap-3">
    <div className="w-10 h-10 rounded-xl bg-brand/10 flex items-center justify-center">
      <PageIcon className="w-5 h-5 text-brand" />
    </div>
    <div>
      <h1 className="text-xl font-bold text-text-primary">Page Title</h1>
      <p className="text-sm text-text-muted">Subtitle</p>
    </div>
  </div>
  <ActionButton /> {/* optional */}
</div>
```

---

## Card Pattern

```tsx
<div className="bg-surface border border-border rounded-xl p-5 hover:shadow-card transition-shadow">
  ...
</div>
```

---

## Pages in Scope

### 1. DashboardShell
- Replace hover-expand with click-toggle sidebar (button in sidebar header)
- Fixed width sidebar, no layout jumps
- Consistent nav item active/inactive states with brand token
- Clean top bar with workspace switcher + bell + avatar
- Mobile: off-canvas overlay drawer

### 2. Dashboard Home
- Remove gradient welcome banner + emoji
- Simple greeting text: "Good morning, {name}" in `text-text-primary`
- 3 stat cards in a row: Total Messages, Connected Channels, Active Bots
- Single `loading` state for all (not 3 separate spinners)
- TrialNotificationsWidget kept
- Quick actions row: "Create Bot", "Connect Channel", "View Inbox"

### 3. Bots Page
- Remove gradient banners
- Bot cards: `bg-surface border border-border rounded-xl` with bot avatar, name, model badge, channel badge
- Action buttons: Edit, Embed, Monetize, Delete — icon buttons with tooltips
- Empty state: centered, "No bots yet", + Create Bot button
- Bot creation/edit stays as existing wizard

### 4. Inbox Page
- Keep existing dual-pane functionality (don't break)
- Migrate color tokens only: `slate-*` → `text-text-*`, `dashboard-*` → `border-border`/`bg-surface`
- Conversation list: cleaner row hover state
- Message area: consistent bubble styling with brand color for bot messages

### 5. Integrations Page
- Remove gradient banner → page header pattern
- Platform cards: logo + name + status badge (Connected/Coming Soon)
- "Coming soon" badge: `bg-border text-text-muted`
- "Connected" badge: `bg-success/10 text-success`

### 6. Triggers Page
- Remove gradient banner → page header pattern
- Trigger rows: table-style list with keyword, media type, status toggle
- Consistent with bots/CRM table patterns

### 7. Knowledge Base Page
- Remove gradient banner → page header pattern
- Keep existing content structure, migrate tokens

### 8. Settings Page
- Remove gradient banner → page header pattern
- Section cards: each section (Profile, Notifications, Security) in its own `bg-surface border border-border rounded-xl` card
- Save button: `bg-brand` consistent styling

### 9. Workspaces Page
- Remove gradient banner → page header pattern
- Members table: clean rows with avatar, name, role badge, actions
- Invite form: card with email input + role select + Send button

### 10. CRM Page
- Already uses new tokens — minor cleanup
- Ensure stat cards match the dashboard home stat card pattern

---

## Anti-patterns to Remove

- `bg-gradient-to-br from-teal-primary via-[#0d6159] to-slate-800` — replace with page header pattern
- `bg-teal-primary`, `text-teal-accent`, `border-teal-primary` — replace with `bg-brand`, `text-brand`, `border-brand`
- `bg-dashboard-bg`, `bg-dashboard-card`, `border-dashboard-border` — replace with `bg-background`, `bg-surface`, `border-border`
- `text-slate-*`, `bg-slate-*` — replace with semantic tokens
- Emoji icons (👋) — remove or replace with Lucide icons
- Hover-expand sidebar — replace with click-toggle

---

## Execution Order

Task order matters because DashboardShell wraps everything:

1. DashboardShell (foundation — all pages depend on this)
2. Dashboard home
3. Bots
4. Inbox (token migration only — no functional changes)
5. Integrations
6. Triggers
7. Knowledge Base
8. Settings
9. Workspaces
10. CRM cleanup
