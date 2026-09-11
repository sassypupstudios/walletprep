# WalletPrep

WalletPrep is a mobile-first Nimiq Mini App for turning public wallet activity into a reviewable transaction ledger. Connect Nimiq Pay with read-only account access, or use the included sample data, then filter, annotate, classify, review, and export records as CSV.

**Value proposition:** Turn Nimiq wallet history into an organized, reviewable CSV in about one minute—without sharing keys or moving funds.

> **WalletPrep organizes transaction records. It does not calculate taxes, determine tax liability, or provide tax, legal, or accounting advice.** Categories are organizational labels only. Ambiguous records remain in **Needs Review** until a user decides how to describe them.

## What works

- Read-only Nimiq Pay connection through the official `@nimiq/mini-app-sdk`
- Public Nimiq transaction history from the documented JSON-RPC `getTransactionsByAddress` method
- Normalized ledger fields: date/timestamp, chain, asset, amount, direction, counterparty, wallet address, network fee, transaction hash, category, notes, and review status
- Tax-year and inclusive custom date-range filters
- Editable categories and notes, saved locally in the browser
- Dedicated **Needs Review** queue and review-status editing
- CSV export of the currently filtered ledger, with spreadsheet-formula injection protection
- Included sample dataset spanning multiple dates and categories
- Responsive, touch-friendly UI designed for Nimiq Pay's mobile WebView

WalletPrep never asks for a seed phrase, private key, signing permission, or transaction permission. Connected addresses are sent only to the configured public RPC endpoint to retrieve public blockchain records. Local edits are kept in the browser's `localStorage` and are not synced to a server.

## Local development

Requirements: Node.js 22+ and npm.

```bash
npm install
npm run dev
```

Open the local URL printed by Vite (normally `http://localhost:5173`). The sample ledger works in any modern browser.

```bash
npm test
npm run build
npm run preview
```

The production-ready static bundle is written to `dist/`.

## Test inside Nimiq Pay

These steps follow the current [official local Mini App guide](https://nimiq.dev/mini-apps/development/load-local-mini-app).

1. Put the phone and development machine on the same Wi-Fi network.
2. Run `npm run dev`. Vite listens on all interfaces by default.
3. Note the **Network** URL printed by Vite, such as `http://192.168.1.42:5173`.
4. In Nimiq Pay, open **Mini Apps**, enter that URL in **Custom URL**, and open it.
5. Tap **Connect Nimiq Pay**. Approve only the native account-list request.
6. Confirm the app displays the shared public account and loads its public transaction history. Edit a category/note, mark a record reviewed, filter it, and export CSV.

If the provider is unavailable, the app reports the error without falling back to broader wallet permissions. **Explore with sample data** remains available.

### One-minute tester route

1. Open the HTTPS test URL in Nimiq Pay, or in any current mobile browser for demo mode.
2. Tap **Try the safe demo — no wallet needed**. No wallet or funds are involved.
3. Tap **Open queue →**, open one item, choose a category, and set it to **Reviewed**.
4. Tap **Export to CSV** and confirm the file downloads.
5. Tap **Send feedback** in the footer. Do not include wallet addresses, transaction details, seed phrases, or private keys in the report.

Tester screenshots: placeholders pending the first hosted phone build.

- `[Screenshot placeholder: first-run data choice on a phone]`
- `[Screenshot placeholder: Needs Review item expanded on a phone]`
- `[Screenshot placeholder: CSV export confirmation/download]`

**Tester call-to-action:** Help us reach 30 wallet testers before the competition deadline—try the one-minute route, then share only usability or bug feedback (never wallet-sensitive data).

### Testnet notes

The official Nimiq Pay guide documents a hidden development menu: long-press the settings button for 10 seconds, then select **Testnet**. Network switching clears Nimiq Pay's transaction history and reloads the app. WalletPrep's default open RPC endpoint is a mainnet prototyping endpoint, so live testnet history requires a testnet history RPC endpoint configured in `src/nimiq.ts`; sample-data mode can be used to test the complete ledger UX without funds.

## Data-source limitations

The default `https://rpc.nimiqwatch.com` endpoint is the open server used in the [official raw RPC examples](https://nimiq.dev/rpc/integrations/raw). It requires no API key, but open RPC services have no uptime guarantee and are not recommended as a production dependency. The MVP requests at most the latest 500 transactions per connected account. Before a public production launch, operate or select a monitored history-node RPC service and configure the endpoint in `src/nimiq.ts`.

## Architecture and EVM extension point

The Nimiq path is deliberately isolated:

- `src/nimiq.ts`: account provider and transaction-history adapter
- `src/ledger.ts`: chain-record normalization, organizational classification, filtering, and CSV serialization
- `src/types.ts`: normalized ledger contract
- `src/fixtures.ts`: safe demo records

An EVM adapter can later map EIP-1193/public RPC records into the same `LedgerEntry` interface, with a chain/asset type expansion and a source selector. Keep chain fetching outside the UI, deduplicate by `chain + transactionHash + asset`, and preserve the same review-first classification policy. EVM support is intentionally not part of this Nimiq-first MVP.

## Security and scope

- No signing or transaction methods are imported or called.
- No secrets, credentials, wallet material, analytics, or backend are included.
- Only public addresses and public blockchain data are handled.
- Do not enter wallet recovery material anywhere in this app or repository.
- Categories are bookkeeping labels, not conclusions about tax treatment.

## Usage measurement

WalletPrep includes no app analytics, cookies, telemetry backend, or tracking pixels. In particular, it does not send wallet addresses or transaction contents to an analytics service. Competition adoption should be verified using Nimiq's own Mini App usage measurement. The launch target is 30 wallet testers, providing a buffer above the stated 20+ usage threshold.

Community-ready launch copy, tester instructions, and bug-report guidance are in [`docs/adoption-launch-kit.md`](docs/adoption-launch-kit.md).

## License

[MIT](LICENSE)
