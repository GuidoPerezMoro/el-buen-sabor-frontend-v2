// Reusable currency formatter that hides ",00" (zero cents)
export function formatCurrencyAuto(
  value: number,
  {locale = 'es-AR', currency = 'ARS'}: {locale?: string; currency?: string} = {}
): string {
  const isZeroCents = Math.abs(value - Math.round(value)) < 1e-6
  const fmt = new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: isZeroCents ? 0 : 2,
    maximumFractionDigits: isZeroCents ? 0 : 2,
  })
  return fmt.format(value)
}

// Convenience wrapper for ARS
export const formatARS = (value: number) =>
  formatCurrencyAuto(value, {locale: 'es-AR', currency: 'ARS'})

export function formatDateDMY(dateStr?: string | null): string {
  if (!dateStr) return ''
  const parts = dateStr.split('-') // yyyy-mm-dd
  if (parts.length !== 3) return dateStr
  const [yyyy, mm, dd] = parts
  return `${dd.padStart(2, '0')}/${mm.padStart(2, '0')}/${yyyy}`
}

export function formatTimeHM(timeStr?: string | null): string {
  if (!timeStr) return ''
  const [timePart] = timeStr.split('.') // discard fractions
  const [hh, mm] = timePart.split(':')
  if (!hh || !mm) return timePart
  return `${hh}:${mm}`
}
