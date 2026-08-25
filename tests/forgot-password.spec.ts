import { test, expect } from '../fixtures/fixtures';
import { ForgotPasswordPage, NEW_PASSWORD } from '../pages/ForgotPasswordPage';
import { LoginPage } from '../pages/LoginPage';

test.describe('Forgot Password Page', () => {
  let forgotPasswordPage: ForgotPasswordPage;
  let loginPage: LoginPage;

  test.beforeEach(async ({ page }) => {
    forgotPasswordPage = new ForgotPasswordPage(page);
    loginPage = new LoginPage(page);
  });

  test.describe('Valid Email', () => {
    test('should be able to reset the password and login using the new password', async ({ page, registeredUser }) => {
      await loginPage.forgotPassword();
      await forgotPasswordPage.submitEmail(registeredUser.email);
      await expect(page).toHaveURL('/auth/forgot-password');
      await expect(page.getByText('page.forgot-password.confirm')).toBeVisible();

      await loginPage.goto();
      await loginPage.login(registeredUser.email, NEW_PASSWORD);
      await expect(page).toHaveURL(/.*\/account/);
    });

    test('should be able to reset the password and cannot login using the old password', async ({ page, registeredUser }) => {
      await loginPage.forgotPassword();
      await forgotPasswordPage.submitEmail(registeredUser.email);
      await expect(page).toHaveURL('/auth/forgot-password');
      await expect(page.getByText('page.forgot-password.confirm')).toBeVisible();

      await loginPage.goto();
      await loginPage.login(registeredUser.email, registeredUser.password);
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
