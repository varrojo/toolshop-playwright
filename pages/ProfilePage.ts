import { Page, Locator } from '@playwright/test';

export interface ProfileFormData {
  firstName: string;
  lastName: string;
  phone: string;
  street: string;
  postalCode: string;
  city: string;
  state: string;
  country: string;
}

export const PROFILE_UPDATE_SUCCESS_MESSAGE = 'Your profile is successfully updated!';
export const PROFILE_UPDATE_FAILURE_MESSAGE_EMPTY_FIELD = 'Please correct the highlighted fields before saving.';

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export class ProfilePage {
  readonly firstNameInput: Locator;
  readonly lastNameInput: Locator;
  readonly emailInput: Locator;
  readonly phoneInput: Locator;
  readonly streetInput: Locator;
  readonly postalCodeInput: Locator;
  readonly cityInput: Locator;
  readonly stateInput: Locator;
  readonly countryInput: Locator;
  readonly updateProfileButton: Locator;
  constructor(private page: Page) {
    this.firstNameInput = page.locator('[data-test="first-name"]');
    this.lastNameInput = page.locator('[data-test="last-name"]');
    this.emailInput = page.locator('[data-test="email"]');
    this.phoneInput = page.locator('[data-test="phone"]');
    this.streetInput = page.locator('[data-test="street"]');
    this.postalCodeInput = page.locator('[data-test="postal_code"]');
    this.cityInput = page.locator('[data-test="city"]');
    this.stateInput = page.locator('[data-test="state"]');
    this.countryInput = page.locator('[data-test="country"]');
    this.updateProfileButton = page.locator('[data-test="update-profile-submit"]');
  }

  async fillForm(overrides: Partial<ProfileFormData> = {}) {
    if (overrides.firstName !== undefined) {
      await this.firstNameInput.fill(overrides.firstName);
    }
    if (overrides.lastName !== undefined) {
      await this.lastNameInput.fill(overrides.lastName);
    }
    if (overrides.phone !== undefined) {
      await this.phoneInput.fill(overrides.phone);
    }
    if (overrides.street !== undefined) {
      await this.streetInput.fill(overrides.street);
    }
    if (overrides.postalCode !== undefined) {
      await this.postalCodeInput.fill(overrides.postalCode);
    }
    if (overrides.city !== undefined) {
      await this.cityInput.fill(overrides.city);
    }
    if (overrides.state !== undefined) {
      await this.stateInput.fill(overrides.state);
    }
    if (overrides.country !== undefined) {
      await this.countryInput.fill(overrides.country);
    }
  }

  async updateProfile() {
    await this.updateProfileButton.click();
  }

  async goto() {
    await this.page.goto('/account/profile');
  }

  async waitUntilLoaded() {
    await this.page.waitForFunction(() => {
      const el = document.querySelector('[data-test="first-name"]') as HTMLInputElement | null;
      return !!el && el.value !== '';
    });
    await this.page.waitForLoadState('networkidle');
  }
}
