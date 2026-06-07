# Dashboard UI Overhaul — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use godmode:task-runner to implement this plan task-by-task.

**Goal:** Redesign all 10 dashboard pages to use the new design token system consistently, replace gradient hero banners with a clean page-header pattern, and convert the hover-expand sidebar to click-toggle.

**Architecture:** Token migration throughout (old `slate-*`/`dashboard-*`/`teal-*` → new semantic tokens). DashboardShell rebuilt first since it wraps every page. Each subsequent page replaces its gradient banner + migrates tokens. No functional changes except sidebar toggle behavior.

**Tech Stack:** Next.js 15, TypeScript, Tailwind CSS, Lucide React, Inter font

---

## Token Reference (old → new)

| Old class | New class |
|-----------|-----------|
| `bg-dashboard-card` | `bg-surface` |
| `bg-dashboard-bg` | `bg-background` |
| `border-dashboard-border` | `border-border` |
| `text-slate-900` | `text-text-primary` |
| `text-slate-700` / `text-slate-800` | `text-text-secondary` |
| `text-slate-500` / `text-slate-600` | `text-text-muted` |
| `text-slate-400` | `text-text-muted` |
| `text-teal-primary` | `text-brand` |
| `bg-teal-primary` | `bg-brand` |
| `bg-teal-primary/10` | `bg-brand/10` |
| `hover:bg-teal-accent` | `hover:bg-brand-light` |
| `hover:text-teal-accent` | `hover:text-brand-light` |
| `border-teal-primary` | `border-brand` |
| `ring-teal-primary` | `ring-brand` |
| `text-teal-accent` | `text-brand-light` |
| `hover:bg-dashboard-bg` | `hover:bg-background` |
| `hover:bg-dashboard-card` | `hover:bg-surface` |
| `hover:text-slate-900` | `hover:text-text-primary` |
| `shadow-teal-primary` | `shadow-brand` |

## Page Header Pattern (replaces ALL gradient banners)

```tsx
{/* Page Header */}
<div className="flex items-center justify-between mb-6">
  <div className="flex items-center gap-3">
    <div className="w-10 h-10 rounded-xl bg-brand/10 flex items-center justify-center shrink-0">
      <IconName className="w-5 h-5 text-brand" aria-hidden="true" />
    </div>
    <div>
      <h1 className="text-xl font-bold text-text-primary">Page Title</h1>
      <p className="text-sm text-text-muted">Page subtitle</p>
    </div>
  </div>
  {/* Action button if needed */}
</div>
```

## Verification command (every task)

```bash
cd /Users/affanzahir/code/yetti-clone
npx tsc --noEmit 2>&1 | head -10
```
Expected: no output (zero errors).

---

## Task 1: DashboardShell — Sidebar toggle + token migration

**File:** `app/dashboard/DashboardShell.tsx`

### Step 1: Change sidebarExpanded default to true

Find:
```tsx
const [sidebarExpanded, setSidebarExpanded] = useState(false);
```
Replace with:
```tsx
const [sidebarExpanded, setSidebarExpanded] = useState(true);
```

### Step 2: Remove hover behavior from aside element

Find:
```tsx
      <aside
        onMouseEnter={() => setSidebarExpanded(true)}
        onMouseLeave={() => setSidebarExpanded(false)}
        className={`fixed inset-y-0 left-0 z-50 bg-dashboard-card border-r border-dashboard-border transition-all duration-300 ease-in-out shadow-sm ${
```
Replace with:
```tsx
      <aside
        className={`fixed inset-y-0 left-0 z-50 bg-surface border-r border-border transition-all duration-300 ease-in-out shadow-sm ${
```

### Step 3: Add ChevronLeft + ChevronRight to lucide imports

Find the lucide-react import block and add `ChevronLeft, ChevronRight` if not present.

### Step 4: Replace sidebar header (logo area + add toggle button)

Find the entire logo div (from `<div className="flex h-20 items-center border-b border-dashboard-border` to its closing `</div>`):

```tsx
          {/* Logo */}
          <div className="flex h-20 items-center border-b border-dashboard-border px-3 md:px-6">
            {/* Expanded sidebar logo */}
            {(sidebarExpanded || mobileSidebarOpen) && (
              <Link
                href="/"
                className="flex items-center gap-3 transition-all duration-300"
              >
                <Image
                  src="/yetti/logo2.jpg"
                  alt="Admin Logo"
                  width={40}
                  height={40}
                  className="shrink-0"
                />
                <div className="text-2xl font-extrabold tracking-tight text-slate-900">
                  Admin
                </div>
              </Link>
            )}

            {/* Collapsed sidebar logo - centered */}
            {!sidebarExpanded && !mobileSidebarOpen && (
              <Link
                href="/"
                className="flex items-center justify-center w-full"
              >
                <Image
                  src="/yetti/logo2.jpg"
                  alt="Admin Logo"
                  width={48}
                  height={48}
                  className="shrink-0"
                />
              </Link>
            )}

            {/* Mobile Close Button */}
            {mobileSidebarOpen && (
              <button
                onClick={() => setMobileSidebarOpen(false)}
                className="ml-auto p-2 rounded-lg text-slate-400 hover:bg-dashboard-bg hover:text-slate-900 transition-colors"
                aria-label={t("dashboard.workspaceSelector.closeSidebar")}
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>
```

Replace with:

```tsx
          {/* Logo + Toggle */}
          <div className="flex h-16 items-center border-b border-border px-3 gap-2">
            <Link
              href="/"
              className={`flex items-center gap-2.5 min-w-0 flex-1 ${!sidebarExpanded && !mobileSidebarOpen ? "justify-center" : ""}`}
            >
              <Image
                src="/yetti/logo2.jpg"
                alt="Yetti"
                width={32}
                height={32}
                className="shrink-0 rounded-lg"
              />
              {(sidebarExpanded || mobileSidebarOpen) && (
                <span className="text-lg font-bold text-text-primary truncate">Yetti</span>
              )}
            </Link>
            {/* Desktop toggle */}
            <button
              onClick={() => setSidebarExpanded((v) => !v)}
              className="hidden md:flex items-center justify-center w-7 h-7 rounded-lg text-text-muted hover:text-text-primary hover:bg-background transition-colors shrink-0 cursor-pointer"
              aria-label={sidebarExpanded ? "Collapse sidebar" : "Expand sidebar"}
            >
              {sidebarExpanded ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </button>
            {/* Mobile close */}
            {mobileSidebarOpen && (
              <button
                onClick={() => setMobileSidebarOpen(false)}
                className="md:hidden flex items-center justify-center w-7 h-7 rounded-lg text-text-muted hover:text-text-primary hover:bg-background transition-colors cursor-pointer"
                aria-label="Close sidebar"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
```

### Step 5: Migrate nav item classes

Find:
```tsx
                  className={`group flex items-center rounded-xl px-3 py-3 transition-all duration-200 ${
                    active
                      ? "bg-teal-primary/10 text-teal-primary shadow-sm ring-1 ring-teal-primary/20"
                      : "text-slate-600 hover:bg-dashboard-bg hover:text-slate-900"
                  }`}
```
Replace with:
```tsx
                  className={`group flex items-center rounded-xl px-3 py-2.5 transition-all duration-200 ${
                    active
                      ? "bg-brand/10 text-brand"
                      : "text-text-muted hover:bg-background hover:text-text-primary"
                  }`}
```

Find:
```tsx
                  <item.icon
                    className={`h-5 w-5 shrink-0 transition-colors ${
                      active
                        ? "text-teal-primary"
                        : "text-slate-400 group-hover:text-slate-600"
                    } ${sidebarExpanded || mobileSidebarOpen ? "mr-3" : "mx-auto"}`}
                  />
```
Replace with:
```tsx
                  <item.icon
                    className={`h-5 w-5 shrink-0 transition-colors ${
                      active ? "text-brand" : "text-text-muted group-hover:text-text-primary"
                    } ${sidebarExpanded || mobileSidebarOpen ? "mr-3" : "mx-auto"}`}
                  />
```

Find:
```tsx
                  {active && (sidebarExpanded || mobileSidebarOpen) && (
                    <div className="ml-auto h-2 w-2 rounded-full bg-teal-primary" />
                  )}
```
Replace with:
```tsx
                  {active && (sidebarExpanded || mobileSidebarOpen) && (
                    <div className="ml-auto h-1.5 w-1.5 rounded-full bg-brand" />
                  )}
```

### Step 6: Migrate user profile section

Find `border-t border-dashboard-border p-4 bg-dashboard-bg` → `border-t border-border p-4 bg-background`

Find `bg-teal-primary text-sm font-bold text-white shadow-md shadow-teal-primary/20` → `bg-brand text-sm font-bold text-white`

Find `text-slate-900` (in user name) → `text-text-primary`

Find `text-slate-500` (in user email) → `text-text-muted`

Find `hover:bg-dashboard-card hover:text-red-500` → `hover:bg-surface hover:text-error`

### Step 7: Migrate top bar (header)

Find `bg-dashboard-card/80` → `bg-surface/80`

Find `border-dashboard-border` (in header) → `border-border`

Find `border-dashboard-border bg-white` (workspace button) → `border-border bg-surface`

Find `text-teal-primary` (building icon, active workspace) → `text-brand`

Find `hover:border-teal-primary/40` → `hover:border-brand/40`

Find `font-semibold text-slate-800` → `font-semibold text-text-primary`

Find `bg-teal-primary/10 text-teal-primary` (active workspace) → `bg-brand/10 text-brand`

Find `text-slate-700 hover:bg-slate-50` → `text-text-secondary hover:bg-background`

Find `text-[11px] uppercase text-slate-500` → `text-[11px] uppercase text-text-muted`

Find `focus:border-teal-primary` (workspace input) → `focus:border-brand`

Find `bg-teal-primary px-3 py-2 text-sm font-bold text-white` (create button) → `bg-brand px-3 py-2 text-sm font-bold text-white`

Find `hover:bg-teal-primary/10 hover:text-teal-primary` (bell button) → `hover:bg-brand/10 hover:text-brand`

Find `bg-teal-primary ring-1 sm:ring-2 ring-white` (notification dot) → `bg-brand ring-1 sm:ring-2 ring-white`

### Step 8: Migrate main content area and onboarding modal

Find `bg-dashboard-bg` (root div) → `bg-background`

Find `pl-72` / `md:pl-72` / `md:pl-20` — keep as-is (these control layout shift, values match sidebar widths)

In onboarding modal: `bg-dashboard-bg` → `bg-background`, `border-dashboard-border` → `border-border`, `focus:border-teal-primary focus:ring-2 focus:ring-teal-primary/20` → `focus:border-brand focus:ring-2 focus:ring-brand/25`, `bg-teal-primary` → `bg-brand`, `hover:bg-teal-accent` → `hover:bg-brand-light`

### Step 9: Update Suspense fallback

Find `bg-dashboard-bg` → `bg-background`, `text-teal-primary` → `text-brand`

### Step 10: Verify + commit

```bash
cd /Users/affanzahir/code/yetti-clone
npx tsc --noEmit 2>&1 | head -10
git add app/dashboard/DashboardShell.tsx
git commit -m "feat: dashboard shell — click-toggle sidebar + token migration"
```

---

## Task 2: Dashboard Home Page

**File:** `app/dashboard/page.tsx`

### Step 1: Replace gradient welcome banner

Find the entire gradient banner div (from `{/* Welcome Banner */}` to its closing `</div>` — the one with `bg-linear-to-br from-teal-primary via-[#0d6159] to-slate-800`).

Replace with:

```tsx
      {/* Welcome */}
      <div className="flex items-center justify-between mb-2">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">
            {t("dashboard.welcomeBack")}, {getUserName()} 👋
          </h1>
          <p className="text-sm text-text-muted mt-0.5">{t("dashboard.welcomeMessage")}</p>
        </div>
        <Link
          href="/dashboard/integrations"
          className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl bg-brand text-white text-sm font-semibold hover:bg-brand-dark transition-all shadow-brand cursor-pointer"
        >
          <Link2 className="w-4 h-4" />
          Add Channel
        </Link>
      </div>
```

### Step 2: Migrate stat cards tokens

In each of the 3 stat card Links, replace:
- `border-dashboard-border bg-dashboard-card` → `border-border bg-surface`
- `hover:border-teal-primary/30` → `hover:border-brand/30`
- `text-slate-500 uppercase` → `text-text-muted uppercase`
- `text-slate-900` (stat number) → `text-text-primary`
- `bg-teal-primary/10 text-teal-primary` (icon bg) → `bg-brand/10 text-brand`
- `group-hover:bg-teal-primary group-hover:text-white` → `group-hover:bg-brand group-hover:text-white`
- `text-emerald-600 bg-emerald-50` → keep (semantic success color, already correct)
- `text-slate-500` (subtitle) → `text-text-muted`
- `text-slate-600 bg-slate-100` → `text-text-muted bg-background`

### Step 3: Migrate Platform Status section

Find `rounded-2xl sm:rounded-3xl border border-dashboard-border bg-dashboard-card` → `rounded-xl border border-border bg-surface`

Find `text-slate-900` (section title) → `text-text-primary`

Find `text-slate-500` (section subtitle) → `text-text-muted`

Find `text-teal-primary hover:text-teal-accent` → `text-brand hover:text-brand-light`

Find `bg-dashboard-bg border border-dashed border-dashboard-border` (empty state) → `bg-background border border-dashed border-border`

Find `text-slate-600 font-medium` (empty state text) → `text-text-muted font-medium`

Find `bg-teal-primary px-6 py-2.5` (Add integration button) → `bg-brand px-6 py-2.5`

Find `hover:bg-teal-accent hover:shadow-lg hover:shadow-teal-primary/20` → `hover:bg-brand-light`

Integration status cards: `border-dashboard-border bg-dashboard-bg` → `border-border bg-background`, `hover:bg-dashboard-card` → `hover:bg-surface`, `text-slate-700` → `text-text-secondary`, `text-slate-500` → `text-text-muted`

### Step 4: Migrate loading state

Find `border-b-2 border-teal-primary` (spinner) → `border-b-2 border-brand`

Find `text-slate-600 font-medium` (loading text) → `text-text-muted font-medium`

### Step 5: Migrate error banner

Find `border-red-200 bg-red-50 text-red-700` → `border-error-border bg-error-bg text-error-text`

### Step 6: Verify + commit

```bash
npx tsc --noEmit 2>&1 | head -10
git add app/dashboard/page.tsx
git commit -m "feat: dashboard home — replace gradient banner + token migration"
```

---

## Task 3: Bots Page

**File:** `app/dashboard/bots/page.tsx`

### Step 1: Read the file to find gradient banners and old tokens

```bash
grep -n "gradient\|teal-primary\|dashboard-card\|dashboard-border\|dashboard-bg\|slate-" app/dashboard/bots/page.tsx | head -40
```

### Step 2: Replace any gradient section headers

Find any `bg-gradient-to-br` or `from-teal-primary` blocks and replace with the page header pattern:

```tsx
{/* Page Header */}
<div className="flex items-center justify-between mb-6">
  <div className="flex items-center gap-3">
    <div className="w-10 h-10 rounded-xl bg-brand/10 flex items-center justify-center shrink-0">
      <Bot className="w-5 h-5 text-brand" aria-hidden="true" />
    </div>
    <div>
      <h1 className="text-xl font-bold text-text-primary">Bots</h1>
      <p className="text-sm text-text-muted">Create and manage your AI chatbots</p>
    </div>
  </div>
  <button
    onClick={() => setWizardOpen(true)}
    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-brand text-white text-sm font-semibold hover:bg-brand-dark transition-all shadow-brand cursor-pointer"
  >
    <Plus className="w-4 h-4" />
    New Bot
  </button>
</div>
```

### Step 3: Migrate all color tokens

Run these find-replace operations across the file:
- `bg-dashboard-card` → `bg-surface`
- `bg-dashboard-bg` → `bg-background`
- `border-dashboard-border` → `border-border`
- `text-teal-primary` → `text-brand`
- `bg-teal-primary` → `bg-brand`
- `bg-teal-primary/10` → `bg-brand/10`
- `hover:bg-teal-accent` → `hover:bg-brand-light`
- `hover:text-teal-accent` → `hover:text-brand-light`
- `text-slate-900` → `text-text-primary`
- `text-slate-700` → `text-text-secondary`
- `text-slate-600` → `text-text-muted`
- `text-slate-500` → `text-text-muted`
- `text-slate-400` → `text-text-muted`
- `bg-slate-50` / `bg-slate-100` → `bg-background`
- `hover:bg-slate-50` → `hover:bg-background`
- `border-slate-200` → `border-border`
- `focus:border-teal-primary` → `focus:border-brand`
- `focus:ring-teal-primary` → `focus:ring-brand`
- `shadow-teal-primary` → `shadow-brand`

### Step 4: Verify + commit

```bash
npx tsc --noEmit 2>&1 | head -10
git add app/dashboard/bots/page.tsx
git commit -m "feat: bots page — remove gradient banners + token migration"
```

---

## Task 4: Inbox Page (token migration only)

**File:** `app/dashboard/inbox/page.tsx`

**Important:** Do NOT change any functional logic — conversation loading, message sending, real-time updates, channel switching. Only migrate color tokens.

### Step 1: Find all old token usages

```bash
grep -n "teal-primary\|dashboard-card\|dashboard-border\|dashboard-bg\|slate-[0-9]" app/dashboard/inbox/page.tsx | wc -l
```

### Step 2: Apply token migration (same mapping as Task 3)

Run the same find-replace operations:
- `bg-dashboard-card` → `bg-surface`
- `bg-dashboard-bg` → `bg-background`
- `border-dashboard-border` → `border-border`
- `text-teal-primary` → `text-brand`
- `bg-teal-primary` → `bg-brand`
- `bg-teal-primary/10` → `bg-brand/10`
- `hover:bg-teal-accent` → `hover:bg-brand-light`
- `text-slate-900` → `text-text-primary`
- `text-slate-700` → `text-text-secondary`
- `text-slate-600` → `text-text-muted`
- `text-slate-500` → `text-text-muted`
- `text-slate-400` → `text-text-muted`
- `bg-slate-50` / `bg-slate-100` → `bg-background`
- `hover:bg-slate-50` / `hover:bg-slate-100` → `hover:bg-background`
- `border-slate-200` → `border-border`
- `focus:border-teal-primary` / `focus:ring-teal-primary` → `focus:border-brand` / `focus:ring-brand`

### Step 3: Verify TypeScript and no functional regressions

```bash
npx tsc --noEmit 2>&1 | head -10
```

### Step 4: Commit

```bash
git add app/dashboard/inbox/page.tsx
git commit -m "feat: inbox page — token migration (no functional changes)"
```

---

## Task 5: Integrations Page

**File:** `app/dashboard/integrations/page.tsx`

### Step 1: Replace gradient header

Find the entire gradient header div (the one with `bg-gradient-to-br from-teal-primary via-[#0d6159] to-slate-800`).

Replace with the page header pattern:
```tsx
{/* Page Header */}
<div className="flex items-center justify-between mb-6">
  <div className="flex items-center gap-3">
    <div className="w-10 h-10 rounded-xl bg-brand/10 flex items-center justify-center shrink-0">
      <Link2 className="w-5 h-5 text-brand" aria-hidden="true" />
    </div>
    <div>
      <h1 className="text-xl font-bold text-text-primary">{t("integrations.title")}</h1>
      <p className="text-sm text-text-muted">{t("integrations.subtitle")}</p>
    </div>
  </div>
</div>
```

### Step 2: Migrate platform cards

For each channel card, replace:
- `bg-gradient-to-r from-{color}` icon gradients → `bg-brand/10`
- `bg-white` card → `bg-surface`
- `border-gray-200` → `border-border`
- `text-gray-900` / `text-gray-800` → `text-text-primary`
- `text-gray-600` / `text-gray-500` → `text-text-muted`
- "Coming soon" badge: `bg-gray-100 text-gray-500` → `bg-background text-text-muted border border-border`

### Step 3: Telegram connected section token migration

Replace `teal-primary` / `dashboard-*` / `slate-*` with semantic tokens.

### Step 4: Verify + commit

```bash
npx tsc --noEmit 2>&1 | head -10
git add app/dashboard/integrations/page.tsx
git commit -m "feat: integrations page — replace gradient banner + token migration"
```

---

## Task 6: Triggers Page

**File:** `app/dashboard/triggers/page.tsx`

### Step 1: Find and replace gradient banner

```bash
grep -n "gradient\|from-teal" app/dashboard/triggers/page.tsx | head -5
```

Replace gradient header with page header pattern using `<Zap>` icon:

```tsx
<div className="flex items-center justify-between mb-6">
  <div className="flex items-center gap-3">
    <div className="w-10 h-10 rounded-xl bg-brand/10 flex items-center justify-center shrink-0">
      <Zap className="w-5 h-5 text-brand" aria-hidden="true" />
    </div>
    <div>
      <h1 className="text-xl font-bold text-text-primary">Triggers</h1>
      <p className="text-sm text-text-muted">Keyword-based media and response automation</p>
    </div>
  </div>
  {/* Add trigger button if one exists */}
</div>
```

### Step 2: Migrate all tokens (same mapping as previous tasks)

### Step 3: Verify + commit

```bash
npx tsc --noEmit 2>&1 | head -10
git add app/dashboard/triggers/page.tsx
git commit -m "feat: triggers page — replace gradient banner + token migration"
```

---

## Task 7: Knowledge Base Page

**File:** `app/dashboard/knowledge-base/page.tsx`

### Step 1: Find and replace gradient banner

```bash
grep -n "gradient\|from-teal" app/dashboard/knowledge-base/page.tsx | head -5
```

Replace with page header pattern using `<FileText>` icon:

```tsx
<div className="flex items-center justify-between mb-6">
  <div className="flex items-center gap-3">
    <div className="w-10 h-10 rounded-xl bg-brand/10 flex items-center justify-center shrink-0">
      <FileText className="w-5 h-5 text-brand" aria-hidden="true" />
    </div>
    <div>
      <h1 className="text-xl font-bold text-text-primary">Knowledge Base</h1>
      <p className="text-sm text-text-muted">Train your bots with documents and FAQs</p>
    </div>
  </div>
</div>
```

### Step 2: Migrate all tokens (same mapping)

### Step 3: Verify + commit

```bash
npx tsc --noEmit 2>&1 | head -10
git add app/dashboard/knowledge-base/page.tsx
git commit -m "feat: knowledge base page — replace gradient banner + token migration"
```

---

## Task 8: Settings Page

**File:** `app/dashboard/settings/page.tsx`

### Step 1: Find and replace gradient banner

```bash
grep -n "gradient\|from-teal" app/dashboard/settings/page.tsx | head -5
```

Replace with page header pattern using `<Settings>` icon:

```tsx
<div className="flex items-center justify-between mb-6">
  <div className="flex items-center gap-3">
    <div className="w-10 h-10 rounded-xl bg-brand/10 flex items-center justify-center shrink-0">
      <SettingsIcon className="w-5 h-5 text-brand" aria-hidden="true" />
    </div>
    <div>
      <h1 className="text-xl font-bold text-text-primary">{t("settings.title")}</h1>
      <p className="text-sm text-text-muted">Manage your account and preferences</p>
    </div>
  </div>
</div>
```

### Step 2: Migrate all tokens

Pay special attention to:
- Form inputs: `focus:border-teal-primary focus:ring-teal-primary/20` → `focus:border-brand focus:ring-brand/25`
- Save buttons: `bg-teal-primary hover:bg-teal-accent` → `bg-brand hover:bg-brand-light`
- Section cards: `bg-white` / `bg-dashboard-card` → `bg-surface`
- Destructive buttons (sign out, delete): keep `text-red-*` / replace with `text-error` if present

### Step 3: Verify + commit

```bash
npx tsc --noEmit 2>&1 | head -10
git add app/dashboard/settings/page.tsx
git commit -m "feat: settings page — replace gradient banner + token migration"
```

---

## Task 9: Workspaces Page

**File:** `app/dashboard/workspaces/page.tsx`

### Step 1: Add page header pattern

Find the top of the JSX return and add the page header:

```tsx
{/* Page Header */}
<div className="flex items-center justify-between mb-6">
  <div className="flex items-center gap-3">
    <div className="w-10 h-10 rounded-xl bg-brand/10 flex items-center justify-center shrink-0">
      <Users className="w-5 h-5 text-brand" aria-hidden="true" />
    </div>
    <div>
      <h1 className="text-xl font-bold text-text-primary">Workspaces</h1>
      <p className="text-sm text-text-muted">Manage members, roles, and bot access</p>
    </div>
  </div>
</div>
```

### Step 2: Migrate all tokens (same mapping)

### Step 3: Verify + commit

```bash
npx tsc --noEmit 2>&1 | head -10
git add app/dashboard/workspaces/page.tsx
git commit -m "feat: workspaces page — add page header + token migration"
```

---

## Task 10: CRM Page cleanup

**File:** `app/dashboard/crm/page.tsx`

### Step 1: Verify existing tokens are correct

```bash
grep -n "slate-\|teal-\|dashboard-" app/dashboard/crm/page.tsx
```

The CRM page was built with new tokens. Fix any remaining old-style classes found.

### Step 2: Ensure stat cards match dashboard home pattern

The 4 stat cards should use:
```tsx
<div className="bg-surface border border-border rounded-xl p-4">
  <div className={`text-2xl font-bold ${color}`}>{value}</div>
  <div className="text-xs text-text-muted mt-0.5">{label}</div>
</div>
```

### Step 3: Verify + commit

```bash
npx tsc --noEmit 2>&1 | head -10
git add app/dashboard/crm/page.tsx
git commit -m "feat: crm page — token consistency cleanup"
```

---

## Final verification

After all 10 tasks:

```bash
cd /Users/affanzahir/code/yetti-clone

# TypeScript
npx tsc --noEmit 2>&1 | head -10

# Check no old tokens remain in dashboard files
grep -rn "bg-dashboard-card\|bg-dashboard-bg\|border-dashboard-border\|text-teal-primary\|bg-teal-primary\|from-teal-primary" app/dashboard/ --include="*.tsx" | grep -v "node_modules"

# Git log
git log --oneline -12
```

Expected:
- `tsc`: no output
- `grep`: no matches (all old tokens removed)
- Git log shows 10 feature commits

## Push

```bash
git push origin main
```
