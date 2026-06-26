import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { LayoutDashboard, BookOpen, ShoppingBag, Upload, LogOut, Tag, Package, Star, FileText, Mail } from 'lucide-react'
import { authOptions } from '@/lib/auth'

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { href: '/admin/atividades', label: 'Atividades', icon: BookOpen },
  { href: '/admin/pedidos', label: 'Pedidos', icon: ShoppingBag },
  { href: '/admin/cupons', label: 'Cupons', icon: Tag },
  { href: '/admin/bundles', label: 'Bundles', icon: Package },
  { href: '/admin/avaliacoes', label: 'Avaliações', icon: Star },
  { href: '/admin/blog', label: 'Blog', icon: FileText },
  { href: '/admin/newsletter', label: 'Newsletter', icon: Mail },
]

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')

  return (
    <div className="flex min-h-screen bg-gray-50">

      {/* Sidebar */}
      <aside className="hidden w-60 flex-shrink-0 flex-col border-r border-gray-200 bg-white lg:flex">
        {/* Brand */}
        <div className="flex h-16 items-center gap-2 border-b border-gray-200 px-5">
          <BookOpen className="h-5 w-5 text-blue-600" />
          <span className="text-sm font-bold text-gray-900">
            Toda<span className="text-blue-600">Atividade</span>
            <span className="ml-1 rounded-full bg-blue-100 px-1.5 py-0.5 text-[10px] font-medium text-blue-700">
              Admin
            </span>
          </span>
        </div>

        {/* Nav */}
        <nav className="flex-1 space-y-0.5 p-3">
          {navItems.map(({ href, label, icon: Icon, exact }) => (
            <AdminNavLink key={href} href={href} label={label} icon={Icon} exact={exact} />
          ))}
          <div className="pt-3 border-t border-gray-100 mt-3">
            <Link
              href="/admin/atividades/nova"
              className="flex items-center gap-2.5 rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
            >
              <Upload className="h-4 w-4" />
              Nova atividade
            </Link>
          </div>
        </nav>

        {/* User */}
        <div className="border-t border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-semibold text-blue-700">
              {session.user?.name?.charAt(0).toUpperCase() ?? 'A'}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-medium text-gray-900">{session.user?.name}</p>
              <p className="truncate text-xs text-gray-500">{session.user?.email}</p>
            </div>
            <Link href="/api/auth/signout" className="rounded-full p-1 text-gray-400 hover:text-red-500 transition-colors">
              <LogOut className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Mobile header */}
        <header className="flex h-14 items-center justify-between border-b border-gray-200 bg-white px-4 lg:hidden">
          <Link href="/admin" className="flex items-center gap-2 text-sm font-bold text-gray-900">
            <BookOpen className="h-5 w-5 text-blue-600" />
            Admin
          </Link>
          <Link
            href="/admin/atividades/nova"
            className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white"
          >
            <Upload className="h-3.5 w-3.5" />
            Nova
          </Link>
        </header>

        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  )
}

function AdminNavLink({
  href,
  label,
  icon: Icon,
}: {
  href: string
  label: string
  icon: React.ElementType
  exact?: boolean
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors"
    >
      <Icon className="h-4 w-4" />
      {label}
    </Link>
  )
}
