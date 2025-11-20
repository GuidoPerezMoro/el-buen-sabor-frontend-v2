'use client'

import {useRouter} from 'next/navigation'
import Button from '@/components/ui/Button'

export default function ForbiddenActions() {
  const router = useRouter()
  return (
    <Button variant="primary" onClick={() => router.back()}>
      Volver
    </Button>
  )
}
