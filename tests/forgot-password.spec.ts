import { test, expect } from '@playwright/test';
import { ForgotPasswordPage, NEW_PASSWORD } from '../pages/ForgotPasswordPage';
import { RegisterPage, RegisterFormData, DEFAULT_PASSWORD } from '../pages/RegisterPage';
import { LoginPage } from '../pages/LoginPage';

test.describe('Forgot Password Page', () => {
  let forgotPasswordPage: ForgotPasswordPage;
  let registerPage: RegisterPage;
  let loginPage: LoginPage;
  let email: string;

  test.beforeEach(async ({ page }) => {
    forgotPasswordPage = new ForgotPasswordPage(page);
    loginPage = new LoginPage(page);
  });

  test.describe('Valid Email', () => {
    test.beforeEach(async ({ page }) => {
      registerPage = new RegisterPage(page);
      await registerPage.goto();
      const validUser: Pick<RegisterFormData, 'email'> = {
        email: `validUser${crypto.randomUUID()}@gmail.com`
      };
      await registerPage.fillForm(validUser);
      await registerPage.submit();
      await expect(page).toHaveURL('/auth/login');

      email = validUser.email;
    });

    test('should be able to reset the password and login using the new password', async ({ page }) => {
      await loginPage.forgotPassword();
      await forgotPasswordPage.submitEmail(email);
      await expect(page).toHaveURL('/auth/forgot-password');
      await expect(page.getByText('page.forgot-password.confirm')).toBeVisible();

      await loginPage.goto();
      await loginPage.login(email, NEW_PASSWORD);
      await expect(page).toHaveURL(/.*\/account/);
    });

    test('should be able to reset the password and cannot login using the old password', async ({ page }) => {
      await loginPage.forgotPassword();
      await forgotPasswordPage.submitEmail(email);
      await expect(page).toHaveURL('/auth/forgot-password');
      await expect(page.getByText('page.forgot-password.confirm')).toBeVisible();

      await loginPage.goto();
      await loginPage.login(email, DEFAULT_PASSWORD);
      await expect(page.getByText('Invalid email or password')).toBeVisible();
      await expect(page).toHaveURL('/auth/login');
    });
  });

  test.describe('Invalid Email', () => {
    test('should display error when email field is empty', async ({ page }) => {
      await loginPage.goto();
      await loginPage.forgotPassword();
      await forgotPasswordPage.submitEmail('');
      await expect(page).toHaveURL('/auth/forgot-password');
      await expect(page.getByText('Email is required')).toBeVisible();
    });

    test('should display error when email is unregistered', async ({ page }) => {
      await loginPage.goto();
      await loginPage.forgotPassword();
      await forgotPasswordPage.submitEmail('unknown@email.com');
      await expect(page).toHaveURL('/auth/forgot-password');
      await expect(page.getByText('The selected email is invalid.')).toBeVisible();
    });

    test('should display error when email format is invalid', async ({ page }) => {
      await loginPage.goto();
      await loginPage.forgotPassword();
      await forgotPasswordPage.submitEmail('invalidformat');
      await expect(page).toHaveURL('/auth/forgot-password');

      // 08/25/2026 - unable to assert actual text as site does not display the error message
      await expect(forgotPasswordPage.errorBox).toBeVisible();
    });
  });
});
