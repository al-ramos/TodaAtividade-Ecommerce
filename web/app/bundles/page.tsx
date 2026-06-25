import type { Metadata } from 'next'
import { createClient } from '@supabase/supabase-js'
import BundleCard from '@/components/bundles/BundleCard'
import type { Bundle } from '@/lib/types'
import { Package } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Kits de Atividades | TodaAtividade',
  description: 'Conjuntos de atividades pedagógicas com desconto especial.',
}

export const revalidate = 60

async function getBundles(): Promise<Bundle[]> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  const { data, error } = await supabase
    .from('bundles')
    .select('*')
    .eq('active', true)
    .order('created_at', { ascending: false })

  if (error) return []
  return data as Bundle[]
}

export default async function BundlesPage() {
  const bundles = await getBundles()

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8 flex items-center gap-3">
        <Package className="h-7 w-7 text-blue-600" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Kits de Atividades</h1>
          <p className="text-sm text-gray-500">Conjuntos temáticos com desconto especial</p>
        </div>
      </div>

      {bundles.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center text-gray-400">
          <Package className="mb-3 h-12 w-12" />
          <p className="text-lg font-medium">Nenhum kit disponível no momento</p>
          <p className="text-sm">Volte em breve para novidades!</p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {bundles.map(bundle => (
            <BundleCard key={bundle.id} bundle={bundle} />
          ))}
        </div>
      )}
    </div>
  )
}
