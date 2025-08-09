'use client'

import {ChangeEvent, useCallback, useRef, useState} from 'react'
import Image from 'next/image'
import {cn} from '@/lib/utils'

interface ImageDropzoneProps {
  onFileAccepted: (file: File | null) => void
  previewUrl?: string | null
  className?: string
}

export default function ImageDropzone({onFileAccepted, className}: ImageDropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)

  const handleClick = () => inputRef.current?.click()

  const handleChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0] || null
      if (file) {
        setPreview(URL.createObjectURL(file))
        onFileAccepted?.(file)
      }
    },
    [onFileAccepted]
  )

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      setDragging(false)
      e.preventDefault()
      e.stopPropagation()
      const file = e.dataTransfer.files?.[0] || null
      if (file) {
        setPreview(URL.createObjectURL(file))
        onFileAccepted?.(file)
      }
    },
    [onFileAccepted]
  )

  return (
    <div
      className={cn(
        'w-full aspect-square max-h-[50vh] md:max-h-none', // cap height on small screens
        'md:aspect-[1/1]', // enforce 1:1 ratio from md and up
        'border-2 border-dashed rounded-md p-4 text-center cursor-pointer',
        dragging ? 'border-primary bg-muted' : 'border-border',
        className
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
            alt="Preview de imagen"
            fill
            className="object-contain"
            unoptimized
            priority
          />
        </div>
      ) : (
        <p className="text-sm text-gray-500">Haz clic o arrastra una imagen aquí</p>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleChange}
      />
    </div>
  )
}
