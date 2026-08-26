import { test, expect } from '../fixtures/fixtures';
import { AccountPage } from '../pages/AccountPage';
import { NavBar } from '../components/NavBar';
import { FavoritesPage, NO_ADDED_FAVORITES_YET } from '../pages/FavoritesPage';
import { HomePage } from '../pages/HomePage';
import { ProfilePage } from '../pages/ProfilePage';
import { LoginPage } from '../pages/LoginPage';
import { ProductDetailsPage, PRODUCT_ADDED_TO_FAVORITES, PRODUCT_ALREADY_ADDED_TO_FAVORITES } from '../pages/ProductDetailsPage';
import { Page } from '@playwright/test';

test.describe('Customer Favorites', () => {
  let profilePage: ProfilePage;
  let accountPage: AccountPage;
  let loginPage: LoginPage;
  let favoritesPage: FavoritesPage;
  let productDetailsPage: ProductDetailsPage;
  let homePage: HomePage;
  let navBar: NavBar;

  test.beforeEach(async ({ page, registeredUser }) => {
    loginPage = new LoginPage(page);
    profilePage = new ProfilePage(page);
    accountPage = new AccountPage(page);
    favoritesPage = new FavoritesPage(page);
    productDetailsPage = new ProductDetailsPage(page);
    homePage = new HomePage(page);
    navBar = new NavBar(page);

    await loginPage.goto();
    await loginPage.login(registeredUser.email, registeredUser.password);
    await expect(page).toHaveURL(/.*\/account/);
  });

  test.describe('User is Signed-in', () => {
    test('should display empty favorites for new user', async ({ page }) => {
      await accountPage.gotoFavorites();
      await expect(page.getByText(NO_ADDED_FAVORITES_YET)).toBeVisible();
    });

    test('should display confirmation message after successful add to favorites', async ({ page }) => {
      await navBar.gotoHome();
      const productName = 'Combination Pliers';
      const productID = await homePage.getProductID(productName);

      await homePage.gotoProductDetails(productName, productID);
      await expect(page).toHaveURL(`/product/${productID}`);

      await productDetailsPage.addToFavorite();
      await expect(page.getByRole('alert').filter({ hasText: PRODUCT_ADDED_TO_FAVORITES })).toBeVisible();

      await navBar.gotoMyFavorites();
      await expect(page).toHaveURL('/account/favorites');

      await expect(favoritesPage.productNameLabel.filter({ hasText: productName })).toBeVisible();
    });
  });
});