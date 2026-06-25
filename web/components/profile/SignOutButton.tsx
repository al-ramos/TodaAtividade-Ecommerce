'use client'

import { signOut } from 'next-auth/react'
import { LogOut } from 'lucide-react'

export default function SignOutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: '/' })}
      className="flex w-full items-center gap-2 rounded-xl border border-gray-200 px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
    >
      <LogOut className="h-4 w-4" />
      Sair da conta
    </button>
  )
}
