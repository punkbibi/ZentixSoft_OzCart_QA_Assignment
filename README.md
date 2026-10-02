# QA Engineering Submission for OzCart & Swagger Petstore

This repository contains a complete QA engineering submission for the OzCart Store web application and the Swagger Petstore API. It demonstrates structured software quality testing across requirement review, bug reporting, manual test design, API validation, and automated end-to-end UI testing.

The deliverables in this project are organized to help reviewers evaluate the application from multiple quality perspectives: functionality, usability, defect detection, API correctness, and automation coverage.

---

## Overview

This QA submission includes:

- Requirement clarification and assumptions
- Defect reports with evidence and reproduction steps
- Manual test case design and coverage analysis
- API validation using Postman and Python
- Automated end-to-end testing using Playwright

The project is intended to simulate a real-world QA review package that can be used by stakeholders, testers, and technical evaluators.

---

## Repository Structure

```text
.
├── FINAL_SUBMISSION_ANSWERS.md         # Summary answers and detailed task breakdowns
├── RUN_ME_FIRST.md                     # Quick-start guide for evaluators
│
├── Part1_Clarification/
│   └── Part1_Clarification.md         # Requirement clarification questions and assumptions
│
├── Part2_Bug_Report/
│   ├── bug_reports.md                 # Standardized bug reports with reproduction steps
│   └── evidence/                     # Screenshots and defect proof
│
├── Part3_Test_Cases/
│   ├── README.md                      # Manual testing strategy overview
│   └── ZentixSoft_OzCart_Test_Cases.xlsx  # Structured manual test cases
│
├── Part4_API_Postman/
│   ├── API_Test_Report.md             # API execution summary and defect findings
│   ├── petstore_collection.json       # Postman collection for CRUD and query tests
│   ├── python_api_helper.py           # Python API validation script
│   ├── python_api_results.json        # Raw API test results
│   └── screenshots/                   # API response evidence and assertions
│
├── Part5_Automation/
│   ├── .gitignore                     # Automation-specific ignore rules
│   ├── AUTOMATION.md                  # E2E architecture and execution guide
│   ├── package.json                   # Node.js dependencies and scripts
│   ├── package-lock.json              # Lockfile for installed dependencies
│   ├── playwright.config.js          # Playwright configuration
│   ├── README.md                     # Playwright suite overview
│   ├── pages/
│   │   └── product-page.js            # Page Object Model for OzCart product page
│   └── tests/
│       ├── product.spec.js           # UI end-to-end tests
│       └── api-bonus.spec.js         # API bonus tests using Playwright
│
└── README.md                          # Project overview and entry point
```

---

## Deliverables by Section

| Section | Focus | Outcome |
| --- | --- | --- |
| Part 1 | Clarification | Requirement assumptions and scope alignment |
| Part 2 | Bug Report | Defects documented with evidence and severity |
| Part 3 | Test Cases | Structured manual test coverage |
| Part 4 | API Testing | API validation using Postman and Python |
| Part 5 | Automation | Playwright end-to-end testing |

---

## Quick Start

### 1) Run the Playwright automation suite

```bash
cd Part5_Automation
npm install
npx playwright install
npx playwright test
npx playwright show-report
```

### 2) Run the Python API helper

```bash
cd Part4_API_Postman
pip install requests
python python_api_helper.py
```

### 3) Import the Postman collection

1. Open Postman
2. Import `Part4_API_Postman/petstore_collection.json`
3. Execute the collection or run individual requests
4. Review outputs and dynamic variables such as `{{$timestamp}}`

---

## Testing Scope

This project validates quality in multiple dimensions:

- Functional validation of key user flows on OzCart
- Negative, boundary, and edge-case testing
- Visual and behavioral defect evidence collection
- API contract validation for Swagger Petstore
- Automation of repeatable regression checks

---

## Key Highlights

- Manual QA coverage for critical product interactions and UI edge cases
- Defect reporting with expected vs. actual behavior and supporting screenshots
- API verification for CRUD operations and status validation
- Use of real-world QA artifacts such as test evidence and structured bug logs
- Playwright-based automation using the Page Object Model (POM)

---

## Tools and Technologies

- Manual test planning and documentation
- Excel-based test case management
- Postman for API request execution
- Python for API automation and data capture
- Playwright for browser automation and E2E validation
- JavaScript for test implementation and page object design

---

## Notes for Evaluators

- Start with `RUN_ME_FIRST.md` for a quick review path.
- Review the manual artifacts in `Part2_Bug_Report` and `Part3_Test_Cases` for evidence-based QA work.
- Use the automation folder to run the E2E suite locally.
- API and UI deliverables are intentionally separated to make review and audit easier.

---

## Summary

This repository represents a practical QA engineering submission showing how a product can be evaluated across requirement analysis, manual testing, bug reporting, API verification, and automation. It is structured for readability, traceability, and execution by both reviewers and technical stakeholders.

For the fastest evaluator experience, begin with `RUN_ME_FIRST.md` and then move into the relevant testing section.
