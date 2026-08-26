import { test, expect } from '../fixtures/fixtures';
import {
  ProfileFormData,
  ProfilePage,
  PROFILE_UPDATE_SUCCESS_MESSAGE,
  PROFILE_UPDATE_FAILURE_MESSAGE_EMPTY_FIELD,
  CHANGE_PASSWORD_CURRENT_INCORRECT,
  CHANGE_PASSWORD_NEW_AND_CONFIRM_DOES_NOT_MATCH,
  CHANGE_PASSWORD_SUCCESS,
  CHANGE_PASSWORD_SAME_AS_CURRENT,
  CHANGE_PASSWORD_NEW_REQUIRED
} from '../pages/ProfilePage';
import { AccountPage } from '../pages/AccountPage';
import { LoginPage } from '../pages/LoginPage';
import { Locator, Page } from '@playwright/test';

test.describe('Customer Profile Page', () => {
  let profilePage: ProfilePage;
  let accountPage: AccountPage;
  let loginPage: LoginPage;

  test.beforeEach(async ({ page, registeredUser }) => {
    loginPage = new LoginPage(page);
    profilePage = new ProfilePage(page);
    accountPage = new AccountPage(page);
    await loginPage.goto();
    await loginPage.login(registeredUser.email, registeredUser.password);
    await expect(page).toHaveURL(/.*\/account/);

    await accountPage.goto();
    await profilePage.waitUntilLoaded();
    await expect(page).toHaveURL('/account/profile');
  });

  test.describe('Successful Updates', () => {
    test('should display successful confirmation message for first name update', async ({ page }) => {
      await expectSuccessfulUpdate(page, profilePage, 'firstName', 'Updated First Name');
    });

    test('should display successful confirmation message for last name update', async ({ page }) => {
      await expectSuccessfulUpdate(page, profilePage, 'lastName', 'Updated Last Name');
    });

    test('should display successful confirmation message for phone update', async ({ page }) => {
      const newPhoneNumberWith7Chars = '1'.repeat(7);
      await expectSuccessfulUpdate(page, profilePage, 'phone', newPhoneNumberWith7Chars);
    });

    // 08/25/2026 - different validation from registration page
    test('should display successful confirmation message for phone update with "+" symbol', async ({ page }) => {
      const newPhoneNumberWithPlusSign = '+1234567';
      await expectSuccessfulUpdate(page, profilePage, 'phone', newPhoneNumberWithPlusSign);
    });

    // 08/25/2026 - different validation from registration page
    test('should display successful confirmation message for phone update with "-" symbol', async ({ page }) => {
      const newPhoneNumberWithMinusSign = '-1234567';
      await expectSuccessfulUpdate(page, profilePage, 'phone', newPhoneNumberWithMinusSign);
    });

    // 08/25/2026 - different validation from registration page
    test('should display successful confirmation message for phone update with spaces', async ({ page }) => {
      const newPhoneNumberWithSpaces = '123 456 789';
      await expectSuccessfulUpdate(page, profilePage, 'phone', newPhoneNumberWithSpaces);
    });

    // 08/25/2026 - different validation from registration page
    test('should display successful confirmation message for phone update with parentheses', async ({ page }) => {
      const newPhoneNumberWithParentheses = '(123) 456 789';
      await expectSuccessfulUpdate(page, profilePage, 'phone', newPhoneNumberWithParentheses);
    });

    test('should display successful confirmation message for street update', async ({ page }) => {
      await expectSuccessfulUpdate(page, profilePage, 'street', 'Updated Street');
    });

    test('should display successful confirmation message for postal code update', async ({ page }) => {
      await expectSuccessfulUpdate(page, profilePage, 'postalCode', '1112223334');
    });

    test('should display successful confirmation message for postal code with symbols/letters', async ({ page }) => {
      await expectSuccessfulUpdate(page, profilePage, 'postalCode', 'AQ!@#$%^&*');
    });

    test('should display successful confirmation message for city update', async ({ page }) => {
      await expectSuccessfulUpdate(page, profilePage, 'city', 'Updated City');
    });

    test('should display successful confirmation message for state update', async ({ page }) => {
      await expectSuccessfulUpdate(page, profilePage, 'state', 'Updated State');
    });

    test('should display successful confirmation message for country update', async ({ page }) => {
      await expectSuccessfulUpdate(page, profilePage, 'country', 'Updated Country');
    });

    test('should have email field as readonly', async () => {
      await expect(profilePage.emailInput).toHaveAttribute('readonly', '');
    });
  });

  test.describe('Failed Updates', () => {
    test('should display error message for city with more than 40 characters', async ({ page }) => {
      const newCityWith40Characters = 'A'.repeat(41);
      const expectedErrorMessage = 'The address.city field must not be greater than 40 characters.';
      await expectValidationError(page, profilePage, 'city', newCityWith40Characters, expectedErrorMessage);
    });

    test('should display error message for phone with invalid characters', async ({ page }) => {
      const newPhoneNumberWithInvalidCharacters = 'A1234567';
      const expectedErrorMessage = 'Please enter a valid phone number (digits, spaces and ( ) + - only).';
      await expectValidationError(page, profilePage, 'phone', newPhoneNumberWithInvalidCharacters, expectedErrorMessage);
    });

    test('should display error message for phone with less than 7 characters', async ({ page }) => {
      const newPhoneNumberWithLessThan7Characters = '1'.repeat(6);
      const expectedErrorMessage = 'Please enter a valid phone number (digits, spaces and ( ) + - only).';
      await expectValidationError(page, profilePage, 'phone', newPhoneNumberWithLessThan7Characters, expectedErrorMessage);
    });

    test('should display error message for postal code with more than 10 characters', async ({ page }) => {
      const newPostalCodeWithMoreThan10Characters = '1'.repeat(11);
      const expectedErrorMessage = 'The address.postal code field must not be greater than 10 characters.';
      await expectValidationError(page, profilePage, 'postalCode', newPostalCodeWithMoreThan10Characters, expectedErrorMessage);
    });

    test('should display error message for blank first name', async ({ page }) => {
      await expectValidationError(page, profilePage, 'firstName', '', PROFILE_UPDATE_FAILURE_MESSAGE_EMPTY_FIELD);
    });

    test('should display error message for blank last name', async ({ page }) => {
      await expectValidationError(page, profilePage, 'lastName', '', PROFILE_UPDATE_FAILURE_MESSAGE_EMPTY_FIELD);
    });

    test('should display error message for blank phone', async ({ page }) => {
      await expectValidationError(page, profilePage, 'phone', '', PROFILE_UPDATE_FAILURE_MESSAGE_EMPTY_FIELD);
    });

    test('should display error message for blank street', async ({ page }) => {
      await expectValidationError(page, profilePage, 'street', '', PROFILE_UPDATE_FAILURE_MESSAGE_EMPTY_FIELD);
    });

    test('should display error message for blank postal code', async ({ page }) => {
      await expectValidationError(page, profilePage, 'postalCode', '', PROFILE_UPDATE_FAILURE_MESSAGE_EMPTY_FIELD);
    });

    test('should display error message for blank city', async ({ page }) => {
      await expectValidationError(page, profilePage, 'city', '', PROFILE_UPDATE_FAILURE_MESSAGE_EMPTY_FIELD);
    });

    test('should display error message for blank state', async ({ page }) => {
      await expectValidationError(page, profilePage, 'state', '', PROFILE_UPDATE_FAILURE_MESSAGE_EMPTY_FIELD);
    });

    test('should display error message for blank country', async ({ page }) => {
      await expectValidationError(page, profilePage, 'country', '', PROFILE_UPDATE_FAILURE_MESSAGE_EMPTY_FIELD);
    });
  });

  test.describe('Change Password Updates', () => {
    test('should display error message when new password is same as current password', async ({ page, registeredUser }) => {
      const currentPassword = registeredUser.password;
      const newPassword = registeredUser.password;
      const confirmPassword = registeredUser.password;

      await profilePage.updatePassword(currentPassword, newPassword, confirmPassword);

      const expectedErrorMessage = CHANGE_PASSWORD_SAME_AS_CURRENT;
      await expect(page.getByRole('alert').filter({ hasText: expectedErrorMessage })).toBeVisible();
    });

    test('should display error message when current password is blank', async ({ page, registeredUser }) => {
      const currentPassword = '';
      const newPassword = `${registeredUser.password}A`;
      const confirmPassword = newPassword;

      await profilePage.updatePassword(currentPassword, newPassword, confirmPassword);

      const expectedErrorMessage = CHANGE_PASSWORD_CURRENT_INCORRECT;
      await expect(page.getByRole('alert').filter({ hasText: expectedErrorMessage })).toBeVisible();
    });

    test('should display error message when all password fields are blank', async ({ page, registeredUser }) => {
      const currentPassword = '';
      const newPassword = '';
      const confirmPassword = '';

      await profilePage.updatePassword(currentPassword, newPassword, confirmPassword);

      const expectedErrorMessage = CHANGE_PASSWORD_CURRENT_INCORRECT;
      await expect(page.getByRole('alert').filter({ hasText: expectedErrorMessage })).toBeVisible();
    });

    test('should display error message when new password field is blank', async ({ page, registeredUser }) => {
      const currentPassword = registeredUser.password;
      const newPassword = '';
      const confirmPassword = `${registeredUser.password}A`;

      await profilePage.updatePassword(currentPassword, newPassword, confirmPassword);

      const expectedErrorMessage = CHANGE_PASSWORD_NEW_REQUIRED;
      await expect(page.getByRole('alert').filter({ hasText: expectedErrorMessage })).toBeVisible();
    });

    test('should display error message when new and confirm password does not match', async ({ page, registeredUser }) => {
      const currentPassword = registeredUser.password;
      const newPassword = `${registeredUser.password}A`;
      const confirmPassword = `${registeredUser.password}B`;

      await profilePage.updatePassword(currentPassword, newPassword, confirmPassword);

      const expectedErrorMessage = CHANGE_PASSWORD_NEW_AND_CONFIRM_DOES_NOT_MATCH;
      await expect(page.getByRole('alert').filter({ hasText: expectedErrorMessage })).toBeVisible();
    });

    test('should display error message when confirm password is blank', async ({ page, registeredUser }) => {
      const currentPassword = registeredUser.password;
      const newPassword = `${registeredUser.password}A`;
      const confirmPassword = '';

      await profilePage.updatePassword(currentPassword, newPassword, confirmPassword);

      const expectedErrorMessage = CHANGE_PASSWORD_NEW_AND_CONFIRM_DOES_NOT_MATCH;
      await expect(page.getByRole('alert').filter({ hasText: expectedErrorMessage })).toBeVisible();
    });

    test('should display confirmation message for successful change password and autologout the user', async ({ page, registeredUser }) => {
      const currentPassword = registeredUser.password;
      const newPassword = `${registeredUser.password}A`;
      const confirmPassword = newPassword;

      await profilePage.updatePassword(currentPassword, newPassword, confirmPassword);
      await resetPasswordAndExpectLogout(page);
    });

    test('should be able to login using new password', async ({ page, registeredUser }) => {
      const currentPassword = registeredUser.password;
      const newPassword = `${registeredUser.password}A`;
      const confirmPassword = newPassword;

      await profilePage.updatePassword(currentPassword, newPassword, confirmPassword);
      await resetPasswordAndExpectLogout(page);

      await loginPage.login(registeredUser.email, newPassword);
      await expect(page).toHaveURL(/.*\/account/);
    });

    test('should not be able to login using old password', async ({ page, registeredUser }) => {
      const currentPassword = registeredUser.password;
      const newPassword = `${registeredUser.password}A`;
      const confirmPassword = newPassword;

      await profilePage.updatePassword(currentPassword, newPassword, confirmPassword);
      await resetPasswordAndExpectLogout(page);

      await loginPage.login(registeredUser.email, currentPassword);
      await expect(page.getByText('Invalid email or password')).toBeVisible();
      await expect(page).toHaveURL('/auth/login');
    });
  });
});

function fieldInput(profilePage: ProfilePage, field: keyof ProfileFormData): Locator {
  const map: Record<keyof ProfileFormData, Locator> = {
    firstName: profilePage.firstNameInput,
    lastName: profilePage.lastNameInput,
    phone: profilePage.phoneInput,
    street: profilePage.streetInput,
    postalCode: profilePage.postalCodeInput,
    city: profilePage.cityInput,
    state: profilePage.stateInput,
    country: profilePage.countryInput
  };
  return map[field];
}

async function expectSuccessfulUpdate(page: Page, profilePage: ProfilePage, field: keyof ProfileFormData, value: string) {
  await profilePage.fillForm({ [field]: value } as Partial<ProfileFormData>);
  await profilePage.updateProfile();
  await expect(page.getByRole('alert').filter({ hasText: PROFILE_UPDATE_SUCCESS_MESSAGE })).toBeVisible();

  await profilePage.goto();
  await expect(fieldInput(profilePage, field)).toHaveValue(value);
}

async function expectValidationError(page: Page, profilePage: ProfilePage, field: keyof ProfileFormData, value: string, message: string) {
  await profilePage.fillForm({ [field]: value } as Partial<ProfileFormData>);
  await profilePage.updateProfile();
  await expect(page.getByRole('alert').filter({ hasText: message })).toBeVisible();
}

async function resetPasswordAndExpectLogout(page: Page) {
  const expectedMessage = CHANGE_PASSWORD_SUCCESS;
  await expect(page.getByRole('alert').filter({ hasText: expectedMessage })).toBeVisible();
  await page.waitForURL('/auth/login');
}
