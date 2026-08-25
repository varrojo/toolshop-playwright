import { Page, Locator } from '@playwright/test';

export class AccountPage {
  readonly navigateToProfileLink: Locator;
  constructor(private page: Page) {
    this.navigateToProfileLink = page.locator('[data-test="nav-profile"]');
  }

  async goto() {
    await this.navigateToProfileLink.click();
  }
}
