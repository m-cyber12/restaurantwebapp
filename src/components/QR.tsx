import { useEffect, useRef } from 'react'
import QRCode from 'qrcode'

interface Props {
  value: string
  size?: number
  dark?: string
  light?: string
  className?: string
  canvasId?: string
}

export default function QR({
  value,
  size = 240,
  dark = '#10141c',
  light = '#ffffff',
  className = '',
  canvasId,
}: Props) {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (!ref.current) return
    QRCode.toCanvas(ref.current, value, {
      width: size,
      margin: 1,
      color: { dark, light },
      errorCorrectionLevel: 'M',
    }).catch(() => {})
  }, [value, size, dark, light])

  return (
    <canvas
      ref={ref}
      id={canvasId}
      className={className}
      style={{ width: size, height: size, display: 'block' }}
      aria-label="QR code"
    />
  )
}
