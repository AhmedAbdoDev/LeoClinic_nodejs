import { sendTokenEmail } from "../../services/mail.service.js";
import {
  sendVerificationEmail,
  sendResetPasswordEmail,
} from "../../utils/email.js";
import { TOKEN_EXPIRATION, TOKEN_TYPES } from "./auth.constants.js";

export const sendEmailVerification = async (user) => {
  try {
    await sendTokenEmail({
      user,
      type: TOKEN_TYPES.email_verification,
      expiresIn: TOKEN_EXPIRATION.email_verification,
      sendEmail: sendVerificationEmail,
    });
  } catch (err) {
    console.error("Failed to send verification email:", err);
  }
};

export const sendPasswordReset = async (user) => {
  try {
    await sendTokenEmail({
      user,
      type: TOKEN_TYPES.password_reset,
      expiresIn: TOKEN_EXPIRATION.password_reset,
      sendEmail: sendResetPasswordEmail,
    });
  } catch (err) {
    console.error("Failed to send password reset email:", err);
  }
};

export const mapUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  contact_number: user.contact_number,
  is_verified: user.is_verified,
  profile: user.role === "doctor" ? user.doctorProfile : user.patientProfile,
});
