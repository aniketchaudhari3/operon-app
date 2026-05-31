'use client'

import { useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'
import { useSidebar } from '@/components/ui/sidebar'

export function SidebarAutoCollapse() {
  const pathname = usePathname()
  const { setOpen } = useSidebar()
  const setOpenRef = useRef(setOpen)
  setOpenRef.current = setOpen

  // Collapse only when navigating onto the editor route. Do not depend on
  // `setOpen` — it is recreated whenever sidebar `open` changes, which would
  // immediately undo a manual toggle.
  useEffect(() => {
    if (pathname.startsWith('/dashboard/projects/')) {
      setOpenRef.current(false)
    }
  }, [pathname])

  return null
}
