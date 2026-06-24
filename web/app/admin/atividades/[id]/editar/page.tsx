import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { supabaseAdmin } from '@/lib/supabase'
import type { Product } from '@/lib/types'
import EditAtividadeForm from '@/components/admin/EditAtividadeForm'

interface Props {
  params: { id: string }
}

export async function generateMetadata({ params }: Props) {
  const { data } = await supabaseAdmin
    .from('products')
    .select('title')
    .eq('id', params.id)
    .single()

  return {
    title: data?.title
      ? `Editar: ${data.title} — Admin | TodaAtividade`
      : 'Editar atividade — Admin | TodaAtividade',
  }
}

async function getProduct(id: string): Promise<(Product & { full_pdf_path?: string }) | null> {
  const { data, error } = await supabaseAdmin
    .from('products')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !data) return null
  return data as Product & { full_pdf_path?: string }
}

export default async function EditarAtividadePage({ params }: Props) {
  const product = await getProduct(params.id)
  if (!product) notFound()

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2">
        <Link
          href="/admin/atividades"
          className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
          Atividades
        </Link>
        <span className="text-gray-300">/</span>
        <span className="text-sm text-gray-500 truncate max-w-[200px]">{product.title}</span>
        <span className="text-gray-300">/</span>
        <span className="text-sm font-medium text-gray-900">Editar</span>
      </div>

      <div>
        <h1 className="text-2xl font-bold text-gray-900">Editar atividade</h1>
        <p className="mt-1 text-sm text-gray-500">
          Altere os metadados da atividade. O ID e as compras já realizadas serão preservados.
        </p>
      </div>

      <EditAtividadeForm product={product} />
    </div>
  )
}
