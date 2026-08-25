import { test, expect } from '../fixtures/fixtures';
import { LoginPage } from '../pages/LoginPage';
import { NavBar } from '../components/NavBar';

test.describe('Login Page', () => {
  let loginPage: LoginPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
  });

  test.describe('Valid Credentials', () => {
    test('should redirect to account page with valid email and password', async ({ page, registeredUser }) => {
      await loginPage.login(registeredUser.email, registeredUser.password);
      await expect(page).toHaveURL(/.*\/account/);
    });

    test('should redirect to account page with valid email on all caps and valid password', async ({ page, registeredUser }) => {
      await loginPage.login(registeredUser.email.toUpperCase(), registeredUser.password);
      await expect(page).toHaveURL(/.*\/account/);
    });

    test('should redirect to account page with valid email with leading spaces', async ({ page, registeredUser }) => {
      await loginPage.login(`  ${registeredUser.email}  `, registeredUser.password);
      await expect(page).toHaveURL(/.*\/account/);
    });

    test('should redirect to login page after user logout', async ({ page, registeredUser }) => {
      const navBar = new NavBar(page);

      await loginPage.login(registeredUser.email, registeredUser.password);
      await expect(page).toHaveURL(/.*\/account/);
      await expect(navBar.navMenuButton).toBeVisible();

      await navBar.signOut();

      await expect(page).toHaveURL('/auth/login');
      await expect(navBar.navSignInButton).toBeVisible();
    });
  });

  test.describe('Invalid / Missing / Malformed Credentials', () => {
    test('should not be able to login with valid email and invalid password', async ({ page, registeredUser }) => {
      await loginPage.login(registeredUser.email, 'invalid123');

      await expect(page.getByText('Invalid email or password')).toBeVisible();
      await expect(page).toHaveURL('/auth/login');
    });

    test('should not be able to login with unregistered email', async ({ page }) => {
      await loginPage.goto();
      await loginPage.login('unregistered@email.com', 'invalid123');

      await expect(page.getByText('Invalid email or password')).toBeVisible();
      await expect(page).toHaveURL('/auth/login');
    });

    test('should not be able to login with empty email', async ({ page }) => {
      await loginPage.goto();
      await loginPage.login('', 'invalid123');

      await expect(page.getByText('Email is required')).toBeVisible();
      await expect(page).toHaveURL('/auth/login');
    });

    test('should not be able to login with empty password', async ({ page }) => {
      await loginPage.goto();
      await loginPage.login('hello@email.com', '');

      await expect(page.getByText('Password is required')).toBeVisible();
      await expect(page).toHaveURL('/auth/login');
    });

    test('should not be able to login with empty email and empty password', async ({ page }) => {
      await loginPage.goto();
      await loginPage.login('', '');

      await expect(page.getByText('Email is required')).toBeVisible();
      await expect(page.getByText('Password is required')).toBeVisible();
      await expect(page).toHaveURL('/auth/login');
    });

    test('should not be able to login with malformed email', async ({ page, registeredUser }) => {
      await loginPage.login('malformed_email', registeredUser.password);

      await expect(page.getByText('Email format is invalid')).toBeVisible();
      await expect(page).toHaveURL('/auth/login');
    });

    test('should not be able to login with valid but uppercase password', async ({ page, registeredUser }) => {
      await loginPage.login(registeredUser.email, registeredUser.password.toUpperCase());

      await expect(page.getByText('Invalid email or password')).toBeVisible();
      await expect(page).toHaveURL('/auth/login');
    });

    test('should not be able to login with valid email and valid password with leading spaces', async ({ page, registeredUser }) => {
      await loginPage.login(registeredUser.email, `  ${registeredUser.password}  `);

      await expect(page.getByText('Invalid email or password')).toBeVisible();
      await expect(page).toHaveURL('/auth/login');
    });

    test('should not be able to login with SQL injection string in email', async ({ page, registeredUser }) => {
      await loginPage.login(`' OR '1'='1'@test.com`, registeredUser.password);

      await expect(page.getByText('Email format is invalid')).toBeVisible();
      await expect(page).toHaveURL('/auth/login');
    });

    test.describe('Login with Locked Account', () => {
      test.skip(({ browserName }) => browserName !== 'chromium', 'lockout is backend behavior, no need to repeat per browser');
      test('should not be able to login with locked account', async ({ page, registeredUser }) => {
        for (let i = 1; i <= 7; i++) {
          await test.step(`Failed attempt ${i}`, async () => {
            await loginPage.login(registeredUser.email, 'invalidpassword');
            await expect(page.getByText('Invalid email or password')).toBeVisible();
          });
        }
        await test.step('8th attempt with valid credentials triggers lockout', async () => {
          await loginPage.login(registeredUser.email, registeredUser.password);
          await expect(page.getByText('Account locked, too many failed attempts. Please contact the administrator.')).toBeVisible();
          await expect(page).toHaveURL('/auth/login');
        });
      });
    });
  });
});
