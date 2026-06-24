import Link from 'next/link'
import { Plus, BookOpen, Upload } from 'lucide-react'
import { supabaseAdmin } from '@/lib/supabase'
import { formatPrice, GRADE_LABELS, DISCIPLINE_LABELS, type Product } from '@/lib/types'
import AtividadeRowActions from '@/components/admin/AtividadeRowActions'

async function getProducts(): Promise<Product[]> {
  const { data } = await supabaseAdmin
    .from('products')
    .select('*')
    .order('created_at', { ascending: false })
  return (data ?? []) as Product[]
}

export default async function AdminAtividadesPage() {
  const products = await getProducts()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Atividades</h1>
          <p className="mt-1 text-sm text-gray-500">{products.length} atividade(s) cadastrada(s)</p>
        </div>
        <Link
          href="/admin/atividades/nova"
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors shadow-sm"
        >
          <Plus className="h-4 w-4" />
          Nova atividade
        </Link>
      </div>

      {products.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 py-16 text-center">
          <BookOpen className="mx-auto h-10 w-10 text-gray-300" />
          <p className="mt-3 text-sm text-gray-500">Nenhuma atividade cadastrada ainda.</p>
          <Link
            href="/admin/atividades/nova"
            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            <Upload className="h-4 w-4" />
            Cadastrar primeira atividade
          </Link>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {['Titulo', 'Serie', 'Disciplina', 'Preco', ''].map((h) => (
                  <th
                    key={h}
                    className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {products.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-8 flex-shrink-0 overflow-hidden rounded border border-gray-200 bg-gray-100">
                        {p.thumbnail_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={p.thumbnail_url} alt="" className="h-full w-full object-cover" />
                        ) : (
                          <BookOpen className="m-auto mt-2 h-4 w-4 text-gray-300" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900 line-clamp-1">{p.title}</p>
                        <p className="text-xs text-gray-400">/atividades/{p.slug}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{GRADE_LABELS[p.grade_level]}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{DISCIPLINE_LABELS[p.discipline]}</td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">{formatPrice(p.price)}</td>
                  <td className="px-4 py-3 text-right">
                    <AtividadeRowActions id={p.id} slug={p.slug} active={p.active} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
