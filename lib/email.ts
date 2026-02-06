import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendInvitationEmail(email: string, inviteLink: string, clinicName: string) {
    if (!process.env.RESEND_API_KEY) {
        console.warn("RESEND_API_KEY is not set. Logged invite link:", inviteLink);
        return;
    }

    try {
        await resend.emails.send({
            from: 'ZahiFlow <onboarding@resend.dev>', // Use resend.dev for testing if no domain
            to: email,
            subject: `Join ${clinicName} on ZahiFlow`,
            html: `
                <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2>You've been invited!</h2>
                    <p>You have been invited to join <strong>${clinicName}</strong> on ZahiFlow.</p>
                    <p>Click the button below to accept the invitation:</p>
                    <a href="${inviteLink}" style="display: inline-block; background-color: #000; color: #fff; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin: 20px 0;">Accept Invitation</a>
                    <p>Or copy this link: <br>${inviteLink}</p>
                    <p>This link expires in 7 days.</p>
                </div>
            `
        });
    } catch (error) {
        console.error('Failed to send email:', error);
        throw new Error('Failed to send invitation email');
    }
}
