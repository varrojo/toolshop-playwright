import { test, expect } from '../fixtures/fixtures';
import { AccountPage } from '../pages/AccountPage';
import { NavBar } from '../components/NavBar';
import { FavoritesPage, NO_ADDED_FAVORITES_YET } from '../pages/FavoritesPage';
import { HomePage } from '../pages/HomePage';
import { ProfilePage } from '../pages/ProfilePage';
import { LoginPage } from '../pages/LoginPage';
import { ProductDetailsPage, PRODUCT_ADDED_TO_FAVORITES, PRODUCT_ALREADY_ADDED_TO_FAVORITES, UNAUTHORIZED_TO_ADD_TO_FAVORITES } from '../pages/ProductDetailsPage';
import { DEFAULT_PASSWORD, RegisterFormData, RegisterPage } from '../pages/RegisterPage';

test.describe('Customer Favorites', () => {
  let profilePage: ProfilePage;
  let registerPage: RegisterPage;
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

    test('should display error message when same product is being added a second time', async ({ page }) => {
      await navBar.gotoHome();
      const productName = 'Combination Pliers';
      const productID = await homePage.getProductID(productName);

      await homePage.gotoProductDetails(productName, productID);
      await expect(page).toHaveURL(`/product/${productID}`);

      await productDetailsPage.addToFavorite();
      await expect(page.getByRole('alert').filter({ hasText: PRODUCT_ADDED_TO_FAVORITES })).toBeVisible();

      await productDetailsPage.addToFavorite();
      await expect(page.getByRole('alert').filter({ hasText: PRODUCT_ALREADY_ADDED_TO_FAVORITES })).toBeVisible();

      await navBar.gotoMyFavorites();
      await expect(page).toHaveURL('/account/favorites');

      await expect(favoritesPage.productNameLabel.filter({ hasText: productName })).toBeVisible();
    });

    test('should be able to add multiple products to favorites', async ({ page }) => {
      await navBar.gotoHome();
      const productName1 = 'Combination Pliers';
      const productID1 = await homePage.getProductID(productName1);

      const productName2 = 'Long Nose Pliers';
      const productID2 = await homePage.getProductID(productName2);

      await homePage.gotoProductDetails(productName1, productID1);
      await expect(page).toHaveURL(`/product/${productID1}`);
      await productDetailsPage.addToFavorite();
      await expect(page.getByRole('alert').filter({ hasText: PRODUCT_ADDED_TO_FAVORITES })).toBeVisible();

      await navBar.gotoHome();
      await homePage.gotoProductDetails(productName2, productID2);
      await expect(page).toHaveURL(`/product/${productID2}`);
      await productDetailsPage.addToFavorite();
      await expect(page.getByRole('alert').filter({ hasText: PRODUCT_ADDED_TO_FAVORITES })).toBeVisible();

      await navBar.gotoMyFavorites();
      await expect(page).toHaveURL('/account/favorites');

      await expect(favoritesPage.productNameLabel.filter({ hasText: productName1 })).toBeVisible();
      await expect(favoritesPage.productNameLabel.filter({ hasText: productName2 })).toBeVisible();
    });

    test('should be able to add and delete a favorite product', async ({ page }) => {
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

      await favoritesPage.deleteFavorite(productName);

      await expect(favoritesPage.productNameLabel.filter({ hasText: productName })).not.toBeVisible();
      await expect(page.getByText(NO_ADDED_FAVORITES_YET)).toBeVisible();
    });

    test('should be able to add multiple products and delete one favorite product', async ({ page }) => {
      await navBar.gotoHome();
      const productName1 = 'Combination Pliers';
      const productID1 = await homePage.getProductID(productName1);

      const productName2 = 'Long Nose Pliers';
      const productID2 = await homePage.getProductID(productName2);

      await homePage.gotoProductDetails(productName1, productID1);
      await expect(page).toHaveURL(`/product/${productID1}`);
      await productDetailsPage.addToFavorite();
      await expect(page.getByRole('alert').filter({ hasText: PRODUCT_ADDED_TO_FAVORITES })).toBeVisible();

      await navBar.gotoHome();
      await homePage.gotoProductDetails(productName2, productID2);
      await expect(page).toHaveURL(`/product/${productID2}`);
      await productDetailsPage.addToFavorite();
      await expect(page.getByRole('alert').filter({ hasText: PRODUCT_ADDED_TO_FAVORITES })).toBeVisible();

      await navBar.gotoMyFavorites();
      await expect(page).toHaveURL('/account/favorites');

      await expect(favoritesPage.productNameLabel.filter({ hasText: productName1 })).toBeVisible();
      await expect(favoritesPage.productNameLabel.filter({ hasText: productName2 })).toBeVisible();

      await favoritesPage.deleteFavorite(productName1);

      await expect(favoritesPage.productNameLabel.filter({ hasText: productName1 })).not.toBeVisible();
      await expect(favoritesPage.productNameLabel.filter({ hasText: productName2 })).toBeVisible();
      await expect(page.getByText(NO_ADDED_FAVORITES_YET)).not.toBeVisible();
    });

    test('should retain favorites after user sign out and re-login', async ({ page, registeredUser }) => {
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

      await navBar.signOut();
      await loginPage.login(registeredUser.email, registeredUser.password);

      await navBar.gotoMyFavorites();
      await expect(page).toHaveURL('/account/favorites');

      await expect(favoritesPage.productNameLabel.filter({ hasText: productName })).toBeVisible();
    });

    test('should successfully navigate to My Favorites page via Nav Menu', async ({ page }) => {
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

    test('should successfully navigate to Favorites page via Account page', async ({ page }) => {
      await navBar.gotoHome();
      const productName = 'Combination Pliers';
      const productID = await homePage.getProductID(productName);

      await homePage.gotoProductDetails(productName, productID);
      await expect(page).toHaveURL(`/product/${productID}`);

      await productDetailsPage.addToFavorite();
      await expect(page.getByRole('alert').filter({ hasText: PRODUCT_ADDED_TO_FAVORITES })).toBeVisible();

      await navBar.gotoMyAccount();
      await expect(page).toHaveURL('/account');

      await accountPage.gotoFavorites();
      await expect(page).toHaveURL('/account/favorites');

      await expect(favoritesPage.productNameLabel.filter({ hasText: productName })).toBeVisible();
    });

    test('should not show user A favorites to user B', async ({ page, registeredUser, browser }) => {
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
      // User B
      const contextB = await browser.newContext();
      const pageB = await contextB.newPage();
      const loginPageB = new LoginPage(pageB);

      const registerPageB = new RegisterPage(pageB);
      await registerPageB.goto();
      const user: Pick<RegisterFormData, 'email' | 'password'> = {
        email: `userB${crypto.randomUUID()}@gmail.com`,
        password: DEFAULT_PASSWORD
      };
      await registerPageB.fillForm(user);
      await registerPageB.submit();
      await expect(pageB).toHaveURL('/auth/login');
      await loginPageB.login(user.email, user.password);
      await expect(pageB).toHaveURL('/account');

      const favoritesPageB = new FavoritesPage(pageB);
      const navBarB = new NavBar(pageB);
      await navBarB.gotoMyFavorites();
      await expect(favoritesPageB.productNameLabel.filter({ hasText: productName })).not.toBeVisible();
      await expect(pageB.getByText(NO_ADDED_FAVORITES_YET)).toBeVisible();
      await contextB.close();
    });
  });
  test.describe('User is Signed-out', () => {
    test('should not be able to add to favorites when not logged in', async ({ page }) => {
      await navBar.signOut();
      await navBar.gotoHome();
      const productName = 'Combination Pliers';
      const productID = await homePage.getProductID(productName);

      await homePage.gotoProductDetails(productName, productID);
      await expect(page).toHaveURL(`/product/${productID}`);

      await productDetailsPage.addToFavorite();
      await expect(page.getByRole('alert').filter({ hasText: UNAUTHORIZED_TO_ADD_TO_FAVORITES })).toBeVisible();
    });
  });
});
