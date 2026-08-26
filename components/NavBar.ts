import { Page, Locator } from '@playwright/test';

export class NavBar {
  readonly navMenuButton: Locator;
  readonly navSignOutButton: Locator;
  readonly navSignInButton: Locator;
  readonly navHomeButton: Locator;

  constructor(private page: Page) {
    this.navMenuButton = page.locator('[data-test="nav-menu"]');
    this.navSignOutButton = page.locator('[data-test="nav-sign-out"]');
    this.navSignInButton = page.locator('[data-test="nav-sign-in"]');
    this.navHomeButton = page.locator('[data-test="nav-home"]');
  }

  async signOut() {
    await this.navMenuButton.click();
    await this.navSignOutButton.click();
  }

  async gotoHome() {
    await this.navHomeButton.click();
  }
}
