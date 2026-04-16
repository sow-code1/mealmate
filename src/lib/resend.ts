import { Resend } from 'resend'

export async function sendVerificationEmail(email: string, token: string) {
    const resend = new Resend(process.env.RESEND_API_KEY!)
    const verifyUrl = `${process.env.NEXTAUTH_URL}/api/auth/verify?token=${token}`

    await resend.emails.send({
        from: 'Caloracle <onboarding@resend.dev>',
        to: email,
        subject: 'Verify your Caloracle account',
        html: `
            <div style="font-family: 'DM Sans', Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 2rem; background: #faf9f6; border-radius: 12px;">
                <h1 style="font-family: Georgia, serif; color: #1c1917; font-size: 1.8rem; margin-bottom: 0.5rem;">Welcome to Caloracle 🔥</h1>
                <p style="color: #78716c; font-size: 1rem; line-height: 1.6; margin-bottom: 1.5rem;">
                    Thanks for signing up! Click the button below to verify your email address and start tracking your recipes and calories.
                </p>
                <a href="${verifyUrl}" style="display: inline-block; background: #3d6b45; color: white; padding: 0.85rem 2rem; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 0.95rem; margin-bottom: 1.5rem;">
                    Verify Email Address
                </a>
                <p style="color: #a8a29e; font-size: 0.8rem; line-height: 1.6;">
                    This link expires in 24 hours. If you didn't create an account, you can safely ignore this email.
                </p>
                <hr style="border: none; border-top: 1px solid #e8e4dc; margin: 1.5rem 0;" />
                <p style="color: #a8a29e; font-size: 0.75rem;">Caloracle · Your personal kitchen & calorie companion</p>
            </div>
        `,
    })
}