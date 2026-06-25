import Link from 'next/link'
import { ChevronRight } from 'lucide-react'

interface BreadcrumbItem { label: string; href?: string }

export function Breadcrumb({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1 text-sm text-gray-500 mb-4 flex-wrap">
      {items.map((item, i) => (
        <span key={i} className="flex items-center gap-1">
          {i > 0 && <ChevronRight className="h-3 w-3 flex-shrink-0" />}
          {item.href && i < items.length - 1 ? (
            <Link href={item.href} className="hover:text-gray-900 hover:underline transition-colors">
              {item.label}
            </Link>
          ) : (
            <span className={i === items.length - 1 ? 'text-gray-900 font-medium truncate max-w-[200px]' : ''}>
              {item.label}
            </span>
          )}
        </span>
      ))}
    </nav>
  )
}
