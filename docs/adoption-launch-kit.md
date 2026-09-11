# WalletPrep adoption launch kit

## Goal

Reach **30 wallet testers** before the competition deadline. This provides a buffer above the competition's stated 20+ usage threshold. Count qualifying usage through Nimiq's own Mini App measurement; WalletPrep deliberately has no analytics and never sends wallet addresses or transaction contents to a tracking service.

## Skool/community post

> WalletPrep turns Nimiq wallet history into a clean, reviewable ledger and CSV—read-only, with no seed phrase, private key, signing, or fund movement. We need 30 quick testers: open **[HTTPS TEST URL]** in Nimiq Pay, use the safe demo or connect read-only, review one unknown item, export the CSV, and send feedback through **[FEEDBACK LINK]**. Please never include wallet addresses, transaction details, seed phrases, or private keys in feedback. WalletPrep organizes records; it does not calculate taxes or provide tax, legal, or accounting advice.

## Short social post

> Testing WalletPrep: organize Nimiq activity, review unknown items, and export CSV in about a minute. Read-only; no seed phrase, private key, signing, or fund movement. We need 30 testers: **[HTTPS TEST URL]** Feedback: **[FEEDBACK LINK]** Never share wallet-sensitive data.

## Tester instructions (paste/share)

> 1. Open **[HTTPS TEST URL]** in Nimiq Pay. You can also use a current mobile browser for demo mode.
> 2. Fastest/safest route: tap **Try the safe demo — no wallet needed**. To test real history instead, tap **Connect Nimiq Pay** and approve only the read-only account-list request.
> 3. Tap **Open queue →** under Needs Review.
> 4. Open one record, choose an organizational category, and set it to **Reviewed**.
> 5. Tap **Export to CSV** and confirm a file downloads.
> 6. Tap **Send feedback** in the footer and report whether all five actions were clear.
>
> Safety: WalletPrep never requests a seed phrase or private key and cannot sign transactions or move funds. Never put wallet addresses, transaction details, seed phrases, private keys, or recovery material in feedback. Categories are organizational only; WalletPrep does not calculate taxes or provide tax, legal, or accounting advice.

## Bug-report instructions

Use the in-app **Send feedback** link, or open [a prefilled GitHub issue](https://github.com/sassypupstudios/walletprep/issues/new?labels=tester-feedback&title=WalletPrep%20tester%20feedback&body=What%20I%20tried%3A%0A%0AWhat%20happened%3A%0A%0ADevice%20and%20browser%3A%0A%0APlease%20do%20not%20include%20wallet%20addresses%2C%20transaction%20details%2C%20seed%20phrases%2C%20or%20private%20keys.). Include:

- What you tapped and what you expected
- What happened instead
- Phone model, OS version, and whether you used Nimiq Pay or a browser
- A screenshot only after checking that it contains no wallet address or transaction content

Never include a wallet address, transaction hash/content, balance, seed phrase, private key, recovery phrase, signing material, or wallet credential. A maintainer should remove sensitive material immediately if a tester posts it accidentally.

## Smoke-test record

Run from commit `HEAD` on 2026-09-11:

- `npm test`: passed, 2 files and 8 tests
- `npm run build`: passed with TypeScript and Vite
- `npm audit --omit=dev`: passed, 0 vulnerabilities
- Static production preview: passed with HTTP 200; built JavaScript and CSS assets both returned successfully
- Mobile responsive implementation: reviewed at the 320px CSS minimum and `max-width: 800px` layout breakpoint
- Rendered mobile-browser/Nimiq Pay device test: pending because this host has no browser runtime and no phone session; use the exact tester instructions above against the HTTPS URL

## Known MVP limitations

- Nimiq only; no EVM adapter
- Public history service is a prototype dependency with no uptime guarantee and a 500-transaction limit per connected account
- Wallet edits stay in that browser's local storage and do not sync
- Testnet live history needs a configured testnet history endpoint; demo mode is network-independent
- CSV download behavior depends on the Nimiq Pay WebView/mobile OS download support
- No tax calculations, tax classification, or tax/legal/accounting advice
