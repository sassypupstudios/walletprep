import type { LedgerEntry } from './types'

const WALLET = 'NQ12 DEMO 7K9X 3LPA 8Q2M 0V4B 6RTE 9C5H 1WYU'

export const SAMPLE_LEDGER: LedgerEntry[] = [
  { id: 'sample:1', timestamp: Date.UTC(2026, 7, 18, 9, 12), date: '2026-08-18', chain: 'Nimiq', asset: 'NIM', amount: 245, direction: 'incoming', counterparty: 'NQ38 SHOP 4JQ8 2FTV 1DKL 9B6R 7SXA 5P0C 3HNM', address: WALLET, networkFee: 0, transactionHash: 'a8d21b4e5f7c0193sampleincoming', category: 'Incoming funds', notes: 'Invoice payment — confirm client', reviewStatus: 'needs-review' },
  { id: 'sample:2', timestamp: Date.UTC(2026, 6, 3, 15, 40), date: '2026-07-03', chain: 'Nimiq', asset: 'NIM', amount: 18.5, direction: 'outgoing', counterparty: 'NQ61 CAFE 8M2K 5YVA 4T0P 1RDS 7GQN 9L3B 6XHJ', address: WALLET, networkFee: 0.00024, transactionHash: 'c371e86a04fb922dsampleoutgoing', category: 'Outgoing payment', notes: '', reviewStatus: 'needs-review' },
  { id: 'sample:3', timestamp: Date.UTC(2026, 5, 15, 6, 5), date: '2026-06-15', chain: 'Nimiq', asset: 'NIM', amount: 50, direction: 'self', counterparty: 'NQ77 SAVE 2XH5 8KWD 0UQ3 6MNP 4TBA 9V1F 5LRC', address: WALLET, networkFee: 0.00024, transactionHash: 'b5e901f24ac78d33sampletransfer', category: 'Transfer', notes: 'Moved to savings wallet', reviewStatus: 'reviewed' },
  { id: 'sample:4', timestamp: Date.UTC(2025, 11, 29, 21, 4), date: '2025-12-29', chain: 'Nimiq', asset: 'NIM', amount: 2.75, direction: 'incoming', counterparty: 'Protocol reward', address: WALLET, networkFee: 0, transactionHash: 'f13ac6709ed245aasamplereward', category: 'Reward/income candidate', notes: 'Purpose needs confirmation', reviewStatus: 'needs-review' },
  { id: 'sample:5', timestamp: Date.UTC(2025, 10, 2, 12, 0), date: '2025-11-02', chain: 'Nimiq', asset: 'NIM', amount: 7.2, direction: 'incoming', counterparty: 'NQ40 UNKN 7Z2J 6CXA 9VTP 1FGR 8L5Q 3WDM 0HBS', address: WALLET, networkFee: null, transactionHash: '9c27be301af85d44sampleunknown', category: 'Unknown/needs review', notes: '', reviewStatus: 'needs-review' },
]
