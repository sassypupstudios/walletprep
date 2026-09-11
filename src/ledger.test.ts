import { describe, expect, it } from 'vitest'
import { categorizeTransaction, filterLedger, ledgerToCsv, normalizeNimiqTransaction } from './ledger'
import type { LedgerEntry, NimiqRpcTransaction } from './types'

const WALLET = 'NQ00 OWNED'
const baseTx: NimiqRpcTransaction = { hash: 'abc', timestamp: Date.UTC(2026, 0, 2), from: 'NQ11 OTHER', to: WALLET, value: 250_000, fee: 24 }

describe('Nimiq normalization', () => {
  it('normalizes luna, dates, fees, direction, and identifiers', () => {
    const entry = normalizeNimiqTransaction(baseTx, [WALLET])
    expect(entry).toMatchObject({ id: 'nimiq:abc', date: '2026-01-02', amount: 2.5, networkFee: 0.00024, direction: 'incoming', counterparty: 'NQ11 OTHER', reviewStatus: 'needs-review' })
  })
})

describe('organizational categorization', () => {
  it('marks incoming and outgoing payments for review', () => {
    expect(categorizeTransaction(baseTx, [WALLET]).category).toBe('Incoming funds')
    expect(categorizeTransaction({ ...baseTx, from: WALLET, to: 'NQ11 OTHER' }, [WALLET])).toMatchObject({ category: 'Outgoing payment', direction: 'outgoing', reviewStatus: 'needs-review' })
  })
  it('recognizes self transfers without asserting tax treatment', () => {
    expect(categorizeTransaction({ ...baseTx, from: WALLET, to: WALLET }, [WALLET])).toMatchObject({ category: 'Transfer', direction: 'self', reviewStatus: 'reviewed' })
  })
  it('labels protocol-originated receipts as income candidates, not conclusions', () => {
    expect(categorizeTransaction({ ...baseTx, from: '', fromType: 3 }, [WALLET]).category).toBe('Reward/income candidate')
  })
})

const entries = [
  normalizeNimiqTransaction(baseTx, [WALLET]),
  normalizeNimiqTransaction({ ...baseTx, hash: 'old', timestamp: Date.UTC(2025, 11, 31) }, [WALLET]),
]

describe('ledger filtering', () => {
  it('filters by year and inclusive date range', () => {
    expect(filterLedger(entries, { year: '2025' }).map((entry) => entry.id)).toEqual(['nimiq:old'])
    expect(filterLedger(entries, { from: '2026-01-02', to: '2026-01-02' })).toHaveLength(1)
  })
  it('filters the needs-review queue', () => {
    expect(filterLedger([{ ...entries[0], reviewStatus: 'reviewed' }, entries[1]], { needsReviewOnly: true })).toEqual([entries[1]])
  })
})

describe('CSV export', () => {
  it('exports every ledger field, escapes quotes, and blocks spreadsheet formulas', () => {
    const risky: LedgerEntry = { ...entries[0], notes: '=HYPERLINK("bad")' }
    const csv = ledgerToCsv([risky])
    expect(csv.split('\r\n')).toHaveLength(3)
    expect(csv).toContain('"Transaction hash"')
    expect(csv).toContain('"\'=HYPERLINK(""bad"")"')
    expect(csv).toContain('"needs-review"')
  })
})
