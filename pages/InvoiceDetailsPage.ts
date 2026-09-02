import { Page, Locator } from '@playwright/test';

export class InvoiceDetailsPage {
  readonly invoiceNumberLabel: Locator;
  readonly invoiceDateLabel: Locator;
  readonly totalLabel: Locator;
  readonly streetLabel: Locator;
  readonly postalCodeLabel: Locator;
  readonly cityLabel: Locator
  readonly stateLabel: Locator;
  readonly countryLabel: Locator;

  readonly productRows: Locator;
  readonly productQuantityCells: Locator;
  readonly productNameCells: Locator;
  readonly productPriceCells: Locator;
  readonly productPriceTotalCells: Locator;

  constructor(private page: Page) {
    this.invoiceNumberLabel = page.getByLabel('Invoice Number');
    this.invoiceDateLabel = page.getByLabel('Invoice Date');
    this.totalLabel = page.getByLabel('Total');

    this.streetLabel = page.getByLabel('Street');
    this.postalCodeLabel = page.getByLabel('Postal Code');
    this.cityLabel = page.getByLabel('City');
    this.stateLabel = page.getByLabel('State');
    this.countryLabel = page.getByLabel('Country');

    this.productRows = page.locator('tbody tr');
    this.productQuantityCells = this.productRows.locator('td:nth-child(1)');
    this.productNameCells = this.productRows.locator('td:nth-child(2)');
    this.productPriceCells = this.productRows.locator('td:nth-child(3)');
    this.productPriceTotalCells = this.productRows.locator('td:nth-child(4)');
  }
}
