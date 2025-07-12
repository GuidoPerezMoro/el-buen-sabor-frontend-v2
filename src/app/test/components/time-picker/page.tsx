'use client'

import {useState} from 'react'
import TimePicker from '@/components/ui/TimePicker'

export default function TimePickerTestPage() {
  const [horaInicio, setHoraInicio] = useState('08:00')
  const [horaFin, setHoraFin] = useState('22:00')
  const [invalido, setInvalido] = useState('')

  return (
    <main className="p-6 space-y-8">
      <h1 className="text-2xl font-bold">Test: TimePicker</h1>

      <TimePicker value={''} onChange={setHoraInicio} />

      <div className="grid gap-6 md:grid-cols-2">
        <TimePicker label="Horario de apertura" value={horaInicio} onChange={setHoraInicio} />

        <TimePicker label="Horario de cierre" value={horaFin} onChange={setHoraFin} />
      </div>

      <TimePicker
        label="Campo con error"
        value={invalido}
        onChange={setInvalido}
        error="Este campo es obligatorio"
      />
    </main>
  )
}
