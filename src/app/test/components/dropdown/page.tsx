// src/app/test/components/dropdown/page.tsx
'use client'

import {useState} from 'react'
import Dropdown from '@/components/ui/Dropdown'

export default function DropdownTestPage() {
  const fruits = ['Apple', 'Banana', 'Cherry', 'Date', 'Elderberry']
  const [selectedFruit, setSelectedFruit] = useState<string | null>(null)

  const cities = [
    {value: 'ny', label: 'New York'},
    {value: 'la', label: 'Los Angeles'},
    {value: 'chi', label: 'Chicago'},
    {value: 'hou', label: 'Houston'},
    {value: 'phx', label: 'Phoenix'},
  ]
  const [selectedCity, setSelectedCity] = useState<{value: string; label: string} | null>(null)

  return (
    <main className="p-6 space-y-8">
      <h1 className="text-2xl font-bold text-text">Test Dropdown</h1>

      <div className="grid gap-6 md:grid-cols-2">
        {/* 1) String options, searchable */}
        <div>
          <label className="block mb-1 text-sm font-medium text-text">Fruits (searchable)</label>
          <Dropdown
            options={fruits}
            value={selectedFruit}
            onChange={setSelectedFruit}
            placeholder="Select a fruit"
            searchable
            className="mb-1"
          />
          <p className="text-sm text-text">Selected: {selectedFruit ?? 'None'}</p>
        </div>

        {/* 2) String options, non-searchable */}
        <div>
          <label className="block mb-1 text-sm font-medium text-text">
            Fruits (non-searchable)
          </label>
          <Dropdown
            options={fruits}
            value={selectedFruit}
            onChange={setSelectedFruit}
            placeholder="Pick a fruit"
            searchable={false}
            className="mb-1"
          />
          <p className="text-sm text-text">Selected: {selectedFruit ?? 'None'}</p>
        </div>

        {/* 3) Object options, searchable */}
        <div>
          <label className="block mb-1 text-sm font-medium text-text">Cities (searchable)</label>
          <Dropdown
            options={cities}
            value={selectedCity}
            onChange={setSelectedCity}
            placeholder="Select a city"
            searchable
            className="mb-1"
          />
          <p className="text-sm text-text">Selected: {selectedCity?.label ?? 'None'}</p>
        </div>

        {/* 4) Object options, non-searchable */}
        <div>
          <label className="block mb-1 text-sm font-medium text-text">
            Cities (non-searchable)
          </label>
          <Dropdown
            options={cities}
            value={selectedCity}
            onChange={setSelectedCity}
            placeholder="Pick a city"
            searchable={false}
            className="mb-1"
          />
          <p className="text-sm text-text">Selected: {selectedCity?.label ?? 'None'}</p>
        </div>
      </div>
    </main>
  )
}
