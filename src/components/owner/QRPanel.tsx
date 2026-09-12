import { useState } from 'react'
import { useApp } from '../../store'
import { copyText } from '../../lib/util'
import { downloadQR } from '../../lib/qr'
import QR from '../QR'
import { CopyIcon, DownloadIcon, PrintIcon, TrashIcon } from '../icons'

const SIZES = [
  { s: 56, label: 'table tent' },
  { s: 84, label: 'shelf tag' },
  { s: 112, label: 'A-frame' },
]

export default function QRPanel() {
  const { store, link, tableLink, tables, addTable, removeTable, toast } = useApp()
  const [draft, setDraft] = useState('')

  const safeFile = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

  const download = async (value: string, name: string) => {
    const ok = await downloadQR(value, `${safeFile(store.slug)}-${safeFile(name)}-qr.png`)
    toast(ok ? 'QR downloaded as a 1024px PNG' : 'Download failed — try copying the link', ok ? '⬇️' : '⚠️')
  }

  const copy = async (value: string, what: string) => {
    const ok = await copyText(value)
    toast(ok ? `${what} link copied` : 'Could not copy — select it manually', ok ? '📋' : '⚠️')
  }

  const addFromDraft = (e: React.FormEvent) => {
    e.preventDefault()
    const label = draft.trim()
    if (!label) return
    if (!addTable(label)) {
      toast(`Table ${label} already exists`, '⚠️')
      return
    }
    toast(`QR created for table ${label}`, '🔳')
    setDraft('')
  }

  const addBatch = () => {
    const made: string[] = []
    for (let n = 1; n <= 8; n++) {
      const label = String(n)
      if (addTable(label)) made.push(label)
    }
    toast(made.length ? `Added tables ${made.join(', ')}` : 'Tables 1–8 already exist', '🔳')
  }

  return (
    <div className="owner-qr">
      <div className="qr-grid">
        <section className="card">
          <h3 className="card-h">Your storefront QR</h3>
          <p className="card-sub">
            Opens <b>{store.name}</b> for anyone who scans it. Use this one on your window,
            counter or flyers.
          </p>
          <div className="qr-frame">
            <QR value={link} size={216} canvasId="qr-main" />
          </div>
          <p className="qr-link" title={link}>
            {link}
          </p>
          <div className="btn-row">
            <button className="btn btn-primary btn-sm" onClick={() => download(link, 'store')}>
              <DownloadIcon size={14} /> Download PNG
            </button>
            <button className="btn btn-ghost btn-sm" onClick={() => copy(link, 'Store')}>
              <CopyIcon size={14} /> Copy link
            </button>
            <button className="btn btn-ghost btn-sm no-print" onClick={() => window.print()}>
              <PrintIcon size={14} /> Print table tents
            </button>
          </div>
          <div className="qr-sizes">
            {SIZES.map(({ s, label }) => (
              <div key={label} className="qr-size">
                <div className="qr-size-frame">
                  <QR value={link} size={s} />
                </div>
                <span>{label}</span>
              </div>
            ))}
          </div>
          <p className="qr-note">
            Every order from this code lands on <b>{store.whatsapp}</b> on WhatsApp.
          </p>
        </section>

        <section className="card">
          <h3 className="card-h">Table QR codes</h3>
          <p className="card-sub">
            One code per table. The table number travels with the order, so you know exactly
            where to carry the plate — no address needed.
          </p>

          <form className="table-add" onSubmit={addFromDraft}>
            <input
              value={draft}
              onChange={e => setDraft(e.target.value)}
              placeholder="Table number — e.g. 12"
              maxLength={12}
              aria-label="Table number"
            />
            <button className="btn btn-primary btn-sm" type="submit">
              + Add table
            </button>
            <button className="btn btn-ghost btn-sm" type="button" onClick={addBatch}>
              Add 1–8
            </button>
          </form>

          {tables.length === 0 ? (
            <div className="empty empty-sm">
              <span className="empty-icon">🔳</span>
              <h3>No tables yet</h3>
              <p>Add a table number and a dedicated QR appears instantly.</p>
            </div>
          ) : (
            <ul className="table-grid">
              {tables.map(t => {
                const url = tableLink(t)
                return (
                  <li key={t} className="table-card">
                    <div className="table-qr">
                      <QR value={url} size={104} />
                    </div>
                    <b className="table-label">Table {t}</b>
                    <span className="table-url" title={url}>
                      ?table={t}
                    </span>
                    <div className="btn-row btn-row-tight">
                      <button
                        className="btn btn-ghost btn-xs"
                        onClick={() => download(url, `table-${t}`)}
                        aria-label={`Download the QR for table ${t}`}
                      >
                        <DownloadIcon size={13} />
                      </button>
                      <button
                        className="btn btn-ghost btn-xs"
                        onClick={() => copy(url, `Table ${t}`)}
                        aria-label={`Copy the link for table ${t}`}
                      >
                        <CopyIcon size={13} />
                      </button>
                      <button
                        className="btn btn-ghost btn-xs danger"
                        onClick={() => {
                          removeTable(t)
                          toast(`Table ${t} removed`, '🗑️')
                        }}
                        aria-label={`Remove table ${t}`}
                      >
                        <TrashIcon size={13} />
                      </button>
                    </div>
                  </li>
                )
              })}
            </ul>
          )}
        </section>
      </div>

      <section className="tents" id="tents" aria-label="Printable table tents">
        <h3 className="card-h no-print">Printable table tents</h3>
        <p className="card-sub no-print">
          {tables.length > 0
            ? `One tent per table (${tables.length}). Print, fold, place.`
            : 'Three generic tents. Add tables above to print numbered ones.'}
        </p>
        <div className="tents-list">
          {(tables.length > 0 ? tables : ['', '', '']).map((t, i) => (
            <div key={t || i} className="tent">
              <div className="tent-qr">
                <QR value={t ? tableLink(t) : link} size={120} dark="#111418" light="#ffffff" />
              </div>
              <b className="tent-name">
                {store.emoji} {store.name}
              </b>
              <span className="tent-slogan">{store.tagline}</span>
              {t && <span className="tent-table">Table {t}</span>}
              <span className="tent-cta">Scan · Order · Eat</span>
              <span className="tent-foot">QR ordering via WhatsApp</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
