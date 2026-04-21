-- ================================================================
-- OutRich Stripe Billing Migration
-- Paste into Supabase → SQL Editor → Run
-- ================================================================

-- 1. Create profiles table (billing status per user)
CREATE TABLE IF NOT EXISTS profiles (
  user_id            UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  stripe_customer_id TEXT UNIQUE,
  subscription_status TEXT NOT NULL DEFAULT 'trialing',
  trial_ends_at      TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '7 days'),
  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. RLS: users can only read their own profile (webhook writes via service role)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "profiles_read_own" ON profiles;
CREATE POLICY "profiles_read_own" ON profiles FOR SELECT USING (auth.uid() = user_id);

-- 3. Auto-create profile with 7-day trial on every new signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO profiles (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE handle_new_user();

-- 4. Backfill profiles for any existing users (sets trial to 7 days from now)
INSERT INTO profiles (user_id)
SELECT id FROM auth.users
ON CONFLICT (user_id) DO NOTHING;
