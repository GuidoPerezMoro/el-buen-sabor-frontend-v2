'use client'

import {useState} from 'react'
import Dropdown from '@/components/ui/Dropdown'

export default function DropdownTestPage() {
  const fruits = ['Apple', 'Banana', 'Cherry', 'Date', 'Elderberry']
  const [selectedFruit, setSelectedFruit] = useState<string>('')

  const cities = [
    {value: 'ny', label: 'New York'},
    {value: 'la', label: 'Los Angeles'},
    {value: 'chi', label: 'Chicago'},
    {value: 'hou', label: 'Houston'},
    {value: 'phx', label: 'Phoenix'},
  ]
  const [selectedCity, setSelectedCity] = useState<{value: string; label: string} | null>(null)

  const [disabledVal] = useState('')

  return (
    <main className="p-6 space-y-8">
      <h1 className="text-2xl font-bold">Test: Dropdown</h1>

      <div className="grid gap-6 md:grid-cols-3">
        {/* String options */}
        <div>
          <label className="block mb-1 text-sm font-medium">Fruits (string[])</label>
          <Dropdown
            options={fruits}
            value={selectedFruit}
            onChange={setSelectedFruit}
            placeholder="Select a fruit"
          />
          <p className="mt-1 text-sm text-gray-600">Selected: {selectedFruit || 'None'}</p>
        </div>

        {/* Object options */}
        <div>
          <label className="block mb-1 text-sm font-medium">Cities (object[])</label>
          <Dropdown
            options={cities}
            value={selectedCity}
            onChange={setSelectedCity}
            placeholder="Select a city"
          />
          <p className="mt-1 text-sm text-gray-600">Selected: {selectedCity?.label || 'None'}</p>
        </div>

        {/* Disabled */}
        <div>
          <label className="block mb-1 text-sm font-medium">Disabled</label>
          <Dropdown
            options={fruits}
            value={disabledVal}
            onChange={() => {}}
            placeholder="Disabled"
            disabled
          />
          <p className="mt-1 text-sm text-gray-600">Selected: {disabledVal || 'None'}</p>
        </div>
      </div>
    </main>
  )
}
