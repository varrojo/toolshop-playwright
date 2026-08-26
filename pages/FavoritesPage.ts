import { Page, Locator } from '@playwright/test';

export const NO_ADDED_FAVORITES_YET = 'There are no favorites yet. In order to add favorites, please go to the product listing and mark some products as your favorite.';

export class FavoritesPage {
  readonly productNameLabel: Locator;
  readonly deleteButton: Locator;

  constructor(private page: Page) {
    this.productNameLabel = page.locator('[data-test="product-name"]');
    this.deleteButton = page.locator('[data-test="delete"]');
  }

  async deleteFavorite(productName: string) {
    await this.page.locator('[data-test^="favorite-"]').filter({ hasText: productName }).locator(this.deleteButton).click();
  }
}
