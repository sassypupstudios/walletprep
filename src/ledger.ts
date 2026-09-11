import { CATEGORIES, type Category, type LedgerEntry, type NimiqRpcTransaction } from './types'

export const LUNA_PER_NIM = 100_000

export function compactAddress(address: string): string {
  return address.replace(/[\s_]/g, '').toUpperCase()
}

export function categorizeTransaction(
  tx: NimiqRpcTransaction,
  walletAddresses: string[],
): Pick<LedgerEntry, 'direction' | 'category' | 'reviewStatus' | 'counterparty' | 'address'> {
  const owned = new Set(walletAddresses.map(compactAddress))
  const sender = tx.from ?? tx.sender ?? ''
  const recipient = tx.to ?? tx.recipient ?? ''
  const fromOwned = owned.has(compactAddress(sender))
  const toOwned = owned.has(compactAddress(recipient))

  if (fromOwned && toOwned) {
    return { direction: 'self', category: 'Transfer', reviewStatus: 'reviewed', counterparty: recipient, address: sender }
  }
  if (fromOwned) {
    return { direction: 'outgoing', category: 'Outgoing payment', reviewStatus: 'needs-review', counterparty: recipient, address: sender }
  }
  if (toOwned) {
    const isReward = tx.fromType === 3 || sender === ''
    return {
      direction: 'incoming',
      category: isReward ? 'Reward/income candidate' : 'Incoming funds',
      reviewStatus: 'needs-review',
      counterparty: sender || 'Protocol reward',
      address: recipient,
    }
  }
  return {
    direction: 'incoming',
    category: 'Unknown/needs review',
    reviewStatus: 'needs-review',
    counterparty: sender || recipient || 'Unknown',
    address: walletAddresses[0] ?? '',
  }
}

export function normalizeNimiqTransaction(tx: NimiqRpcTransaction, walletAddresses: string[]): LedgerEntry {
  const classification = categorizeTransaction(tx, walletAddresses)
  return {
    id: `nimiq:${tx.hash}`,
    timestamp: tx.timestamp,
    date: new Date(tx.timestamp).toISOString().slice(0, 10),
    chain: 'Nimiq',
    asset: 'NIM',
    amount: tx.value / LUNA_PER_NIM,
    networkFee: typeof tx.fee === 'number' ? tx.fee / LUNA_PER_NIM : null,
    transactionHash: tx.hash,
    notes: '',
    ...classification,
  }
}

export interface LedgerFilter { year?: string; from?: string; to?: string; needsReviewOnly?: boolean }

export function filterLedger(entries: LedgerEntry[], filter: LedgerFilter): LedgerEntry[] {
  return entries.filter((entry) => {
    if (filter.year && entry.date.slice(0, 4) !== filter.year) return false
    if (filter.from && entry.date < filter.from) return false
    if (filter.to && entry.date > filter.to) return false
    if (filter.needsReviewOnly && entry.reviewStatus !== 'needs-review') return false
    return true
  })
}

function csvCell(value: string | number | null): string {
  let text = value === null ? '' : String(value)
  if (/^[=+\-@\t\r]/.test(text)) text = `'${text}`
  return `"${text.replace(/"/g, '""')}"`
}

export function ledgerToCsv(entries: LedgerEntry[]): string {
  const headers = ['Date', 'Timestamp', 'Chain', 'Asset', 'Amount', 'Direction', 'Counterparty', 'Wallet address', 'Network fee', 'Transaction hash', 'Category', 'Notes', 'Review status']
  const rows = entries.map((entry) => [
    entry.date, new Date(entry.timestamp).toISOString(), entry.chain, entry.asset,
    entry.amount, entry.direction, entry.counterparty, entry.address, entry.networkFee,
    entry.transactionHash, entry.category, entry.notes, entry.reviewStatus,
  ])
  return [headers, ...rows].map((row) => row.map(csvCell).join(',')).join('\r\n') + '\r\n'
}

export function isCategory(value: string): value is Category {
  return CATEGORIES.includes(value as Category)
}
