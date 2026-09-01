# Customer Invoices — Scenario Plan

[← Back to README](../../README.md#scenarios-covered-per-module)

Status: 🟡 In progress — 4 of 10 scenarios done.

Source: site's Testing Guide, feature #6 (Customer Invoices).

**Acceptance Criteria**

- List of invoices is shown for logged-in user.
- Clicking invoice shows detail page.
- Download button provides correct PDF file.

**Testing Guidance**

- Verify invoices belong to logged-in customer only.
- Check invoice detail matches data on list (dates, totals).
- Download PDF → open file, verify correct content.

**Techniques applied:** Equivalence Partitioning (logged-in vs logged-out), State Transition Testing (list view → detail view), Error Guessing (direct URL access to another customer's invoice).

Confirmed live: list page (`/account/invoices`) columns are Invoice Number, Billing Address, Invoice Date, Total, backed by a paginated API (`GET /invoices?page=1`, `per_page: 15`). Two navigation paths exist, mirroring the pattern found in Customer Favorites — `nav-my-invoices` (nav-menu dropdown → "My invoices") and `nav-invoices` (button on the Account dashboard page).

Confirmed live: the empty-state for a fresh account with no invoices differs from Favorites — there's no explicit "no invoices yet" message, just the table header row with zero data rows.

Confirmed live: logged-out access to `/account/invoices` does redirect to `/auth/login`, but with a noticeable delay (~2-4s, not immediate) — the eventual test needs a generous timeout on the URL assertion rather than the default, or it'll flake.

Confirmed live (two independent site-provided accounts, two fresh browser sessions): direct URL access to another customer's invoice (`/account/invoices/<ULID>`) is backend-enforced — `GET https://api.practicesoftwaretesting.com/invoices/<id>` returns **404**, and the frontend shows "This invoice doesn't exist." Not just a frontend hide; confirmed at the API level.

Guest checkout (the "Continue as Guest" option at the Sign In step) also produces a real invoice number, but since a guest order isn't tied to any account, there's no logged-in view to check it from afterward — considered and dropped as a scenario since it falls outside this AC's "logged-in customer" framing.

Pagination (scenario #10) needs 16+ invoices to trigger a real second page — too slow/risky to self-seed via 16+ real checkouts in one test (each checkout takes ~15-20s, and the site does periodic data refreshes that could wipe a self-registered user's data mid-test). Decision: use one of the site's provided/seeded test accounts instead, and assert structurally (next-page control exists, page 2 shows different invoices than page 1) rather than exact counts, since the seed account's invoice count isn't something this test controls. Keep that test read-only — no creating/modifying/deleting anything on a shared account.

## Scenarios

| #   | Scenario                                                                        | Expected result                                                                                                            | Status   |
| --- | ------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- | -------- |
| 1   | Login with a fresh account, no invoices yet                                     | Invoices list shows only the table header row, no data rows, no explicit empty-state message                               | ✅ Done  |
| 2   | Navigate to invoices via nav-menu → "My invoices"                               | Correct invoices list is shown (nav-menu path)                                                                             | ✅ Done  |
| 3   | Navigate to invoices via Account dashboard → "Invoices" button                  | Correct invoices list is shown (direct-link path)                                                                          | ✅ Done  |
| 4   | Complete a purchase                                                             | A new invoice appears in the list with correct Invoice Number, Invoice Date, and Total                                     | ✅ Done  |
| 5   | Click an invoice in the list                                                    | Navigates to the detail page; Invoice Number, Invoice Date, and Total match the list row (State Transition Testing)        | 📝 To Do |
| 6   | Complete 2 separate purchases                                                   | Both invoices appear in the list, each with correct individual data, not cross-contaminated                                | 📝 To Do |
| 7   | Click "Download PDF" on an invoice detail page                                  | A PDF file downloads successfully (`.pdf`, non-zero size) — content not verified, see note below                           | 📝 To Do |
| 8   | Attempt to access the invoices list while logged out                            | Redirects to the login page (EP: logged-in vs logged-out)                                                                  | 📝 To Do |
| 9   | Attempt direct URL access to another customer's invoice                         | 404 — "This invoice doesn't exist." (Error Guessing)                                                                       | 📝 To Do |
| 10  | Pagination: view invoices list for an account with 16+ invoices (site-provided) | A "next page" control exists; navigating to it shows different invoices than page 1 (read-only, structural assertion only) | 📝 To Do |

**Scenario 4 flaky:** completing checkout requires two clicks of the same "Confirm" button (`[data-test="finish"]`) — the first submits payment (shows "Payment was successful" on the same Payment step), the second actually places the order and navigates to the "Thanks for your order" confirmation page. That second navigation occasionally takes longer than expected under concurrent test load (multiple browser projects running checkout in parallel against the shared public demo backend) — confirmed by testing: the same test passed reliably running alone (~16-18s) but intermittently failed when run alongside the other two browser projects, even after bumping the test's own timeout to 45s (`test.setTimeout(45000)`) and the confirmation assertion's timeout to 15s. This is treated as a known, accepted flake tied to the shared demo site's backend under load — not a bug in the test itself — same category as the pre-existing `registeredUser` fixture flake seen intermittently on webkit. Rerun if hit.

**Scenario 7 content not verified:** the AC's testing guidance says "open file, verify correct content," which would need a PDF-parsing library (e.g. `pdf-parse`) to extract and assert on text — Playwright itself only hands back the raw downloaded file, it doesn't parse PDF content. Decided to skip that for now rather than add a new dependency for one scenario. This is a deliberate, acknowledged gap, not full AC coverage: scenario #7 as scoped only proves a PDF downloads successfully (download event fires, `.pdf` extension, non-zero size) — it does **not** verify the invoice number/total/line items inside the PDF are correct. Revisit if `pdf-parse` (or similar) becomes worth adding.
