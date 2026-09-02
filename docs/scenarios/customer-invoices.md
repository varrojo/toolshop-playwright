# Customer Invoices — Scenario Plan

[← Back to README](../../README.md#scenarios-covered-per-module)

Status: 🟡 In progress — 6 of 10 scenarios done.

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

Confirmed live (scenario #5 build-out): the billing address form validates postal code format against the selected country — e.g. country `PH` with postal code `1600` is a valid pairing, but the same `1600` paired with `US` is invalid (not a 5-digit ZIP) and silently keeps "Proceed to checkout" disabled. Any future change to `BILLING_ADDRESS.country` in `CheckoutPage.ts` must keep `postalCode` in a format that country actually accepts, or checkout breaks — for both scenario #4 and #5, since they share the `checkout()` helper.

Confirmed live (scenario #5 build-out): the invoice total price renders as **three different text formats** depending on where it's displayed — the invoices list "Total" column and the invoice-detail page's line-item "Price"/"Total" table cells all show `$14.15` (no space), while the invoice-detail page's own top-of-page "Total" input field shows `$ 14.15` (with a space after `$`). One shared price constant can't satisfy all of these; `DEFAULT_PRODUCT` in `CheckoutPage.ts` carries both `productPriceWithoutSpace` and `productPriceWithSpace` for this reason.

Confirmed live (scenario #5 build-out): the invoice-detail page's line-items table has 4 columns in this order — Quantity, Product, Price, Total (not Product/Price/Total as originally assumed) — `InvoiceDetailsPage.ts` locators are indexed accordingly (`productQuantityCells` through `productPriceTotalCells`, nth-child(1) through (4)).

## Scenarios

| #   | Scenario                                                                        | Expected result                                                                                                            | Status   |
| --- | ------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- | -------- |
| 1   | Login with a fresh account, no invoices yet                                     | Invoices list shows only the table header row, no data rows, no explicit empty-state message                               | ✅ Done  |
| 2   | Navigate to invoices via nav-menu → "My invoices"                               | Correct invoices list is shown (nav-menu path)                                                                             | ✅ Done  |
| 3   | Navigate to invoices via Account dashboard → "Invoices" button                  | Correct invoices list is shown (direct-link path)                                                                          | ✅ Done  |
| 4   | Complete a purchase                                                             | A new invoice appears in the list with correct Invoice Number, Invoice Date, and Total                                     | ✅ Done  |
| 5   | Click an invoice in the list                                                    | Navigates to the detail page; Invoice Number, Invoice Date, and Total match the list row (State Transition Testing)        | ✅ Done  |
| 6   | Complete 2 separate purchases                                                   | Both invoices appear in the list, each with correct individual data, not cross-contaminated                                | ✅ Done  |
| 7   | Click "Download PDF" on an invoice detail page                                  | A PDF file downloads successfully (`.pdf`, non-zero size) — content not verified, see note below                           | 📝 To Do |
| 8   | Attempt to access the invoices list while logged out                            | Redirects to the login page (EP: logged-in vs logged-out)                                                                  | 📝 To Do |
| 9   | Attempt direct URL access to another customer's invoice                         | 404 — "This invoice doesn't exist." (Error Guessing)                                                                       | 📝 To Do |
| 10  | Pagination: view invoices list for an account with 16+ invoices (site-provided) | A "next page" control exists; navigating to it shows different invoices than page 1 (read-only, structural assertion only) | 📝 To Do |

**Scenarios 4, 5 & 6 flaky (shared `checkout()` helper):** completing checkout requires two clicks of the same "Confirm" button (`[data-test="finish"]`) — the first submits payment (shows "Payment was successful" on the same Payment step), the second actually places the order and navigates to the "Thanks for your order" confirmation page (`#order-confirmation`). That second navigation intermittently never completes.

Scenario #6 doubles exposure to this flake since it runs the `checkout()` helper twice per test — observed 3 failures out of 4 solo runs, all at the identical `finishButton.click()` → `#order-confirmation` step, none related to scenario #6's own list/detail-page assertion logic (which passed cleanly on the one full run that got past checkout).

Originally characterized as concurrent-load-only (passed reliably solo, only flaked alongside other browser projects). Revisited during scenario #5 build-out and found to now fail **solo** too, roughly 30-50% of runs. Two fixes were attempted and neither closed it:

- Hypothesized a frontend DOM re-render race (the same `[data-test="finish"]` locator serves both the "Finish" and "Confirm" states) and added `await expect(checkoutPage.finishButton).toHaveText('Confirm')` before the second click. No effect — the failure snapshot showed the button already correctly labeled "Confirm" before the click, ruling out a frontend timing cause. Reverted.
- Bumped the confirmation assertion's timeout from 15s to 30s. Reduced but did not eliminate the failure — still reproduced in solo runs at 30s.

Conclusion: this looks like backend response latency on the order-placement request itself (the shared public demo backend), not something fixable from the test side. Still treated as a known, accepted, environment-level flake — not a bug in the test or the app code under test — same category as the pre-existing `registeredUser` fixture flake seen intermittently on webkit. Rerun if hit.

Caution if the confirmation timeout is raised further: scenario #4's overall `test.setTimeout(45000)` wasn't raised alongside the 30s assertion timeout, so the *outer* test timeout can now fire before the *inner* 30s assertion finishes waiting, surfacing as a less-informative "Test timeout of 45000ms exceeded" instead of the specific assertion failure. Bump `test.setTimeout` to stay comfortably ahead of whatever the confirmation timeout is set to.

**Scenario 7 content not verified:** the AC's testing guidance says "open file, verify correct content," which would need a PDF-parsing library (e.g. `pdf-parse`) to extract and assert on text — Playwright itself only hands back the raw downloaded file, it doesn't parse PDF content. Decided to skip that for now rather than add a new dependency for one scenario. This is a deliberate, acknowledged gap, not full AC coverage: scenario #7 as scoped only proves a PDF downloads successfully (download event fires, `.pdf` extension, non-zero size) — it does **not** verify the invoice number/total/line items inside the PDF are correct. Revisit if `pdf-parse` (or similar) becomes worth adding.
