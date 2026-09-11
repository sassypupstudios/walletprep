import { init } from '@nimiq/mini-app-sdk'
import { normalizeNimiqTransaction } from './ledger'
import type { LedgerEntry, NimiqRpcTransaction } from './types'

export const DEFAULT_RPC_ENDPOINT = 'https://rpc.nimiqwatch.com'

function providerError(result: unknown): string | null {
  if (!result || typeof result !== 'object' || !('error' in result)) return null
  const error = (result as { error?: { message?: unknown } }).error
  return typeof error?.message === 'string' ? error.message : 'The wallet denied the account request.'
}

export async function connectReadOnlyWallet(): Promise<string[]> {
  const provider = await init({ timeout: 10_000 })
  const result = await provider.listAccounts()
  const error = providerError(result)
  if (error) throw new Error(error)
  if (!Array.isArray(result) || !result.every((item) => typeof item === 'string')) {
    throw new Error('Nimiq Pay returned an unexpected account response.')
  }
  return result
}

export async function loadNimiqTransactions(
  addresses: string[],
  endpoint = DEFAULT_RPC_ENDPOINT,
): Promise<LedgerEntry[]> {
  const results = await Promise.all(addresses.map(async (address) => {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jsonrpc: '2.0', method: 'getTransactionsByAddress', params: [address, 500, null], id: address }),
    })
    if (!response.ok) throw new Error(`Transaction service returned HTTP ${response.status}.`)
    const payload = await response.json() as { result?: { data?: NimiqRpcTransaction[] } | NimiqRpcTransaction[]; error?: { message?: string } }
    if (payload.error) throw new Error(payload.error.message || 'Transaction service request failed.')
    const data = Array.isArray(payload.result) ? payload.result : payload.result?.data
    if (!Array.isArray(data)) throw new Error('Transaction service returned an unexpected response.')
    return data
  }))
  const unique = new Map<string, NimiqRpcTransaction>()
  results.flat().forEach((tx) => unique.set(tx.hash, tx))
  return [...unique.values()]
    .map((tx) => normalizeNimiqTransaction(tx, addresses))
    .sort((a, b) => b.timestamp - a.timestamp)
}
