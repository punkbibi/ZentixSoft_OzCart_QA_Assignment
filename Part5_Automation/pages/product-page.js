const { expect } = require('@playwright/test');

class ProductPage {
  constructor(page) {
    this.page = page;
    this.heading = page.getByRole('heading', { name: '14ct Earrings - Gold' });
    this.colour = page.getByLabel('Colour', { exact: true });
    this.size = page.getByLabel('Size', { exact: true });
    // The form field name "quantity" is confirmed by the add-to-cart request payload.
    this.quantity = page.locator('input[name="quantity"]');
    // The related-products block also has "Add to Cart"; the product button comes first in the DOM.
    this.addToCartButton = page.getByRole('button', { name: /Add to Cart/i }).first();
    this.successAlert = page.getByText(/Success: You have added/i).first();
  }

  async open() {
    await this.page.goto('/_v5/14ct-gold-earrings', { waitUntil: 'domcontentloaded' });
    await expect(this.heading).toBeVisible();
    // Options are filled in asynchronously; wait until Size has a real option besides the placeholder.
    await expect(this.size.locator('option').nth(1)).toBeAttached();
  }

  // Gift Wrap radio accessible names include the stock text, e.g. "Yes (+$2.00) (50 left)".
  giftWrap(answer) {
    return this.page.getByRole('radio', { name: new RegExp(`^${answer}\\b`, 'i') });
  }

  async chooseGiftWrap(answer) {
    await this.giftWrap(answer).check();
  }

  async #selectByText(select, pattern) {
    const option = select.locator('option', { hasText: pattern }).first();
    await expect(option).toBeAttached();
    await select.selectOption(await option.getAttribute('value'));
  }

  chooseColour(pattern) {
    return this.#selectByText(this.colour, pattern);
  }

  chooseSize(pattern) {
    return this.#selectByText(this.size, pattern);
  }

  async setQuantity(value) {
    await this.quantity.fill(String(value));
  }

  // Clicks Add to Cart and returns the JSON of the checkout/cart/add request.
  async addToCart() {
    const [response] = await Promise.all([
      this.page.waitForResponse(r => r.url().includes('checkout/cart/add')),
      this.addToCartButton.click()
    ]);
    return response.json();
  }

  priceText(amount) {
    return this.page.getByText(amount, { exact: true }).first();
  }
}

module.exports = { ProductPage };
