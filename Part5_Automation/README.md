# ZentixSoft QA Assignment: OzCart Playwright Automation

## Framework
- Playwright Test (JavaScript)
- Node.js 20 or newer

## Install
```bash
npm install
npx playwright install chromium
```

## Run
```bash
npm test               # headless
npm run test:headed    # headed (visible browser)
npm run test:debug     # Playwright inspector
npm run report         # open the HTML report of the last run
```

## Configuration
No environment variables are needed. The base URL (`https://demo.ozcart.com`) is set in `playwright.config.js`.

## Tests
- 7 UI tests in `tests/product.spec.js` (AT-01 to AT-07)
- 2 API bonus tests in `tests/api-bonus.spec.js`

## Known failing tests (real defects, not hidden)
| Test | Why it fails |
|---|---|
| AT-07 | Size "Small" is shown as "(0 left)" but can still be added to the cart (BUG-001) |
| BONUS-API-02 | Petstore returns 200 and `[]` for an invalid status; Swagger documents 400 |

## Known environment limitations
- Third-party shared demo: stock, pricing and markup may change without notice.
- Colour/Size options and prices load asynchronously. In the first run, AT-01 and AT-02 passed in headed mode but failed headless because they read the page before the options had loaded. The tests now wait for the options explicitly. No fixed delays and no retries are used.
- Each test uses a fresh browser context, so no cart state is shared between tests. Checkout is not automated (it creates real orders).

Do not commit `node_modules`, `test-results` or `playwright-report`.
