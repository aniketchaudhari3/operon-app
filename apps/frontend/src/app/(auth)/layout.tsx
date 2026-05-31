import { LogoMark } from '@/components/brand/logo-mark'
import { PRODUCT_NAME, PRODUCT_TAGLINE } from '@/lib/brand'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 p-6">
      <div className="flex items-center gap-2">
        <LogoMark className="size-7" />
        <span className="text-lg font-semibold">{PRODUCT_NAME}</span>
      </div>
      {children}
      <p className="max-w-sm text-center text-page-subtitle">{PRODUCT_TAGLINE}</p>
    </div>
  )
}
