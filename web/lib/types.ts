// ─── Produto / Atividade ────────────────────────────────────────────────────
export type GradeLevel =
  | '1ano' | '2ano' | '3ano' | '4ano' | '5ano'
  | '6ano' | '7ano' | '8ano' | '9ano'

export type Discipline =
  | 'matematica' | 'portugues' | 'ciencias' | 'historia'
  | 'geografia'  | 'artes'    | 'educacao-fisica' | 'ingles'

export interface Product {
  id: string
  title: string
  slug: string
  description: string
  pedagogical_objectives?: string
  price: number              // em centavos (ex: 990 = R$ 9,90)
  thumbnail_url: string      // URL pública da prévia (1ª página)
  preview_url: string        // URL pública da 1ª página com watermark
  grade_level: GradeLevel
  discipline: Discipline
  page_count?: number
  tags?: string[]
  active: boolean
  created_at: string
}

// ─── Usuário ─────────────────────────────────────────────────────────────────
export interface AppUser {
  id: string
  email: string
  name: string
  avatar_url?: string
  provider: 'google' | 'microsoft' | 'facebook' | 'email'
  created_at: string
}

// ─── Pedido ───────────────────────────────────────────────────────────────────
export type OrderStatus = 'pending' | 'paid' | 'failed' | 'expired'
export type PaymentMethod = 'pix' | 'credit_card'

export interface Order {
  id: string
  user_id: string
  status: OrderStatus
  payment_method: PaymentMethod
  payment_id?: string       // ID do Mercado Pago
  total: number             // em centavos
  items: OrderItem[]
  created_at: string
  paid_at?: string
}

export interface OrderItem {
  id: string
  order_id: string
  product_id: string
  product: Product
  price_at_purchase: number
}

// ─── Download ────────────────────────────────────────────────────────────────
export interface Download {
  id: string
  user_id: string
  product_id: string
  order_id: string
  token: string
  expires_at: string
  downloaded_at?: string
}

// ─── Carrinho (client-side) ──────────────────────────────────────────────────
export interface CartItem {
  product: Product
  quantity: number
}

// ─── Filtros do catálogo ─────────────────────────────────────────────────────
export interface CatalogFilters {
  grade?: GradeLevel[]
  discipline?: Discipline[]
  search?: string
  minPrice?: number
  maxPrice?: number
}

// ─── Helpers de formatação ────────────────────────────────────────────────────
export const GRADE_LABELS: Record<GradeLevel, string> = {
  '1ano': '1º Ano', '2ano': '2º Ano', '3ano': '3º Ano',
  '4ano': '4º Ano', '5ano': '5º Ano', '6ano': '6º Ano',
  '7ano': '7º Ano', '8ano': '8º Ano', '9ano': '9º Ano',
}

export const DISCIPLINE_LABELS: Record<Discipline, string> = {
  matematica: 'Matemática', portugues: 'Português', ciencias: 'Ciências',
  historia: 'História', geografia: 'Geografia', artes: 'Artes',
  'educacao-fisica': 'Ed. Física', ingles: 'Inglês',
}

export function formatPrice(cents: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(cents / 100)
}
