# Automation Strategy

## Scenarios selected for automation
| ID | Scenario | Suite |
|---|---|---|
| AT-01 | Product page opens; name, price, availability, model and Add to Cart are shown | Smoke |
| AT-02 | Gift Wrap, Colour and Size options are present | Regression |
| AT-03 | Choosing Large removes the Colour option (documented paired option) | Regression |
| AT-04 | Gift Wrap = Yes increases the displayed price by $2.00 | Regression |
| AT-05 | Configured product is added; the cart shows the same options and price | Smoke |
| AT-06 | Quantity 2 gives the correct total ($44.70) and cart quantity | Regression |
| AT-07 | Out-of-stock Size "Small (0 left)" must not be addable | Regression (known defect, expected failure) |
| BONUS-API-01 | Petstore: create and retrieve a Pet using a dynamic ID | Regression |
| BONUS-API-02 | Petstore: invalid status value is rejected with 400 (per Swagger) | Regression (known API deviation, expected failure) |

## Why these
They cover the highest-risk behaviour found while exploring: option dependency, price calculation, stock enforcement and cart integrity. They are deterministic, fast, independent (fresh browser context per test) and create no persistent business data.

## Kept manual (from Part 3)
- Full checkout and order creation: it creates real orders in a shared demo, so it needs a safe test environment and cleanup.
- Quantity 0, negative, decimal and `abc` inputs: the page shows `NaN` and negative prices; this is best explored manually until the expected rules are confirmed.
- DB validations: no database access.
- Exploratory price-label checks (labels scale with quantity).

## More automation in a real project
Every valid Colour/Size/Gift Wrap combination, stock boundaries (qty equal to and above stock), cart update and remove, checkout validation, tax and shipping totals, API-level cart tests, Firefox/WebKit, order persistence with a database check.

## Smoke vs Regression
- **Smoke:** AT-01, AT-05.
- **Regression:** AT-02, AT-03, AT-04, AT-06, AT-07 and the API tests.

## Observations from the first runs (before fixes)
| Result | Cause | Classification |
|---|---|---|
| AT-04, 05, 06, 07 failed | `getByRole('radio', { name: /^No$/ })`: the accessible name is "No (50 left)" | Automation error (fixed: name now matches the start of the label) |
| AT-01, AT-02 failed headless, passed headed | The tests read the title and option lists before the page had loaded the options | Timing/automation issue (fixed with explicit waits) |
| AT-03 skipped | Size options read "Large (+$2.20) (7 left)", so an exact "Large" match found nothing | Automation error (fixed) |
| AT-02 failed on `toBeChecked()` for Gift Wrap "No" | The test assumed "No" is pre-selected. The page has no default Gift Wrap selection (the radio exists but is unchecked) | Automation assumption error (fixed: the test now checks that the option is visible) |
| BONUS-API-02 failed (expected 400, got 200) | Live API does not follow its Swagger definition | API deviation (see "Known defects" below) |
| AT-07 failed (item added) | Application accepts an out-of-stock option | Application defect (see "Known defects" below) |

## Known defects (expected failures)

Two tests are marked with `test.fail(true, reason)`. They still run on every execution. Playwright treats their current failure as expected and shows the reason in the report. They are not automation problems: the assertions are correct against the expected behaviour and were not changed to match the faulty behaviour.

| Test | Status | Classification | Observed behaviour | Expected behaviour | Evidence |
|------|--------|----------------|--------------------|--------------------|----------|
| AT-07 | Expected failure (`test.fail`) | Application defect | Selecting Size "Small (0 left)" and clicking Add to Cart returns HTTP 200 with "Success: You have added 14ct Gold Earrings to your shopping cart". The cart accepts the out-of-stock item. | An out-of-stock option is rejected with an out-of-stock message and nothing is added to the cart. | Reproduced manually and logged as BUG-001 in the Part 2 report (the cart and checkout results are described there). Request: `POST /_v5/index.php?route=checkout/cart/add` with `product_id=158`, `option[293]`, `option[262]`, `option[261]`. Playwright trace from the run. |
| BONUS-API-02 | Expected failure (`test.fail`) | Third-party API deviation | `GET /v2/pet/findByStatus?status=invalid-status` returns HTTP 200 and `[]`. | Swagger documents HTTP 400 "Invalid status value". | Playwright trace from the run. Also reported in Part 4. |

### Why test.fail instead of skipping or changing the assertion
- Both tests keep running, so they continue to prove the problem exists.
- When the issue is fixed, the test starts passing and Playwright reports it as failed ("expected to fail, but passed"). That is the signal to remove the `test.fail(...)` line.
- A caveat: an expected failure can also hide an unrelated failure (for example, the site being down). Check the trace if the results look unusual.

## Assumptions
- The product data (price $19.25, Gift Wrap +$2.00, Medium +$1.10) is stable. If the demo data changes, these values need updating.
- The add-to-cart endpoint (`checkout/cart/add`) and the quantity field name (`quantity`) are taken from the browser's network traffic.
- Gift Wrap has no default selection (observed). Colour and Size must be chosen before adding to the cart.

## Selector strategy and limitations
- Preferred: `getByRole` (heading, radio, button, table) and `getByLabel` (Colour, Size). Radios are matched by the start of the label because it includes stock text.
- Fallbacks: `input[name="quantity"]` and `input[name^="quantity"]` on the cart page, because the quantity field has no label. These names come from the add-to-cart payload.
- Price text is found by its exact value (for example "$21.45"), because the price element has no stable semantic hook.
- The page has no `data-testid` attributes. In a real project I would ask for `data-testid` on the price, option controls, cart rows and quantity input.
- Colour/Size/price update through AJAX. Assertions rely on Playwright auto-waiting (`expect`, `waitForResponse`); there are no fixed delays and no retries.

## Risks and flaky areas
- Shared demo data (stock, other testers) can change values.
- The vendor's public documentation states that the demo store resets every hour. Stock levels and carts can therefore change between runs, and a test run that crosses the reset time may behave differently.
- The related-products block also has "Add to Cart" buttons; the page object uses the first (product) button.
- The demo server is sometimes slow; the suite runs with one worker to reduce load.
- The Swagger Petstore is a shared public service. Data can be changed by others and responses can differ from its documentation, so API tests use dynamically generated IDs and check only documented behaviour.

## Latest run results
`npm test`: **9 passed** (33.4 s, 1 worker, Chromium).
- 7 tests pass normally: BONUS-API-01, AT-01, AT-02, AT-03, AT-04, AT-05, AT-06.
- 2 tests are expected failures (shown with `✘` in the console but counted as passed): AT-07 (application defect) and BONUS-API-02 (API deviation).