const nodemailer = require('nodemailer');

const toNumber = (value, fallback) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const buildTransport = () => {
  const host = process.env.SMTP_HOST;
  const port = toNumber(process.env.SMTP_PORT, 587);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const secure = String(process.env.SMTP_SECURE || 'false').toLowerCase() === 'true';

  if (!host || !user || !pass) {
    throw new Error('SMTP credentials are not configured');
  }

  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass },
  });
};

const getFromAddress = () => {
  const fromEmail = process.env.FROM_EMAIL || process.env.SMTP_USER;
  const fromName = process.env.FROM_NAME || 'UrbanPro';
  return `${fromName} <${fromEmail}>`;
};

async function sendVerificationEmail({ to, link }) {
  const transporter = buildTransport();

  return transporter.sendMail({
    from: getFromAddress(),
    to,
    subject: 'Verify your UrbanPro email',
    text: `Welcome to UrbanPro! Verify your email: ${link}`,
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6;">
        <h2>Verify your email</h2>
        <p>Thanks for signing up with UrbanPro. Please verify your email to continue.</p>
        <p>
          <a href="${link}" style="display:inline-block;padding:10px 16px;background:#2563eb;color:#ffffff;text-decoration:none;border-radius:6px;">Verify Email</a>
        </p>
        <p>If the button does not work, copy and paste this link into your browser:</p>
        <p>${link}</p>
      </div>
    `,
  });
}

async function sendPasswordResetEmail({ to, link }) {
  const transporter = buildTransport();

  return transporter.sendMail({
    from: getFromAddress(),
    to,
    subject: 'Reset your UrbanPro password',
    text: `Reset your password here: ${link}`,
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6;">
        <h2>Reset Password</h2>
        <p>You requested a password reset for UrbanPro.</p>
        <p>
          <a href="${link}" style="display:inline-block;padding:10px 16px;background:#ef4444;color:#ffffff;text-decoration:none;border-radius:6px;">Reset Password</a>
        </p>
        <p>If you didn't request this, you can ignore this email.</p>
        <p>Link: ${link}</p>
      </div>
    `,
  });
}

module.exports = {
  sendVerificationEmail,
  sendPasswordResetEmail,
};
