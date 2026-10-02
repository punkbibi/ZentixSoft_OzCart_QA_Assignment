const { test, expect } = require('@playwright/test');
const { ProductPage } = require('../pages/product-page');

test.describe('14ct Gold Earrings - product and cart flow', () => {
  test('AT-01 product page opens and shows core product information', async ({ page }) => {
    const product = new ProductPage(page);
    await product.open();

    await expect(product.priceText('$19.25')).toBeVisible();
    await expect(page.getByText(/Availability:\s*\d+/)).toBeVisible(); // value is shared demo data, so not hardcoded
    await expect(page.getByText('QQ3928')).toBeVisible();
    await expect(product.addToCartButton).toBeVisible();
  });

  test('AT-02 Gift Wrap, Colour and Size options are available', async ({ page }) => {
    const product = new ProductPage(page);
    await product.open();

    await expect(product.giftWrap('No')).not.toBeChecked();
    await expect(product.giftWrap('Yes')).toBeVisible();
    await expect(product.colour.locator('option', { hasText: /Turquoise/ })).toBeAttached();
    for (const size of [/Small/, /Medium/, /Large/]) {
      await expect(product.size.locator('option', { hasText: size })).toBeAttached();
    }
  });

  test('AT-03 choosing Large removes the Colour option, as the product description states', async ({ page }) => {
    const product = new ProductPage(page);
    await product.open();
    await expect(product.colour).toBeVisible();

    await product.chooseSize(/Large/);
    await expect(product.colour).toBeHidden();

    await product.chooseSize(/Medium/);
    await expect(product.colour).toBeVisible();
  });

  test('AT-04 Gift Wrap = Yes increases the displayed price by $2.00', async ({ page }) => {
    const product = new ProductPage(page);
    await product.open();
    await expect(product.priceText('$19.25')).toBeVisible();

    await product.chooseGiftWrap('Yes');
    await expect(product.priceText('$21.25')).toBeVisible();
  });

  test('AT-05 a configured product is added and the cart shows the same configuration', async ({ page }) => {
    const product = new ProductPage(page);
    await product.open();

    await product.chooseGiftWrap('Yes');
    await product.chooseColour(/Turquoise/);
    await product.chooseSize(/Medium/);
    await expect(product.giftWrap('Yes')).toBeChecked(); // selections survive the dependent-option refresh
    await product.setQuantity(1);

    const result = await product.addToCart();
    expect(result.success).toContain('Success: You have added');
    await expect(product.successAlert).toBeVisible();

    await page.goto('/_v5/cart');
    const cartTable = page.getByRole('table').filter({ hasText: '14ct Gold Earrings' }).first();
    await expect(cartTable).toContainText('Medium');
    await expect(cartTable).toContainText('Turquoise');
    await expect(cartTable).toContainText(/Gift Wrap:?\s*Yes/);
    await expect(cartTable).toContainText('$22.35'); // 19.25 + 1.10 (Medium) + 2.00 (Gift Wrap)
  });

  test('AT-06 quantity 2 doubles the line total in the cart', async ({ page }) => {
    const product = new ProductPage(page);
    await product.open();

    await product.chooseGiftWrap('Yes');
    await product.chooseColour(/Turquoise/);
    await product.chooseSize(/Medium/);
    await product.setQuantity(2);

    const result = await product.addToCart();
    expect(result.total).toBe('2 item(s) - $44.70');

    await page.goto('/_v5/cart');
    await expect(page.locator('input[name^="quantity"]').first()).toHaveValue('2');
  });

  test('AT-07 an out-of-stock Size ("Small", 0 left) cannot be added to the cart', async ({ page }) => {
    // Expected to FAIL today: documented defect BUG-001 (see AUTOMATION.md).
    test.fail(true, 'KNOWN DEFECT (BUG-001): add-to-cart accepts Size "Small (0 left)" and returns "Success". Expected: rejected with an out-of-stock message. This test fails until the defect is fixed.');

    const product = new ProductPage(page);
    await product.open();

    await product.chooseGiftWrap('No');
    await product.chooseColour(/Turquoise/);
    await product.chooseSize(/Small/);
    await product.setQuantity(1);

    const result = await product.addToCart();
    expect(result.success, 'Size Small shows "(0 left)" but was added to the cart').toBeUndefined();
  });
});
