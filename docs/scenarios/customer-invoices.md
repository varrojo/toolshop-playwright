# Customer Invoices — Scenario Plan

[← Back to README](../../README.md#scenarios-covered-per-module)

Status: 🟢 Done — 10 of 10 scenarios done.

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

## Scenarios

| # | Scenario | Expected result | Status |
| - | - | - | - |
| 1 | Login with a fresh account, no invoices yet | Invoices list shows only the table header row, no data rows, no explicit empty-state message | ✅ Done |
| 2 | Navigate to invoices via nav-menu → "My invoices" | Correct invoices list is shown (nav-menu path) | ✅ Done |
| 3 | Navigate to invoices via Account dashboard → "Invoices" button | Correct invoices list is shown (direct-link path) | ✅ Done |
| 4 | Complete a purchase | A new invoice appears in the list with correct Invoice Number, Invoice Date, and Total | ✅ Done |
| 5 | Click an invoice in the list | Navigates to the detail page; Invoice Number, Invoice Date, and Total match the list row (State Transition Testing) | ✅ Done |
| 6 | Complete 2 separate purchases | Both invoices appear in the list, each with correct individual data, not cross-contaminated | ✅ Done |
| 7 | Click "Download PDF" on an invoice detail page | A PDF file downloads successfully (`.pdf`, non-zero size) — content not verified, see [Scope gaps](#scope-gaps) | ✅ Done |
| 8 | Attempt to access the invoices list while logged out | Redirects to the login page (EP: logged-in vs logged-out) | ✅ Done |
| 9 | Attempt direct URL access to another customer's invoice | 404 — "This invoice doesn't exist." (Error Guessing) | ✅ Done |
| 10 | Pagination: view invoices list for an account with 16+ invoices (site-provided) | A "next page" control exists; navigating to it shows different invoices than page 1 (read-only, structural assertion only) | ✅ Done |

## Notes

### Navigation & empty states

- List page (`/account/invoices`) columns: Invoice Number, Billing Address, Invoice Date, Total — backed by a paginated API (`GET /invoices?page=1`, `per_page: 15`).
- Two navigation paths exist, mirroring the pattern found in Customer Favorites: `nav-my-invoices` (nav-menu dropdown → "My invoices") and `nav-invoices` (button on the Account dashboard page).
- The empty-state for a fresh account with no invoices differs from Favorites — there's no explicit "no invoices yet" message, just the table header row with zero data rows.
- Logged-out access to `/account/invoices` does redirect to `/auth/login`, but with a noticeable delay — measured live at ~3.3s, right up against Playwright's 5s default `expect` timeout. Scenario #8's test (`'User Not Signed In'`) uses an explicit 15s timeout on the URL assertion to stay clear of that margin.

### Data-format quirks (confirmed live, scenario #5 build-out)

- **Postal code validation is country-dependent:** the billing address form validates postal code format against the selected country — e.g. country `PH` with postal code `1600` is a valid pairing, but the same `1600` paired with `US` is invalid (not a 5-digit ZIP) and silently keeps "Proceed to checkout" disabled. Any future change to `BILLING_ADDRESS.country` in `CheckoutPage.ts` must keep `postalCode` in a format that country actually accepts, or checkout breaks for scenarios #4, #5, and #6 (they share the `checkout()` helper).
- **Invoice total renders in three different text formats** depending on where it's displayed — the invoices list "Total" column and the invoice-detail page's line-item "Price"/"Total" table cells all show `$14.15` (no space), while the invoice-detail page's own top-of-page "Total" input field shows `$ 14.15` (with a space after `$`). One shared price constant can't satisfy all of these; `DEFAULT_PRODUCTS` in `CheckoutPage.ts` carries both `productPriceWithoutSpace` and `productPriceWithSpace` for this reason.
- **Line-items table column order:** the invoice-detail page's line-items table has 4 columns in this order — Quantity, Product, Price, Total (not Product/Price/Total as originally assumed). `InvoiceDetailsPage.ts` locators are indexed accordingly (`productQuantityCells` through `productPriceTotalCells`, nth-child(1) through (4)).

### Access control & scope decisions

- Direct URL access to another customer's invoice (`/account/invoices/<ULID>`) is backend-enforced, not just a frontend hide — confirmed with two independent site-provided accounts (scenario #9's `SEEDED_USER1`/`SEEDED_USER2`): `GET https://api.practicesoftwaretesting.com/invoices/<id>` returns **404**, and the frontend shows "This invoice doesn't exist."
- Guest checkout (the "Continue as Guest" option at the Sign In step) also produces a real invoice number, but since a guest order isn't tied to any account, there's no logged-in view to check it from afterward — considered and dropped as a scenario since it falls outside this AC's "logged-in customer" framing.
- Pagination (scenario #10) needs 16+ invoices to trigger a real second page — too slow/risky to self-seed via 16+ real checkouts in one test (each checkout takes ~15-20s, and the site does periodic data refreshes that could wipe a self-registered user's data mid-test). Decision: use one of the site's provided/seeded test accounts instead, and assert structurally (next-page control exists, page 2 shows different invoices than page 1) rather than exact counts, since the seed account's invoice count isn't something this test controls. Keep that test read-only — no creating/modifying/deleting anything on a shared account.

### Test data strategy — seeded accounts & env vars

- Scenarios #7 and #9 use a new `'User from Seeded Accounts'` describe block (`customer-invoices.spec.ts`) logging in with site-provided seeded accounts instead of a fresh `registeredUser` + checkout — avoids the checkout flow's `#order-confirmation` flake entirely (see below) and needs whatever invoices are already on those accounts. Scenario #9 needs two separate accounts (`SEEDED_USER1`, `SEEDED_USER2`) to prove cross-account isolation; it signs out of one and logs into the other within the same test rather than using two separate browser sessions.
- Since a seeded/shared account's invoice list isn't test-controlled, tests read the first invoice dynamically (`invoicesPage.allInvoiceNumbers()[0]`) rather than hardcoding a specific invoice number — same reasoning as scenario #10's pagination approach below.
- Scenario #10 confirmed the pagination controls live: single-step Previous (`«`, `data-test="pagination-prev"`) and Next (`»`, `data-test="pagination-next"`) only — no jump-to-first/last controls. Numbered page links have no `data-test`, but a stable `aria-label="Page-N"`. The seeded account used has 3 pages of invoices (15/page), comfortably past the "16+" threshold needed. The test stays structural per the read-only decision above: it compares the full invoice-number arrays between page 1 and page 2 (`not.toEqual`) and confirms a round-trip back to page 1 matches exactly, without asserting on specific invoice numbers.
- Login credentials (`ADMIN_EMAIL`/`ADMIN_PASSWORD` for stock management, `SEEDED_USER_EMAIL1`/`SEEDED_USER_PASSWORD1` and `SEEDED_USER_EMAIL2`/`SEEDED_USER_PASSWORD2` for scenarios #7 and #9) live in a gitignored `.env`, loaded via `dotenv` in `playwright.config.ts`; `.env.example` documents the required keys. `InvoicesPage.ts` throws immediately at load time (`requireEnv` helper) if a required variable is missing, rather than silently passing `undefined` into `login()`.
- **Resolved — cross-browser download collision:** running scenario #7 across all 3 browser projects in parallel initially risked a file collision — all 3 workers log into the same seeded account, hit the same first invoice, and so would `saveAs` the download to the identical hardcoded path at the same time. Fixed by using Playwright's `testInfo.outputPath(filename)` instead of a manual path, which gives each test (per browser project) its own isolated output directory.
- **Resolved — scenario #9 was a false positive on first pass:** the invoice-details URL is keyed by the invoice's ULID (e.g. `/account/invoices/01M1FXH2D80GYNG0NTP9KSEGW3`), not the human-readable "INV-XXXXXXX" invoice number shown in the list. An early version built the cross-account URL from the invoice number string instead of the real ULID — confirmed live that this produces "This invoice doesn't exist." even for the invoice's own rightful owner, meaning the test wasn't exercising access control at all, just a malformed-ID 404. Fixed by capturing `page.url()` right after navigating into the real details page (while still logged in as the owner) and reusing that captured URL for the cross-account attempt. The test also has user 2 open their own invoice first as a positive control, so a "doesn't exist" result can't be mistaken for a broken details page rather than a real access-control block.

### Known flakiness — checkout confirmation (scenarios 4, 5 & 6)

Completing checkout requires two clicks of the same "Confirm" button (`[data-test="finish"]`) — the first submits payment (shows "Payment was successful" on the same Payment step), the second actually places the order and navigates to the "Thanks for your order" confirmation page (`#order-confirmation`). That second navigation intermittently never completes.

- Originally characterized as concurrent-load-only (passed reliably solo, only flaked alongside other browser projects). Revisited during scenario #5 build-out and found to now fail **solo** too, roughly 30-50% of runs.
- Scenario #6 doubles exposure to this flake since it runs the `checkout()` helper twice per test — observed 3 failures out of 4 solo runs, all at the identical `finishButton.click()` → `#order-confirmation` step, none related to scenario #6's own list/detail-page assertion logic (which passed cleanly on the one full run that got past checkout).

Two fixes were attempted and neither closed it:

1. Hypothesized a frontend DOM re-render race (the same `[data-test="finish"]` locator serves both the "Finish" and "Confirm" states) and added `await expect(checkoutPage.finishButton).toHaveText('Confirm')` before the second click. No effect — the failure snapshot showed the button already correctly labeled "Confirm" before the click, ruling out a frontend timing cause. Reverted.
2. Bumped the confirmation assertion's timeout from 15s to 30s. Reduced but did not eliminate the failure — still reproduced in solo runs at 30s.

**Conclusion:** this looks like backend response latency on the order-placement request itself (the shared public demo backend), not something fixable from the test side. Still treated as a known, accepted, environment-level flake — not a bug in the test or the app code under test — same category as the pre-existing `registeredUser` fixture flake seen intermittently on webkit. Rerun if hit.

**Caution if the confirmation timeout is raised further:** scenario #4's overall `test.setTimeout(45000)` wasn't raised alongside the 30s assertion timeout, so the *outer* test timeout can now fire before the *inner* 30s assertion finishes waiting, surfacing as a less-informative "Test timeout of 45000ms exceeded" instead of the specific assertion failure. Bump `test.setTimeout` to stay comfortably ahead of whatever the confirmation timeout is set to.

### Scope gaps

**Scenario 7 content not verified:** the AC's testing guidance says "open file, verify correct content," which would need a PDF-parsing library (e.g. `pdf-parse`) to extract and assert on text — Playwright itself only hands back the raw downloaded file, it doesn't parse PDF content. Decided to skip that for now rather than add a new dependency for one scenario. This is a deliberate, acknowledged gap, not full AC coverage: scenario #7 as scoped only proves a PDF downloads successfully (download event fires, `.pdf` extension, non-zero size) — it does **not** verify the invoice number/total/line items inside the PDF are correct. Revisit if `pdf-parse` (or similar) becomes worth adding.
