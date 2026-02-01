-- Function to get invitation details by token (Publicly accessible but secure)
CREATE OR REPLACE FUNCTION public.get_invitation_by_token(token_input TEXT)
RETURNS TABLE (
    id UUID,
    clinic_id UUID,
    clinic_name TEXT,
    email TEXT,
    role TEXT,
    expires_at TIMESTAMPTZ,
    status TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ci.id,
        ci.clinic_id,
        c.name as clinic_name,
        ci.email,
        ci.role,
        ci.expires_at,
        ci.status
    FROM public.clinic_invitations ci
    JOIN public.clinics c ON c.id = ci.clinic_id
    WHERE ci.token = token_input
    AND ci.expires_at > now()
    AND ci.status = 'pending';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant access to public (anon) and authenticated users
GRANT EXECUTE ON FUNCTION public.get_invitation_by_token(TEXT) TO anon, authenticated, service_role;


-- Function to accept an invitation
CREATE OR REPLACE FUNCTION public.accept_invitation(token_input TEXT)
RETURNS JSONB AS $$
DECLARE
    invite_record public.clinic_invitations%ROWTYPE;
    current_user_id UUID;
    existing_member UUID;
BEGIN
    -- Get current user ID
    current_user_id := auth.uid();
    
    IF current_user_id IS NULL THEN
        RAISE EXCEPTION 'Not authenticated';
    END IF;

    -- Find the invitation
    SELECT * INTO invite_record
    FROM public.clinic_invitations
    WHERE token = token_input
    AND status = 'pending'
    AND expires_at > now();

    IF invite_record.id IS NULL THEN
        RAISE EXCEPTION 'Invalid or expired invitation';
    END IF;

    -- Check if user is already a member
    SELECT id INTO existing_member
    FROM public.clinic_members
    WHERE clinic_id = invite_record.clinic_id
    AND user_id = current_user_id;

    IF existing_member IS NOT NULL THEN
        -- Already a member, just mark invite as accepted
        UPDATE public.clinic_invitations
        SET status = 'accepted'
        WHERE id = invite_record.id;
        
        RETURN jsonb_build_object('success', true, 'message', 'Already a member');
    END IF;

    -- Add user to clinic members
    INSERT INTO public.clinic_members (clinic_id, user_id, role)
    VALUES (invite_record.clinic_id, current_user_id, invite_record.role);

    -- Mark invite as accepted
    UPDATE public.clinic_invitations
    SET status = 'accepted'
    WHERE id = invite_record.id;

    RETURN jsonb_build_object('success', true, 'clinic_id', invite_record.clinic_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute to authenticated users only
GRANT EXECUTE ON FUNCTION public.accept_invitation(TEXT) TO authenticated, service_role;
