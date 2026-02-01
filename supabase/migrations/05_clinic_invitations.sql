-- Create clinic_invitations table
CREATE TABLE IF NOT EXISTS public.clinic_invitations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    clinic_id UUID NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'member',
    token TEXT NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(32), 'hex'),
    expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '7 days'),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_by UUID REFERENCES auth.users(id),
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'expired'))
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_clinic_invitations_token ON public.clinic_invitations(token);
CREATE INDEX IF NOT EXISTS idx_clinic_invitations_email ON public.clinic_invitations(email);
CREATE INDEX IF NOT EXISTS idx_clinic_invitations_clinic_id ON public.clinic_invitations(clinic_id);

-- RLS Policies
ALTER TABLE public.clinic_invitations ENABLE ROW LEVEL SECURITY;

-- Policy: Clinic admins/owners can insert invitations
CREATE POLICY "allow_insert_invitations" ON public.clinic_invitations
FOR INSERT
WITH CHECK (
    clinic_id IN (SELECT get_my_clinic_ids())
);

-- Policy: Clinic members can view invitations for their clinic
CREATE POLICY "allow_view_invitations" ON public.clinic_invitations
FOR SELECT
USING (
    clinic_id IN (SELECT get_my_clinic_ids()) OR
    token = current_setting('request.jwt.claim.sub', true) -- Allow lookup by token if needed? No, token is secret.
    -- We might need a public function to view by token for the accept page, or use a secure RPC.
    -- For now, keep it restricted to members.
);

-- Policy: Clinic admins/owners can delete/revoke invitations
CREATE POLICY "allow_delete_invitations" ON public.clinic_invitations
FOR DELETE
USING (
    clinic_id IN (SELECT get_my_clinic_ids())
);
