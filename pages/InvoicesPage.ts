import { Page, Locator } from '@playwright/test';

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
}

export const SEEDED_USER1 = {
  email: requireEnv('SEEDED_USER_EMAIL1'),
  password: requireEnv('SEEDED_USER_PASSWORD1')
};

export const SEEDED_USER2 = {
  email: requireEnv('SEEDED_USER_EMAIL2'),
  password: requireEnv('SEEDED_USER_PASSWORD2')
};

export const INVOICE_DOES_NOT_EXIST_TEXT = `This invoice doesn't exist.`;

export class InvoicesPage {
  readonly rows: Locator;
  readonly headers: Locator;
  readonly headerCells: Locator;
  readonly detailsButton: Locator;
  readonly paginationNextButton: Locator;
  readonly paginationPreviousButton: Locator;

  constructor(private page: Page) {
    this.rows = page.locator('tbody tr');
    this.headers = page.locator('thead tr');
    this.headerCells = this.headers.locator('th');
    this.detailsButton = page.locator('a', { hasText: 'Details' });
    this.paginationNextButton = page.locator('[data-test="pagination-next"]');
    this.paginationPreviousButton = page.locator('[data-test="pagination-prev"]');
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
    await this.row(invoiceNumber).locator('a', { hasText: 'Details' }).click();
  }

  async allInvoiceNumbers() {
    return this.rows.locator('td:nth-child(1)').allInnerTexts();
  }

  async gotoNextPage() {
    await this.paginationNextButton.click();
  }

  async gotoPreviousPage() {
    await this.paginationPreviousButton.click();
  }
}
