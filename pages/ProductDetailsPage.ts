import { Page, Locator } from '@playwright/test';

export const PRODUCT_ADDED_TO_FAVORITES = 'Product added to your favorites list.';
export const PRODUCT_ALREADY_ADDED_TO_FAVORITES = 'Product already in your favorites list.';
export const UNAUTHORIZED_TO_ADD_TO_FAVORITES = 'Unauthorized, can not add product to your favorite list.';

export class ProductDetailsPage {
  readonly addToCartButton: Locator;
  readonly addToFavoritesButton: Locator;
  readonly addToCompareButton: Locator;
  readonly productNameLabel: Locator;

  constructor(private page: Page) {
    this.addToCartButton = page.locator('[data-test="add-to-cart"]');
    this.addToFavoritesButton = page.locator('[data-test="add-to-favorites"]');
    this.addToCompareButton = page.locator('[data-test="add-to-compare"]');
    this.productNameLabel = page.locator('[data-test="product-name"]');
  }

  async addToFavorite() {
    await this.addToFavoritesButton.click();
  }
}
