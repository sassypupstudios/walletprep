# WalletPrep project brief

## Purpose

WalletPrep is a Nimiq/EVM wallet transaction ledger organizer for bookkeeping and tax-prep record organization. It does not calculate taxes, determine tax liability, or provide tax, legal, or accounting advice.

## MVP workflow

The MVP will let a user:

1. Connect a wallet using a read-only transaction-data flow.
2. Choose the tax year whose records they want to organize.
3. Load transactions for the selected wallet and year.
4. Normalize transactions into consistent ledger entries.
5. Categorize entries when their purpose is obvious.
6. Flag unknown or ambiguous entries for review.
7. Add notes and edit categories without changing source transaction data.
8. Export the reviewed ledger as CSV.

## Boundaries

- WalletPrep organizes records; it does not implement tax calculations or tax-liability estimates.
- Outputs are not tax, legal, or accounting advice and should be reviewed by the user or a qualified professional.
- The MVP will not include production wallet signing or transaction execution integrations.

## Security

Seed phrases, private keys, secrets, credentials, and signing material must never be committed. WalletPrep should request only the minimum read-only access needed to load public transaction history.
