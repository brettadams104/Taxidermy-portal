-- Create invitations table for client sign-up links
CREATE TABLE IF NOT EXISTS public.invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  email TEXT,
  token TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_invitations_token ON public.invitations(token);
CREATE INDEX IF NOT EXISTS idx_invitations_business_id ON public.invitations(business_id);

-- Enable RLS
ALTER TABLE public.invitations ENABLE ROW LEVEL SECURITY;

-- Allow admins to see invitations for their business
CREATE POLICY IF NOT EXISTS "invitations_select_own_business" ON public.invitations
  FOR SELECT USING (
    business_id = (
      SELECT id FROM businesses WHERE owner_id = auth.uid()
    )
  );

CREATE POLICY IF NOT EXISTS "invitations_insert_own_business" ON public.invitations
  FOR INSERT WITH CHECK (
    business_id = (
      SELECT id FROM businesses WHERE owner_id = auth.uid()
    )
  );
