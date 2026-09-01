import { test, expect } from '../fixtures/fixtures';
import { AccountPage } from '../pages/AccountPage';
import { CheckoutPage, PAYMENT_SUCCESS_TEXT } from '../pages/CheckoutPage';
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
  test.beforeEach(async ({ page, registeredUser }) => {
    loginPage = new LoginPage(page);
    accountPage = new AccountPage(page);
    checkoutPage = new CheckoutPage(page);
    invoicesPage = new InvoicesPage(page);
    homePage = new HomePage(page);
    navBar = new NavBar(page);
    productDetailsPage = new ProductDetailsPage(page);

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
      test.setTimeout(45000);
      await navBar.gotoHome();
      let invoiceNumber = '';
      const productName = 'Combination Pliers';
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
      await expect(checkoutPage.thanksForYourOrderMessage).toBeVisible({ timeout: 15000 });
      invoiceNumber = await checkoutPage.invoiceNumberSpan.innerText();

      await navBar.gotoInvoices();
      await expect(page).toHaveURL('/account/invoices');
      await assertInvoicesHeader(invoicesPage);

      // Only Street is displayed in the Billing Address column, so we only check for that
      // We calculate for the invoice date in the assertion function, so we don't check for that here
      await assertInvoiceRow(invoicesPage, invoiceNumber, 'Brenda Knoll', '$14.15');
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
  await checkoutPage.billingCountry.selectOption('PH');
  await checkoutPage.billingPostalCode.fill('1600');
  await checkoutPage.billingHouseNumber.fill('123');
  await checkoutPage.billingStreet.fill('Brenda Knoll');
  await checkoutPage.billingCity.fill('New Brennon');
  await checkoutPage.billingState.fill('Utah');
  await checkoutPage.proceed3Button.click();

  // Payment
  await checkoutPage.paymentMethod.selectOption('cash-on-delivery');
  await checkoutPage.finishButton.click();
}
