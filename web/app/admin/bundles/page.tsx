'use client'

import { useEffect, useState, useCallback } from 'react'
import { Package, Plus, ToggleLeft, ToggleRight, Loader2 } from 'lucide-react'
import type { Product } from '@/lib/types'

interface BundleRow {
  id: string
  slug: string
  title: string
  description: string | null
  price: number
  original_price: number
  active: boolean
  created_at: string
  bundle_items: { id: string; product_id: string }[]
}

function formatBRL(v: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v)
}

export default function AdminBundlesPage() {
  const [bundles, setBundles] = useState<BundleRow[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    title: '',
    slug: '',
    description: '',
    price: '',
    original_price: '',
    product_ids: [] as string[],
  })

  const fetchBundles = useCallback(async () => {
    const res = await fetch('/api/admin/bundles')
    if (res.ok) setBundles(await res.json())
  }, [])

  useEffect(() => {
    async function load() {
      setLoading(true)
      await fetchBundles()
      const res = await fetch('/api/admin/products')
      if (res.ok) {
        const data = await res.json()
        setProducts(Array.isArray(data) ? data : data.products ?? [])
      }
      setLoading(false)
    }
    load()
  }, [fetchBundles])

  function handleSlugify(title: string) {
    const slug = title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
    setForm(f => ({ ...f, title, slug }))
  }

  function toggleProduct(id: string) {
    setForm(f => ({
      ...f,
      product_ids: f.product_ids.includes(id)
        ? f.product_ids.filter(p => p !== id)
        : [...f.product_ids, id],
    }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    const res = await fetch('/api/admin/bundles', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: form.title,
        slug: form.slug,
        description: form.description || null,
        price: parseFloat(form.price),
        original_price: parseFloat(form.original_price),
        product_ids: form.product_ids,
      }),
    })
    if (res.ok) {
      setForm({ title: '', slug: '', description: '', price: '', original_price: '', product_ids: [] })
      setShowForm(false)
      await fetchBundles()
    }
    setSaving(false)
  }

  async function toggleActive(bundle: BundleRow) {
    await fetch('/api/admin/bundles', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: bundle.id, active: !bundle.active }),
    })
    await fetchBundles()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Package className="h-5 w-5 text-blue-600" />
          <h1 className="text-xl font-bold text-gray-900">Bundles / Kits</h1>
        </div>
        <button
          onClick={() => setShowForm(v => !v)}
          className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Novo bundle
        </button>
      </div>

      {/* Formulário de criação */}
      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="rounded-xl border border-gray-200 bg-white p-6 space-y-4 shadow-sm"
        >
          <h2 className="text-base font-semibold text-gray-900">Novo bundle</h2>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Título *</label>
              <input
                required
                value={form.title}
                onChange={e => handleSlugify(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Slug *</label>
              <input
                required
                value={form.slug}
                onChange={e => setForm(f => ({ ...f, slug: e.target.value }))}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm font-mono focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Descrição</label>
            <textarea
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              rows={3}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Preço do bundle (R$) *</label>
              <input
                required
                type="number"
                min="0"
                step="0.01"
                value={form.price}
                onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Preço original (R$) *</label>
              <input
                required
                type="number"
                min="0"
                step="0.01"
                value={form.original_price}
                onChange={e => setForm(f => ({ ...f, original_price: e.target.value }))}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-2">
              Produtos incluídos ({form.product_ids.length} selecionados)
            </label>
            <div className="max-h-48 overflow-y-auto rounded-lg border border-gray-200 p-2 space-y-1">
              {products.map(p => (
                <label key={p.id} className="flex cursor-pointer items-center gap-2.5 rounded-md px-2 py-1.5 hover:bg-gray-50">
                  <input
                    type="checkbox"
                    checked={form.product_ids.includes(p.id)}
                    onChange={() => toggleProduct(p.id)}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">{p.title}</span>
                </label>
              ))}
              {products.length === 0 && (
                <p className="py-4 text-center text-sm text-gray-400">Nenhum produto encontrado</p>
              )}
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              Criar bundle
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
          </div>
        </form>
      )}

      {/* Listagem */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        {bundles.length === 0 ? (
          <div className="py-16 text-center text-gray-400">
            <Package className="mx-auto mb-2 h-8 w-8" />
            <p className="text-sm">Nenhum bundle cadastrado</p>
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">Título</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">Preço</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">Itens</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">Status</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {bundles.map(bundle => (
                <tr key={bundle.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <p className="text-sm font-medium text-gray-900">{bundle.title}</p>
                    <p className="text-xs text-gray-400">{bundle.slug}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm font-semibold text-blue-600">{formatBRL(bundle.price)}</span>
                    <span className="ml-1.5 text-xs text-gray-400 line-through">{formatBRL(bundle.original_price)}</span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {bundle.bundle_items?.length ?? 0} produto(s)
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${bundle.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {bundle.active ? 'Ativo' : 'Inativo'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => toggleActive(bundle)}
                      title={bundle.active ? 'Desativar' : 'Ativar'}
                      className="rounded p-1 text-gray-400 hover:text-blue-600 transition-colors"
                    >
                      {bundle.active
                        ? <ToggleRight className="h-5 w-5 text-green-500" />
                        : <ToggleLeft className="h-5 w-5" />
                      }
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
