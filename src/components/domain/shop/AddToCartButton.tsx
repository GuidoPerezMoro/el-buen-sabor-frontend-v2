'use client'

import Button from '@/components/ui/Button'
import {ShoppingCart} from 'lucide-react'

interface AddToCartButtonProps {
  disabled?: boolean
  onClick?: () => void
}

export default function AddToCartButton({disabled, onClick}: AddToCartButtonProps) {
  return (
    <Button
      type="button"
      size="sm"
      className="w-full mt-2"
      disabled={disabled}
      onClick={() => {
        onClick?.()
      }}
      icon={<ShoppingCart className="h-4 w-4" />}
    >
      Agregar al carrito
    </Button>
  )
}
