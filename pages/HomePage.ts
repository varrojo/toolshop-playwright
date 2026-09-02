import { Page, Locator } from '@playwright/test';

export class HomePage {
  readonly productNameLabel: Locator;

  constructor(private page: Page) {
    this.productNameLabel = page.locator('[data-test="product-name"]');
  }

  async gotoProductDetails(productName: string, productID: string) {
    await this.page.locator(`[data-test^="product-${productID}"]`).filter({ hasText: productName }).locator(this.productNameLabel).click();
  }

  async getProductID(productName: string): Promise<string> {
    const dataTest = await this.page.locator('a.card').filter({ has: this.page.locator('[data-test="product-name"]', { hasText: new RegExp(`^\\s*${productName}\\s*$`) }) }).getAttribute('data-test');
    if (!dataTest) {
      throw new Error(`Expected a data-test attribute on the card for "${productName}", got null`);
    }
    return dataTest.replace('product-', '');
  }
}
