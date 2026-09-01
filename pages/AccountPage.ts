import { Page, Locator } from '@playwright/test';

export class AccountPage {
  readonly navigateToProfileLink: Locator;
  readonly navigateToFavoritesLink: Locator;
  readonly navigateToInvoicesLink: Locator;
  constructor(private page: Page) {
    this.navigateToProfileLink = page.locator('[data-test="nav-profile"]');
    this.navigateToFavoritesLink = page.locator('[data-test="nav-favorites"]');
    this.navigateToInvoicesLink = page.locator('[data-test="nav-invoices"]');
  }

  async gotoProfile() {
    await this.navigateToProfileLink.click();
  }

  async gotoFavorites() {
    await this.navigateToFavoritesLink.click();
  }

  async gotoInvoices() {
    await this.navigateToInvoicesLink.click();
  }
}
