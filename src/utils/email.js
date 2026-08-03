import transporter from "../lib/mailer/transport.js";

export const sendVerificationEmail = async ({ to, token }) => {
  const url = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to,
    subject: "Verify your email",
    html: `
      <h2>Email Verification</h2>
      <p>Click the link below to verify your account:</p>
      <a href="${url}">${url}</a>
    `,
  });
};

export const sendResetPasswordEmail = async ({ to, token }) => {
  const url = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to,
    subject: "Reset your password",
    html: `
      <h2>Password Reset</h2>
      <p>Click the link below to reset your password:</p>
      <a href="${url}">${url}</a>
    `,
  });
};
