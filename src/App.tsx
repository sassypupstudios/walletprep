import { useMemo, useState } from 'react'
import { SAMPLE_LEDGER } from './fixtures'
import { filterLedger, ledgerToCsv } from './ledger'
import { connectReadOnlyWallet, loadNimiqTransactions } from './nimiq'
import { CATEGORIES, type Category, type LedgerEntry, type ReviewStatus } from './types'

const STORAGE_KEY = 'walletprep-ledger-v1'
const SOURCE_KEY = 'walletprep-source-v1'
const ONBOARDING_KEY = 'walletprep-onboarding-v1'
const FEEDBACK_URL = 'https://github.com/sassypupstudios/walletprep/issues/new?labels=tester-feedback&title=WalletPrep%20tester%20feedback&body=What%20I%20tried%3A%0A%0AWhat%20happened%3A%0A%0ADevice%20and%20browser%3A%0A%0APlease%20do%20not%20include%20wallet%20addresses%2C%20transaction%20details%2C%20seed%20phrases%2C%20or%20private%20keys.'

function readStoredLedger(): LedgerEntry[] | null {
  try {
    const value = localStorage.getItem(STORAGE_KEY)
    return value ? JSON.parse(value) as LedgerEntry[] : null
  } catch { return null }
}

function shortAddress(value: string) {
  return value.length > 20 ? `${value.slice(0, 10)}…${value.slice(-6)}` : value
}

function downloadCsv(entries: LedgerEntry[]) {
  const blob = new Blob([ledgerToCsv(entries)], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = `walletprep-${new Date().toISOString().slice(0, 10)}.csv`
  anchor.click()
  URL.revokeObjectURL(url)
}

export default function App() {
  const [entries, setEntriesState] = useState<LedgerEntry[]>(() => readStoredLedger() ?? SAMPLE_LEDGER)
  const [source, setSource] = useState<'sample' | 'wallet'>(() => localStorage.getItem(SOURCE_KEY) === 'wallet' ? 'wallet' : 'sample')
  const [addresses, setAddresses] = useState<string[]>([])
  const [year, setYear] = useState('')
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [reviewOnly, setReviewOnly] = useState(false)
  const [expanded, setExpanded] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')
  const [started, setStarted] = useState(() => localStorage.getItem(ONBOARDING_KEY) === 'complete')
  const [reviewedThisVisit, setReviewedThisVisit] = useState(false)
  const [exportedThisVisit, setExportedThisVisit] = useState(false)

  const setEntries = (next: LedgerEntry[]) => {
    setEntriesState(next)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  }
  const years = useMemo(() => [...new Set(entries.map((entry) => entry.date.slice(0, 4)))].sort().reverse(), [entries])
  const visible = useMemo(() => filterLedger(entries, { year, from, to, needsReviewOnly: reviewOnly }), [entries, year, from, to, reviewOnly])
  const needsReview = entries.filter((entry) => entry.reviewStatus === 'needs-review').length
  const incoming = visible.filter((entry) => entry.direction === 'incoming').reduce((sum, entry) => sum + entry.amount, 0)
  const outgoing = visible.filter((entry) => entry.direction === 'outgoing').reduce((sum, entry) => sum + entry.amount + (entry.networkFee ?? 0), 0)

  async function connect() {
    setBusy(true); setMessage('Waiting for Nimiq Pay…')
    try {
      const connected = await connectReadOnlyWallet()
      if (connected.length === 0) throw new Error('No Nimiq accounts were shared.')
      setAddresses(connected)
      setMessage('Loading public transaction history…')
      const loaded = await loadNimiqTransactions(connected)
      setEntries(loaded); setSource('wallet'); localStorage.setItem(SOURCE_KEY, 'wallet')
      setStarted(true)
      setMessage(`${loaded.length} transaction${loaded.length === 1 ? '' : 's'} loaded. No signing permission was requested.`)
    } catch (error) {
      setMessage(error instanceof Error ? error.message : String(error))
    } finally { setBusy(false) }
  }

  function updateEntry(id: string, patch: Partial<LedgerEntry>) {
    setEntries(entries.map((entry) => entry.id === id ? { ...entry, ...patch } : entry))
    if (patch.reviewStatus === 'reviewed' || patch.category || patch.notes !== undefined) setReviewedThisVisit(true)
  }

  function loadSample() {
    setEntries(SAMPLE_LEDGER); setSource('sample'); localStorage.setItem(SOURCE_KEY, 'sample'); setAddresses([]); setStarted(true); setMessage('Safe sample ledger loaded — no wallet connected.')
    window.setTimeout(() => document.querySelector('#ledger')?.scrollIntoView({ behavior: 'smooth' }), 50)
  }

  function exportLedger() {
    downloadCsv(visible)
    setExportedThisVisit(true)
    localStorage.setItem(ONBOARDING_KEY, 'complete')
  }

  return <div className="app-shell">
    <header className="topbar">
      <a className="brand" href="#top" aria-label="WalletPrep home"><span className="brand-mark">W</span><span>WalletPrep</span></a>
      <span className={`source-badge ${source}`}>{source === 'sample' ? 'Sample data' : 'Wallet connected'}</span>
    </header>

    <main id="top">
      <section className="hero">
        <div>
          <p className="eyebrow">Nimiq record organizer</p>
          <h1>Turn wallet activity into a ledger you can review.</h1>
          <p className="hero-copy">Connect read-only or try the safe demo, review unknown items, and export clean records for your bookkeeping workflow.</p>
          <ol className="quick-steps" aria-label="Three-step WalletPrep workflow">
            <li className={started ? 'done' : 'active'}><span>1</span><div><strong>Choose data</strong><small>Read a wallet or use the demo</small></div></li>
            <li className={reviewedThisVisit ? 'done' : started ? 'active' : ''}><span>2</span><div><strong>Review</strong><small>Classify unknown items</small></div></li>
            <li className={exportedThisVisit ? 'done' : reviewedThisVisit ? 'active' : ''}><span>3</span><div><strong>Export</strong><small>Download your CSV</small></div></li>
          </ol>
        </div>
        <div className="connect-card">
          <div className="shield">✓</div>
          <div><strong>Read-only by design</strong><small>Seed phrases and private keys are never requested. WalletPrep cannot sign or move funds.</small></div>
          <button className="primary" onClick={connect} disabled={busy}>{busy ? 'Connecting…' : 'Connect Nimiq Pay'}</button>
          <button className="demo-button" onClick={loadSample}>Try the safe demo — no wallet needed</button>
          {addresses.length > 0 && <small className="connected-address">{addresses.length} account{addresses.length > 1 ? 's' : ''}: {shortAddress(addresses[0])}</small>}
          {message && <p className="status" role="status">{message}</p>}
        </div>
      </section>

      <section className="workspace" id="ledger" aria-label="Ledger workspace">
        <div className="section-heading">
          <div><p className="eyebrow">Your records</p><h2>Transaction ledger</h2></div>
          <button className="export" onClick={exportLedger} disabled={visible.length === 0}>↓ Export {visible.length} to CSV</button>
        </div>

        <div className="summary-grid">
          <div className="metric"><span>Visible records</span><strong>{visible.length}</strong><small>of {entries.length} total</small></div>
          <div className="metric review"><span>Needs review</span><strong>{needsReview}</strong><button onClick={() => setReviewOnly(!reviewOnly)}>{reviewOnly ? 'Show all' : 'Open queue →'}</button></div>
          <div className="metric"><span>Incoming</span><strong className="positive">+{incoming.toLocaleString(undefined, { maximumFractionDigits: 5 })} NIM</strong><small>Organizational total</small></div>
          <div className="metric"><span>Outgoing + fees</span><strong>−{outgoing.toLocaleString(undefined, { maximumFractionDigits: 5 })} NIM</strong><small>Organizational total</small></div>
        </div>

        <div className="filters">
          <label>Tax year<select value={year} onChange={(event) => setYear(event.target.value)}><option value="">All years</option>{years.map((item) => <option key={item}>{item}</option>)}</select></label>
          <label>From<input type="date" value={from} onChange={(event) => setFrom(event.target.value)} /></label>
          <label>To<input type="date" value={to} onChange={(event) => setTo(event.target.value)} /></label>
          <label className="toggle"><input type="checkbox" checked={reviewOnly} onChange={(event) => setReviewOnly(event.target.checked)} /><span />Needs Review only</label>
          {(year || from || to) && <button className="clear" onClick={() => { setYear(''); setFrom(''); setTo('') }}>Clear dates</button>}
        </div>

        <div className="ledger-list">
          {visible.length === 0 && <div className="empty"><strong>No matching transactions</strong><span>Adjust the filters or connect a wallet with transaction history.</span></div>}
          {visible.map((entry) => {
            const isOpen = expanded === entry.id
            return <article className={`transaction ${isOpen ? 'open' : ''}`} key={entry.id}>
              <button className="transaction-summary" onClick={() => setExpanded(isOpen ? null : entry.id)} aria-expanded={isOpen}>
                <span className={`direction-icon ${entry.direction}`}>{entry.direction === 'incoming' ? '↓' : entry.direction === 'outgoing' ? '↑' : '↔'}</span>
                <span className="tx-main"><strong>{entry.category}</strong><small>{entry.date} · {shortAddress(entry.counterparty)}</small></span>
                <span className={`amount ${entry.direction}`}>{entry.direction === 'incoming' ? '+' : entry.direction === 'outgoing' ? '−' : ''}{entry.amount.toLocaleString(undefined, { maximumFractionDigits: 5 })} <small>NIM</small></span>
                <span className={`review-pill ${entry.reviewStatus}`}>{entry.reviewStatus === 'needs-review' ? 'Needs Review' : 'Reviewed'}</span>
                <span className="chevron">⌄</span>
              </button>
              {isOpen && <div className="transaction-detail">
                <div className="edit-grid">
                  <label>Category<select value={entry.category} onChange={(event) => updateEntry(entry.id, { category: event.target.value as Category, reviewStatus: event.target.value === 'Unknown/needs review' ? 'needs-review' : entry.reviewStatus })}>{CATEGORIES.map((category) => <option key={category}>{category}</option>)}</select></label>
                  <label>Review status<select value={entry.reviewStatus} onChange={(event) => updateEntry(entry.id, { reviewStatus: event.target.value as ReviewStatus })}><option value="needs-review">Needs Review</option><option value="reviewed">Reviewed</option></select></label>
                </div>
                <label>Notes<textarea rows={2} value={entry.notes} placeholder="Add invoice, vendor, purpose, or other context…" onChange={(event) => updateEntry(entry.id, { notes: event.target.value })} /></label>
                <dl><div><dt>Wallet</dt><dd>{entry.address}</dd></div><div><dt>Counterparty</dt><dd>{entry.counterparty}</dd></div><div><dt>Network fee</dt><dd>{entry.networkFee === null ? 'Unavailable' : `${entry.networkFee} NIM`}</dd></div><div><dt>Transaction hash</dt><dd>{entry.transactionHash}</dd></div></dl>
              </div>}
            </article>
          })}
        </div>
      </section>
    </main>

    <footer><strong>Read-only: never share a seed phrase or private key.</strong> WalletPrep only organizes records and does not provide tax, legal, or accounting advice. <a href={FEEDBACK_URL} target="_blank" rel="noreferrer">Send feedback</a></footer>
  </div>
}
