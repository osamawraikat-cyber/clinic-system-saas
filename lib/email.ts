import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendInvitationEmail(email: string, inviteLink: string, clinicName: string) {
    if (!process.env.RESEND_API_KEY) {
        console.warn("RESEND_API_KEY is not set. Logged invite link:", inviteLink);
        return;
    }

    // If domain is not verified, Resend only allows sending from onboarding@resend.dev
    // to the email address associated with the account.
    // If zahiflow.com is verified, this MUST be ZahiFlow <noreply@zahiflow.com>
    const fromEmail = process.env.RESEND_FROM_EMAIL || 'ZahiFlow <noreply@zahiflow.com>';

    try {
        const { data, error } = await resend.emails.send({
            from: fromEmail,
            to: email,
            subject: `Join ${clinicName} on ZahiFlow`,
            html: `
                <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
                    <h2 style="color: #10b981;">You've been invited!</h2>
                    <p>Hello,</p>
                    <p>You have been invited to join <strong>${clinicName}</strong> on ZahiFlow (Clinic Management System).</p>
                    <p>Click the button below to accept the invitation and set up your account:</p>
                    <div style="margin: 30px 0;">
                        <a href="${inviteLink}" style="background-color: #10b981; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">Accept Invitation</a>
                    </div>
                    <p>Or copy this link into your browser:</p>
                    <p style="background: #f4f4f5; padding: 10px; border-radius: 4px; font-size: 14px; word-break: break-all;">${inviteLink}</p>
                    <p style="font-size: 13px; color: #666; margin-top: 30px;">This link expires in 7 days.</p>
                </div>
            `
        });

        if (error) {
            console.error('Resend API Error:', error);
            throw new Error(`Resend Error: ${error.message}`);
        }

        console.log('Email sent successfully:', data?.id);
    } catch (error: any) {
        console.error('Failed to send email via Resend:', error);
        throw new Error(error.message || 'Failed to send invitation email');
    }
}
