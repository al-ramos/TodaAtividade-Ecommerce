import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { CheckCircle2, Clock, Download, BookOpen } from 'lucide-react'
import Link from 'next/link'
import { authOptions } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'
import { formatPrice } from '@/lib/types'
import { PendingPoller } from './PendingPoller'
import { PurchaseTracker } from './PurchaseTracker'

interface PageProps {
  searchParams: { orderId?: string }
}

export default async function SucessoPage({ searchParams }: PageProps) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    redirect('/login')
  }

  const orderId = searchParams.orderId

  type OrderRow = { id: string; status: string; total: number; payment_method: string }
  let order: OrderRow | null = null

  if (orderId) {
    const { data } = await supabaseAdmin
      .from('orders')
      .select('id, status, total, payment_method')
      .eq('id', orderId)
      .eq('user_id', session.user.id)
      .maybeSingle()
    order = data as OrderRow | null
  }

  type ProductJoin = { id: string; title: string; thumbnail_url: string | null } | null
  type ItemRow = {
    product_id: string
    price_at_purchase: number
    products: ProductJoin | ProductJoin[]
  }
  let items: ItemRow[] = []

  if (order) {
    const { data } = await supabaseAdmin
      .from('order_items')
      .select('product_id, price_at_purchase, products!product_id(id, title, thumbnail_url)')
      .eq('order_id', order.id)
    items = (data ?? []) as ItemRow[]
  }

  const isPaid = order?.status === 'paid'
  const isPending = order?.status === 'pending'

  // Coleta IDs dos produtos para o evento Purchase do Meta Pixel
  const productIds = items.map((i) => i.product_id)

  return (
    <>
      {isPaid && order && (
        <PurchaseTracker
          orderId={order.id}
          total={order.total}
          productIds={productIds}
        />
      )}
      <main className="min-h-screen bg-gray-50 flex items-center justify-center py-10">
        <div className="max-w-lg mx-auto px-4 w-full">
          <div className="bg-white rounded-2xl shadow-sm p-8 space-y-6">

            <div className="text-center space-y-3">
              {isPending ? (
                <Clock className="w-20 h-20 text-yellow-500 mx-auto" />
              ) : (
                <CheckCircle2 className="w-20 h-20 text-green-500 mx-auto" />
              )}
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {isPending ? 'Aguardando pagamento' : 'Compra aprovada!'}
                </h1>
                <p className="text-gray-500 mt-1 text-sm">
                  {isPending
                    ? 'Assim que o pagamento for confirmado, os botoes de download aparecirao aqui.'
                    : 'Suas atividades pedagogicas estao prontas para download.'}
                </p>
              </div>
            </div>

            {orderId && (
              <p className="text-xs text-gray-400 bg-gray-50 rounded-lg py-2 px-3 font-mono text-center">
                Pedido: {orderId}
              </p>
            )}

            {isPending && orderId && (
              <PendingPoller />
            )}

            {items.length > 0 && (
              <div className="space-y-2">
                <h2 className="text-sm font-semibold text-gray-700">Suas atividades</h2>
                {items.map((item) => {
                  const product = (
                    Array.isArray(item.products) ? item.products[0] : item.products
                  ) as ProductJoin
                  if (!product) return null

                  return (
                    <div
                      key={item.product_id}
                      className="flex items-center justify-between bg-gray-50 rounded-lg px-4 py-3"
                    >
                      <div>
                        <p className="text-sm font-medium text-gray-900">{product.title}</p>
                        <p className="text-xs text-gray-400">{formatPrice(item.price_at_purchase)}</p>
                      </div>
                      {isPaid && orderId && (
                        <Link
                          href={`/api/download/${orderId}/${item.product_id}`}
                          className="flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-700"
                        >
                          <Download className="w-3.5 h-3.5" />
                          Baixar
                        </Link>
                      )}
                    </div>
                  )
                })}
              </div>
            )}

            {order && (
              <div className="flex justify-between items-center text-sm text-gray-700 border-t pt-4">
                <span className="font-medium">Total pago</span>
                <span className="font-bold text-gray-900">{formatPrice(order.total)}</span>
              </div>
            )}

            <div className="space-y-3">
              <Link
                href="/atividades"
                className="flex items-center justify-center gap-2 w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 rounded-lg transition-colors"
              >
                <BookOpen className="w-4 h-4" />
                Explorar mais atividades
              </Link>
              <Link
                href="/minha-conta/pedidos"
                className="flex items-center justify-center gap-2 w-full text-sm text-gray-500 hover:text-gray-700 transition-colors"
              >
                Ver historico de pedidos
              </Link>
            </div>

          </div>
        </div>
      </main>
    </>
  )
}
