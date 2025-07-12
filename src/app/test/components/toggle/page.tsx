// app/test/components/toggle/page.tsx
'use client'

import {useState} from 'react'
import Toggle from '@/components/ui/Toggle'

export default function ToggleTestPage() {
  const [toggle1, setToggle1] = useState(false)
  const [toggle2, setToggle2] = useState(true)
  const [toggleDisabled] = useState(false)

  return (
    <main className="p-6 space-y-8">
      <h1 className="text-2xl font-bold">Test: Toggle</h1>

      <div className="grid gap-6 md:grid-cols-3 items-start">
        {/* Default Off */}
        <div>
          <label className="block text-sm font-medium mb-1">Default Off</label>
          <Toggle checked={toggle1} onChange={setToggle1} />
          <p className="mt-1 text-sm text-gray-600">State: {toggle1 ? 'On' : 'Off'}</p>
        </div>

        {/* Default On */}
        <div>
          <label className="block text-sm font-medium mb-1">Default On</label>
          <Toggle checked={toggle2} onChange={setToggle2} />
          <p className="mt-1 text-sm text-gray-600">State: {toggle2 ? 'On' : 'Off'}</p>
        </div>

        {/* Disabled */}
        <div>
          <label className="block text-sm font-medium mb-1">Disabled</label>
          <Toggle checked={toggleDisabled} onChange={() => {}} disabled />
          <p className="mt-1 text-sm text-gray-600">State: {toggleDisabled ? 'On' : 'Off'}</p>
        </div>
      </div>
    </main>
  )
}
