# QA Engineering Submission & Test Automation Suite

Welcome to the QA Engineering test submission project. This repository contains end-to-end quality assurance deliverables for the **OzCart Store** web application and the **Swagger Petstore API**.

The project covers manual test strategy, defect reporting with evidence, structured test case design, Postman & Python API verification, and automated Playwright E2E UI tests using the Page Object Model (POM) pattern.

---

## 📁 Repository Structure

```text
.
├── FINAL_SUBMISSION_ANSWERS.md    # Summary answers & detailed task breakdowns
├── RUN_ME_FIRST.md                # Quickstart guide for evaluators
│
├── Part1_Clarification/
│   └── Part1_Clarification.md     # Requirement clarification questions & assumptions
│
├── Part2_Bug_Report/
│   ├── bug_reports.md             # Standardized bug reports with steps to reproduce
│   └── evidence/                  # Screenshots & visual proof of defects
│
├── Part3_Test_Cases/
│   ├── README.md                  # Manual testing strategy overview
│   └── ZentixSoft_OzCart_Test_Cases.xlsx  # Comprehensive manual test cases (.xlsx)
│
├── Part4_API_Postman/
│   ├── API_Test_Report.md         # API execution summary & defect findings
│   ├── petstore_collection.json   # Postman collection (CRUD & queries)
│   ├── python_api_helper.py       # Python script for API execution
│   ├── python_api_results.json    # Raw API test execution output
│   └── screenshots/               # Postman response evidence & assertions
│
└── Part5_Automation/
    ├── .gitignore                 # Automation-specific git ignore rules
    ├── AUTOMATION.md              # E2E test architecture & execution guide
    ├── package.json               # Node.js dependencies & scripts
    ├── package-lock.json          # Lockfile for node dependencies
    ├── playwright.config.js       # Playwright configuration
    ├── README.md                  # Playwright suite overview
    ├── pages/
    │   └── product-page.js        # Page Object Model (POM) for OzCart product page
    └── tests/
        ├── product.spec.js        # E2E UI tests for product interactions
        └── api-bonus.spec.js      # API automation specs via Playwright context
```

🚀 Quick Start Guide
1. E2E UI & API Tests (Playwright)
Navigate to the Part5_Automation directory to install dependencies and execute the automated Playwright test suite.

Bash


# Navigate to automation directory
cd Part5_Automation

# Install dependencies
npm install

# Install Playwright browsers
npx playwright install

# Run all Playwright tests (UI + API Bonus)
npx playwright test

# View test execution report
npx playwright show-report
2. Python API Helper Script
To run the standalone Python helper script that executes CRUD operations against the Swagger Petstore API:

Bash


# Navigate to API directory
cd Part4_API_Postman

# Install required Python package
pip install requests

# Run API test automation script
python python_api_helper.py
3. Postman Collection
Open Postman.

Import Part4_API_Postman/petstore_collection.json.

Execute individual requests or run the entire suite via Collection Runner.

Dynamic variables like {{$timestamp}} and collection-scoped environment variables are set automatically during execution.

🛠️ Key Testing Highlights
Manual Test Coverage: Interactive feature testing covering critical user paths, boundary conditions, and UI validation on OzCart.

Defect Documentation: Detailed bug reporting with clear steps to reproduce, expected vs. actual outcomes, severity ratings, and annotated visual evidence in Part2_Bug_Report/evidence/.

API Schema & Edge Case Testing: Identified critical schema validation misalignments in Petstore endpoints (e.g., accepting missing mandatory fields during POST and empty payloads during PUT).

Modular Test Automation: Built scalable E2E automation using JavaScript, Playwright, and the Page Object Model design pattern for high maintainability and crisp reporting.
