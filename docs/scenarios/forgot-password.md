# Forgot Password — Scenario Plan

Status: ⚪ Not started — 0 of 5 scenarios done.

Source: site's Testing Guide, feature #3 (Forgot Password).

**Acceptance Criteria**

- Email must exist in the system.
- New password is set to `welcome02` (for demo).
- User can log in with the new password immediately.

**Techniques applied:** Equivalence Partitioning (email exists vs. doesn't exist vs. malformed vs. missing), State Transition Testing (user state changes from "cannot log in" → "can log in" after reset, and the old password stops working).

## Scenarios

| #   | Scenario                             | Expected result                                                                                                                                          | Status         |
| --- | ------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------- |
| 1   | Unregistered/unknown email            | "The selected email is invalid."                                                                                                                             | ⚪ Not started |
| 2   | Empty email                           | "Email is required"                                                                                                                                          | ⚪ Not started |
| 3   | Malformed email format                | `email-error` box is displayed but contains no text — **see Issue #1**                                                                                       | ⚪ Not started |
| 4   | Valid registered email → login with new password | Notification shown (renders as the literal untranslated key `page.forgot-password.confirm`, not real message text); password reset to `welcome02`; user can log in with the new password | ⚪ Not started |
| 5   | Valid registered email → old password rejected   | Same reset as #4; user can no longer log in with their old password                                                                                       | ⚪ Not started |

## Issues Found

### Issue #1 — Malformed email format shows an empty error message

On the Forgot Password form, submitting a malformed email (invalid format) displays the `email-error` element, but it renders with no text content. Per the AC's implied "clear error" expectation (and consistent with Login's "Email format is invalid" message for the same kind of input), this should show a specific validation message instead of an empty error box — likely a missing or broken message binding for this validation case.
