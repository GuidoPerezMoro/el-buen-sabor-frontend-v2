import {useEffect, useState} from 'react'

export default function useIsMdUp() {
  const [isMdUp, setIsMdUp] = useState(false)

  useEffect(() => {
    const checkSize = () => {
      setIsMdUp(window.innerWidth >= 768)
    }

    checkSize() // initial check
    window.addEventListener('resize', checkSize)

    return () => window.removeEventListener('resize', checkSize)
  }, [])

  return isMdUp
}
