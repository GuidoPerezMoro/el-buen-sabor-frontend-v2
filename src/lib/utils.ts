type ClassValue = string | number | null | false | undefined | Record<string, boolean>

export function cn(...inputs: ClassValue[]): string {
  return inputs
    .flatMap(input => {
      if (typeof input === 'string' || typeof input === 'number') return [input]
      if (input && typeof input === 'object') {
        return Object.entries(input)
          .filter(([, value]) => Boolean(value))
          .map(([key]) => key)
      }
      return []
    })
    .join(' ')
}
