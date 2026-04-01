<instructions>
This file will be automatically added to your context. 
It serves multiple purposes:
  1. Storing frequently used tools so you can use them without searching each time
  2. Recording the user's code style preferences (naming conventions, preferred libraries, etc.)
  3. Maintaining useful information about the codebase structure and organization
  4. Remembering tricky quirks from this codebase

When you spend time searching for certain configuration files, tricky code coupled dependencies, or other codebase information, add that to this CODER.md file so you can remember it for next time.
</instructions>

<coder>
# Project: My CRM (Albanian language UI)

## Stack
- React 18 + TypeScript, Vite, Tailwind CSS
- `@animaapp/playground-react-sdk` for all data (useQuery, useMutation, useAuth)
- `@phosphor-icons/react` for icons
- `cmdk` for command palette
- Radix UI components via shadcn-style wrappers in `src/components/ui/`

## Key Entities
- Client: name, email, phone, status (lead/active/inactive)
- Invoice: clientId, invoiceNumber, amount, dueDate, status (pending/paid/overdue)
- Appointment: clientId, title, scheduledAt, notes
- Task: title, dueDate, isCompleted, priority (high/medium/low)

## Routing
- No react-router — uses `currentView` state from AppContext
- Views: dashboard | clients | invoices | appointments | tasks | settings

## Patterns
- All modals are inline (no separate modal component) — stateful per-view
- `clientMap` pattern: `Object.fromEntries(clients.map(c => [c.id, c.name]))` for ID→name lookup
- `useApp()` for toast + navigation; `useQuery/useMutation` for all data
- AnimaProvider wraps the entire app in `src/index.tsx`
- Tailwind `bg-gradient-primary` = `linear-gradient(135deg, hsl(210,90%,56%), hsl(190,70%,45%))`
</coder>
