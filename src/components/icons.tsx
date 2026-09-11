import React from 'react'

export function WAIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12.04 2a9.9 9.9 0 0 0-8.5 14.96L2.1 21.9l5.05-1.32A9.9 9.9 0 1 0 12.04 2Zm0 18.06a8.1 8.1 0 0 1-4.13-1.13l-.3-.18-3 .79.8-2.92-.2-.3a8.13 8.13 0 1 1 6.83 3.74Zm4.45-6.08c-.24-.12-1.44-.71-1.66-.79s-.39-.12-.55.12-.63.79-.77.95-.28.18-.53.06a6.65 6.65 0 0 1-3.34-2.91c-.25-.43.25-.4.72-1.34.08-.16.04-.3-.02-.42s-.55-1.4-.75-1.91c-.2-.5-.4-.43-.55-.44h-.47a.9.9 0 0 1-.65.31 2.7 2.7 0 0 1-1.63 1.47 5.2 5.2 0 0 1-2 1.28 33.6 33.6 0 0 0 5 4.93 10.5 10.5 0 0 0 3.24 1.72 7.7 7.7 0 0 0 2.24.4 5.05 5.05 0 0 0 3.1-1.46 4.15 4.15 0 0 0 1-2.39 1 1 0 0 0-.67-.88Z" />
    </svg>
  )
}

export function SearchIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.8-3.8" />
    </svg>
  )
}

export function PinIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  )
}

export function CartIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <circle cx="9" cy="20" r="1.6" />
      <circle cx="18" cy="20" r="1.6" />
      <path d="M2.5 3.5h2.2l2.5 12h10.6l2.2-8.5H6" />
    </svg>
  )
}

export function Arrow({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M5 12h14m-6-6 6 6-6 6" />
    </svg>
  )
}
