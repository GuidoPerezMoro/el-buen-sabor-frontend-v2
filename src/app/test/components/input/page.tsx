'use client'

import Input from '@/components/ui/Input'

import {useState} from 'react'

export default function InputsPage() {
  const [value, setValue] = useState('')

  return (
    <main className="flex min-h-screen flex-col gap-6 p-8 bg-background text-text">
      <h1 className="text-2xl font-bold">Input Component Tests</h1>

      {/* Standard input */}
      <Input label="Nombre" placeholder="Escribe tu nombre" />

      {/* Input con valor controlado */}
      <Input
        label="Nombre controlado"
        placeholder="Escribe tu nombre"
        value={value}
        onChange={e => setValue(e.target.value)}
      />

      {/* Input con error */}
      <Input label="Email" placeholder="email@dominio.com" error="Campo requerido" />

      {/* Input con ícono izquierdo */}
      <Input label="Buscar" placeholder="Buscar..." iconLeft={<span>🔍</span>} />

      {/* Input bloqueado */}
      <Input label="Bloqueado" value="No editable" readOnly />

      {/* Input deshabilitado */}
      <Input label="Deshabilitado" placeholder="No se puede escribir" disabled />

      {/* Input tipo contraseña */}
      <Input label="Contraseña" type="password" placeholder="********" showPasswordToggle={true} />

      {/* Textarea multiline */}
      <Input label="Comentarios" placeholder="Escribe algo..." multiline />

      {/* Combinación de elementos */}
      <Input
        label="Con todo"
        placeholder="Escribe algo..."
        iconLeft={<span>✏️</span>}
        error="Algo salió mal"
      />
    </main>
  )
}
