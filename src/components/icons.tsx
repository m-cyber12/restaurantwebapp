import React from 'react'

type P = { size?: number }

const base = (size: number) => ({
  width: size,
  height: size,
  viewBox: '0 0 24 24',
  'aria-hidden': true,
  focusable: false,
}) as const

export function WAIcon({ size = 18 }: P) {
  return (
    <svg {...base(size)} fill="currentColor">
      <path d="M12.04 2a9.9 9.9 0 0 0-8.5 14.96L2.1 21.9l5.05-1.32A9.9 9.9 0 1 0 12.04 2Zm0 18.06a8.1 8.1 0 0 1-4.13-1.13l-.3-.18-3 .79.8-2.92-.2-.3a8.13 8.13 0 1 1 6.83 3.74Zm4.45-6.08c-.24-.12-1.44-.71-1.66-.79s-.39-.12-.55.12-.63.79-.77.95-.28.18-.53.06a6.65 6.65 0 0 1-3.34-2.91c-.25-.43.25-.4.72-1.34.08-.16.04-.3-.02-.42s-.55-1.4-.75-1.91c-.2-.5-.4-.43-.55-.44h-.47a.9.9 0 0 1-.65.31 2.7 2.7 0 0 1-1.63 1.47 5.2 5.2 0 0 1-2 1.28 33.6 33.6 0 0 0 5 4.93 10.5 10.5 0 0 0 3.24 1.72 7.7 7.7 0 0 0 2.24.4 5.05 5.05 0 0 0 3.1-1.46 4.15 4.15 0 0 0 1-2.39 1 1 0 0 0-.67-.88Z" />
    </svg>
  )
}

export function SearchIcon({ size = 18 }: P) {
  return (
    <svg {...base(size)} fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.8-3.8" />
    </svg>
  )
}

export function PinIcon({ size = 16 }: P) {
  return (
    <svg
      {...base(size)}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  )
}

export function CartIcon({ size = 20 }: P) {
  return (
    <svg
      {...base(size)}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="9" cy="20" r="1.6" />
      <circle cx="18" cy="20" r="1.6" />
      <path d="M2.5 3.5h2.2l2.5 12h10.6l2.2-8.5H6" />
    </svg>
  )
}

export function Arrow({ size = 16 }: P) {
  return (
    <svg
      {...base(size)}
      fill="none"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 12h14m-6-6 6 6-6 6" />
    </svg>
  )
}

/* ── navigation & product icons (24px grid, 1.7 stroke) ─────── */

const strokeProps = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.7,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
} as const

export function HomeIcon({ size = 20 }: P) {
  return (
    <svg {...base(size)} {...strokeProps}>
      <path d="M3.5 10.5 12 3.8l8.5 6.7V20a1 1 0 0 1-1 1h-4.6v-5.4H9.1V21H4.5a1 1 0 0 1-1-1Z" />
    </svg>
  )
}

export function DishIcon({ size = 20 }: P) {
  return (
    <svg {...base(size)} {...strokeProps}>
      <path d="M6 3v7.2a2.6 2.6 0 0 0 5.2 0V3M8.6 10.4V21" />
      <path d="M17.4 3c-1.6 1.2-2.4 3-2.4 5.3 0 1.7.8 2.7 2.4 3V21" />
    </svg>
  )
}

export function BasketIcon({ size = 20 }: P) {
  return (
    <svg {...base(size)} {...strokeProps}>
      <path d="M3 9h18l-1.7 10.2a1.6 1.6 0 0 1-1.6 1.3H6.3a1.6 1.6 0 0 1-1.6-1.3Z" />
      <path d="m8 9 2.4-5M16 9l-2.4-5M9.5 13v4M14.5 13v4" />
    </svg>
  )
}

export function ScooterIcon({ size = 20 }: P) {
  return (
    <svg {...base(size)} {...strokeProps}>
      <circle cx="5.5" cy="17.5" r="2.8" />
      <circle cx="18.5" cy="17.5" r="2.8" />
      <path d="M8.3 17.5h7.4M15.7 17.5 14 6.5h-2.6M17.6 8.6h2.8l1 6.4M11.4 6.5H8.2" />
    </svg>
  )
}

export function StoreIcon({ size = 20 }: P) {
  return (
    <svg {...base(size)} {...strokeProps}>
      <path d="M3.6 9.4V20a1 1 0 0 0 1 1h14.8a1 1 0 0 0 1-1V9.4" />
      <path d="M2.8 9.4 4.6 4h14.8l1.8 5.4a3 3 0 0 1-5.7 1.6 3 3 0 0 1-5.4 0 3 3 0 0 1-5.7-1.6Z" />
      <path d="M9.6 21v-5.6h4.8V21" />
    </svg>
  )
}

export function QrIcon({ size = 20 }: P) {
  return (
    <svg {...base(size)} {...strokeProps}>
      <rect x="3.5" y="3.5" width="6.5" height="6.5" rx="1.4" />
      <rect x="14" y="3.5" width="6.5" height="6.5" rx="1.4" />
      <rect x="3.5" y="14" width="6.5" height="6.5" rx="1.4" />
      <path d="M14 14h3v3h-3zM20.5 14v3M14 20.5h6.5v-3.5" />
    </svg>
  )
}

export function CheckIcon({ size = 16 }: P) {
  return (
    <svg {...base(size)} {...strokeProps} strokeWidth="2.6">
      <path d="m4.5 12.5 5 5 10-11" />
    </svg>
  )
}

export function CloseIcon({ size = 18 }: P) {
  return (
    <svg {...base(size)} {...strokeProps} strokeWidth="2.1">
      <path d="M6 6l12 12M18 6 6 18" />
    </svg>
  )
}

export function StarIcon({ size = 14 }: P) {
  return (
    <svg {...base(size)} fill="currentColor">
      <path d="M12 2.6l2.9 5.9 6.5.95-4.7 4.6 1.1 6.5-5.8-3.05L6.2 20.55l1.1-6.5-4.7-4.6 6.5-.95Z" />
    </svg>
  )
}

export function HeartIcon({ size = 17, filled = false }: P & { filled?: boolean }) {
  return (
    <svg
      {...base(size)}
      fill={filled ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinejoin="round"
    >
      <path d="M12 20.3s-7.6-4.6-7.6-9.7A4.4 4.4 0 0 1 12 7.6a4.4 4.4 0 0 1 7.6 3c0 5.1-7.6 9.7-7.6 9.7Z" />
    </svg>
  )
}

export function ClockIcon({ size = 15 }: P) {
  return (
    <svg {...base(size)} {...strokeProps}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.2V12l3.2 2" />
    </svg>
  )
}

export function CopyIcon({ size = 15 }: P) {
  return (
    <svg {...base(size)} {...strokeProps}>
      <rect x="8.5" y="8.5" width="12" height="12" rx="2.2" />
      <path d="M15.5 5.5v-.6a1.4 1.4 0 0 0-1.4-1.4H4.9a1.4 1.4 0 0 0-1.4 1.4v9.2a1.4 1.4 0 0 0 1.4 1.4h.6" />
    </svg>
  )
}

export function DownloadIcon({ size = 15 }: P) {
  return (
    <svg {...base(size)} {...strokeProps}>
      <path d="M12 3.5v11m0 0 4.2-4.2M12 14.5 7.8 10.3M4 17v2.2a1.3 1.3 0 0 0 1.3 1.3h13.4A1.3 1.3 0 0 0 20 19.2V17" />
    </svg>
  )
}

export function PrintIcon({ size = 15 }: P) {
  return (
    <svg {...base(size)} {...strokeProps}>
      <path d="M7 9V3.5h10V9M7 18H4.8A1.3 1.3 0 0 1 3.5 16.7v-5.4A1.3 1.3 0 0 1 4.8 10h14.4a1.3 1.3 0 0 1 1.3 1.3v5.4a1.3 1.3 0 0 1-1.3 1.3H17" />
      <rect x="7" y="14.5" width="10" height="6" rx="1" />
    </svg>
  )
}

export function PlusIcon({ size = 16 }: P) {
  return (
    <svg {...base(size)} {...strokeProps} strokeWidth="2.4">
      <path d="M12 5v14M5 12h14" />
    </svg>
  )
}

export function TrashIcon({ size = 15 }: P) {
  return (
    <svg {...base(size)} {...strokeProps}>
      <path d="M4.5 6.5h15M9.5 6.5V4.8a1.3 1.3 0 0 1 1.3-1.3h2.4a1.3 1.3 0 0 1 1.3 1.3v1.7M6.5 6.5l.9 13a1.3 1.3 0 0 0 1.3 1.2h6.6a1.3 1.3 0 0 0 1.3-1.2l.9-13" />
    </svg>
  )
}

export function ChartIcon({ size = 18 }: P) {
  return (
    <svg {...base(size)} {...strokeProps}>
      <path d="M4 20V9.5M10 20V4M16 20v-7.5M22 20H2" />
    </svg>
  )
}

export function PaletteIcon({ size = 18 }: P) {
  return (
    <svg {...base(size)} {...strokeProps}>
      <path d="M12 21a9 9 0 1 1 9-9c0 2.2-1.9 3-3.6 3H16a2 2 0 0 0-1.4 3.4c.4.5.2 1.6-1 1.6Z" />
      <circle cx="7.8" cy="12" r="1.15" fill="currentColor" stroke="none" />
      <circle cx="10.4" cy="8" r="1.15" fill="currentColor" stroke="none" />
      <circle cx="15.2" cy="8.4" r="1.15" fill="currentColor" stroke="none" />
    </svg>
  )
}

export function GearIcon({ size = 18 }: P) {
  return (
    <svg {...base(size)} {...strokeProps}>
      <circle cx="12" cy="12" r="3.2" />
      <path d="M19.6 14.4a1.5 1.5 0 0 0 .3 1.7l.1.1a1.8 1.8 0 1 1-2.6 2.6l-.1-.1a1.5 1.5 0 0 0-2.6 1v.3a1.8 1.8 0 1 1-3.6 0v-.2a1.5 1.5 0 0 0-2.7-1l-.1.1a1.8 1.8 0 1 1-2.6-2.6l.1-.1a1.5 1.5 0 0 0-1-2.6h-.3a1.8 1.8 0 1 1 0-3.6h.2a1.5 1.5 0 0 0 1-2.7l-.1-.1A1.8 1.8 0 1 1 8.2 4.6l.1.1a1.5 1.5 0 0 0 2.6-1v-.3a1.8 1.8 0 1 1 3.6 0v.2a1.5 1.5 0 0 0 2.6 1l.1-.1a1.8 1.8 0 1 1 2.6 2.6l-.1.1a1.5 1.5 0 0 0 1 2.6h.3a1.8 1.8 0 1 1 0 3.6h-.2a1.5 1.5 0 0 0-1.4.9Z" />
    </svg>
  )
}

export function ReceiptIcon({ size = 18 }: P) {
  return (
    <svg {...base(size)} {...strokeProps}>
      <path d="M5.5 3.5h13v17l-2.2-1.5-2.2 1.5-2.1-1.5-2.2 1.5-2.1-1.5-2.2 1.5Z" />
      <path d="M9 8.5h6M9 12.5h6" />
    </svg>
  )
}

export function SparkIcon({ size = 16 }: P) {
  return (
    <svg {...base(size)} fill="currentColor">
      <path d="M12 2.5l1.9 5.6 5.6 1.9-5.6 1.9L12 17.5l-1.9-5.6L4.5 10l5.6-1.9Z" />
    </svg>
  )
}

export function ShieldIcon({ size = 16 }: P) {
  return (
    <svg {...base(size)} {...strokeProps}>
      <path d="M12 3.2 5 6v6c0 4.3 3 7.6 7 8.8 4-1.2 7-4.5 7-8.8V6Z" />
      <path d="m9.2 12 2 2 3.6-3.8" />
    </svg>
  )
}
