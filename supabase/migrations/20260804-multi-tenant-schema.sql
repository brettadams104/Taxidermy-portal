-- supabase/migrations/20260804-multi-tenant-schema.sql

-- Create businesses table (one per taxidermist)
CREATE TABLE IF NOT EXISTS public.businesses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  business_name TEXT,
  stages JSONB DEFAULT '["Received", "In Progress", "Completed"]'::jsonb NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Add business_id to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_profiles_business_id ON public.profiles(business_id);

-- Add business_id to skulls
ALTER TABLE public.skulls ADD COLUMN IF NOT EXISTS business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_skulls_business_id ON public.skulls(business_id);

-- Add business_id to clients
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_clients_business_id ON public.clients(business_id);

-- Add business_id to notifications
ALTER TABLE public.notifications ADD COLUMN IF NOT EXISTS business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_notifications_business_id ON public.notifications(business_id);

-- Remove hardcoded status CHECK constraint from skulls (replaced by app-level validation)
ALTER TABLE public.skulls DROP CONSTRAINT IF EXISTS check_valid_status;

-- Create RLS policies for multi-tenancy
-- Businesses: users can only see their own business
CREATE POLICY "businesses_select_own" ON public.businesses
  FOR SELECT USING (auth.uid() = owner_id);

CREATE POLICY "businesses_update_own" ON public.businesses
  FOR UPDATE USING (auth.uid() = owner_id);

-- Profiles: users can see profiles in their business
CREATE POLICY "profiles_business_isolation" ON public.profiles
  FOR SELECT USING (
    business_id = (
      SELECT id FROM businesses WHERE owner_id = auth.uid()
    )
  );

CREATE POLICY "profiles_insert_own_business" ON public.profiles
  FOR INSERT WITH CHECK (
    business_id = (
      SELECT id FROM businesses WHERE owner_id = auth.uid()
    )
  );

CREATE POLICY "profiles_update_own_business" ON public.profiles
  FOR UPDATE USING (
    business_id = (
      SELECT id FROM businesses WHERE owner_id = auth.uid()
    )
  );

-- Skulls: users can only see skulls in their business
CREATE POLICY "skulls_business_isolation" ON public.skulls
  FOR SELECT USING (
    business_id = (
      SELECT id FROM businesses WHERE owner_id = auth.uid()
    )
  );

CREATE POLICY "skulls_insert_own_business" ON public.skulls
  FOR INSERT WITH CHECK (
    business_id = (
      SELECT id FROM businesses WHERE owner_id = auth.uid()
    )
  );

CREATE POLICY "skulls_update_own_business" ON public.skulls
  FOR UPDATE USING (
    business_id = (
      SELECT id FROM businesses WHERE owner_id = auth.uid()
    )
  );

-- Clients: users can only see clients in their business
CREATE POLICY "clients_business_isolation" ON public.clients
  FOR SELECT USING (
    business_id = (
      SELECT id FROM businesses WHERE owner_id = auth.uid()
    )
  );

CREATE POLICY "clients_insert_own_business" ON public.clients
  FOR INSERT WITH CHECK (
    business_id = (
      SELECT id FROM businesses WHERE owner_id = auth.uid()
    )
  );

CREATE POLICY "clients_update_own_business" ON public.clients
  FOR UPDATE USING (
    business_id = (
      SELECT id FROM businesses WHERE owner_id = auth.uid()
    )
  );

-- Notifications: users can only see notifications for their business
CREATE POLICY "notifications_business_isolation" ON public.notifications
  FOR SELECT USING (
    business_id = (
      SELECT id FROM businesses WHERE owner_id = auth.uid()
    )
  );

CREATE POLICY "notifications_insert_own_business" ON public.notifications
  FOR INSERT WITH CHECK (
    business_id = (
      SELECT id FROM businesses WHERE owner_id = auth.uid()
    )
  );

-- Enable RLS on all tables
ALTER TABLE public.businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skulls ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
