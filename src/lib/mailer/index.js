import transport from "./transport.js";

export default function sendEmail({ to, subject, html }) {
  return transport.sendMail({
    from: `Clinics Manager <${process.env.SMTP_USER}>`,
    to,
    subject,
    html,
  });
}
