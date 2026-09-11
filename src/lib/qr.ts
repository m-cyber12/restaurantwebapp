import QRCode from 'qrcode'

/**
 * Render a QR at print resolution, independent of whatever size is on screen.
 * Plan §25 asks for better download/print quality — a 216px canvas screenshot
 * goes blurry on a table tent, a 1024px one does not.
 */
export async function qrDataUrl(
  value: string,
  size = 1024,
  dark = '#10141c',
  light = '#ffffff'
): Promise<string> {
  return QRCode.toDataURL(value, {
    width: size,
    margin: 2,
    errorCorrectionLevel: 'M',
    color: { dark, light },
  })
}

export async function downloadQR(
  value: string,
  filename: string,
  size = 1024
): Promise<boolean> {
  try {
    const url = await qrDataUrl(value, size)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.rel = 'noopener'
    document.body.appendChild(a)
    a.click()
    a.remove()
    return true
  } catch {
    return false
  }
}
