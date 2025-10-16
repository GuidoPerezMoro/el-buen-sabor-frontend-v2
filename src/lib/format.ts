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
