# ZentixSoft — OzCart QA Assignment
## Complete Answer Sheet and Submission Instructions

> Use this file as the master answer sheet. The assignment-specific source is the supplied task brief. Run the remaining environment-dependent steps before submitting.

---

# 1. Part 1 — Clarification (Test Documentation)

## 1.1 Business Questions

### Product configuration
1. Which product options are mandatory before a product can be added to the cart?
2. Which Colour + Size combinations are valid?
3. When a selected option becomes unavailable after another option changes, should the value be hidden, disabled, or automatically cleared?
4. Should the customer ever be able to submit an invalid option combination?
5. Are option availability rules identical for all quantities, or can availability change by quantity?

### Pricing
6. What is the exact pricing rule for every product option?
7. Is Gift Wrap always an additional +$2.00?
8. Does the option surcharge multiply with quantity?
9. Are sale prices applied before or after option surcharges?
10. What is the source of truth for price: frontend configuration or backend calculation?
11. How are tax, shipping, discounts and option charges combined?
12. Should the cart and checkout always reproduce the same final price as the product page?

### Inventory
13. Is the displayed Availability the product-level stock or selected-variation stock?
14. Are option/variation quantities managed separately from product-level inventory?
15. What should happen when requested quantity exceeds stock?
16. When is inventory decremented: add-to-cart, checkout, payment, or order creation?
17. Can inventory change while an item is in a customer cart?

### Cart
18. If the same product is added with different options, should items merge or remain separate lines?
19. Which selected configuration values must appear in the cart?
20. Can customers edit product options directly from the cart?
21. What happens if a cart item becomes unavailable?
22. Should changing quantity re-evaluate stock and pricing immediately?

### Checkout / Order
23. Can a guest customer complete checkout?
24. Which checkout fields are mandatory?
25. What validation rules apply to customer information?
26. Which payment methods are available in the demo environment?
27. Is it safe to create persistent test orders?
28. What initial status should a newly created order receive?
29. At what point is an order considered successfully created?
30. Does the created order preserve the exact cart configuration and final price?

## 1.2 Technical Questions

### Environment
1. Is the environment shared with other testers?
2. Is the environment reset periodically?
3. Are test orders allowed, and how are test records cleaned up?
4. Are external services involved in pricing, tax, shipping or payment?
5. Which browsers and viewport sizes are officially supported?

### APIs / Backend
6. Which endpoint handles product configuration and option availability?
7. Which endpoint creates/updates cart items?
8. Where is the final price calculated?
9. Which endpoint creates the final order?
10. Is there a correlation/request ID for defect investigation?
11. Are browser network logs available to QA and developers?

### Database
12. Which tables store products and options?
13. Where are option dependency/variation rules stored?
14. Where is inventory stored?
15. Where are cart items and selected options stored?
16. Where are orders and order items stored?
17. What is the relationship between an order item and its product variation/options?
18. Is there an audit trail for inventory and order changes?

### Automation
19. Are stable test IDs or accessible attributes available?
20. Can test data be prepared and cleaned through an API?
21. Are there environment rate limits or known sources of flakiness?
22. Is there a dedicated test account or should the suite use guest flow?

## 1.3 Assumptions

1. Required product options must be selected before Add to Cart succeeds.
2. An unavailable option combination must not be purchasable.
3. The cart must preserve the exact configuration selected on the product page.
4. The displayed Gift Wrap +$2.00 charge must be applied exactly according to the product option rule.
5. Quantity must be a positive integer.
6. The customer must not be able to purchase more stock than is available for the selected configuration.
7. Product, cart and checkout prices must use consistent business rules.
8. An order should only be created after successful checkout submission.
9. A created order should preserve the exact product, options, quantity and final price.
10. Test data may be created in the demo environment, but unnecessary persistent data should be minimized.

## 1.4 Top Five Product Risks

| Risk | Why High Priority |
|---|---|
| Invalid Colour + Size combinations can be purchased | Could result in incorrect product configuration being sold or fulfilled. |
| Product price differs between product page and cart/checkout | Direct financial and customer-impact risk. |
| Stock limits are not enforced | Could cause overselling and fulfillment problems. |
| Selected options are lost/changed in the cart | Customer may receive a different configuration from the one selected. |
| Order data differs from final cart | Can corrupt fulfillment, reporting and customer history. |

---

# 2. Part 2 — Exploratory Testing & Bug Report

## 2.1 Exploratory scope

Test the following areas on:
`https://demo.ozcart.com/_v5/14ct-gold-earrings`

1. Product configuration
2. Colour and Size dependency
3. Gift Wrap price calculation
4. Quantity boundaries
5. Add to Cart
6. Cart configuration and pricing
7. Checkout as far as safely possible

## 2.2 Primary bug candidate — inventory consistency

### BUG-001 — Product page displays apparently conflicting stock values

**Severity:** Medium (pending business-rule confirmation)

**Priority:** Medium

**Labels:** `product-options`, `inventory`, `data-consistency`, `storefront`

**Component:** Product Page / Product Options

### Preconditions
1. Product page is accessible.
2. Product page finishes loading.

### Steps to Reproduce
1. Open the product page.
2. Locate the product-level Availability value.
3. Locate the stock text for Gift Wrap = No.
4. Locate the stock text for Gift Wrap = Yes.
5. Compare the values shown at the same time.

### Expected Result
The inventory information should be internally consistent, or the UI should clearly explain that the values represent different inventory scopes such as product-level stock versus option-level stock.

### Actual Result
The current rendered page shows:
- Availability: 39
- Gift Wrap = No: 50 left
- Gift Wrap = Yes: 50 left

The page does not explain why the option-level values are higher than the product-level Availability value.

### Impact
A customer may not know which quantity represents the actual purchasable inventory. This makes stock-boundary testing ambiguous and may lead to incorrect customer expectations.

### Evidence to attach
- Browser screenshot of the page showing all three values.
- Browser Network request/response used to load product option/inventory data.
- Product ID/SKU.
- Timestamp of reproduction.

### Backend / DB information to request
- Product ID/SKU and product-level inventory record.
- Gift Wrap option IDs and quantities.
- Variation/pair inventory records.
- Product configuration response payload.
- Add-to-cart request/response.
- Server/application logs around reproduction time.
- Relevant inventory/cart database rows.
- Business-rule confirmation for product-level vs option-level stock.

### Important classification note
Before submitting BUG-001 as a confirmed functional defect, verify in the browser and with the product/business rule that the two inventory scopes are not intentionally independent. QA should not turn an unexplained data difference into a confirmed business defect without that confirmation.

## 2.3 Stronger functional check to perform manually

The product description says that selecting Large should make a colour disappear. Therefore run:

1. Open the product page.
2. Select a Colour.
3. Select Size = Large.
4. Confirm the documented colour dependency.
5. Try to select an unavailable colour if it remains visible.
6. Try Add to Cart.

If the unavailable colour remains selectable or an invalid combination can be added, replace BUG-001 with that confirmed functional defect because it has clearer functional expected/actual behavior.

---

# 3. Part 3 — Test Case Design

Use the supplied Excel workbook as the formal table. It contains 10 cases, within the requested 6–12 range.

## TC-001 — Add valid configured product to cart
**Priority:** High

**Preconditions:** Product page available; at least one valid Colour and Size.

**Steps:**
1. Open product page.
2. Select a valid Colour.
3. Select a valid Size.
4. Select Gift Wrap = No.
5. Set Quantity = 1.
6. Click Add to Cart.
7. Open the cart.

**Expected:** Product is added; selected options and quantity are preserved; cart price matches configured product price.

**DB validation:** Verify cart item stores the correct product ID, quantity and selected option/variation IDs.

## TC-002 — Required option missing
**Priority:** High

**Steps:**
1. Open product page.
2. Leave a required option unselected.
3. Click Add to Cart.

**Expected:** Product is not added and clear validation is shown.

**DB validation:** No invalid cart item is created.

## TC-003 — Invalid dependent Colour + Size combination
**Priority:** High

**Steps:**
1. Select a Colour.
2. Select Size = Large.
3. Attempt to use a Colour that should not be available for Large.
4. Attempt Add to Cart.

**Expected:** Invalid combination cannot be submitted.

**DB validation:** No invalid variation/cart record is created.

## TC-004 — Gift Wrap price calculation
**Priority:** High

**Steps:**
1. Record price with Gift Wrap = No.
2. Select Gift Wrap = Yes.
3. Record price again.
4. Add the product to the cart.
5. Compare product and cart price.

**Expected:** Price changes according to the displayed +$2.00 option rule and the same configured price is reflected in cart.

## TC-005 — Quantity = 0
**Priority:** Medium

**Steps:** Set quantity to 0 and attempt Add to Cart.

**Expected:** Zero quantity is rejected or purchase is blocked.

**DB validation:** No cart item with quantity 0 exists.

## TC-006 — Quantity greater than available stock
**Priority:** High

**Steps:** Set a quantity above the available stock and attempt Add to Cart.

**Expected:** Purchase is blocked or quantity is limited to available stock.

**DB validation:** Inventory never becomes negative.

## TC-007 — Negative quantity
**Priority:** Medium

**Steps:** Enter -1 and attempt to add/update cart.

**Expected:** Negative quantity is rejected.

## TC-008 — Cart preserves configuration
**Priority:** High

**Steps:** Select Colour, Size and Gift Wrap; add to cart; open cart.

**Expected:** Cart displays the same selected configuration.

**DB validation:** Cart item references the correct option/variation IDs.

## TC-009 — Cart quantity change recalculates total
**Priority:** High

**Steps:** Add one item; change quantity from 1 to 2; observe totals; change back to 1.

**Expected:** Quantity and subtotal/total are recalculated correctly.

**DB validation:** Stored cart quantity matches the latest cart value.

## TC-010 — Order preserves final cart data
**Priority:** High

**Steps:** Add a valid configured product; continue through checkout; submit only if safe in the demo environment.

**Expected:** Order contains the same product, quantity, selected options and final price as the submitted cart.

**DB validation:** Order header/order item data matches the submitted cart data.

---

# 4. Part 4 — API Testing / Postman

## Environment

`baseUrl = https://petstore.swagger.io/v2`

Environment variable:
`petId`

## 4.1 Create Pet — valid

**POST** `{{baseUrl}}/pet`

```json
{
  "id": {{$timestamp}},
  "category": {
    "id": 1001,
    "name": "zentixsoft-category"
  },
  "name": "ZentixSoft Test Pet",
  "photoUrls": [
    "https://example.com/zentixsoft-pet.jpg"
  ],
  "tags": [
    {"id": 1, "name": "qa"},
    {"id": 2, "name": "assignment"}
  ],
  "status": "available"
}
```

**Verify:** successful result, returned ID, name, status, category, tags and photoUrls.

**Postman test:** save returned ID into `petId`.

## 4.2 Create Pet — missing required fields

**POST** `{{baseUrl}}/pet`

```json
{
  "id": {{$timestamp}},
  "category": {
    "id": 1001,
    "name": "zentixsoft-category"
  },
  "status": "available"
}
```

**Expected:** request should be rejected as invalid because `name` and `photoUrls` are required by the published Pet schema.

**Actual:** record from Postman; do not invent the response.

## 4.3 Retrieve Pet — valid

**GET** `{{baseUrl}}/pet/{{petId}}`

Verify ID, name, status, category, tags and photoUrls.

## 4.4 Retrieve Pet — negative

**GET** `{{baseUrl}}/pet/999999999`

Expected: not-found behavior according to Swagger. Record actual status/body.

## 4.5 Update Pet — valid

**PUT** `{{baseUrl}}/pet`

```json
{
  "id": {{petId}},
  "category": {
    "id": 1001,
    "name": "zentixsoft-category"
  },
  "name": "ZentixSoft Updated Pet",
  "photoUrls": [
    "https://example.com/zentixsoft-pet.jpg"
  ],
  "tags": [
    {"id": 1, "name": "qa"},
    {"id": 2, "name": "assignment"}
  ],
  "status": "sold"
}
```

Verify changed name/status; ID and other fields remain unchanged.

## 4.6 Update Pet — negative

**PUT** `{{baseUrl}}/pet`

```json
{}
```

Expected: validation/error behavior. Record actual result.

## 4.7 Find Pets by status — valid

**GET** `{{baseUrl}}/pet/findByStatus?status=available`

Verify 200 and every returned record has `status = available`.

## 4.8 Find Pets by status — negative

**GET** `{{baseUrl}}/pet/findByStatus?status=invalid-status`

Expected according to Swagger: 400 Invalid status value. Record actual result.

## 4.9 Delete Pet — valid

**DELETE** `{{baseUrl}}/pet/{{petId}}`

Verify successful deletion response.

Then:
**GET** `{{baseUrl}}/pet/{{petId}}`

Verify the deleted pet is no longer available.

## 4.10 Delete Pet — negative

**DELETE** `{{baseUrl}}/pet/999999999`

Expected: not-found/error behavior. Record actual result.

## 4.11 Negative testing summary

Use three executed negative cases:
- Retrieve nonexistent Pet
- Find Pets with invalid status
- Create Pet with missing required fields

For each, record objective, request, expected, actual, response body/status and Swagger comparison.

## 4.12 API observations

The published Swagger definition marks `name` and `photoUrls` as required in the Pet schema, while the POST `/pet` operation documents a 405 Invalid input response but does not explicitly list a normal 200/201 response. Therefore actual execution should be used to confirm the server's real success behavior, and any mismatch should be noted as documentation inconsistency.

---

# 5. Part 5 — UI Automation

## Framework
Playwright Test + JavaScript.

## Selected automated scenarios
1. Product page opens and core information is visible.
2. Product options/variations are available.
3. Large-size dependency affects Colour availability.
4. Gift Wrap changes price by the displayed +$2.00.
5. Valid configuration can be added to cart.
6. Cart preserves selected product configuration.
7. Cart quantity can be changed.

## Why these were automated
These are repeatable, high-value, business-critical checks and do not require payment completion. They directly cover configuration integrity, pricing and cart persistence.

## Keep manual
- Full checkout/payment when it creates persistent records.
- Exploratory combinations intended to discover unknown defects.
- Shared-stock stress/boundary tests when the environment is not isolated.

## Smoke
- Product page opens.
- Product data is visible.
- Valid configuration can be added to cart.
- Cart shows the configured item.

## Regression
- Option dependency.
- Gift Wrap pricing.
- Quantity changes.
- Negative/boundary validation.
- Cart persistence.
- Checkout/order integrity when safe.

## Assumptions / limitations
- Third-party demo application may change markup or state.
- Semantic selectors are preferred; fallback selectors should be documented if required.
- No fixed sleeps or excessive retries should be used to hide application defects.

---

# 6. What you must do locally before submission

## 6.1 Part 2 — browser evidence
1. Open the OzCart product page in Chrome.
2. Press F12.
3. Open Network and enable Preserve log.
4. Reload the page.
5. Reproduce the Large/Colour dependency.
6. Reproduce the inventory display observation.
7. Take screenshots.
8. Put screenshots into `Part2_Bug_Report/evidence/`.
9. Keep only the bug that is actually reproducible and supported by the UI/business rule.

## 6.2 Part 4 — Postman
1. Import `Part4_API_Postman/petstore_collection.json`.
2. Set/create the environment with `baseUrl` and `petId`.
3. Run the requests in sequence.
4. Record the actual HTTP status and response body for every request.
5. Take a screenshot of every request/response.
6. Save screenshots to `Part4_API_Postman/screenshots/`.
7. Update `API_Test_Report.md` with the actual results.

## 6.3 Part 5 — Playwright
From `Part5_Automation/`:

```bash
npm install
npx playwright install
npm test
```

For headed mode:
```bash
npm run test:headed
```

For debug mode:
```bash
npm run test:debug
```

If failures are caused by the demo environment, document the failure instead of hiding it with fixed waits.

## 6.4 GitHub
1. Create a public repository named something like `zentixsoft-ozcart-qa`.
2. Push only the `Part5_Automation` project.
3. Do not upload `node_modules/`, reports or secrets.
4. Put the public repository URL in the final submission.

---

# 7. Files to submit

1. `ZentixSoft_OzCart_QA_Assignment_English.zip`
2. `ZentixSoft_OzCart_Test_Cases_English.xlsx`
3. Public GitHub URL for `Part5_Automation`
4. The Postman screenshots inside the ZIP
5. Browser evidence inside `Part2_Bug_Report/evidence/`

---

# 8. Important rule

Do not claim an actual HTTP status, API response, bug reproduction, screenshot, or Playwright pass/fail result until you have executed it in your environment. Use the prepared files, then replace the execution placeholders with real evidence.
