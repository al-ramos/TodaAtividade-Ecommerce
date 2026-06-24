import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// ─── Tipos ────────────────────────────────────────────────────────────────────
interface Installment {
  installments: number
  installment_amount: number  // em centavos
  total_amount: number        // em centavos
  recommended_message: string
  has_interest: boolean
  labels: string[]
}

// Máximo de parcelas sem juros (configurável via env)
const MAX_FREE_INSTALLMENTS = Number(process.env.MAX_FREE_INSTALLMENTS ?? 3)
// Taxa mensal para parcelas com juros (padrão MP ~2,99%)
const MONTHLY_RATE = Number(process.env.INSTALLMENT_MONTHLY_RATE ?? 0.0299)

// ─── Cálculo das parcelas ─────────────────────────────────────────────────────
function calculateInstallments(amountCents: number): Installment[] {
  return Array.from({ length: 12 }, (_, idx) => {
    const n = idx + 1
    const hasInterest = n > MAX_FREE_INSTALLMENTS

    let installmentAmount: number
    let totalAmount: number

    if (hasInterest) {
      // Fórmula de juros compostos (Price)
      const rate = MONTHLY_RATE
      const factor = (rate * Math.pow(1 + rate, n)) / (Math.pow(1 + rate, n) - 1)
      installmentAmount = Math.ceil(amountCents * factor)
      totalAmount = installmentAmount * n
    } else {
      installmentAmount = Math.ceil(amountCents / n)
      totalAmount = installmentAmount * n
    }

    const fmtCents = (c: number) =>
      new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(c / 100)

    let recommendedMessage: string
    if (n === 1) {
      recommendedMessage = `1x de ${fmtCents(installmentAmount)} sem juros`
    } else if (!hasInterest) {
      recommendedMessage = `${n}x de ${fmtCents(installmentAmount)} sem juros`
    } else {
      recommendedMessage = `${n}x de ${fmtCents(installmentAmount)} com juros (total ${fmtCents(totalAmount)})`
    }

    return {
      installments: n,
      installment_amount: installmentAmount,
      total_amount: totalAmount,
      recommended_message: recommendedMessage,
      has_interest: hasInterest,
      labels: [hasInterest ? 'COM_JUROS' : 'SEM_JUROS'],
    }
  })
}

// ─── GET /api/checkout/parcelas?amount=<centavos> ─────────────────────────────
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const amountParam = searchParams.get('amount')

  if (!amountParam) {
    return NextResponse.json(
      { error: 'Parâmetro "amount" obrigatório (valor em centavos)' },
      { status: 400 },
    )
  }

  const amountCents = parseInt(amountParam, 10)
  if (isNaN(amountCents) || amountCents < 100) {
    return NextResponse.json({ error: 'Amount inválido (mínimo 100 centavos)' }, { status: 400 })
  }

  const installments = calculateInstallments(amountCents)

  return NextResponse.json({
    installments,
    max_free_installments: MAX_FREE_INSTALLMENTS,
    amount_cents: amountCents,
  })
}
