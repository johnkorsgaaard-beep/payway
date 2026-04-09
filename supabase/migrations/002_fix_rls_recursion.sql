-- ============================================================
-- Fix: RLS infinite recursion on profiles table
-- The admin policy referenced profiles itself, causing a loop
-- Solution: SECURITY DEFINER function bypasses RLS for the check
-- ============================================================

-- Create a helper function that bypasses RLS to check admin status
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role IN ('admin', 'account_manager')
  );
$$;

CREATE OR REPLACE FUNCTION is_merchant_owner(merchant_uuid uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.merchants
    WHERE id = merchant_uuid AND owner_id = auth.uid()
  );
$$;

-- ─── Fix profiles policies ─────────────────────────────────
DROP POLICY IF EXISTS "Admins read all profiles" ON profiles;

CREATE POLICY "Admins read all profiles"
  ON profiles FOR SELECT
  USING (is_admin());

-- ─── Fix wallets policies ───────────────────────────────────
DROP POLICY IF EXISTS "Admins read all wallets" ON wallets;

CREATE POLICY "Admins read all wallets"
  ON wallets FOR SELECT
  USING (is_admin());

-- ─── Fix merchants policies ─────────────────────────────────
DROP POLICY IF EXISTS "Admins read all merchants" ON merchants;

CREATE POLICY "Admins read all merchants"
  ON merchants FOR SELECT
  USING (is_admin());

DROP POLICY IF EXISTS "Admins update all merchants" ON merchants;

CREATE POLICY "Admins update all merchants"
  ON merchants FOR UPDATE
  USING (is_admin());

-- ─── Fix transactions policies ──────────────────────────────
DROP POLICY IF EXISTS "Admins read all transactions" ON transactions;

CREATE POLICY "Admins read all transactions"
  ON transactions FOR SELECT
  USING (is_admin());

-- ─── Fix payouts policies ───────────────────────────────────
DROP POLICY IF EXISTS "Admins read all payouts" ON payouts;

CREATE POLICY "Admins read all payouts"
  ON payouts FOR SELECT
  USING (is_admin());

-- ─── Fix cashback policies ──────────────────────────────────
DROP POLICY IF EXISTS "Admins manage cashback_rules" ON cashback_rules;

CREATE POLICY "Admins manage cashback_rules"
  ON cashback_rules FOR ALL
  USING (is_admin());

DROP POLICY IF EXISTS "Admins read all cashback" ON cashback_ledger;

CREATE POLICY "Admins read all cashback"
  ON cashback_ledger FOR SELECT
  USING (is_admin());

-- ─── Fix CRM policies ──────────────────────────────────────
DROP POLICY IF EXISTS "Admins manage crm_deals" ON crm_deals;

CREATE POLICY "Admins manage crm_deals"
  ON crm_deals FOR ALL
  USING (is_admin());

DROP POLICY IF EXISTS "Admins manage crm_activities" ON crm_activities;

CREATE POLICY "Admins manage crm_activities"
  ON crm_activities FOR ALL
  USING (is_admin());

-- ─── Fix storage policies ───────────────────────────────────
DROP POLICY IF EXISTS "Admins read all KYC docs" ON storage.objects;

CREATE POLICY "Admins read all KYC docs" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'kyc-documents' AND is_admin()
  );

-- Reload schema cache
NOTIFY pgrst, 'reload schema';
