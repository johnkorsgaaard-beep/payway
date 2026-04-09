-- ============================================================
-- PayWay Database Schema — Full Migration
-- Supabase (Postgres) · payway-production
-- ============================================================

-- ─── ENUMS ──────────────────────────────────────────────────

CREATE TYPE user_role AS ENUM ('user', 'merchant', 'admin', 'account_manager');
CREATE TYPE kyc_status AS ENUM ('none', 'pending', 'verified', 'rejected');
CREATE TYPE locale AS ENUM ('fo', 'da', 'en');
CREATE TYPE transaction_type AS ENUM ('topup', 'p2p', 'merchant_payment', 'withdrawal', 'refund', 'cashback');
CREATE TYPE transaction_status AS ENUM ('pending', 'completed', 'failed', 'refunded');
CREATE TYPE merchant_plan AS ENUM ('free', 'store', 'platform');
CREATE TYPE onboarding_status AS ENUM ('pending', 'active', 'suspended');
CREATE TYPE payout_status AS ENUM ('pending', 'in_transit', 'paid', 'failed');
CREATE TYPE qr_session_status AS ENUM ('active', 'paid', 'expired');
CREATE TYPE group_role AS ENUM ('owner', 'admin', 'member');
CREATE TYPE notification_type AS ENUM ('payment_received', 'payment_sent', 'payout', 'cashback', 'group_invite', 'system');
CREATE TYPE deal_priority AS ENUM ('low', 'medium', 'high');
CREATE TYPE activity_type AS ENUM ('call', 'email', 'meeting', 'note');


-- ─── PROFILES ───────────────────────────────────────────────

CREATE TABLE profiles (
  id          uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  role        user_role NOT NULL DEFAULT 'user',
  full_name   text NOT NULL DEFAULT '',
  phone       text UNIQUE,
  email       text,
  avatar_url  text,
  pin_hash    text,
  biometrics_enabled boolean NOT NULL DEFAULT false,
  kyc_status  kyc_status NOT NULL DEFAULT 'none',
  kyc_verified_at timestamptz,
  locale      locale NOT NULL DEFAULT 'fo',
  push_token  text,
  is_active   boolean NOT NULL DEFAULT true,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Admins read all profiles"
  ON profiles FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('admin', 'account_manager'))
  );

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', '')
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();


-- ─── WALLETS ────────────────────────────────────────────────

CREATE TABLE wallets (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL UNIQUE REFERENCES profiles ON DELETE CASCADE,
  balance     bigint NOT NULL DEFAULT 0 CHECK (balance >= 0),
  currency    text NOT NULL DEFAULT 'DKK',
  is_frozen   boolean NOT NULL DEFAULT false,
  created_at  timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE wallets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own wallet"
  ON wallets FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins read all wallets"
  ON wallets FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );

-- Auto-create wallet when profile is created
CREATE OR REPLACE FUNCTION handle_new_profile_wallet()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.wallets (user_id) VALUES (NEW.id);
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_profile_created_wallet
  AFTER INSERT ON profiles
  FOR EACH ROW EXECUTE FUNCTION handle_new_profile_wallet();


-- ─── MERCHANTS ──────────────────────────────────────────────

CREATE TABLE merchants (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id          uuid NOT NULL REFERENCES profiles ON DELETE CASCADE,
  name              text NOT NULL,
  slug              text UNIQUE NOT NULL,
  description       text NOT NULL DEFAULT '',
  address           text NOT NULL DEFAULT '',
  city              text NOT NULL DEFAULT '',
  postal_code       text NOT NULL DEFAULT '',
  country           text NOT NULL DEFAULT 'FO',
  phone             text,
  email             text,
  logo_url          text,
  qr_code_id        text UNIQUE NOT NULL DEFAULT gen_random_uuid()::text,
  stripe_account_id text,
  stripe_onboarding_complete boolean NOT NULL DEFAULT false,
  fee_rate          integer NOT NULL DEFAULT 250,
  is_active         boolean NOT NULL DEFAULT true,
  is_open           boolean NOT NULL DEFAULT false,
  plan              merchant_plan NOT NULL DEFAULT 'free',
  onboarding_status onboarding_status NOT NULL DEFAULT 'pending',
  account_manager_id uuid REFERENCES profiles,
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE merchants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owner reads own merchant"
  ON merchants FOR SELECT
  USING (auth.uid() = owner_id);

CREATE POLICY "Owner updates own merchant"
  ON merchants FOR UPDATE
  USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Admins read all merchants"
  ON merchants FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('admin', 'account_manager'))
  );

CREATE POLICY "Admins update all merchants"
  ON merchants FOR UPDATE
  USING (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );

CREATE TRIGGER merchants_updated_at
  BEFORE UPDATE ON merchants
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE INDEX idx_merchants_owner ON merchants (owner_id);
CREATE INDEX idx_merchants_slug ON merchants (slug);
CREATE INDEX idx_merchants_qr ON merchants (qr_code_id);


-- ─── TRANSACTIONS ───────────────────────────────────────────

CREATE TABLE transactions (
  id                      uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type                    transaction_type NOT NULL,
  status                  transaction_status NOT NULL DEFAULT 'pending',
  from_wallet_id          uuid REFERENCES wallets,
  to_wallet_id            uuid REFERENCES wallets,
  merchant_id             uuid REFERENCES merchants,
  amount                  bigint NOT NULL CHECK (amount > 0),
  fee                     bigint NOT NULL DEFAULT 0,
  net_amount              bigint NOT NULL GENERATED ALWAYS AS (amount - fee) STORED,
  stripe_payment_intent_id text,
  description             text,
  metadata                jsonb DEFAULT '{}',
  created_at              timestamptz NOT NULL DEFAULT now(),
  completed_at            timestamptz
);

ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own transactions"
  ON transactions FOR SELECT
  USING (
    from_wallet_id IN (SELECT id FROM wallets WHERE user_id = auth.uid())
    OR
    to_wallet_id IN (SELECT id FROM wallets WHERE user_id = auth.uid())
  );

CREATE POLICY "Merchants read own transactions"
  ON transactions FOR SELECT
  USING (
    merchant_id IN (SELECT id FROM merchants WHERE owner_id = auth.uid())
  );

CREATE POLICY "Admins read all transactions"
  ON transactions FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );

CREATE INDEX idx_tx_from_wallet ON transactions (from_wallet_id, created_at DESC);
CREATE INDEX idx_tx_to_wallet ON transactions (to_wallet_id, created_at DESC);
CREATE INDEX idx_tx_merchant ON transactions (merchant_id, created_at DESC);
CREATE INDEX idx_tx_type_status ON transactions (type, status);
CREATE UNIQUE INDEX idx_tx_stripe ON transactions (stripe_payment_intent_id) WHERE stripe_payment_intent_id IS NOT NULL;


-- ─── QR SESSIONS (dynamic QR) ──────────────────────────────

CREATE TABLE qr_sessions (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant_id     uuid NOT NULL REFERENCES merchants ON DELETE CASCADE,
  amount          bigint NOT NULL CHECK (amount > 0),
  status          qr_session_status NOT NULL DEFAULT 'active',
  transaction_id  uuid REFERENCES transactions,
  expires_at      timestamptz NOT NULL DEFAULT (now() + interval '10 minutes'),
  created_at      timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE qr_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Merchants manage own qr_sessions"
  ON qr_sessions FOR ALL
  USING (
    merchant_id IN (SELECT id FROM merchants WHERE owner_id = auth.uid())
  );

CREATE POLICY "Anyone can read active qr_sessions"
  ON qr_sessions FOR SELECT
  USING (status = 'active' AND expires_at > now());

CREATE INDEX idx_qr_merchant ON qr_sessions (merchant_id, created_at DESC);
CREATE INDEX idx_qr_active ON qr_sessions (status) WHERE status = 'active';


-- ─── PAYOUTS ────────────────────────────────────────────────

CREATE TABLE payouts (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant_id       uuid NOT NULL REFERENCES merchants ON DELETE CASCADE,
  amount            bigint NOT NULL CHECK (amount > 0),
  fee               bigint NOT NULL DEFAULT 0,
  net_amount        bigint NOT NULL GENERATED ALWAYS AS (amount - fee) STORED,
  stripe_payout_id  text,
  status            payout_status NOT NULL DEFAULT 'pending',
  period_start      timestamptz NOT NULL,
  period_end        timestamptz NOT NULL,
  transaction_count integer NOT NULL DEFAULT 0,
  created_at        timestamptz NOT NULL DEFAULT now(),
  paid_at           timestamptz
);

ALTER TABLE payouts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Merchants read own payouts"
  ON payouts FOR SELECT
  USING (
    merchant_id IN (SELECT id FROM merchants WHERE owner_id = auth.uid())
  );

CREATE POLICY "Admins read all payouts"
  ON payouts FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );

CREATE INDEX idx_payouts_merchant ON payouts (merchant_id, created_at DESC);


-- ─── GROUPS ─────────────────────────────────────────────────

CREATE TABLE groups (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name        text NOT NULL,
  description text NOT NULL DEFAULT '',
  avatar_url  text,
  created_by  uuid NOT NULL REFERENCES profiles ON DELETE CASCADE,
  is_active   boolean NOT NULL DEFAULT true,
  created_at  timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE groups ENABLE ROW LEVEL SECURITY;

CREATE TABLE group_members (
  id        uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id  uuid NOT NULL REFERENCES groups ON DELETE CASCADE,
  user_id   uuid NOT NULL REFERENCES profiles ON DELETE CASCADE,
  role      group_role NOT NULL DEFAULT 'member',
  joined_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (group_id, user_id)
);

ALTER TABLE group_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members read own groups"
  ON groups FOR SELECT
  USING (
    id IN (SELECT group_id FROM group_members WHERE user_id = auth.uid())
  );

CREATE POLICY "Members read group_members"
  ON group_members FOR SELECT
  USING (
    group_id IN (SELECT group_id FROM group_members gm WHERE gm.user_id = auth.uid())
  );

CREATE POLICY "Group owners manage members"
  ON group_members FOR ALL
  USING (
    group_id IN (
      SELECT group_id FROM group_members
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    )
  );

CREATE TABLE group_transactions (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id        uuid NOT NULL REFERENCES groups ON DELETE CASCADE,
  transaction_id  uuid NOT NULL REFERENCES transactions ON DELETE CASCADE,
  added_by        uuid NOT NULL REFERENCES profiles ON DELETE CASCADE,
  created_at      timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE group_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members read group_transactions"
  ON group_transactions FOR SELECT
  USING (
    group_id IN (SELECT group_id FROM group_members WHERE user_id = auth.uid())
  );

CREATE INDEX idx_group_members_user ON group_members (user_id);
CREATE INDEX idx_group_members_group ON group_members (group_id);
CREATE INDEX idx_group_tx ON group_transactions (group_id, created_at DESC);


-- ─── CASHBACK ───────────────────────────────────────────────

CREATE TABLE cashback_rules (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant_id uuid REFERENCES merchants ON DELETE CASCADE,
  percentage  integer NOT NULL CHECK (percentage > 0 AND percentage <= 5000),
  max_amount  bigint NOT NULL DEFAULT 500000,
  is_active   boolean NOT NULL DEFAULT true,
  valid_from  timestamptz NOT NULL DEFAULT now(),
  valid_until timestamptz
);

ALTER TABLE cashback_rules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone reads active cashback_rules"
  ON cashback_rules FOR SELECT
  USING (is_active = true AND valid_from <= now() AND (valid_until IS NULL OR valid_until > now()));

CREATE POLICY "Admins manage cashback_rules"
  ON cashback_rules FOR ALL
  USING (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );

CREATE TABLE cashback_ledger (
  id                      uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                 uuid NOT NULL REFERENCES profiles ON DELETE CASCADE,
  transaction_id          uuid NOT NULL REFERENCES transactions,
  cashback_transaction_id uuid NOT NULL REFERENCES transactions,
  amount                  bigint NOT NULL CHECK (amount > 0),
  rule_id                 uuid NOT NULL REFERENCES cashback_rules,
  created_at              timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE cashback_ledger ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own cashback"
  ON cashback_ledger FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins read all cashback"
  ON cashback_ledger FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );

CREATE INDEX idx_cashback_user ON cashback_ledger (user_id, created_at DESC);


-- ─── NOTIFICATIONS ──────────────────────────────────────────

CREATE TABLE notifications (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL REFERENCES profiles ON DELETE CASCADE,
  type        notification_type NOT NULL,
  title       text NOT NULL,
  body        text NOT NULL DEFAULT '',
  data        jsonb DEFAULT '{}',
  is_read     boolean NOT NULL DEFAULT false,
  created_at  timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own notifications"
  ON notifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users update own notifications"
  ON notifications FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_notifications_user ON notifications (user_id, created_at DESC);
CREATE INDEX idx_notifications_unread ON notifications (user_id) WHERE is_read = false;


-- ─── CRM (admin only) ──────────────────────────────────────

CREATE TABLE crm_deals (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title           text NOT NULL,
  company         text NOT NULL,
  contact_name    text NOT NULL DEFAULT '',
  contact_email   text NOT NULL DEFAULT '',
  contact_phone   text NOT NULL DEFAULT '',
  value           bigint NOT NULL DEFAULT 0,
  probability     integer NOT NULL DEFAULT 10 CHECK (probability >= 0 AND probability <= 100),
  stage           text NOT NULL DEFAULT 'Ny lead',
  priority        deal_priority NOT NULL DEFAULT 'medium',
  tags            text[] NOT NULL DEFAULT '{}',
  notes           text NOT NULL DEFAULT '',
  assigned_to     uuid REFERENCES profiles,
  merchant_id     uuid REFERENCES merchants,
  expected_close  date,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE crm_deals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage crm_deals"
  ON crm_deals FOR ALL
  USING (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('admin', 'account_manager'))
  );

CREATE TRIGGER crm_deals_updated_at
  BEFORE UPDATE ON crm_deals
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TABLE crm_activities (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_id     uuid NOT NULL REFERENCES crm_deals ON DELETE CASCADE,
  type        activity_type NOT NULL,
  text        text NOT NULL,
  created_by  uuid REFERENCES profiles,
  created_at  timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE crm_activities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage crm_activities"
  ON crm_activities FOR ALL
  USING (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('admin', 'account_manager'))
  );

CREATE INDEX idx_crm_deals_stage ON crm_deals (stage);
CREATE INDEX idx_crm_deals_assigned ON crm_deals (assigned_to);
CREATE INDEX idx_crm_activities_deal ON crm_activities (deal_id, created_at DESC);


-- ─── REALTIME ───────────────────────────────────────────────
-- Enable realtime for key tables

ALTER PUBLICATION supabase_realtime ADD TABLE transactions;
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE payouts;
ALTER PUBLICATION supabase_realtime ADD TABLE qr_sessions;


-- ─── STORAGE BUCKETS ────────────────────────────────────────

INSERT INTO storage.buckets (id, name, public)
VALUES
  ('avatars', 'avatars', true),
  ('merchant-logos', 'merchant-logos', true),
  ('kyc-documents', 'kyc-documents', false);

-- Avatars: anyone can read, users upload their own
CREATE POLICY "Avatar read access" ON storage.objects
  FOR SELECT USING (bucket_id = 'avatars');

CREATE POLICY "Users upload own avatar" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Merchant logos: anyone can read, owner uploads
CREATE POLICY "Logo read access" ON storage.objects
  FOR SELECT USING (bucket_id = 'merchant-logos');

CREATE POLICY "Merchant owner uploads logo" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'merchant-logos'
    AND EXISTS (
      SELECT 1 FROM merchants WHERE owner_id = auth.uid() AND id::text = (storage.foldername(name))[1]
    )
  );

-- KYC: only the user and admins
CREATE POLICY "User reads own KYC docs" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'kyc-documents'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "User uploads own KYC docs" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'kyc-documents'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Admins read all KYC docs" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'kyc-documents'
    AND EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );
