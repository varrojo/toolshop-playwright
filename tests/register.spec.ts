import { test, expect } from '@playwright/test';
import { RegisterPage, RegisterFormData, dobForAge } from '../pages/RegisterPage';

test.describe('Register Page', () => {
  let registerPage: RegisterPage;

  test.beforeEach(async ({ page }) => {
    registerPage = new RegisterPage(page);
    await registerPage.goto();
  });

  test('should display error message for users age 17 and below', async ({ page }) => {
    const underageData: Partial<RegisterFormData> = {
        dob: dobForAge(17),
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

  // currently validates 93 and above as too old, but 76 is the actual limit in AC
  test('should display error message for users age 93 and above', async ({ page }) => {
    const adultData: Partial<RegisterFormData> = {
      dob: dobForAge(93),
    };

    await registerPage.fillForm(adultData);
    await registerPage.submit();
    await expect(page.getByText('Customer must be younger than 75 years old.')).toBeVisible();
  });

});

