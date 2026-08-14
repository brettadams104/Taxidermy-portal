-- Add sent_at column to track when invitation email was sent
ALTER TABLE public.invitations ADD COLUMN IF NOT EXISTS sent_at TIMESTAMPTZ;

-- Create index for filtering unsent invitations
CREATE INDEX IF NOT EXISTS idx_invitations_sent_at ON public.invitations(sent_at);
