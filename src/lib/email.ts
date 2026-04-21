import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
    },
})

export async function sendVerificationEmail(email: string, code: string) {
    await transporter.sendMail({
        from: `"Caloracle" <${process.env.GMAIL_USER}>`,
        to: email,
        subject: `${code} is your Caloracle verification code`,
        html: `
            <div style="font-family: 'DM Sans', Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 2rem; background: #faf9f6; border-radius: 12px;">
                <h1 style="font-family: Georgia, serif; color: #1c1917; font-size: 1.8rem; margin-bottom: 0.5rem;">Welcome to Caloracle 🔥</h1>
                <p style="color: #78716c; font-size: 1rem; line-height: 1.6; margin-bottom: 1.5rem;">
                    Enter this code to verify your email address and start tracking your recipes and calories.
                </p>
                <div style="background: #ffffff; border: 2px dashed #3d6b45; border-radius: 12px; padding: 1.25rem; text-align: center; margin-bottom: 1.5rem;">
                    <span style="font-family: 'Courier New', monospace; font-size: 2.5rem; font-weight: 700; letter-spacing: 0.5rem; color: #3d6b45;">
                        ${code}
                    </span>
                </div>
                <p style="color: #a8a29e; font-size: 0.8rem; line-height: 1.6;">
                    This code expires in 10 minutes. If you didn't create an account, you can safely ignore this email.
                </p>
                <hr style="border: none; border-top: 1px solid #e8e4dc; margin: 1.5rem 0;" />
                <p style="color: #a8a29e; font-size: 0.75rem;">Caloracle · Your personal kitchen &amp; calorie companion</p>
            </div>
        `,
    })
}
