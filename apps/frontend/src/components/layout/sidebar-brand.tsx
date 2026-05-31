'use client'

import Link from 'next/link'
import { LogoMark } from '@/components/brand/logo-mark'
import { PRODUCT_INITIAL, PRODUCT_NAME } from '@/lib/brand'
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar'

export function SidebarBrand() {
  const { state } = useSidebar()
  const collapsed = state === 'collapsed'

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton size="default" asChild tooltip={PRODUCT_NAME}>
          <Link href="/dashboard">
            {collapsed ? (
              <span className="flex size-4 shrink-0 items-center justify-center text-sm font-semibold">
                {PRODUCT_INITIAL}
              </span>
            ) : (
              <>
                <LogoMark className="size-7 shrink-0" />
                <span className="truncate font-semibold">{PRODUCT_NAME}</span>
              </>
            )}
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
