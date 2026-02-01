'use server'

import { createClient } from '@/utils/supabase/server'
import { sendInvitationEmail } from '@/lib/email'
import { revalidatePath } from 'next/cache'

export async function inviteMember(email: string, role: string, clinicId: string) {
    const supabase = await createClient()

    // Get current user
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        return { error: 'Not authenticated' }
    }

    // Check member limit
    const { data: canAdd, error: limitError } = await supabase.rpc('can_add_member', { p_clinic_id: clinicId })
    if (limitError) {
        console.error('Error checking limit:', limitError)
        return { error: 'Failed to check subscription limits' }
    }

    if (!canAdd) {
        return { error: 'Member limit reached for your plan. Upgrade to invite more members.' }
    }

    // Insert invitation
    // RLS will check if user has permission to insert for this clinic
    const { data: invitation, error } = await supabase
        .from('clinic_invitations')
        .insert({
            clinic_id: clinicId,
            email,
            role,
            created_by: user.id
        })
        .select()
        .single()

    if (error) {
        console.error('Error creating invitation:', error)
        return { error: error.message }
    }

    // Get clinic name for email
    const { data: clinic } = await supabase
        .from('clinics')
        .select('name')
        .eq('id', clinicId)
        .single()

    const clinicName = clinic?.name || 'SehaTech'

    // Send email
    // Construct invite link
    // Assuming the accept page is /invite/accept?token=...
    const inviteLink = `${process.env.NEXT_PUBLIC_APP_URL}/invite/accept?token=${invitation.token}`

    try {
        await sendInvitationEmail(email, inviteLink, clinicName)
        revalidatePath('/team') // Revalidate team page to show pending invite
        return { success: true }
    } catch (emailError) {
        console.error('Error sending email:', emailError)
        return { error: 'Invitation created but failed to send email. Please try resending.' }
    }
}


export async function acceptInvitation(token: string) {
    const supabase = await createClient()

    // Call the RPC function to accept the invitation
    // This function checks if the user is authenticated and membership status
    const { data, error } = await supabase
        .rpc('accept_invitation', { token_input: token })

    if (error) {
        console.error('Error accepting invitation:', error)
        return { error: error.message }
    }

    // cast data to any to check custom error message from RPC if needed
    // The RPC returns { success: boolean, message?: string, clinic_id?: uuid }

    return { success: true, data }
}

export async function getInvitation(token: string) {
    const supabase = await createClient()

    // We can call the secure RPC to get details even if anonymously (via RPC permissions)
    // or simply rely on the fact that if they are authenticated, they can get it.
    // If not authenticated, we might want to show basic info (Clinic Name) so they know what they are joining.
    // Our RPC `get_invitation_by_token` is SECURITY DEFINER and granted to anon.

    const { data, error } = await supabase
        .rpc('get_invitation_by_token', { token_input: token })
        .single() // Expecting single row

    if (error) {
        return { error: error.message }
    }

    return { data }
}
