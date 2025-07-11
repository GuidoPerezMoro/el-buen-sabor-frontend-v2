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
  return (
    <Input
      label={label}
      type="time"
      step={60}
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder="hh:mm"
      error={error}
      className={className}
    />
  )
}
