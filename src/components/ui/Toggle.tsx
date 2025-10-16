'use client'

import {forwardRef} from 'react'
import {cn} from '@/lib/utils'

interface ToggleProps {
  /** Is the toggle on (Yes) or off (No) */
  checked: boolean
  /** Callback when toggled */
  onChange: (checked: boolean) => void
  /** Disable interaction */
  disabled?: boolean
  /** Extra wrapper classes */
  className?: string
}

const Toggle = forwardRef<HTMLButtonElement, ToggleProps>(
  ({checked, onChange, disabled = false, className}, ref) => {
    return (
      <button
        ref={ref}
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={cn(
          'relative inline-flex items-center h-6 w-11 flex-shrink-0 cursor-pointer rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary disabled:cursor-not-allowed disabled:opacity-25',
          checked ? 'bg-primary' : 'bg-muted',
          className
        )}
      >
        <span
          className={cn(
            // absolute positions the knob exactly 2px from top & left of the 24px track:
            'absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform',
            // translate by exactly 20px (1.25rem) when “on” to land 2px from the right edge:
            checked ? 'translate-x-5' : 'translate-x-0'
          )}
        />
      </button>
    )
  }
)
Toggle.displayName = 'Toggle'

export default Toggle

/* 
  // Future ideas:
  // - Add size variants (sm/md/lg) via a `size` prop
  // - Support on/off labels with an optional `labelOn`/`labelOff`
  // - Allow custom colors via a `variant` prop
*/
