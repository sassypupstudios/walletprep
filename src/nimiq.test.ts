import { afterEach, describe, expect, it, vi } from 'vitest'
import { loadNimiqTransactions } from './nimiq'

afterEach(() => vi.unstubAllGlobals())

describe('Nimiq transaction loading', () => {
  it('uses the read-only history method and unwraps the current RPC response', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ result: { data: [{ hash: 'rpc-hash', timestamp: 1_788_000_000_000, from: 'NQ11 OTHER', to: 'NQ00 OWNED', value: 100_000, fee: 24 }] } }),
    })
    vi.stubGlobal('fetch', fetchMock)

    const entries = await loadNimiqTransactions(['NQ00 OWNED'])

    const request = JSON.parse(fetchMock.mock.calls[0][1].body)
    expect(request).toMatchObject({ method: 'getTransactionsByAddress', params: ['NQ00 OWNED', 500, null] })
    expect(entries[0]).toMatchObject({ transactionHash: 'rpc-hash', amount: 1, networkFee: 0.00024 })
  })
})
