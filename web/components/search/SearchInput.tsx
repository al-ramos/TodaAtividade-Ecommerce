'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Search, X, Loader2 } from 'lucide-react'
import { formatPrice } from '@/lib/types'

interface SearchResult {
  id: string
  title: string
  slug: string
  price: number
  thumbnail_url?: string
}

export function SearchInput() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout>>()
  const router = useRouter()

  const search = useCallback(async (q: string) => {
    if (q.length < 2) { setResults([]); setOpen(false); return }
    setLoading(true)
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}&autocomplete=true`)
      const data = await res.json()
      setResults(data.results || [])
      setOpen(true)
    } catch { /* ignore */ } finally { setLoading(false) }
  }, [])

  useEffect(() => {
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => search(query), 300)
    return () => clearTimeout(debounceRef.current)
  }, [query, search])

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        !dropdownRef.current?.contains(e.target as Node) &&
        !inputRef.current?.contains(e.target as Node)
      ) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      setOpen(false)
      router.push(`/busca?q=${encodeURIComponent(query.trim())}`)
    }
  }

  const handleSelect = (slug: string) => {
    setOpen(false)
    setQuery('')
    router.push(`/atividades/${slug}`)
  }

  return (
    <div className="relative w-full max-w-md">
      <form onSubmit={handleSubmit}>
        <div className="relative flex items-center">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
          <input
            ref={inputRef}
            type="search"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Buscar atividades..."
            className="w-full pl-9 pr-8 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            aria-label="Buscar atividades"
            autoComplete="off"
          />
          {loading ? (
            <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 animate-spin" />
          ) : query ? (
            <button
              type="button"
              onClick={() => { setQuery(''); setResults([]); setOpen(false) }}
              className="absolute right-3 top-1/2 -translate-y-1/2"
            >
              <X className="h-4 w-4 text-gray-400 hover:text-gray-600" />
            </button>
          ) : null}
        </div>
      </form>

      {open && results.length > 0 && (
        <div
          ref={dropdownRef}
          className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 overflow-hidden"
        >
          {results.map(r => (
            <button
              key={r.id}
              onClick={() => handleSelect(r.slug)}
              className="w-full flex items-center gap-3 px-3 py-2 hover:bg-gray-50 text-left"
            >
              {r.thumbnail_url && (
                <img src={r.thumbnail_url} alt="" className="w-8 h-8 object-cover rounded flex-shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{r.title}</p>
                <p className="text-xs text-gray-500">{formatPrice(r.price)}</p>
              </div>
            </button>
          ))}
          <button
            onClick={() => { setOpen(false); router.push(`/busca?q=${encodeURIComponent(query)}`) }}
            className="w-full px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 text-center border-t border-gray-100"
          >
            Ver todos os resultados para &ldquo;{query}&rdquo;
          </button>
        </div>
      )}

      {open && query.length >= 2 && results.length === 0 && !loading && (
        <div
          ref={dropdownRef}
          className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 px-3 py-4 text-center"
        >
          <p className="text-sm text-gray-500">Nenhum resultado para &ldquo;{query}&rdquo;</p>
        </div>
      )}
    </div>
  )
}
