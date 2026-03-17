# Changelog — François Bertho Production App
_Last updated: March 17, 2026_

---

## Summary of All Changes Made This Session

### 1. 🔔 Loading Animations & UI Feedback

**Goal:** The app was hanging silently during async operations, giving zero feedback to the user.

**What was done:**
- Added a `Loader2` spinning icon on the **Login** button while authenticating
- Added an `isSubmitting` spinner on the **Create Order** confirmation modal button
- Added an `isUpdating` spinner on the **Update Order** confirmation modal button — button disables and shows "Saving..." while the server action runs
- Wrapped the **Search Bar** (`search_bar.tsx`) in `useTransition` — the magnifying glass swaps to a spinner while filtering
- Wrapped the **Status Filter** (`status_filter.tsx`) in `useTransition` — shows a spinner while the filter is applying
- Added `app/client_dashboard/loading.tsx` and `app/supplier_dashboard/loading.tsx` for full page skeleton loading during route transitions
- Added a **top progress bar** (via `next-nprogress-bar`) that fires instantly on any link click across the app, making navigation feel immediate

---

### 2. ✉️ Order Update — Save & Send Split

**Goal:** When updating an order, there needed to be two distinct actions: a silent save vs. a save that also notifies the other party by email.

**What was done:**
- Split the single "Save" button into **Save** (silent) and **Send** (save + email) in the update modal
- A second confirmation modal appears before either action, clearly explaining what will happen ("This will notify the other party by email" vs. "No email will be sent")
- Integrated **Resend API** to manually dispatch emails on "Send" — email template chosen based on the new order status and role
- Reloads the page after a successful update so changes are immediately visible
- Added graceful handling when `RESEND_API_KEY` is missing — logs a warning but doesn't crash

---

### 3. 🔒 Role-Based Privilege Gating

**Goal:** Client and Supplier had access to the same update fields, which was incorrect.

**What was done in the Update Modal based on role (detected via `basePath`):**

| Field | Client | Supplier |
|---|---|---|
| Price (€) | 🔒 Read-only | ✏️ Editable |
| Expected Shipping Date | 🔒 Read-only | ✏️ Editable |
| Supplier Notes | 🔒 Read-only | ✏️ Editable |
| FB Notes (Client) | ✏️ Editable | 🔒 Read-only |
| Status dropdown | To be submitted, Submitted, Review completed | Checking, Review Needed, In production, Shipped |

---

### 4. 📋 Order Detail View — Dual Notes Display

**Goal:** Only one note was shown in the order detail page.

**What was done:**
- Replaced the single "Notes / Use Case" text block with **two distinct styled boxes**:
  - 🟣 **Supplier Notes** — purple background/border
  - 🔴 **FB Notes (Client)** — red background/border
- Both boxes always visible, showing placeholder text if empty

---

### 5. 📎 Multi-File Support (Order_file Table)

**Goal:** Orders previously only supported one file stored in a `file_name` column. The schema was updated to support multiple files via a joined `Order_file` table.

**What was done:**
- Updated `order_list.tsx` query to join `Order_file(id, "fileName")` instead of reading the old column
- Order cards now show a **"2 PDFs"** badge (or "PDF" for one) sourced from `Order_file`
- Order detail page now renders **all attached files as clickable cards** from `Order_file[]`
- The **Update Modal** shows all existing files with individual **Remove** buttons (calls `deleteFile` action)
- Users can add up to a combined total of **2 files** via a drag-zone file picker (calls `insertFile` action)
- New uploads are inserted into the `Order_file` table on confirm

---

### 6. 🎛️ Floating Action Bar — 5-Button Layout

**Goal:** Add Save and Send update as quick actions directly accessible from the order detail page without opening the full Modify modal.

**What was done:**
- Redesigned the floating action bar with a clean layout:
  - **Left group** (ghost buttons): Archive / Modify / Delete
  - **Divider**
  - **Right group** (primary): Save (purple outline) + Send update (solid green)
- On **mobile**: icons only (no labels) to prevent overflow
- On **tablet/desktop**: icons + labels

The Save / Send update buttons pre-fill the confirm modal with the current order's data, bypassing the full edit form — useful for quickly re-submitting or notifying without making any changes.

---

### 7. 🏷️ Navbar — Logo Non-Clickable for Supplier

**Goal:** Clicking the "François Bertho" logo was navigating suppliers to a page they shouldn't access.

**What was done:**
- For the supplier role, the logo is rendered as a plain `<span>` instead of a `<Link>`, making it non-navigable
- For the client role, it remains a working link to the home/dashboard

---

### 8. 🔐 Security Hardening

**What was done:**
- **Removed `/api/debug-storage`** — this was an unprotected API route that publicly exposed storage bucket names and authenticated user data. Deleted entirely.
- **Added auth guard to `updateOrder`** — returns `{ error: "Unauthorized" }` immediately if no valid session is found
- **Removed all debug `console.log` statements** from server actions (`updateOrder.tsx`, `insertOrder.tsx`) and client components to prevent leaking internal payload data to logs
- **Removed scratch files** (`build_output.log`, `fetch_schema.js`) that were accidentally tracked by git

---

### 9. ⚡ Performance — Tab Switching Delay

The perceived delay when switching between tabs (New Orders, Production, Archives) is primarily caused by **server-side data fetching on each navigation** in a local dev environment. In production on Vercel, this is significantly faster due to edge caching and reduced server cold-start latency. The top progress bar and `loading.tsx` skeletons provide visual feedback to mask remaining delays.

---

_All changes are committed to `origin/main` and deployed to Vercel._
