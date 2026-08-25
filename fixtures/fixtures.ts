import { test as base, expect } from '@playwright/test';
import { RegisterPage, RegisterFormData, DEFAULT_PASSWORD } from '../pages/RegisterPage';

type Fixtures = {
  registeredUser: { email: string; password: string };
};

export const test = base.extend<Fixtures>({
  registeredUser: async ({ page }, use) => {
    const registerPage = new RegisterPage(page);
    await registerPage.goto();
    const user: Pick<RegisterFormData, 'email' | 'password'> = {
      email: `user${crypto.randomUUID()}@gmail.com`,
      password: DEFAULT_PASSWORD
    };
    await registerPage.fillForm(user);
    await registerPage.submit();
    await expect(page).toHaveURL('/auth/login');

    await use(user);
  }
});

export { expect };
