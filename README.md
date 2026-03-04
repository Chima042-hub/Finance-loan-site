# Chima Loan Service Website

A premium, single-page loan website built with HTML, CSS, and vanilla JavaScript.

This project includes interactive finance tools, application handling, local draft persistence, and a built-in application status tracker.

## Live Product Summary

The site is designed as a modern, classic-style loan service experience with:

- South Africa market formatting (Rand currency and SA phone formatting)
- Loan product discovery and ranges
- Loan calculator and early payoff planner
- Smart eligibility pre-check and coaching tips
- Application form with save/resume draft
- Local application tracker with generated reference IDs

## Core Features

### 1) Branded Loan Landing Experience

- Sticky top navigation with smooth section links
- Premium visual style (navy/gold theme, gradient hero, elevated cards)
- Distinct button styles per action for stronger UX clarity
- Clickable contact links (`tel:` and `mailto:`)

### 2) Loan Products Section

Displays product options and ranges:

- Personal Loan
- Business Loan
- Home Loan
- Salary Advance

All ranges are shown in Rand (R).

### 3) Loan Calculator

Users can calculate:

- Estimated monthly payment (EMI)
- Total repayment
- Total interest

Behavior:

- Auto-updates based on amount, rate, and tenure inputs
- Loan-type selection auto-fills default rate
- Calculator values sync into Apply + Early Payoff forms

### 4) Early Payoff Planner

Shows the impact of paying extra each month:

- New estimated tenure
- Months saved
- Interest saved

Includes dynamic guidance message based on payoff impact.

### 5) Smart Eligibility Check

Input-driven pre-check using:

- Income
- Expenses
- Existing debt repayment
- Credit score
- Employment type

Outputs:

- Eligibility status
- Indicative maximum loan amount
- Debt-to-income (DTI) ratio
- Personalized coaching recommendations

### 6) Application Form

Collects:

- Name, email, phone
- Loan type, amount, tenure
- Additional details
- Consent confirmation

Phone input features:

- SA format enforcement: `0xx xxx xxxx`
- Auto-format while typing
- Auto-converts `+27`, `27`, `0027` to local format

### 7) Save & Resume Draft

Draft handling uses browser local storage:

- Save draft manually
- Resume draft manually
- Drafts older than 7 days automatically expire and are removed
- Clears draft after successful submission

### 8) Application Tracker

On submit, system generates a reference ID format:

- `CLS-YYYYMMDD-XXXX`

Tracker features:

- Search status by reference ID
- Multi-step status timeline:
  1. Submitted
  2. Under Review
  3. Approved
- Device-local persistence for tracker records
- Clear tracker data action

## Status Progress Logic

Tracker stage is time-based (simulated):

- `< 24 hours` → Submitted
- `24 to <72 hours` → Under Review
- `>= 72 hours` → Approved

## Technology

- HTML5
- CSS3
- Vanilla JavaScript (no framework)
- Browser `localStorage` for drafts and tracker records

## Project Structure

- `index.html` — app structure and content
- `styles.css` — visual styles and layout
- `app.js` — interactive logic and local storage handling
- `README.md` — project documentation
- `PRIVACY.md` — demo privacy notice
- `SECURITY.md` — security policy and reporting process

## Run Locally

Because this is a static site, no build step is required.

Option 1:

- Open `index.html` directly in your browser

Option 2 (recommended for cleaner testing):

- Use VS Code Live Server extension and run from project root

## GitHub Deployment (Pages)

1. Open repository Settings on GitHub
2. Go to **Pages**
3. Source: **Deploy from a branch**
4. Branch: `master`, folder: `/ (root)`
5. Save and wait for deployment

## Security

Please review the security policy in [SECURITY.md](SECURITY.md) for supported versions and vulnerability reporting guidance.

## Privacy

Please review [PRIVACY.md](PRIVACY.md) for the demo privacy notice and local data storage behavior.

## Current Notes

- This version is frontend-only (no backend API/database)
- Application tracking is local to each browser/device
- For production, add server-side form handling, real status pipeline, and secure storage

## Author

Designed by Joseph Chimakpa Njoku
