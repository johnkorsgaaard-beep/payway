-- ============================================================
-- PayWay Migration 003 — App Backend Support
-- Adds payway_tag, atomic wallet functions, indexes
-- ============================================================

-- ─── PAYWAY TAG ────────────────────────────────────────────
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS payway_tag text UNIQUE;
CREATE INDEX IF NOT EXISTS idx_profiles_payway_tag ON profiles(payway_tag);
CREATE INDEX IF NOT EXISTS idx_profiles_phone ON profiles(phone);

-- ─── ATOMIC P2P TRANSFER ──────────────────────────────────
CREATE OR REPLACE FUNCTION transfer_p2p(
  p_sender_id uuid,
  p_receiver_id uuid,
  p_amount bigint,
  p_description text DEFAULT NULL
) RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_sender_wallet uuid;
  v_receiver_wallet uuid;
  v_tx_id uuid;
BEGIN
  SELECT id INTO v_sender_wallet
    FROM public.wallets WHERE user_id = p_sender_id FOR UPDATE;
  SELECT id INTO v_receiver_wallet
    FROM public.wallets WHERE user_id = p_receiver_id FOR UPDATE;

  IF v_sender_wallet IS NULL THEN
    RAISE EXCEPTION 'sender_wallet_not_found';
  END IF;
  IF v_receiver_wallet IS NULL THEN
    RAISE EXCEPTION 'receiver_wallet_not_found';
  END IF;

  IF (SELECT balance FROM public.wallets WHERE id = v_sender_wallet) < p_amount THEN
    RAISE EXCEPTION 'insufficient_balance';
  END IF;

  UPDATE public.wallets SET balance = balance - p_amount WHERE id = v_sender_wallet;
  UPDATE public.wallets SET balance = balance + p_amount WHERE id = v_receiver_wallet;

  INSERT INTO public.transactions
    (type, status, from_wallet_id, to_wallet_id, amount, description, completed_at)
  VALUES
    ('p2p', 'completed', v_sender_wallet, v_receiver_wallet, p_amount, p_description, now())
  RETURNING id INTO v_tx_id;

  -- Notifications
  INSERT INTO public.notifications (user_id, type, title, body, data)
  VALUES
    (p_sender_id, 'payment_sent', 'Betaling sendt',
     format('Du sendte %s DKK', (p_amount::numeric / 100)::text),
     jsonb_build_object('transaction_id', v_tx_id)),
    (p_receiver_id, 'payment_received', 'Betaling modtaget',
     format('Du modtog %s DKK', (p_amount::numeric / 100)::text),
     jsonb_build_object('transaction_id', v_tx_id));

  RETURN v_tx_id;
END;
$$;

-- ─── ATOMIC MERCHANT PAYMENT ──────────────────────────────
CREATE OR REPLACE FUNCTION pay_merchant(
  p_payer_id uuid,
  p_merchant_id uuid,
  p_amount bigint,
  p_description text DEFAULT NULL
) RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_payer_wallet uuid;
  v_fee_rate integer;
  v_fee bigint;
  v_tx_id uuid;
  v_merchant_name text;
BEGIN
  SELECT id INTO v_payer_wallet
    FROM public.wallets WHERE user_id = p_payer_id FOR UPDATE;
  SELECT fee_rate, name INTO v_fee_rate, v_merchant_name
    FROM public.merchants WHERE id = p_merchant_id AND is_active = true;

  IF v_payer_wallet IS NULL THEN
    RAISE EXCEPTION 'wallet_not_found';
  END IF;
  IF v_fee_rate IS NULL THEN
    RAISE EXCEPTION 'merchant_not_found';
  END IF;

  v_fee := (p_amount * v_fee_rate) / 10000;

  IF (SELECT balance FROM public.wallets WHERE id = v_payer_wallet) < p_amount THEN
    RAISE EXCEPTION 'insufficient_balance';
  END IF;

  UPDATE public.wallets SET balance = balance - p_amount WHERE id = v_payer_wallet;

  INSERT INTO public.transactions
    (type, status, from_wallet_id, merchant_id, amount, fee, description, completed_at)
  VALUES
    ('merchant_payment', 'completed', v_payer_wallet, p_merchant_id, p_amount, v_fee,
     COALESCE(p_description, v_merchant_name), now())
  RETURNING id INTO v_tx_id;

  INSERT INTO public.notifications (user_id, type, title, body, data)
  VALUES
    (p_payer_id, 'payment_sent', 'Betaling til ' || v_merchant_name,
     format('Du betalte %s DKK', (p_amount::numeric / 100)::text),
     jsonb_build_object('transaction_id', v_tx_id, 'merchant_id', p_merchant_id));

  RETURN v_tx_id;
END;
$$;

-- ─── ATOMIC WALLET TOP-UP ─────────────────────────────────
CREATE OR REPLACE FUNCTION topup_wallet(
  p_user_id uuid,
  p_amount bigint,
  p_stripe_pi_id text DEFAULT NULL
) RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_wallet uuid;
  v_tx_id uuid;
BEGIN
  SELECT id INTO v_wallet
    FROM public.wallets WHERE user_id = p_user_id FOR UPDATE;

  IF v_wallet IS NULL THEN
    RAISE EXCEPTION 'wallet_not_found';
  END IF;

  UPDATE public.wallets SET balance = balance + p_amount WHERE id = v_wallet;

  INSERT INTO public.transactions
    (type, status, to_wallet_id, amount, stripe_payment_intent_id, description, completed_at)
  VALUES
    ('topup', 'completed', v_wallet, p_amount, p_stripe_pi_id, 'Optankning', now())
  RETURNING id INTO v_tx_id;

  INSERT INTO public.notifications (user_id, type, title, body, data)
  VALUES
    (p_user_id, 'payment_received', 'Wallet optanket',
     format('%s DKK tilføjet til din wallet', (p_amount::numeric / 100)::text),
     jsonb_build_object('transaction_id', v_tx_id));

  RETURN v_tx_id;
END;
$$;

NOTIFY pgrst, 'reload schema';
