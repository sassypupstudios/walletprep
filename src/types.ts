export const CATEGORIES = [
  'Incoming funds',
  'Outgoing payment',
  'Transfer',
  'Fee',
  'Reward/income candidate',
  'Unknown/needs review',
] as const

export type Category = (typeof CATEGORIES)[number]
export type Direction = 'incoming' | 'outgoing' | 'self' | 'fee'
export type ReviewStatus = 'needs-review' | 'reviewed'

export interface LedgerEntry {
  id: string
  timestamp: number
  date: string
  chain: 'Nimiq'
  asset: 'NIM'
  amount: number
  direction: Direction
  counterparty: string
  address: string
  networkFee: number | null
  transactionHash: string
  category: Category
  notes: string
  reviewStatus: ReviewStatus
}

export interface NimiqRpcTransaction {
  hash: string
  timestamp: number
  from?: string
  to?: string
  sender?: string
  recipient?: string
  value: number
  fee?: number
  fromType?: number
  toType?: number
  executionResult?: boolean
}
