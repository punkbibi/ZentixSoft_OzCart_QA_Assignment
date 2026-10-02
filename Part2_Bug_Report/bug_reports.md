# OzCart Product Page: Bug Reports (Part 2)

**Product:** 14ct Earrings - Gold (Model QQ3928, `product_id=158`)
**URL:** https://demo.ozcart.com/_v5/14ct-gold-earrings

## Environment (all bugs)

- Application: https://demo.ozcart.com/_v5/ (demo store, currency AUD)
- Browser: Google Chrome 130 (Chromium 130)
- OS: Windows 10, 64-bit
- Tested: 01 Oct 2026, around 18:44 GMT (from the response `Date` header)
- Session: guest (not logged in)

## Summary

| ID | Title | Severity | Priority |
|----|-------|----------|----------|
| BUG-001 | Out-of-stock option (0 left) and quantity above option stock can be added to the cart | High (provisional) | High |
| BUG-002 | Product page price and option labels show invalid values for quantity 0, negative and non-numeric input | Medium | Medium |
| BUG-003 | Decimal quantity is used by the page but truncated to 1 in the cart | Medium | Medium |
| BUG-004 | "Excl. Tax" on the product page is higher than the cart subtotal when an option is selected | Low | Medium |
| BUG-005 | Minor data and content findings (stock figures, sale dates, placeholder text) | Low | Low |

---

## BUG-001: Out-of-stock option and quantity above option stock can be added to the cart

**Severity:** High (provisional; lower to Medium if the cart or checkout blocks the item, see "To verify")
**Priority:** High
**Component:** Product Options / Inventory / Cart
**Labels:** `functional`, `inventory`, `product-options`, `cart`

### Preconditions
1. Guest user, empty cart.
2. Product page is loaded.

### Steps to Reproduce
**Case A: option with 0 stock**
1. Open the product page.
2. Gift Wrap = **No**, Colour = **Turquoise**, Size = **Small (0 left)**.
3. Quantity = 1, click **Add to Cart**.

**Case B: quantity above option stock**
1. Reload the product page.
2. Gift Wrap = **No**, Colour = **Turquoise**, Size = **Medium (4 left)**.
3. Quantity = 5, click **Add to Cart**.

### Actual Result
- Case A: "Success: You have added 14ct Gold Earrings to your shopping cart". The cart shows Size Small x 1 at $19.25 (subtotal $17.50, GST $1.75). Request `POST /_v5/index.php?route=checkout/cart/add` returns **200 OK**.
- Case B: the cart badge shows 5 and the mini cart shows Medium x 5 at $101.75, although only 4 are in stock.

### Expected Result
- An option shown as "(0 left)" cannot be added to the cart (disabled, hidden, or rejected with an out-of-stock message).
- Quantity above the available option stock is rejected with a clear message.

### Request data
- `POST /_v5/index.php?route=checkout/cart/add`, form data: `product_id=158`, `quantity=1`, `option[293]=104`, `option[262]=71`, `option[261]=68`
- Status: 200 OK
- Response: `{"success":"Success: You have added <a ...>14ct Gold Earrings</a> to your <a ...>shopping cart</a>","total":"1 item(s) - $19.25"}`

### To verify before submitting
Open the full cart page (`/_v5/cart`) and the checkout. Note whether an out-of-stock warning appears and whether checkout is blocked. If it is blocked, change severity to Medium.

### Evidence
`bug_001_1.png`, `bug_001_2_.png`, `bug_001_3.png`, `bug_001_4.png`, `bug_001_5.jpeg`, `bug_001_6.png` (Case A), `bug_003_1.png` (Case B)

### Information to request from the development team
- Server logs for `checkout/cart/add` at 01 Oct 2026 ~18:44 GMT
- Stock records for product 158 and option values (Size Small, Medium, Large; Gift Wrap)
- Whether the "subtract stock" setting is on and which stock check the add-to-cart controller runs
- Cart table rows created for the session

---

## BUG-002: Price and option labels show invalid values for quantity 0, negative and non-numeric input

**Severity:** Medium
**Priority:** Medium
**Component:** Product Page / Live Price Calculation / Input Validation
**Labels:** `functional`, `price-calculation`, `validation`, `ui`

### Preconditions
1. Product page is loaded, Size = Large, Gift Wrap = No.
2. Default state: price $21.45, labels "Yes (+$2.00)" and "Large (+$2.20)".

### Steps to Reproduce
1. Type `0` in the quantity field.
2. Type `-1`.
3. Type `abc`.
4. Observe the price and option labels after each change.

### Actual Result
| Quantity | Price shown | Option labels |
|----------|-------------|---------------|
| 0 | $0.00 (struck-through $0.00), Excl. Tax $0.00, "You save $19.25" unchanged | Yes (+$0.00), Large (+$0.00) |
| -1 | **$-21.45**, struck-through $-40.70, Excl. Tax $-19.70, **reward points -45** | Yes (+$-2.00), Large (+$-2.20) |
| abc | $0.00, Excl. Tax $0.00 | Yes (+$**NaN**), Large (+$**NaN**) |

### Expected Result
Quantity is restricted to a positive integer (minimum 1). Invalid input is rejected or reset to the last valid value. The page never shows negative prices, negative reward points, `NaN`, or $0.00 for a purchasable product.

### Also observed (same cause, quantity 2)
With Medium and Gift Wrap = Yes at quantity 2, the labels change to "Yes (+$4.00)" and "Medium (+$2.20)" although the real surcharges are $2.00 and $1.10. Please confirm with the team whether labels are meant to show line totals. If not, they are wrong.

### Notes
These screenshots show the page display only. Whether Add to Cart accepts 0, -1 or `abc` was not verified (see "To verify").

### To verify before submitting
For each value, click **Add to Cart** and record the message and the response in the Network tab. Add that result here only if you saw it.

### Evidence
`bug_003_2.png` (qty 0), `bug_003_3.png` (qty -1), `bug_003_4.png` (qty abc), `tc_004.png` (qty 2 labels)

### Information to request from the development team
- Response of `index.php?route=product/live_...` (the live price request) for these inputs
- Client-side and server-side quantity validation rules
- Cart rows if a non-positive quantity was submitted

---

## BUG-003: Decimal quantity is used by the page but truncated to 1 in the cart

**Severity:** Medium
**Priority:** Medium
**Component:** Product Page / Cart / Input Validation
**Labels:** `functional`, `validation`, `cart`, `data-consistency`

### Preconditions
1. Product page is loaded, Size = Large, Gift Wrap = No.

### Steps to Reproduce
1. Type `1.6` in the quantity field.
2. Observe the option labels.
3. Click **Add to Cart**.
4. Observe the mini cart.

### Actual Result
- The option labels use 1.6: "Yes (+$3.20)", "Large (+$3.52)".
- The price still shows $21.45 (the value for quantity 1).
- The mini cart shows **x 1** at $21.45.
- The page accepts and partly calculates with a quantity that the cart then silently changes.

### Expected Result
A non-integer quantity is rejected with a message or rounded visibly before it is used. The page and the cart agree on the quantity.

### Evidence
`bug_003_5.png`

### Information to request from the development team
- Add-to-cart request payload for quantity `1.6` and how the controller casts it
- Product minimum and step quantity settings

---

## BUG-004: "Excl. Tax" on the product page is higher than the cart subtotal when an option is selected

**Severity:** Low
**Priority:** Medium
**Component:** Product Page / Price Display / Tax
**Labels:** `price-calculation`, `tax`, `ui`

### Preconditions
1. Product page is loaded, Size = Large, Gift Wrap = No, quantity 1.

### Steps to Reproduce
1. Select Size = Large and add to cart.
2. Compare the product page "Excl. Tax" with the mini cart "Subtotal".

### Actual Result
- Product page: price $21.45, **Excl. Tax: $19.70**
- Mini cart: Subtotal **$19.50**, GST (10%) $1.95, Total $21.45
- The page builds Excl. Tax as $17.50 + $2.20 (the option surcharge already includes tax), so it is overstated by $0.20. The same effect appears at quantity 5 (page $93.00 vs cart subtotal $92.50) and quantity 2 (page $41.20 vs cart $40.64).
- The tax-inclusive total ($21.45) is the same in both places.

### Expected Result
"Excl. Tax" on the product page equals the subtotal in the cart for the same configuration.

### Evidence
`bug_002_4.png` (also `bug_003_1.png` and `tc_004.png` for quantities 5 and 2)

### Information to request from the development team
- The tax class and option price rules for Size and Gift Wrap
- The code path that computes the live "Excl. Tax" value

---

## BUG-005: Minor data and content findings

**Severity:** Low
**Priority:** Low
**Component:** Product Details / Content
**Labels:** `inventory`, `content`, `configuration`

### Steps to Reproduce
Open the product page and read the price, availability and options area.

### Actual Result
- Product Availability is **39**, while Gift Wrap options show **(50 left)** each and the Size options show 0, 4 and 7. The scope of these numbers is not explained.
- "Special started on: Apr 03, 2019" and "Special ends on: Apr 03, 2080".
- Customer-facing text: "Special sale for a long time! This text can be edited."

### Expected Result
Stock figures are consistent or labelled by scope. The promotion dates and text are intentional, final content. Confirm with the product owner.

### Evidence
`bug_001_1.png` (or `bug_002_1.png`: full page showing Availability 39, dates, text and option stock)

---

# Evidence index

| File | Used in |
|------|---------|
| `bug_001_1.png` | BUG-001, BUG-005 |
| `bug_001_2.png` | BUG-001 |
| `bug_001_3.png` | BUG-001 |
| `bug_001_4.png` | BUG-001 |
| `bug_001_5.jpeg` | BUG-001 |
| `bug_003_1.png` | BUG-001 (Case B), BUG-004 |
| `bug_003_2.png` | BUG-002 |
| `bug_003_3.png` | BUG-002 |
| `bug_003_4.png` | BUG-002 |
| `bug_003_5.png` | BUG-003 |
| `bug_002_1.png` | BUG-004 |
| `tc_004.png` | BUG-002, BUG-004 |
| `bug_002_1.png` | BUG-005 |
