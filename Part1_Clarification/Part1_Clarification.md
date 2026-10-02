# Ozcart Demo Store: Manual QA / AQA Test Assignment

## Part 1: Clarification (Test Documentation)

| | |
|---|---|
| **Product under test** | https://demo.ozcart.com/ (product page: `/_v5/14ct-gold-earrings`) |
| **Prepared by** | `Alexandre Bibilashvili` |
| **Date** | 2026-10-01 |
| **Input available** | Test environment only (no requirements, user stories, acceptance criteria or test docs) |

Questions marked **[BLOCKING]** must be answered before test design can be finalised. All other questions can be answered in parallel with testing, using the assumptions in section 4 in the meantime.

---

## 1. What I Observed While Exploring

This is the basis for every question below.

- **Product:** "14ct Earrings - Gold".
- **Price:** sale price $19.25, struck-through $38.50 ("You save $19.25 (50% off)"), "Excl. Tax: $17.50" (displayed price looks like price + 10% tax).
- **Special price validity:** Apr 03, 2019 to Apr 03, 2080.
- **Availability:** 39 at product level, but each option shows its own stock counter:
  - Gift Wrap: No (50 left) / Yes +$2.00 (50 left)
  - Colour: Turquoise (19 left)
  - Size: Small (0 left) / Medium +$1.10 (4 left) / Large +$2.20 (7 left)
- **Dependent options:** the description says "Choose the Large size to see the colour disappear".
- **Other features:** currency switcher (AUD, CAD, EUR, NZD, GBP, USD), price in reward points (45), guest checkout, guest order history, wish list, compare, login/register.
- **Content oddity:** the Specifications tab of an earrings product shows "Bag Features / Dimensions 10mm".
- **Environment:** public vendor documentation states the demo store resets every hour, so data is not persistent.

---

## 2. Business Questions (BA / Product Manager)

### 2.1 Pricing, promotions and tax

| ID | Question |
|---|---|
| B-01 | The 50% sale price is valid until 2080. Is this permanent by design? Which price (regular or special) is the base for calculations, and which customer groups see it? |
| B-02 | **[BLOCKING]** Do option surcharges (Medium +$1.10, Large +$2.20, Gift Wrap +$2.00) receive the sale discount or are they added at full value? Are surcharges charged per item or per order line? Is Gift Wrap per item or once per order? Does the surcharge multiply with quantity? |
| B-03 | **[BLOCKING]** Are displayed prices tax-inclusive? Which tax rate applies per country/customer group? Are option surcharges taxed? How is rounding done (per unit, per line, per order)? |
| B-04 | Which currencies are officially supported? Are exchange rates fixed or live, and what is the rounding rule? Is the customer charged in the displayed currency or the base currency? What happens to cart items when the currency changes? |
| B-05 | "Price in reward points: 45": can points pay for sale items? Are points earned on purchases, and when? |
| B-06 | Can coupons, vouchers or gift certificates be combined with the sale price and with surcharged options? How are tax, shipping, discounts, points and surcharges combined into the total? |
| B-07 | Must the cart and checkout always reproduce exactly the final price shown on the product page? |

### 2.2 Product configuration and options

| ID | Question |
|---|---|
| B-08 | **[BLOCKING]** Which options are mandatory (Colour, Size, Gift Wrap)? Do any have default values? |
| B-09 | **[BLOCKING]** What is the full matrix of valid option combinations? The description says Large hides Colour; are there other dependencies? What happens to a Colour that was already selected when Large is chosen (hidden, disabled, cleared)? Should an invalid combination ever be submittable? |
| B-10 | Size "Small" shows "(0 left)". Expected behaviour: hidden, visible but disabled, or sellable as backorder/pre-order? |
| B-11 | Do option availability rules change with the requested quantity? |

### 2.3 Stock and availability

| ID | Question |
|---|---|
| B-12 | **[BLOCKING]** Which stock is the source of truth: product-level (39) or option-level (50 / 19 / 0 / 4 / 7)? Is stock tracked per option value or per combination (e.g. Medium + Turquoise)? How are the levels related? |
| B-13 | Is stock reserved at add-to-cart, at checkout start, or only when the order is placed/paid? Is there a reservation timeout? |
| B-14 | What should happen when the requested quantity exceeds stock, or when stock drops below the cart quantity before checkout (warning, auto-adjust, block)? |

### 2.4 Quantity and cart

| ID | Question |
|---|---|
| B-15 | What are the minimum and maximum quantities per order line and per order? Are multiples required? |
| B-16 | When the same product is added twice with different options, should the lines merge or stay separate? |
| B-17 | Which configuration values must be displayed in the cart? Can options be edited from the cart? Does changing quantity re-evaluate stock and option pricing immediately? |
| B-18 | What should happen when a cart item becomes unavailable? |
| B-19 | How long does a cart persist for guests and logged-in users? Are carts merged on login? |

### 2.5 Checkout and orders

| ID | Question |
|---|---|
| B-20 | **[BLOCKING]** Is guest checkout officially supported? Which fields are mandatory, and what are the validation rules (name, e-mail, phone, address, postcode per country, terms & conditions)? |
| B-21 | **[BLOCKING]** Which shipping and payment methods are enabled here? Is there a sandbox/test payment method? Is it safe to create persistent orders in the demo environment? |
| B-22 | What is the order lifecycle (statuses and allowed transitions)? Which status is set at submit, and at what point is an order considered successfully created? |
| B-23 | When is stock decremented (placed / paid / processing) and when is it restored (cancel / refund)? |
| B-24 | Does the created order preserve the exact cart configuration (options, quantity, price, currency, totals)? |
| B-25 | Which notifications are sent (order confirmation, status change), and are they sandboxed in this environment? |
| B-26 | How does guest order lookup work (e-mail + order ID)? Is there rate limiting? |

### 2.6 General

| ID | Question |
|---|---|
| B-27 | What are the supported browsers, devices, languages and accessibility requirements? |
| B-28 | Is the "Bag Features" specification on an earrings product, and the generic FAQ/custom tab text, intended demo content or a content defect? |

---

## 3. Technical Questions

### 3.1 Architecture and data

| ID | Question |
|---|---|
| T-01 | Technology stack and versions (the storefront looks like an OpenCart-based "Ozcart V5"), theme, installed plugins. |
| T-02 | DB engine and schema: tables/columns for products, options, option values, specials, cart, orders, order products/options/totals/history, stock fields, currency; table prefix; which fields drive "subtract stock". Where are option dependency rules stored? |
| T-03 | **[BLOCKING]** Where is the price calculated: server only, or also in client-side JavaScript? Which fields are used (price, special, option price with +/- prefix, tax class)? What rounding applies and where? |
| T-04 | Caching layers (page cache, CDN, opcode cache): TTL and invalidation after price/stock changes. |
| T-05 | Which endpoints does the storefront call (add to cart, update, remove, shipping quote, checkout steps, confirm)? Request/response and error formats, auth/CSRF handling. |
| T-06 | Where is the cart stored (session or DB)? Session lifetime, cookie names and flags (Secure/HttpOnly/SameSite). |
| T-07 | **[BLOCKING]** Which validations are enforced server-side (quantity, required options, option IDs belonging to the product, stock check) and which only in the UI? |
| T-08 | How is concurrency handled for the last items in stock (transactions, row locking)? Can stock go negative? |
| T-09 | **[BLOCKING]** Is the environment shared, reset periodically (documentation says hourly) and seeded? Can other testers modify the same data? Can I restore the initial data and create products/orders freely without affecting others? How are test records cleaned up? |

### 3.2 Observability and access

| ID | Question |
|---|---|
| T-10 | Can I get read-only DB access, application/PHP/web-server error logs, and an admin account with test data? |
| T-11 | Log format, level, location and retention. How can a UI action be correlated with a log line (timestamp + session ID + order ID + request ID)? Are browser network logs available to QA and developers? |
| T-12 | Is there a REST/JSON API (or admin API) for test-data set-up, cleanup and verification? Is there an audit trail for inventory changes and order creation? |

### 3.3 Integrations, automation and non-functional

| ID | Question |
|---|---|
| T-13 | Third-party integrations (payment gateways, shipping calculators, exchange-rate provider, tax, social sharing, analytics). Which can be stubbed in the test environment? |
| T-14 | Does the markup have stable test hooks (`id`, `name`, `aria-label`, `data-testid`)? Is there bot protection, WAF or rate limiting that could make UI automation flaky? Is there a supported test account, or should all UI tests use guest flows? |
| T-15 | Time-zone handling: server time vs UTC vs user time for special-price dates and order timestamps. |
| T-16 | Security expectations: HTTPS only, input sanitisation (XSS/SQLi), PCI scope for payment fields, rate limits. |
| T-17 | Performance targets (page load, add-to-cart response time) and expected load. |
| T-18 | Where can I see the deployed build/version (footer, endpoint, release notes)? Are feature flags used? |

---

## 4. Assumptions

Used until the project team confirms the requirements.

| ID | Assumption |
|---|---|
| A-01 | Displayed prices include tax (10% GST). Option surcharges are shown tax-inclusive and are **not** discounted. Expected unit price for Medium + Gift Wrap = 19.25 + 1.10 + 2.00 = **$22.35 (AUD)**. *(To be corrected if B-02 shows otherwise.)* |
| A-02 | Colour and Size are mandatory; Gift Wrap is optional and defaults to "No". A required option must be selected before Add to Cart succeeds. |
| A-03 | An option value with "0 left" cannot be purchased (no backorders). An unavailable option combination must not be purchasable. |
| A-04 | Quantity must be a positive integer (minimum 1) and cannot exceed the stock of the chosen configuration. |
| A-05 | When Large is selected, Colour is hidden and must not appear in the cart or order for that line. |
| A-06 | Stock is decremented when the order is placed, not when the item is added to the cart. |
| A-07 | Default currency is AUD; guest checkout is supported. |
| A-08 | A submitted order gets the default initial status (e.g. "Pending") and an offline/test payment method exists. |
| A-09 | Server-side validation exists independently of UI validation; UI-only validation is considered a defect. |
| A-10 | The environment resets hourly and is shared, so tests must read the current "(N left)" values instead of hard-coding them. |
| A-11 | The DB is relational (MySQL-like) with an OpenCart-like schema; table names are "to be confirmed" and used for DB checks only. |
| A-12 | Supported browsers: latest Chrome, Firefox, Safari and Edge; desktop first, responsive layout. |
| A-13 | The sale price valid until 2080 is intended demo data, not a defect. |
| A-14 | Special-price dates and order timestamps use the server time zone. |
| A-15 | The cart preserves the exact configuration selected on the product page, and cart and checkout prices come from the same calculation rules. |
| A-16 | An order is created only after successful checkout submission and contains the exact product, options, quantity and final price from the submitted cart. |
| A-17 | No formal performance/SLA requirements apply to this exercise. |
| A-18 | Test orders are safe in the demo environment, but persistent changes will be kept to a minimum. |

---

## 5. Top 5 Product Risks

Based only on exploring the website; ordered by priority.

| # | Risk | Evidence | Why it matters |
|---|---|---|---|
| 1 | **Price calculation** (sale price + option surcharges + tax + currency) | $19.25 vs $38.50, "Excl. Tax: $17.50", surcharges +$1.10 / +$2.20 / +$2.00, six currencies, reward points | Many independent factors combine. A small rule mistake silently over- or under-charges every order, with direct financial and legal impact. Product-page, cart and checkout prices may also diverge. |
| 2 | **Stock and availability consistency** | Availability 39 vs option counters 50 / 19 / 0 / 4 / 7; "Small (0 left)" still listed | Overselling or exceeding stock causes refunds and lost trust. Several stock levels exist for one product, so they can easily get out of sync. |
| 3 | **Dependent options (Large ↔ Colour) and invalid combinations** | Description states that choosing Large removes Colour | Hidden fields can still be submitted (stale values), producing invalid combinations, wrong price or the wrong item shipped. Options can also be lost or changed between page and cart. |
| 4 | **Data integrity: product page → cart → checkout → order (DB)** | Guest checkout, guest order history, several currencies, order data stored in the DB | The order must contain exactly what the customer configured and saw (options, quantity, price, currency, totals). Any mismatch breaks fulfilment and accounting; stock must be updated once and only once. |
| 5 | **Input validation and server-side enforcement** | Free-text quantity field, several required options, guest checkout form with personal data | If rules exist only in the UI they can be bypassed (0, negative, decimal, huge quantities, missing options, script in text fields), causing corrupted carts, 500 errors, negative stock or security issues. |

---

## Sources

- OzCart product page: https://demo.ozcart.com/_v5/14ct-gold-earrings
- OzCart product option / variant documentation: https://client.ozcart.com/index.php/knowledgebase/1219/
