import { Page, Locator } from '@playwright/test';

export const EMPTY_CART_TEXT = 'The cart is empty. Nothing to display.';
export const PAYMENT_SUCCESS_TEXT = 'Payment was successful';

export const BILLING_ADDRESS = {
  country: 'PH',
  postalCode: '1600',
  houseNumber: '123',
  street: 'Brenda Knoll',
  city: 'New Brennon',
  state: 'Utah'
};

export const DEFAULT_PRODUCTS = [
  {
    productName: 'Combination Pliers',
    productPriceWithoutSpace: '$14.15',
    productPriceWithSpace: '$ 14.15'
  },
  {
    productName: 'Pliers',
    productPriceWithoutSpace: '$12.01',
    productPriceWithSpace: '$ 12.01'
  }
];

export class CheckoutPage {
  readonly proceed1Button: Locator; // Proceed to Sign In

  readonly proceed2Button: Locator; // Proceed to Billing Address

  readonly billingCountry: Locator;
  readonly billingPostalCode: Locator;
  readonly billingHouseNumber: Locator;
  readonly billingStreet: Locator;
  readonly billingCity: Locator;
  readonly billingState: Locator;
  readonly proceed3Button: Locator; // Proceed to Payment

  readonly paymentMethod: Locator;
  readonly finishButton: Locator;

  readonly paymentSuccessMessage: Locator;

  readonly thanksForYourOrderMessage: Locator;
  readonly invoiceNumberSpan: Locator;

  constructor(private page: Page) {
    this.proceed1Button = page.locator('[data-test="proceed-1"]');

    this.proceed2Button = page.locator('[data-test="proceed-2"]');

    this.billingCountry = page.locator('[data-test="country"]');
    this.billingPostalCode = page.locator('[data-test="postal_code"]');
    this.billingHouseNumber = page.locator('[data-test="house_number"]');
    this.billingStreet = page.locator('[data-test="street"]');
    this.billingCity = page.locator('[data-test="city"]');
    this.billingState = page.locator('[data-test="state"]');
    this.proceed3Button = page.locator('[data-test="proceed-3"]');

    this.paymentMethod = page.locator('[data-test="payment-method"]');
    this.finishButton = page.locator('[data-test="finish"]');

    this.paymentSuccessMessage = page.locator('[data-test="payment-success-message"]');
    this.thanksForYourOrderMessage = page.locator('#order-confirmation');
    this.invoiceNumberSpan = this.thanksForYourOrderMessage.locator('span');
  }
}
