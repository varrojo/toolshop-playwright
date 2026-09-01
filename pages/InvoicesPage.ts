import { Page, Locator } from '@playwright/test';

export class InvoicesPage {
  readonly rows: Locator;
  readonly headers: Locator;
  readonly headerCells: Locator;

  constructor(private page: Page) {
    this.rows = page.locator('tbody tr');
    this.headers = page.locator('thead tr');
    this.headerCells = this.headers.locator('th');
  }

  row(invoiceNumber: string) {
    return this.rows.filter({ hasText: invoiceNumber });
  }

  async getRowData(invoiceNumber: string) {
    const cells = this.row(invoiceNumber).locator('td');
    return {
      invoiceNumber: await cells.nth(0).innerText(),
      billingAddress: await cells.nth(1).innerText(),
      date: await cells.nth(2).innerText(),
      total: await cells.nth(3).innerText()
    };
  }

  async clickDetails(invoiceNumber: string) {
    await this.row(invoiceNumber).getByRole('link', { name: 'Details' }).click();
  }

  async allInvoiceNumbers() {
    return this.rows.locator('td:nth-child(1)').allInnerTexts();
  }
}
