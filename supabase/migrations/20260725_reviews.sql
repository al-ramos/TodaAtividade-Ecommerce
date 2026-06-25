-- US-48: Replace generic ALL policy with separate granular policies.
-- The INSERT policy now enforces that the user has a paid order for the product.
-- The reviews table already exists from 20260624_reviews.sql.

-- Drop old permissive ALL policy so the new INSERT check is actually enforced
DROP POLICY IF EXISTS "Users manage own reviews" ON public.reviews;

-- Separate INSERT policy with purchase verification
CREATE POLICY "reviews_insert" ON public.reviews FOR INSERT
  WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM public.orders o
      JOIN public.order_items oi ON oi.order_id = o.id
      WHERE o.user_id = auth.uid()
        AND oi.product_id = reviews.product_id
        AND o.status = 'paid'
    )
  );

-- Users can update their own review
DROP POLICY IF EXISTS "reviews_update" ON public.reviews;
CREATE POLICY "reviews_update" ON public.reviews FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own review
DROP POLICY IF EXISTS "reviews_delete" ON public.reviews;
CREATE POLICY "reviews_delete" ON public.reviews FOR DELETE
  USING (auth.uid() = user_id);
