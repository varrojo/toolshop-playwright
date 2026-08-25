# Customer Profile — Scenario Plan

[← Back to README](../../README.md#scenarios-covered-per-module)

Status: ⚪ Not started — 0 of 17 scenarios done.

Source: site's Testing Guide, feature #4 (Customer Profile).

**Acceptance Criteria**

- First name, last name, phone, address fields can be updated.
- Password reset cannot reuse the current password.
- After password reset, user is logged out automatically.

**Techniques applied:** Equivalence Partitioning (valid vs. invalid phone, postal code), State Transition Testing (session state after password reset), Boundary Value Analysis (field length max, e.g. 40 chars for city).

**Out of scope:** the Profile page also has a "Set up Two-Factor Authentication" section (QR code, manual key, `totp-code`/`verify-totp`) below the Password form — not covered by this module's AC. Would need its own AC/testing guidance before scoping scenarios for it.

## Test account strategy

Password-change scenarios mutate the account's actual credential, so each one needs its own disposable, freshly-registered user (same pattern as `login.md`'s lockout-adjacent scenarios) — reusing one account across parallel password-reset tests would leave later tests unable to log in with the password they expect. Field-update scenarios (name/phone/address) don't mutate credentials and can share a single `registeredUser`-style fixture per test.

Confirmed live: the Profile page's fields/validators take a moment to finish loading after navigation — submitting immediately after arriving on `/account/profile` can show "Please correct the highlighted fields before saving." even with valid data in every field. The POM's navigation/goto step should wait for the form to be genuinely interactive (e.g. wait for a populated field value, not just element visibility) before any test fills it in.

## Scenarios

| #   | Scenario                                                     | Expected result                                                                                                                                                                            | Status         |
| --- | ------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------- |
| 1   | Update first name                                            | Persists after reload                                                                                                                                                                      | ⚪ Not started |
| 2   | Update last name                                             | Persists after reload                                                                                                                                                                      | ⚪ Not started |
| 3   | Update phone                                                 | Persists after reload                                                                                                                                                                      | ⚪ Not started |
| 4   | Update street                                                | Persists after reload                                                                                                                                                                      | ⚪ Not started |
| 5   | Update postal code                                           | Persists after reload                                                                                                                                                                      | ⚪ Not started |
| 6   | Update city                                                  | Persists after reload                                                                                                                                                                      | ⚪ Not started |
| 7   | Update state                                                 | Persists after reload                                                                                                                                                                      | ⚪ Not started |
| 8   | Update country                                               | Persists after reload — **note:** unlike Register's `<select>` dropdown, this is a plain text `<input>` here, confirmed live                                                               | ⚪ Not started |
| 9   | City, 41 characters (BVA)                                    | "The address.city field must not be greater than 40 characters." — confirmed live                                                                                                          | ⚪ Not started |
| 10  | Phone, invalid format (EP)                                   | "Please enter a valid phone number (digits, spaces and ( ) + - only)." — confirmed live; **note:** wording differs from Register's "Only numbers are allowed."                             | ⚪ Not started |
| 11  | Postal code, invalid characters (letters/symbols)            | No rejection — confirmed live the field has no format validation, update succeeds regardless of content. Not a valid EP negative case; consider a max-length (BVA) test instead.           | ⚪ Not started |
| 12  | Password reset: new password same as current                 | "New Password cannot be same as your current password." — confirmed live                                                                                                                   | ⚪ Not started |
| 13  | Password reset: empty current password                       | "Unauthorized" shown — confirmed live                                                                                                                                                      | ⚪ Not started |
| 14  | Password reset: valid new password, correct current password | Green snackbar "Your password is successfully updated!" (auto-dismisses after a few seconds — assert before it disappears), then auto-logout, redirected to `/auth/login` — confirmed live | ⚪ Not started |
| 15  | Login with new password after successful reset               | Redirect to `/account`                                                                                                                                                                     | ⚪ Not started |
| 16  | Login with old password after successful reset               | "Invalid email or password" — confirmed live                                                                                                                                               | ⚪ Not started |
| 17  | State transition: logged in → password reset → logged out    | Redirected to `/auth/login`, session ended — confirmed live                                                                                                                                | ⚪ Not started |
