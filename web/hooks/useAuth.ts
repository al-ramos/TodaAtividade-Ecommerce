import { useSession, signIn, signOut } from 'next-auth/react'
import type { SignInOptions, SignOutParams } from 'next-auth/react'

export function useAuth() {
  const { data: session, status } = useSession()

  return {
    user: session?.user ?? null,
    isLoading: status === 'loading',
    isAuthenticated: status === 'authenticated',
    signIn: (provider?: string, options?: SignInOptions) =>
      signIn(provider, options),
    signOut: (params?: SignOutParams<true>) =>
      signOut(params),
  }
}
