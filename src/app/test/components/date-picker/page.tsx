'use client'

import {useState} from 'react'
import DatePicker from '@/components/ui/DatePicker'

export default function DatePickerTestPage() {
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [err, setErr] = useState('')

  return (
    <main className="p-6 space-y-8">
      <h1 className="text-2xl font-bold">Test: DatePicker</h1>

      <div className="grid gap-6 md:grid-cols-2">
        <DatePicker label="Desde" value={from} onChange={setFrom} />
        <DatePicker label="Hasta" value={to} onChange={setTo} />
      </div>

      <DatePicker label="Con error" value={err} onChange={setErr} error="Fecha obligatoria" />

      <div className="mt-4 text-sm text-gray-600">
        <p>Desde: {from || '—'}</p>
        <p>Hasta: {to || '—'}</p>
        <p>Error: {err || '—'}</p>
      </div>
    </main>
  )
}
