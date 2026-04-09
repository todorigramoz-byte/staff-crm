<instructions>
## 🚨 MANDATORY: CHANGELOG TRACKING 🚨

You MUST maintain this file to track your work across messages. This is NON-NEGOTIABLE.

---

## INSTRUCTIONS

- **MAX 5 lines** per entry - be concise but informative
- **Include file paths** of key files modified or discovered
- **Note patterns/conventions** found in the codebase
- **Sort entries by date** in DESCENDING order (most recent first)
- If this file gets corrupted, messy, or unsorted -> re-create it. 
- CRITICAL: Updating this file at the END of EVERY response is MANDATORY.
- CRITICAL: Keep this file under 300 lines. You are allowed to summarize, change the format, delete entries, etc., in order to keep it under the limit.

</instructions>

<changelog>
## 2026-04-09 — Add NotificationBellButton to sidebar (navigates to /notifications view)
- TopNavBar.tsx: added `NotificationBellButton` component with unread badge counter
- Bell icon imported from @phosphor-icons/react; duplicate `useQuery` import merged
- Reads invoices/tasks/appointments to compute unread count vs localStorage read IDs
- Clicking navigates to `notifications` view (Notifications.tsx full page)

## 2026-04-09 — Connect Settings Team tab to StaffMember database
- Settings.tsx Team tab now reads from useQuery('StaffMember') instead of hardcoded array
- Added "Shto Anëtar" modal with name, email, color picker → createStaff()
- Remove button calls removeStaff(id) from DB
- Empty state shown when no staff exists
- Erjoni Besimi, Albani (+ Besimi) already in DB and now visible

## 2026-04-09 — Link Tasks to Staff (assignedTo field)
- Added optional `assignedTo` to Task entity via `backend_database_patch_entities`
- Tasks.tsx: 3-button toggle in modal (Pa caktuar / Erjoni / Albani) with color coding
- Task cards show staff badge (violet for Erjoni, emerald for Albani) with first name only
- Preview modal shows "Caktuar" meta cell with full name badge or "Pa caktuar"

## 2026-04-09 — Link Tasks to Clients (clientId field)
- Added optional `clientId` to Task entity via `backend_database_patch_entities`
- Tasks.tsx: fetches clients, adds dropdown in modal ("Klienti - opsionale")
- Task cards show client name badge (blue, UserCircle icon) when linked
- Preview modal shows "Klienti" meta cell with client name or "Pa klient"

## 2026-04-09 — Convert top navbar to left vertical sidebar
- Redesigned `src/components/TopNavBar.tsx` — horizontal top nav → fixed left sidebar (w-56)
- Sidebar has: logo, search button, vertical nav list, user avatar/logout at bottom
- App.tsx: main content now has `md:pl-56` offset; footer also offset
- Mobile: kept hamburger top bar + drawer menu (top-[60px])

## 2026-04-09 — Simplify CV Tracker to "ku ndala" bookmark tool
## 2026-04-09 — Convert top navbar to left vertical sidebar
- Redesigned `src/components/TopNavBar.tsx` — horizontal top nav → fixed left sidebar (w-56)
- Sidebar has: logo, search button, vertical nav list, user avatar/logout at bottom
- App.tsx: main content now has `md:pl-56` offset; footer also offset
- Mobile: kept hamburger top bar + drawer menu (top-[60px])

## 2026-04-09 — Simplify CV Tracker to "ku ndala" bookmark tool
- Redesigned `src/views/CvTracker.tsx` — fokus vetëm te puna e fundit + historiku
- Big blue card: pozicioni, kompania, data/ora e fundit, shënime + buton "Regjistro Tjetrën"
- Historiku si listë nën kartë me hover actions (ndrysho/fshi)
- localStorage key: "cvTrackerSessions" — format i thjeshtësuar

## 2026-04-07 — Multi-user auth: useUser() to read state, useAuth().login() for signup/login
- App.tsx: uses `useUser()` (never redirects) to check auth state — shows Login if user===null
- Login.tsx: single "Kyçu / Regjistrohu" button calls `useAuth().login()` → opens Anima modal
- TopNavBar.tsx: reads name/email from `useUser()`, logout calls `useAuth().logout()`
- Removed all localStorage auth logic — now fully multi-user via Anima auth

## 2026-04-07 — Replace staff.al logo with My CRM branded logo
- TopNavBar.tsx: replaced SVG staff.al logo with gradient icon + "My CRM" text logo
- Icon: blue→cyan gradient square with 4-grid SVG; text: "My" neutral + "CRM" blue-600

## 2026-04-07 — Invoices: monthly chart + expanded stats above table
- Added 4-card stat row (total, paid, pending, overdue) with icons replacing old 3-card grid
- Added bar chart (last 6 months EUR) with hover tooltips — pure CSS/SVG, no chart library
- Added "Sot" daily stats panel beside the chart (count, EUR total, ALL total)
- All changes in `src/views/Invoices.tsx` only

## 2026-04-02 — Fix logout not working
- TopNavBar.tsx: `handleLogout` now uses `await logout()` with try/catch
- App.tsx: check `user === null` (explicit null = logged out) instead of `!user` (avoids blocking on undefined)

## 2026-04-02 — Switch to Anima email auth (replace localStorage auth)
- Login.tsx: now uses `useAuth().login()` from Anima SDK — single "Kyçu me Email" button
- App.tsx/TopNavBar.tsx: removed all localStorage auth logic, uses `useAuth()` from SDK

## 2026-04-02 — Fix EUR_TO_ALL constant back to 100 (user confirmed rate is 1 EUR = 100 ALL)
## 2026-04-02 — Switch to Anima email auth (replace localStorage auth)
- Login.tsx: now uses `useAuth().login()` from Anima SDK — single "Kyçu me Email" button
- App.tsx: uses `isAnonymous` + `isPending` from `useAuth()` instead of localStorage flag
- TopNavBar.tsx: reads `user.name`/`user.email` from SDK; logout calls `useAuth().logout()`
- Removed all localStorage auth logic (isLoggedIn, userName, userEmail, authChange event)

## 2026-04-02 — Fix EUR_TO_ALL constant back to 100 (user confirmed rate is 1 EUR = 100 ALL)
- Changed EUR_TO_ALL from 123 → 100 in Invoices.tsx
- Now 1200 EUR → 120,000 ALL correctly

## 2026-04-02 — Fix currency toggle root cause: amount field moved above currency selector
- Bug: amount="" at toggle time because amount input was BELOW the currency buttons in DOM order
- Fix: moved manual amount input ABOVE the currency selector in the modal
- Removed all __ANIMA_DBG__ console logs
- EUR_TO_ALL=123; conversion: EUR→ALL ×123, ALL→EUR ÷123

## 2026-04-02 — Fix invoice amount storage (no EUR conversion for ALL invoices)
- Removed `toEUR()` conversion on save — amounts now stored as-is in native currency
- Fixes bug: 8000 L was saved as 80 (divided by EUR_TO_ALL=100) then shown as 80 L
- `openEdit` no longer applies `toDisplay()` multiplier when loading amount into form
- Lines total display also fixed to use `linesTotal` directly

## 2026-03-30 — EmailJS credentials injected
- Hardcoded real credentials in `src/lib/emailService.ts` (fallback values)
- Also injected via `globalThis.__EMAILJS_CONFIG__` block in `index.html`
- `isEmailConfigured()` now returns true → emails send via EmailJS directly

## 2026-03-30 — Fix import.meta.env in emailService.ts (Sandpack compat)
- Replaced `import.meta.env` with `globalThis.__EMAILJS_CONFIG__` fallback pattern
- Config is injected via a `<script>` block in `index.html` for Sandpack compatibility
- `isEmailConfigured()` and `sendEmail()` logic unchanged; mailto fallback preserved

## 2026-03-30 — EmailJS real email sending integration
- Installed `@emailjs/browser`, created `src/lib/emailService.ts` with `sendEmail()` + `isEmailConfigured()`
- Reads `VITE_EMAILJS_SERVICE_ID/TEMPLATE_ID/PUBLIC_KEY` from `.env`
- If configured: sends directly via EmailJS; if not: falls back to mailto
- Emails.tsx: shows green "configured" banner or amber setup guide; toast reflects actual send result

## 2026-03-30 — Clients: switch from card grid to table list
- Replaced 3-col card grid with a responsive `<table>` layout in `src/views/Clients.tsx`
- Columns: Klienti (avatar+name+contactPerson), Email/Tel, Industria, Vlera Kontratës, Qyteti, Statusi, Veprime
- Responsive: some columns hidden on small screens (sm/md/lg breakpoints)
- Row hover shows action buttons (email, edit, delete); modal unchanged

## 2026-03-30 — Add Forgot Password + Change Password
- Login.tsx: "Harruat fjalëkalimin?" link → modal që shfaq kredencialet aktuale (lexon nga localStorage)
- Password ruhet në `localStorage["crmAdminPassword"]` (default "admin123" nëse nuk është ndryshuar)
- Settings.tsx: tab i ri "Llogaria" me formë ndryshimi fjalëkalimi (validim: current pw, min 6 chars, confirm match)
- Ndryshimi i fjalëkalimit reflektohet menjëherë në login dhe "Forgot" modal

## 2026-03-30 — Replace Anima auth with localStorage auth
- Removed all `useAuth` from `@animaapp/playground-react-sdk` in Login.tsx, App.tsx, TopNavBar.tsx
- Login.tsx: hardcoded credentials (admin/admin123), saves isLoggedIn + userName + userEmail to localStorage
- App.tsx: reads `isLoggedIn` from localStorage, listens to `authChange` custom event for reactivity
- TopNavBar.tsx: reads userName/userEmail from localStorage, logout clears localStorage + fires `authChange`

## 2026-03-30 — Add Email module (compose, history, reply)
- New `Email` entity patched: toClientId, toEmail, subject, body, status, sentAt
- Created `src/views/Emails.tsx`: compose modal (Gmail-style), history list, preview modal, reply
- When sending: saves to CRM history + opens `mailto:` so OS email client delivers it
- Added "Emailet" nav item in TopNavBar + route in App.tsx
- Added "Dërgo Email" (PaperPlaneRight) button on each Client card → navigates to Emails with compose pre-filled

## 2026-03-30 — Add 3 new fields to Client entity
- New fields: `contactPerson` (string), `industry` (dropdown, 13 sektorë), `contractValue` (number, ALL)
- Backend patched via `backend_database_patch_entities`
- Modal: new row for contactPerson, grid row for industry (select) + contractValue (number)
- Card: shows contactPerson (UserCircle), industry (Briefcase), contractValue in green (CurrencyCircleDollar)

## 2026-03-30 — Add Products & Services view + link to Invoices
- Created full `src/views/Products.tsx`: CRUD for produktet/shërbimet, type toggle, unit, isActive toggle
- Added "Produkte" nav item in `TopNavBar.tsx` + route in `App.tsx`
- `Invoices.tsx`: added line-items section — select product → auto-fill price, qty, total computed from lines; falls back to manual amount if no lines added
- Product entity already existed in SDK schema (no backend patch needed)

## 2026-03-30 — Auth gate: Email login/logout
- Created `src/views/Login.tsx`: branded email login page, calls `useAuth().login()`
- `AppShell` in `App.tsx` now checks `isAnonymous` — shows Login page if not authenticated, loading spinner while `isPending`
- TopNavBar: removed Login item from dropdown (app is always behind auth gate), kept only "Dilni (Logout)"
- Auth flow uses Anima SDK email auth (no custom password handling needed)

## 2026-03-30 — Dashboard: Add Leads stat card
- Added `useQuery("Lead")` to Dashboard alongside existing queries
- Stats grid now 5 cards (lg:grid-cols-5): Leads Aktive, Klientë, Fatura, Takime, Detyra
- Leads card uses violet colour + Funnel icon, links to "leads" view
- Fixed via write_to_file after replace_in_file conflict

## 2026-03-30 — Tasks: Add description field
## 2026-03-30 — Dashboard: Add Leads stat card
- Added `useQuery("Lead")` to Dashboard alongside existing queries
- Stats grid now 5 cards (lg:grid-cols-5): Leads Aktive, Klientë, Fatura, Takime, Detyra
- Leads card uses violet colour + Funnel icon, links to "leads" view
- Fixed via write_to_file after replace_in_file conflict

## 2026-03-30 — Tasks: Add description field
- Added optional `description` field to Task entity (backend_database_patch_entities)
- Modal now shows textarea for description (opsionale)
- Card shows description as truncated caption below the title if set

## 2026-03-30 — Tasks: Jira-style Kanban Board
- Replaced list view with 3-column Kanban: Të bëra / Në progres / Të kryera
- Drag & drop via @dnd-kit/core + @dnd-kit/sortable (cross-column + reorder)
- DragOverlay shows floating card preview while dragging
- Column state managed locally (columnMap + orderedIds); isCompleted synced to backend on drop
- Modal extended with "Kolona" selector

## 2026-03-19 — Full CRM Rebuild
- Replaced Jobs/Applications with Clients, Invoices, Appointments, Tasks
- All 4 new views use `useQuery`/`useMutation` from `@animaapp/playground-react-sdk`
- Dashboard rebuilt with live CRM stats (clients, invoices, appointments, tasks)
- TopNavBar updated with new nav items + real auth (useAuth)
- CommandPalette simplified to CRM navigation + quick actions
- Deleted: Jobs.tsx, Applications.tsx, AddJobModal.tsx, StageBadge.tsx
- All UI in Albanian language
</changelog>
