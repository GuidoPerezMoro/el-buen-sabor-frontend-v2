'use client'

import Input from '@/components/ui/Input'

interface DatePickerProps {
  /** Label shown above the field */
  label?: string
  /** ISO-date string: YYYY-MM-DD */
  value: string
  /** Called with the new ISO string on pick or manual edit */
  onChange: (val: string) => void
  /** Error message to display */
  error?: string
  /** Extra wrapper classes */
  className?: string
}

export default function DatePicker({label, value, onChange, error, className}: DatePickerProps) {
  return (
    <Input
      label={label}
      type="date"
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder="dd/mm/aaaa"
      error={error}
      className={className}
    />
  )
}
