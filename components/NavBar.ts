import { Page, Locator } from '@playwright/test';

export class NavBar {
  readonly navMenuButton: Locator;
  readonly navSignOutButton: Locator;
  readonly navSignInButton: Locator;

  constructor(private page: Page) {
    this.navMenuButton = page.locator('[data-test="nav-menu"]');
    this.navSignOutButton = page.locator('[data-test="nav-sign-out"]');
    this.navSignInButton = page.locator('[data-test="nav-sign-in"]');
  }

  async signOut() {
    await this.navMenuButton.click();
    await this.navSignOutButton.click();
  }
}
