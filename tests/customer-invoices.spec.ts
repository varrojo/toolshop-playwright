import { test, expect } from '../fixtures/fixtures';
import { AccountPage } from '../pages/AccountPage';
import { CheckoutPage, PAYMENT_SUCCESS_TEXT, BILLING_ADDRESS, DEFAULT_PRODUCTS } from '../pages/CheckoutPage';
import { InvoiceDetailsPage } from '../pages/InvoiceDetailsPage';
import { InvoicesPage } from '../pages/InvoicesPage';
import { LoginPage } from '../pages/LoginPage';
import { HomePage } from '../pages/HomePage';
import { PRODUCT_ADDED_TO_CART, ProductDetailsPage } from '../pages/ProductDetailsPage';
import { NavBar } from '../components/NavBar';

test.describe('Customer Invoices Page', () => {
  let accountPage: AccountPage;
  let loginPage: LoginPage;
  let checkoutPage: CheckoutPage;
  let invoicesPage: InvoicesPage;
  let navBar: NavBar;
  let homePage: HomePage;
  let productDetailsPage: ProductDetailsPage;
  let invoiceDetailsPage: InvoiceDetailsPage;
  test.beforeEach(async ({ page, registeredUser }) => {
    loginPage = new LoginPage(page);
    accountPage = new AccountPage(page);
    checkoutPage = new CheckoutPage(page);
    invoicesPage = new InvoicesPage(page);
    homePage = new HomePage(page);
    navBar = new NavBar(page);
    productDetailsPage = new ProductDetailsPage(page);
    invoiceDetailsPage = new InvoiceDetailsPage(page);

    await loginPage.goto();
    await loginPage.login(registeredUser.email, registeredUser.password);
    await expect(page).toHaveURL(/.*\/account/);
  });

  test.describe('User Signed In', () => {
    test('should display empty invoices for new user', async ({ page }) => {
      await accountPage.gotoInvoices();
      await expect(page).toHaveURL('/account/invoices');
      await expect(invoicesPage.rows).toHaveCount(0);
      await assertInvoicesHeader(invoicesPage);
    });

    test('should be able to navigate to Invoices via Nav Menu', async ({ page }) => {
      await navBar.gotoInvoices();
      await expect(page).toHaveURL('/account/invoices');
      await assertInvoicesHeader(invoicesPage);
    });

    test('should be able to navigate to Invoices via Account Page', async ({ page }) => {
      await navBar.gotoMyAccount();
      await expect(page).toHaveURL('/account');

      await accountPage.gotoInvoices();
      await expect(page).toHaveURL('/account/invoices');
      await assertInvoicesHeader(invoicesPage);
    });

    test('should be able to checkout and view invoices', async ({ page }) => {
      test.setTimeout(60000);
      await navBar.gotoHome();
      let invoiceNumber = '';
      const productName = DEFAULT_PRODUCTS[0].productName;
      const productID = await homePage.getProductID(productName);

      await homePage.gotoProductDetails(productName, productID);
      await expect(page).toHaveURL(`/product/${productID}`);

      await productDetailsPage.addToCart();
      await expect(page.getByRole('alert').filter({ hasText: PRODUCT_ADDED_TO_CART })).toBeVisible();

      await navBar.gotoCheckout();
      await expect(page).toHaveURL('/checkout');

      await checkout(checkoutPage);

      await expect(checkoutPage.paymentSuccessMessage).toBeVisible();
      await expect(checkoutPage.paymentSuccessMessage).toHaveText(PAYMENT_SUCCESS_TEXT);

      await checkoutPage.finishButton.click();
      await expect(checkoutPage.thanksForYourOrderMessage).toBeVisible({ timeout: 30000 });

      invoiceNumber = await checkoutPage.invoiceNumberSpan.innerText();

      await navBar.gotoInvoices();
      await expect(page).toHaveURL('/account/invoices');
      await assertInvoicesHeader(invoicesPage);

      // Only Street is displayed in the Billing Address column, so we only check for that
      // We calculate for the invoice date in the assertion function, so we don't check for that here
      await assertInvoiceRow(invoicesPage, invoiceNumber, BILLING_ADDRESS.street, DEFAULT_PRODUCTS[0].productPriceWithoutSpace);
    });

    test('should be able to view invoice details', async ({ page }) => {
      test.setTimeout(60000);
      await navBar.gotoHome();
      let invoiceNumber = '';
      let invoiceDate = '';
      const productName = DEFAULT_PRODUCTS[0].productName;
      const productID = await homePage.getProductID(productName);

      await homePage.gotoProductDetails(productName, productID);
      await expect(page).toHaveURL(`/product/${productID}`);

      await productDetailsPage.addToCart();
      await expect(page.getByRole('alert').filter({ hasText: PRODUCT_ADDED_TO_CART })).toBeVisible();

      await navBar.gotoCheckout();
      await expect(page).toHaveURL('/checkout');

      await checkout(checkoutPage);

      await expect(checkoutPage.paymentSuccessMessage).toBeVisible();
      await expect(checkoutPage.paymentSuccessMessage).toHaveText(PAYMENT_SUCCESS_TEXT);

      await checkoutPage.finishButton.click();
      await expect(checkoutPage.thanksForYourOrderMessage).toBeVisible({ timeout: 30000 });

      invoiceNumber = await checkoutPage.invoiceNumberSpan.innerText();

      await navBar.gotoInvoices();
      await expect(page).toHaveURL('/account/invoices');
      await assertInvoicesHeader(invoicesPage);

      await assertInvoiceRow(invoicesPage, invoiceNumber, BILLING_ADDRESS.street, DEFAULT_PRODUCTS[0].productPriceWithoutSpace);
      await (async () => {
        invoiceDate = await invoicesPage.getRowData(invoiceNumber).then((data) => data.date);
      })();

      await invoicesPage.clickDetails(invoiceNumber);
      await expect(page).toHaveURL(/\/account\/invoices\/.+/);

      await assertInvoiceDetails(
        invoiceDetailsPage,
        invoiceNumber,
        invoiceDate,
        DEFAULT_PRODUCTS[0].productPriceWithSpace, // total display has space between currency symbol and amount, while the invoices page does not
        BILLING_ADDRESS.street,
        productName,
        DEFAULT_PRODUCTS[0].productPriceWithoutSpace
      );
    });

    test('should be able to do multiple checkout and view invoices', async ({ page }) => {
      test.setTimeout(60000);
      let invoiceNumber = [];

      for (let i = 0; i < 2; i++) {
        await navBar.gotoHome();
        const productName = DEFAULT_PRODUCTS[i].productName;
        const productID = await homePage.getProductID(productName);

        await homePage.gotoProductDetails(productName, productID);
        await expect(page).toHaveURL(`/product/${productID}`);

        await productDetailsPage.addToCart();
        await expect(page.getByRole('alert').filter({ hasText: PRODUCT_ADDED_TO_CART })).toBeVisible();

        await navBar.gotoCheckout();
        await expect(page).toHaveURL('/checkout');

        await checkout(checkoutPage);

        await expect(checkoutPage.paymentSuccessMessage).toBeVisible();
        await expect(checkoutPage.paymentSuccessMessage).toHaveText(PAYMENT_SUCCESS_TEXT);

        await checkoutPage.finishButton.click();
        await expect(checkoutPage.thanksForYourOrderMessage).toBeVisible({ timeout: 30000 });

        invoiceNumber.push(await checkoutPage.invoiceNumberSpan.innerText());
      }

      await navBar.gotoInvoices();
      await expect(page).toHaveURL('/account/invoices');
      await assertInvoicesHeader(invoicesPage);

      // iterate through the invoice numbers and assert each one
      for (let i = 0; i < invoiceNumber.length; i++) {
        await assertInvoiceRow(invoicesPage, invoiceNumber[i], BILLING_ADDRESS.street, DEFAULT_PRODUCTS[i].productPriceWithoutSpace);

        const invoiceDate = await invoicesPage.getRowData(invoiceNumber[i]).then((data) => data.date);

        await invoicesPage.clickDetails(invoiceNumber[i]);
        await expect(page).toHaveURL(/\/account\/invoices\/.+/);

        await assertInvoiceDetails(
          invoiceDetailsPage,
          invoiceNumber[i],
          invoiceDate,
          DEFAULT_PRODUCTS[i].productPriceWithSpace,
          BILLING_ADDRESS.street,
          DEFAULT_PRODUCTS[i].productName,
          DEFAULT_PRODUCTS[i].productPriceWithoutSpace
        );

        await navBar.gotoInvoices();
        await expect(page).toHaveURL('/account/invoices');
      }
    });
  });
});

async function assertInvoicesHeader(invoicesPage: InvoicesPage) {
  await expect(invoicesPage.headers).toHaveCount(1);
  await expect(invoicesPage.headerCells).toHaveText(['Invoice Number', 'Billing Address', 'Invoice Date', 'Total', '']);
}

async function assertInvoiceRow(invoicesPage: InvoicesPage, invoiceNumber: string, billingAddress: string, total: string) {
  const rowData = await invoicesPage.getRowData(invoiceNumber);

  const OFFSET_HOURS = 8; // site's server clock is 8h behind local
  const TOLERANCE_MS = 5 * 60 * 1000; // absorb latency between purchase and assertion
  const expectedServerTime = Date.now() - OFFSET_HOURS * 60 * 60 * 1000;
  const actualTime = new Date(rowData.date.replace(' ', 'T')).getTime();

  expect(rowData.invoiceNumber).toBe(invoiceNumber);
  expect(rowData.billingAddress).toBe(billingAddress);
  expect(Math.abs(actualTime - expectedServerTime)).toBeLessThan(TOLERANCE_MS);
  expect(rowData.total).toBe(total);
}

async function checkout(checkoutPage: CheckoutPage) {
  // Cart
  await checkoutPage.proceed1Button.click();

  // Sign In
  await checkoutPage.proceed2Button.click();

  // Billing Address
  await checkoutPage.billingCountry.selectOption(BILLING_ADDRESS.country);
  await checkoutPage.billingPostalCode.fill(BILLING_ADDRESS.postalCode);
  await checkoutPage.billingHouseNumber.fill(BILLING_ADDRESS.houseNumber);
  await checkoutPage.billingStreet.fill(BILLING_ADDRESS.street);
  await checkoutPage.billingCity.fill(BILLING_ADDRESS.city);
  await checkoutPage.billingState.fill(BILLING_ADDRESS.state);
  await checkoutPage.proceed3Button.click();

  // Payment
  await checkoutPage.paymentMethod.selectOption('cash-on-delivery');
  await checkoutPage.finishButton.click();
}

async function assertInvoiceDetails(
  invoiceDetailsPage: InvoiceDetailsPage,
  invoiceNumber: string,
  invoiceDate: string,
  total: string,
  billingAddress: string,
  productName: string,
  productPrice: string
) {
  await expect(invoiceDetailsPage.invoiceNumberLabel).toHaveValue(invoiceNumber);
  await expect(invoiceDetailsPage.invoiceDateLabel).toHaveValue(invoiceDate);
  await expect(invoiceDetailsPage.totalLabel).toHaveValue(total);

  await expect(invoiceDetailsPage.streetLabel).toHaveValue(billingAddress);
  await expect(invoiceDetailsPage.postalCodeLabel).toHaveValue(BILLING_ADDRESS.postalCode);
  await expect(invoiceDetailsPage.cityLabel).toHaveValue(BILLING_ADDRESS.city);
  await expect(invoiceDetailsPage.stateLabel).toHaveValue(BILLING_ADDRESS.state);
  await expect(invoiceDetailsPage.countryLabel).toHaveValue(BILLING_ADDRESS.country);

  await expect(invoiceDetailsPage.productRows).toHaveCount(1);
  await expect(invoiceDetailsPage.productQuantityCells.nth(0)).toHaveText('1');
  await expect(invoiceDetailsPage.productNameCells.nth(0)).toHaveText(productName);
  await expect(invoiceDetailsPage.productPriceCells.nth(0)).toHaveText(productPrice);
  await expect(invoiceDetailsPage.productPriceTotalCells.nth(0)).toHaveText(productPrice);
}
