import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, cleanup, fireEvent } from '@testing-library/react'
import App from '../src/App'

const ROUTES = ['/', '/menu', '/grocery', '/checkout', '/track',
  '/store/overview', '/store/orders', '/store/menu', '/store/grocery',
  '/store/qr', '/store/settings', '/store/appearance']

describe('console hygiene', () => {
  let errs: string[] = []
  const spyE = vi.spyOn(console, 'error').mockImplementation((...a) => { errs.push(String(a[0])) })
  const spyW = vi.spyOn(console, 'warn').mockImplementation((...a) => { errs.push('WARN ' + String(a[0])) })

  beforeEach(() => { errs = [] })
  afterEach(() => { cleanup() })

  it.each(ROUTES)('renders %s with no console output', route => {
    window.history.replaceState({}, '', 'http://localhost:3000/#' + route)
    const { container } = render(<App />)
    expect(errs, `console output on ${route}: ${errs.join(' | ')}`).toEqual([])
    // every button has an accessible name
    container.querySelectorAll('button').forEach(b => {
      const name = (b.textContent || '').trim() || b.getAttribute('aria-label') || b.getAttribute('title')
      expect(name, `unnamed button on ${route}: ${b.outerHTML.slice(0, 90)}`).toBeTruthy()
    })
    // no empty href="#" style dead routes
    container.querySelectorAll('a[href]').forEach(a => {
      expect(a.getAttribute('href')!, 'dead href on ' + route).not.toBe('#')
    })
  })

  it('every owner tab is reachable by clicking the sidebar', () => {
    window.history.replaceState({}, '', 'http://localhost:3000/#/store/overview')
    render(<App />)
    const tabs = Array.from(document.querySelectorAll('.ownertab')) as HTMLElement[]
    expect(tabs.length).toBe(7)
    for (const t of tabs) {
      fireEvent.click(t)
      expect(t.classList.contains('on')).toBe(true)
    }
    expect(errs, errs.join(' | ')).toEqual([])
  })
})
