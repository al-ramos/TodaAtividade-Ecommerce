import { supabaseAdmin } from './supabase'

export type SubscriptionStatus = {
  isActive: boolean
  status: string | null
  currentPeriodEnd: Date | null
  stripeCustomerId: string | null
  stripeSubscriptionId: string | null
}

const ACTIVE_STATUSES = new Set(['active', 'trialing'])

/**
 * Returns the subscription status for a given Supabase user_id.
 * Uses supabaseAdmin (service role) — safe for server-only use.
 */
export async function getUserSubscriptionStatus(userId: string): Promise<SubscriptionStatus> {
  const { data } = await supabaseAdmin
    .from('subscriptions')
    .select('status, current_period_end, stripe_customer_id, stripe_subscription_id')
    .eq('user_id', userId)
    .maybeSingle()

  if (!data) {
    return {
      isActive: false,
      status: null,
      currentPeriodEnd: null,
      stripeCustomerId: null,
      stripeSubscriptionId: null,
    }
  }

  return {
    isActive: ACTIVE_STATUSES.has(data.status),
    status: data.status,
    currentPeriodEnd: data.current_period_end ? new Date(data.current_period_end) : null,
    stripeCustomerId: data.stripe_customer_id,
    stripeSubscriptionId: data.stripe_subscription_id,
  }
}
