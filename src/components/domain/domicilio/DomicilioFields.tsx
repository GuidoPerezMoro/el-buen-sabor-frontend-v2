'use client'

import Input from '@/components/ui/Input'
import LocalidadCascade from '@/components/domain/domicilio/LocalidadCascade'

interface DomicilioFieldsProps {
  calle: string
  numero: number | ''
  cp: number | ''
  localidadId: number | null
  onChangeCalle: (v: string) => void
  onChangeNumero: (v: number | '') => void
  onChangeCp: (v: number | '') => void
  onChangeLocalidadId: (id: number | null) => void
  disableLocalidad?: boolean
  errors?: {
    calle?: string
    numero?: string
    cp?: string
    idLocalidad?: string
  }
}

/**
 * Bloque reutilizable de domicilio:
 * - Calle / Número / Código Postal
 * - Selector País > Provincia > Localidad (reutilizable para Sucursal, Cliente, etc.)
 */
export default function DomicilioFields({
  calle,
  numero,
  cp,
  localidadId,
  onChangeCalle,
  onChangeNumero,
  onChangeCp,
  onChangeLocalidadId,
  disableLocalidad = false,
  errors,
}: DomicilioFieldsProps) {
  return (
    <div className="space-y-4">
      {/* Calle / Número / CP */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Input
          label="Calle"
          value={calle}
          onChange={e => onChangeCalle(e.target.value)}
          error={errors?.calle}
        />
        <Input
          label="Número"
          type="number"
          value={numero === '' ? '' : numero.toString()}
          onChange={e => onChangeNumero(e.target.value === '' ? '' : e.target.valueAsNumber)}
          error={errors?.numero}
        />
        <Input
          label="Código postal"
          type="number"
          value={cp === '' ? '' : cp.toString()}
          onChange={e => onChangeCp(e.target.value === '' ? '' : e.target.valueAsNumber)}
          error={errors?.cp}
        />
      </div>

      {/* País > Provincia > Localidad */}
      <LocalidadCascade
        localidadId={localidadId}
        onChangeLocalidadId={onChangeLocalidadId}
        disabled={disableLocalidad}
        error={errors?.idLocalidad}
      />
    </div>
  )
}
