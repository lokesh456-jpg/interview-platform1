const nodemailer = require('nodemailer');

let transporter = null;

const initEmailTransport = () => {
  if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.EMAIL_PORT) || 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
    console.log('✅ Email transport configured');
  } else {
    console.warn('⚠️  Email not configured. Password reset emails will be logged in development mode.');
  }
};

const sendEmail = async ({ to, subject, html }) => {
  if (!transporter) {
    if (process.env.NODE_ENV === 'development') {
      console.log('\n📧 [DEV EMAIL - would be sent in production]');
      console.log(`To: ${to}`);
      console.log(`Subject: ${subject}`);
      console.log(`Content: ${html.replace(/<[^>]+>/g, '')}`);
      return;
    }
    throw new Error('Email service is not configured.');
  }

  await transporter.sendMail({
    from: process.env.EMAIL_FROM || 'InterviewAI <noreply@interviewai.com>',
    to,
    subject,
    html,
  });
};

const sendPasswordResetEmail = async ({ to, resetUrl, name }) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #6366f1;">Reset Your InterviewAI Password</h2>
      <p>Hi ${name},</p>
      <p>You requested a password reset. Click the button below to set a new password:</p>
      <a href="${resetUrl}" style="display: inline-block; background: #6366f1; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; margin: 16px 0;">
        Reset Password
      </a>
      <p>This link expires in <strong>1 hour</strong>.</p>
      <p>If you did not request this, please ignore this email.</p>
      <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
      <p style="color: #6b7280; font-size: 14px;">InterviewAI - AI-powered interview preparation</p>
    </div>
  `;

  await sendEmail({ to, subject: 'Reset Your InterviewAI Password', html });
};

module.exports = { initEmailTransport, sendEmail, sendPasswordResetEmail };
