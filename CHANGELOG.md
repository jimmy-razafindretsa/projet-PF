# CHANGELOG

## v2.0.0 — 2026-03-17

### New Features
- **Role-Based Access:** Clients and suppliers now see distinct UI, statuses, and editable fields. Suppliers cannot modify price, shipping date, or client notes.
- **Order Statuses:** 7 custom statuses replacing the generic ones — `To be submitted`, `Submitted`, `Checking`, `Review Needed`, `In production`, `Shipped`, `Review completed`.
- **Dual Notes:** Orders now carry separate supplier and client note fields, both visible on order cards and detail views.
- **Multi-File Upload:** Up to 2 PDFs per order. Files can be added or removed during order updates.
- **Save vs. Send:** Updates can be saved silently or sent with an email notification to the other party — no more automatic emails on every change.
- **Loading States:** Spinners on all async actions (login, create, update, search, filter). Instant top-bar progress indicator on page navigation.

### Security & Code Quality
- Removed `/api/debug-storage` endpoint that exposed internal storage and user data.
- Added authentication guard to `updateOrder` server action.
- Stripped all debug `console.log` statements from server actions and client components.
- Supplier logo no longer links to the client dashboard.
