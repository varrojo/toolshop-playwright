import { test, expect } from '@playwright/test';
import { RegisterPage, RegisterFormData, dobForAge } from '../pages/RegisterPage';

test.describe('Register Page', () => {
  let registerPage: RegisterPage;

  test.beforeEach(async ({ page }) => {
    registerPage = new RegisterPage(page);
    await registerPage.goto();
  });

  test.describe('Age Validation', () => {
    test('should display error message for users age 17 and below', async ({ page }) => {
      const underageData: Partial<RegisterFormData> = {
        dob: dobForAge(17)
      };
      await registerPage.fillForm(underageData);
      await registerPage.submit();
      await expect(page.getByText('Customer must be 18 years old.')).toBeVisible();
    });

    test('should create account for users age 18 years old and 1 day old', async ({ page }) => {
      const adultData: Partial<RegisterFormData> = {
        dob: dobForAge(18, -1) // Set dayOffset to -1 to ensure the user is 18 years old (fails when exactly 18 years old)
      };

      await registerPage.fillForm(adultData);
      await registerPage.submit();
      await expect(page).toHaveURL(/.*\/auth\/login/, { timeout: 10000 });
    });

    test('should create account for users age 75 years old', async ({ page }) => {
      const adultData: Partial<RegisterFormData> = {
        dob: dobForAge(75)
      };

      await registerPage.fillForm(adultData);
      await registerPage.submit();
      await expect(page).toHaveURL(/.*\/auth\/login/, { timeout: 10000 });
    });

    // 08/18/2026 - validates 93 and above as too old, but 76 is the actual limit in AC
    test('should display error message for users age 93 and above', async ({ page }) => {
      const adultData: Partial<RegisterFormData> = {
        dob: dobForAge(93)
      };

      await registerPage.fillForm(adultData);
      await registerPage.submit();
      await expect(page.getByText('Customer must be younger than 75 years old.')).toBeVisible();
    });
  });

  test.describe('First Name Validation', () => {
    test('should display error message for empty first name', async ({ page }) => {
      const invalidData: Partial<RegisterFormData> = {
        firstName: ''
      };
      await registerPage.fillForm(invalidData);
      await registerPage.submit();
      await expect(page.getByText('First name is required')).toBeVisible();
    });

    test('should display error message for first name with more than 40 characters', async ({ page }) => {
      const invalidData: Partial<RegisterFormData> = {
        firstName: 'A'.repeat(41)
      };
      await registerPage.fillForm(invalidData);
      await registerPage.submit();
      await expect(page.getByText('The first name field must not be greater than 40 characters.')).toBeVisible();
    });
  });
  test.describe('Last Name Validation', () => {
    test('should display error message for empty last name', async ({ page }) => {
      const invalidData: Partial<RegisterFormData> = {
        lastName: ''
      };
      await registerPage.fillForm(invalidData);
      await registerPage.submit();
      await expect(page.getByText('Last name is required')).toBeVisible();
    });

    test('should display error message for last name with more than 20 characters', async ({ page }) => {
      const invalidData: Partial<RegisterFormData> = {
        lastName: 'A'.repeat(21)
      };
      await registerPage.fillForm(invalidData);
      await registerPage.submit();
      await expect(page.getByText('The last name field must not be greater than 20 characters.')).toBeVisible();
    });
  });

  test.describe('Email Address Validation', () => {
    test('should display error message for empty email address', async ({ page }) => {
      const invalidData: Partial<RegisterFormData> = {
        email: ''
      };
      await registerPage.fillForm(invalidData);
      await registerPage.submit();
      await expect(page.getByText('Email is required')).toBeVisible();
    });

    test('should display error message for invalid email address format', async ({ page }) => {
      const invalidData: Partial<RegisterFormData> = {
        email: 'invalidemail'
      };

      await registerPage.fillForm(invalidData);
      await registerPage.submit();
      await expect(page.getByText('Email format is invalid')).toBeVisible();
    });

    test('should display error message for used email address', async ({ page }) => {
      const invalidData: Partial<RegisterFormData> = {
        email: 'emailalreadyexist@test.com'
      };

      await registerPage.fillForm(invalidData);
      await registerPage.submit();

      await registerPage.goto();
      await registerPage.fillForm(invalidData);
      await registerPage.submit();
      await expect(page.getByText('A customer with this email address already exists.')).toBeVisible();
    });
  });

  test.describe('Password Validation', () => {
    test('should display error message for empty password', async ({ page }) => {
      const invalidData: Partial<RegisterFormData> = {
        password: ''
      };
      await registerPage.fillForm(invalidData);
      await registerPage.submit();
      await expect(page.getByText('Password is required')).toBeVisible();
    });

    // 08/18/2026 - throws different error message as expected
    test('should display error message for password less than 8 characters', async ({ page }) => {
      const invalidData: Partial<RegisterFormData> = {
        password: 'A'.repeat(7)
      };
      await registerPage.fillForm(invalidData);
      await registerPage.submit();
      await expect(page.getByText('Password must be minimal 6 characters long.')).toBeVisible();
    });

    test('should display error message for password that has appeared in a data leak', async ({ page }) => {
      const invalidData: Partial<RegisterFormData> = {
        password: 'Password123!'
      };
      await registerPage.fillForm(invalidData);
      await registerPage.submit();
      await expect(page.getByText('The given password has appeared in a data leak. Please choose a different password.')).toBeVisible();
    });

    test('should not display green text for password that does not satisfy the bullet requirements', async ({ page }) => {
      const invalidData: Partial<RegisterFormData> = {
        password: 'passwor'
      };
      await registerPage.fillForm(invalidData);
      await registerPage.submit();
      await expect(page.getByText('Be at least 8 characters long')).not.toHaveClass(/text-success/);
      await expect(page.getByText('Contain both uppercase and lowercase letters')).not.toHaveClass(/text-success/);
      await expect(page.getByText('Include at least one number')).not.toHaveClass(/text-success/);
      await expect(page.getByText('Have at least one special symbol (e.g., @, #, $, etc.)')).not.toHaveClass(/text-success/);
    });

    test('should display green text for password that satisfied the bullet requirements', async ({ page }) => {
      const validPassword: Partial<RegisterFormData> = {
        password: 'P@ssword123'
      };
      await registerPage.fillForm(validPassword);
      await registerPage.submit();
      await expect(page.getByText('Be at least 8 characters long')).toHaveClass(/text-success/);
      await expect(page.getByText('Contain both uppercase and lowercase letters')).toHaveClass(/text-success/);
      await expect(page.getByText('Include at least one number')).toHaveClass(/text-success/);
      await expect(page.getByText('Have at least one special symbol (e.g., @, #, $, etc.)')).toHaveClass(/text-success/);
    });
  });
});
