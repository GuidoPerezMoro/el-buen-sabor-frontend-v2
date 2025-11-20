'use client'

import {ChangeEvent, useCallback, useEffect, useId, useRef, useState} from 'react'
import Image from 'next/image'
import {cn} from '@/lib/utils'

interface ImageDropzoneProps {
  onFileAccepted: (file: File | null) => void
  previewUrl?: string | null
  className?: string
  label?: string
  hint?: string
  error?: string
  required?: boolean
}

export default function ImageDropzone({
  onFileAccepted,
  previewUrl,
  label,
  hint,
  error,
  required = false,
  className,
}: ImageDropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)
  const [localUrl, setLocalUrl] = useState<string | null>(null)
  const uid = useId()

  const handleClick = () => inputRef.current?.click()

  const setFile = useCallback(
    (file: File | null) => {
      if (!file) return
      const url = URL.createObjectURL(file)
      setPreview(url)
      setLocalUrl(prev => {
        if (prev) URL.revokeObjectURL(prev)
        return url
      })
      onFileAccepted?.(file)
    },
    [onFileAccepted]
  )

  const handleChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => setFile(e.target.files?.[0] || null),
    [setFile]
  )

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      setDragging(false)
      e.preventDefault()
      e.stopPropagation()
      setFile(e.dataTransfer.files?.[0] || null)
    },
    [setFile]
  )

  // Sync external preview when no local file was chosen
  useEffect(() => {
    if (!localUrl) setPreview(previewUrl ?? null)
  }, [previewUrl, localUrl])

  // Cleanup object URL on unmount
  useEffect(() => {
    return () => {
      if (localUrl) URL.revokeObjectURL(localUrl)
    }
  }, [localUrl])

  const describedBy =
    [hint ? `${uid}-hint` : null, error ? `${uid}-err` : null].filter(Boolean).join(' ') ||
    undefined

  return (
    <div className={cn('w-full', className)}>
      {label && (
        <label htmlFor={uid} className="block text-sm font-medium text-text mb-2">
          {label} {required && <span className="text-danger">*</span>}
        </label>
      )}

      <div
        role="button"
        aria-describedby={describedBy}
        aria-invalid={!!error || undefined}
        tabIndex={0}
        className={cn(
          'w-full aspect-square max-h-[50vh] md:max-h-none md:aspect-[1/1]',
          'border-2 border-dashed rounded-md p-4 text-center cursor-pointer',
          dragging ? 'border-primary bg-muted' : 'border-border'
        )}
        onClick={handleClick}
        onDragOver={e => {
          e.preventDefault()
          setDragging(true)
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
      >
        {preview ? (
          <div className="relative w-full h-full">
            <Image
              src={preview}
              alt="Vista previa de la imagen"
              fill
              className="object-contain"
              unoptimized
              priority
            />
          </div>
        ) : (
          <p className="text-sm text-muted">Haz clic o arrastra una imagen aquí</p>
        )}
      </div>

      <input
        id={uid}
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleChange}
      />

      {hint && !error && (
        <p id={`${uid}-hint`} className="text-xs text-muted my-2">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${uid}-err`} className="text-xs text-danger mt-2">
          {error}
        </p>
      )}
    </div>
  )
}
