# Customer Favorites — Scenario Plan

[← Back to README](../../README.md#scenarios-covered-per-module)

Status: 🟡 In progress — scenarios drafted, not yet implemented.

Source: site's Testing Guide, feature #5 (Customer Favorites).

**Acceptance Criteria**

- User can add a product to favorites from the product detail page.
- Favorited products appear in the Favorites list.
- User can remove a favorite from the list and it no longer appears there.

**Techniques applied:** State Transition Testing (product state: not favorite → favorite → not favorite), Error Guessing (attempting to favorite while logged out).

Confirmed live (DOM check via a throwaway script, both pages logged out): the listing/category page's `data-test` attributes have no favorite-related element at all — `add-to-favorites` only exists on the product detail page. The original AC draft said "listing or detail page"; narrowed to detail page only since the listing page has no such affordance.

Equivalence Partitioning against an "unavailable product" was considered but dropped: confirmed live that `add-to-favorites` is present, enabled, and behaves identically on an out-of-stock product's detail page and an in-stock one's — only `add-to-cart` gets disabled for out-of-stock. There's no distinct behavior to test, so the technique doesn't apply here.

## Scenarios

| #   | Scenario                                                              | Expected result                                                                                                                    | Status   |
| --- | --------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- | -------- |
| 1   | Login with a fresh account, no favorites yet                          | "There are no favorites yet. In order to add favorites, please go to the product listing and mark some products as your favorite." | 📝 To Do |
| 2   | Add a product to favorites from its detail page                       | "Product added to your favorites list." alert; product appears correctly in the favorites list                                     | 📝 To Do |
| 3   | Add the same product to favorites a second time                       | "Product already in your favorites list." alert; still only 1 entry for that product in the favorites list                         | 📝 To Do |
| 4   | Click add-to-favorites 3 times on an already-favorited product        | "Product already in your favorites list." alert shown on each of the 3 clicks                                                      | 📝 To Do |
| 5   | Add 2 different products to favorites                                 | Both products appear in the favorites list, with correct product details for each                                                  | 📝 To Do |
| 6   | Add 1 product to favorites, then delete it                            | Product removed from the favorites list; empty-state message ("There are no favorites yet...") reappears                           | 📝 To Do |
| 7   | Add 2 different products to favorites, then delete 1                  | Correct product removed, the other remains with correct details; empty-state message is **not** shown                              | 📝 To Do |
| 8   | Add a product to favorites, then sign out and log back in             | Favorited product is still present in the favorites list after re-login                                                            | 📝 To Do |
| 9   | Navigate to favorites via nav-menu → username → "My Favorites"        | Correct favorited product is shown (alternate navigation path to the favorites list)                                               | 📝 To Do |
| 10  | Attempt to add a product to favorites while logged out                | "Unauthorized, can not add product to your favorite list." alert                                                                   | 📝 To Do |
| 11  | Cross-user isolation: User A favorites a product, then User B logs in | User B's favorites list does not include the product User A favorited — favorites are scoped per account, not shared/global        | 📝 To Do |
