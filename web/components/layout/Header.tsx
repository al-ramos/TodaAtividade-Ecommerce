'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useSession, signOut } from 'next-auth/react'
import { ShoppingCart, User, LogOut, Menu, X, Heart, Sparkles } from 'lucide-react'
import { useState } from 'react'
import { cn } from '@/lib/utils'
import { useCart } from '@/lib/cart-context'
import { SearchInput } from '@/components/search/SearchInput'

export default function Header() {
  const { data: session } = useSession()
  const [menuOpen, setMenuOpen] = useState(false)
  const { count, openCart } = useCart()

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">

        {/* Logo */}
        <Link href="/" className="flex-shrink-0">
          <Image
            src="/logo-todaatividade.png"
            width={80}
            height={80}
            alt="TodaAtividade"
            className="h-12 w-12 object-contain"
            priority
          />
        </Link>

        {/* Search — desktop only */}
        <div className="hidden md:flex flex-1 max-w-sm mx-6">
          <SearchInput />
        </div>

        {/* Nav desktop */}
        <nav className="hidden items-center gap-6 md:flex">
          <Link href="/atividades" className="text-sm font-medium text-gray-600 hover:text-primary transition-colors">
            Catálogo
          </Link>
          <Link href="/atividades?grade=1ano" className="text-sm font-medium text-gray-600 hover:text-primary transition-colors">
            Anos Iniciais
          </Link>
          <Link href="/atividades?grade=6ano" className="text-sm font-medium text-gray-600 hover:text-primary transition-colors">
            Anos Finais
          </Link>
          <Link href="/bundles" className="text-sm font-medium text-gray-600 hover:text-primary transition-colors">
            Kits
          </Link>
          <Link href="/blog" className="text-sm font-medium text-gray-600 hover:text-primary transition-colors">
            Blog
          </Link>
          <Link href="/faq" className="text-sm font-medium text-gray-600 hover:text-primary transition-colors">
            FAQ
          </Link>
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={openCart}
            className="relative rounded-full p-2 text-gray-600 hover:bg-primary-veryLight hover:text-primary transition-colors"
            aria-label="Carrinho"
          >
            <ShoppingCart className="h-5 w-5" />
            {count > 0 && (
              <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white">
                {count > 9 ? '9+' : count}
              </span>
            )}
          </button>

          {session ? (
            <div className="relative group">
              <button className="flex items-center gap-2 rounded-full p-1 hover:bg-primary-veryLight transition-colors">
                {session.user?.image ? (
                  <Image
                    src={session.user.image}
                    alt={session.user.name ?? 'Avatar'}
                    width={32}
                    height={32}
                    className="rounded-full"
                  />
                ) : (
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-light text-white text-sm font-medium">
                    {session.user?.name?.charAt(0).toUpperCase() ?? 'U'}
                  </div>
                )}
              </button>

              {/* Dropdown */}
              <div className="absolute right-0 top-full mt-2 w-48 hidden group-hover:block rounded-xl border border-border bg-white shadow-lg">
                <div className="border-b border-border px-4 py-3">
                  <p className="text-sm font-medium text-gray-900 truncate">{session.user?.name}</p>
                  <p className="text-xs text-gray-500 truncate">{session.user?.email}</p>
                </div>
                <div className="py-1">
                  <Link href="/perfil" className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-primary-veryLight">
                    <User className="h-4 w-4" /> Meu perfil
                  </Link>
                  <Link href="/minha-conta/favoritos" className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-primary-veryLight">
                    <Heart className="h-4 w-4" /> Favoritos
                  </Link>
                  <Link href="/minha-conta/pedidos" className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-primary-veryLight">
                    <ShoppingCart className="h-4 w-4" /> Minhas compras
                  </Link>
                  <Link href="/minha-conta/assinatura" className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-primary-veryLight">
                    <Sparkles className="h-4 w-4 text-yellow-500" /> Assinatura
                  </Link>
                  <button
                    onClick={() => signOut({ callbackUrl: '/' })}
                    className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                  >
                    <LogOut className="h-4 w-4" /> Sair
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <Link
              href="/login"
              className="rounded-xl bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-[#9B3A58] transition-colors"
            >
              Entrar
            </Link>
          )}

          {/* Mobile menu toggle */}
          <button
            className="rounded-lg p-2 text-gray-600 hover:bg-primary-veryLight md:hidden"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile nav */}
      <div className={cn('md:hidden border-t border-border bg-white px-4 pb-4', menuOpen ? 'block' : 'hidden')}>
        <nav className="flex flex-col gap-3 pt-3">
          <Link href="/atividades" className="text-sm font-medium text-gray-700" onClick={() => setMenuOpen(false)}>
            Catálogo
          </Link>
          <Link href="/atividades?grade=1ano" className="text-sm font-medium text-gray-700" onClick={() => setMenuOpen(false)}>
            Anos Iniciais
          </Link>
          <Link href="/atividades?grade=6ano" className="text-sm font-medium text-gray-700" onClick={() => setMenuOpen(false)}>
            Anos Finais
          </Link>
          <Link href="/bundles" className="text-sm font-medium text-gray-700" onClick={() => setMenuOpen(false)}>
            Kits
          </Link>
          <Link href="/blog" className="text-sm font-medium text-gray-700" onClick={() => setMenuOpen(false)}>
            Blog
          </Link>
          <Link href="/faq" className="text-sm font-medium text-gray-700" onClick={() => setMenuOpen(false)}>
            FAQ
          </Link>
          {session && (
            <>
              <Link href="/perfil" className="text-sm font-medium text-gray-700" onClick={() => setMenuOpen(false)}>
                Meu perfil
              </Link>
              <Link href="/minha-conta/favoritos" className="text-sm font-medium text-gray-700" onClick={() => setMenuOpen(false)}>
                Favoritos
              </Link>
              <Link href="/minha-conta/pedidos" className="text-sm font-medium text-gray-700" onClick={() => setMenuOpen(false)}>
                Minhas compras
              </Link>
              <Link href="/minha-conta/assinatura" className="flex items-center gap-1.5 text-sm font-medium text-gray-700" onClick={() => setMenuOpen(false)}>
                <Sparkles className="h-4 w-4 text-yellow-500" /> Assinatura
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  )
}
