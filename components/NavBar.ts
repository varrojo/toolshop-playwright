import { Page, Locator } from '@playwright/test';

export class NavBar {
  readonly navMenuButton: Locator;
  readonly navSignOutButton: Locator;
  readonly navSignInButton: Locator;
  readonly navHomeButton: Locator;
  readonly navMyFavoritesButton: Locator;
  readonly navMyAccountButton: Locator;
  readonly navCartButton: Locator;
  readonly navInvoicesButton: Locator;

  constructor(private page: Page) {
    this.navMenuButton = page.locator('[data-test="nav-menu"]');
    this.navSignOutButton = page.locator('[data-test="nav-sign-out"]');
    this.navSignInButton = page.locator('[data-test="nav-sign-in"]');
    this.navHomeButton = page.locator('[data-test="nav-home"]');
    this.navMyFavoritesButton = page.locator('[data-test="nav-my-favorites"]');
    this.navMyAccountButton = page.locator('[data-test="nav-my-account"]');
    this.navCartButton = page.locator('[data-test="nav-cart"]');
    this.navInvoicesButton = page.locator('[data-test="nav-my-invoices"]');
  }

  async signOut() {
    await this.navMenuButton.click();
    await this.navSignOutButton.click();
  }

  async gotoHome() {
    await this.navHomeButton.click();
  }

  async gotoMyFavorites() {
    await this.navMenuButton.click();
    await this.navMyFavoritesButton.click();
  }

  async gotoMyAccount() {
    await this.navMenuButton.click();
    await this.navMyAccountButton.click();
  }

  async gotoCheckout() {
    await this.navCartButton.click();
  }

  async gotoInvoices() {
    await this.navMenuButton.click();
    await this.navInvoicesButton.click();
  }
}
