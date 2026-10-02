# ZentixSoft — Run Me First

## 1. Read the master answers
Open:
`FINAL_SUBMISSION_ANSWERS.md`

## 2. Part 2 — Manual browser evidence
Open the OzCart product page and reproduce the configured option/stock behavior. Save screenshots under:
`Part2_Bug_Report/evidence/`

## 3. Part 4 — Postman
Import:
`Part4_API_Postman/petstore_collection.json`
Run the requests in sequence, record actual responses, and save screenshots under:
`Part4_API_Postman/screenshots/`

Optional Python helper:
`Part4_API_Postman/python_api_helper.py`

Run from that folder:
```bash
pip install requests
python python_api_helper.py
```
This is only a helper and does not replace Postman screenshots.

## 4. Part 5 — Playwright
Open a terminal in:
`Part5_Automation/`

Run:
```bash
npm install
npx playwright install
npm test
```

Headed:
```bash
npm run test:headed
```

Debug:
```bash
npm run test:debug
```

## 5. GitHub
Create a PUBLIC repository and push only `Part5_Automation/`.

## 6. Final submission
Submit the ZIP, the Excel workbook, and the public GitHub repository URL.
