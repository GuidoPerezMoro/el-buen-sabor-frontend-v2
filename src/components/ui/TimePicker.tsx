'use client'

import Input from '@/components/ui/Input'

interface TimePickerProps {
  label?: string
  value: string
  onChange: (value: string) => void
  error?: string
  className?: string
}

export default function TimePicker({label, value, onChange, error, className}: TimePickerProps) {
  // Normalize "HH:MM" or "H:MM AM/PM" → "HH:MM"
  const to24h = (raw: string) => {
    const s = raw.trim()
    const m = s.match(/^(\d{1,2}):(\d{2})(?:\s*(AM|PM))?$/i)
    if (!m) return s
    let h = parseInt(m[1], 10)
    const mm = m[2]
    const ap = m[3]?.toUpperCase()
    if (ap) {
      h = (h % 12) + (ap === 'PM' ? 12 : 0)
    }
    return `${String(h).padStart(2, '0')}:${mm}`
  }

  return (
    <Input
      label={label}
      type="time"
      step={60}
      value={value}
      onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange(to24h(e.target.value))}
      placeholder="hh:mm"
      error={error}
      className={className}
    />
  )
}
