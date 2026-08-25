import { Page, Locator } from '@playwright/test';

export const NEW_PASSWORD = 'welcome02';

export class ForgotPasswordPage {
  readonly emailInput: Locator;
  readonly forgotPasswordLink: Locator;
  readonly errorBox: Locator;

  constructor(private page: Page) {
    this.emailInput = page.locator('[data-test="email"]');
    this.forgotPasswordLink = page.locator('[data-test="forgot-password-submit"]');
    this.errorBox = page.locator('[data-test="email-error"]');
  }

  async goto() {
    await this.page.goto('/auth/forgot-password');
  }

  async submitEmail(email: string) {
    await this.emailInput.fill(email);
    await this.forgotPasswordLink.click();
  }
}
