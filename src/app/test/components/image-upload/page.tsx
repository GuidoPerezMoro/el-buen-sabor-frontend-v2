'use client'

import {useState} from 'react'
import Image from 'next/image'
import ImageDropzone from '@/components/ui/ImageDropzone'

export default function TestImageUploadPage() {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  const handleImageChange = (file: File | null) => {
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => setPreviewUrl(reader.result as string)
      reader.readAsDataURL(file)
    } else {
      setPreviewUrl(null)
    }
  }

  return (
    <main className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Test Image Upload</h1>

      <ImageDropzone onFileAccepted={handleImageChange} />

      {previewUrl && (
        <div className="mt-4">
          <h2 className="text-lg font-semibold mb-2">Vista previa:</h2>
          <Image
            src={previewUrl}
            alt="Vista previa"
            width={800}
            height={600}
            className="w-full max-h-80 object-contain rounded shadow"
            unoptimized
            priority
          />
        </div>
      )}
    </main>
  )
}
