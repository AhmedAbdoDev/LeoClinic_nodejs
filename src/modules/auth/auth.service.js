import bcrypt from "bcrypt";

import User from "../../models/user.model.js";
import Specialty from "../../models/specialty.model.js";
import Session from "../../models/session.model.js";

import AppError from "../../error/AppError.js";
import verificationCodeModel from "../../models/verificationCode.model.js";
import {
  generateAccessToken,
  generateSecurityToken,
  hashToken,
} from "../../utils/jwt.js";
import { dummyHash, TOKEN_EXPIRATION, TOKEN_TYPES } from "./auth.constants.js";
import { sendEmailVerification, sendPasswordReset } from "./auth.helper.js";

const register = async ({ data }) => {
  if (data?.role === "doctor") {
    const specialty = await Specialty.findById(
      data?.doctorProfile?.specialty_id,
    );
    if (!specialty || !specialty.isActive || specialty.isDeleted)
      throw new AppError("Invalid specialtyId", 400);
  }
  const hashedPassword = await bcrypt.hash(data.password, 12);

  let user;

  try {
    user = await User.create({
      ...data,
      password: hashedPassword,
    });
  } catch (error) {
    if (error?.code === 11000) throw new AppError("Email already exists", 409);

    throw error;
  }
  await sendEmailVerification(user);
  return {
    message: "User registered successfully. Please verify your email.",
  };
};

const verifyEmail = async ({ token }) => {
  const hashedToken = hashToken(token);
  const tokenRecord = await verificationCodeModel
    .findOne({
      token: hashedToken,
      type: TOKEN_TYPES.email_verification,
      expires_at: {
        $gt: new Date(),
      },
    })
    .populate("user_id");
  let user = tokenRecord ? tokenRecord?.user_id : null;

  if (!tokenRecord || !user)
    throw new AppError("Invalid or expired verification token", 400);

  if (user.is_verified) throw new AppError("Email already verified", 400);

  user.is_verified = true;
  await user.save();
  await verificationCodeModel.deleteMany({
    user_id: user._id,
    type: TOKEN_TYPES.email_verification,
  });
  return {
    success: true,
    message: "Email verified successfully",
  };
};

const login = async ({ data }) => {
  const { email, password } = data;

  const user = await User.findOne({ email }).lean();

  const isMatch = await bcrypt.compare(password, user?.password || dummyHash);

  if (!user || !isMatch) throw new AppError("Invalid email or password", 401);

  if (!user.is_verified) {
    await sendEmailVerification(user);
    throw new AppError(
      "Email is not verified. A verification email has been sent if needed.",
      403,
    );
  }

  if (user.is_blocked)
    throw new AppError("Your account has been blocked.", 403);

  const { rawToken, hashedToken } = generateSecurityToken();
  const session = await Session.create({
    user_id: user._id,
    refresh_token: hashedToken,
    expires_at: new Date(Date.now() + TOKEN_EXPIRATION.refresh_token),
  });
  const accessToken = generateAccessToken({
    userId: user._id,
    role: user.role,
    sessionId: session._id,
  });

  const profile =
    user.role === "doctor" ? user.doctorProfile : user.patientProfile;

  return {
    accessToken,
    accessTokenExpiresIn: TOKEN_EXPIRATION.access_token / 1000,
    refreshToken: rawToken,
    user: {
      id: user.id,
      name: user.name,
      role: user.role,
      contact_number: user.contact_number,
      profile,
    },
  };
};

const logout = async ({ sessionId }) => {
  const result = await Session.updateOne(
    { _id: sessionId, revoked_at: null },
    { revoked_at: new Date() },
  );

  if (!result.matchedCount) throw new AppError("Unauthorized", 401);

  return true;
};

const resendVerification = async ({ email }) => {
  const user = await User.findOne({ email });

  if (user) {
    if (user.is_verified) throw new AppError("Email already verified.", 400);
    await sendEmailVerification(user);
  }
  return {
    message: "If an account exists, a verification email has been sent.",
  };
};

const refreshToken = async ({ refreshToken }) => {
  const hashedToken = hashToken(refreshToken);

  const session = await Session.findOne({
    refresh_token: hashedToken,
    revoked_at: null,
    expires_at: {
      $gt: new Date(),
    },
  }).populate("user_id");

  if (!session) throw new AppError("Invalid or expired refresh token", 401);

  const user = session.user_id;

  if (!user) throw new AppError("User not found", 404);

  if (!user.is_verified)
    throw new AppError("Please verify your email first.", 403);

  if (user.is_blocked)
    throw new AppError("Your account has been blocked.", 403);

  const { rawToken, hashedToken: newHashedToken } = generateSecurityToken();

  session.refresh_token = newHashedToken;
  session.expires_at = new Date(Date.now() + TOKEN_EXPIRATION.refresh_token);
  session.last_used_at = new Date();

  await session.save();

  return {
    accessToken: generateAccessToken({
      userId: user._id,
      role: user.role,
    }),
    accessTokenExpiresIn: TOKEN_EXPIRATION.access_token / 1000,
    refreshToken: rawToken,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      contact_number: user.contact_number,
      profile:
        user.role === "doctor" ? user.doctorProfile : user.patientProfile,
    },
  };
};

const requestPasswordReset = async ({ email }) => {
  const user = await User.findOne({
    email,
    is_blocked: false,
  });

  if (user) await sendPasswordReset(user);

  return {
    message: "If an account exists, a password reset email has been sent.",
  };
};
const verifyPasswordResetToken = async ({ token }) => {
  const hashedToken = hashToken(token);

  const tokenRecord = await verificationCodeModel.exists({
    token: hashedToken,
    type: TOKEN_TYPES.password_reset,
    expires_at: {
      $gt: new Date(),
    },
  });

  if (!tokenRecord)
    throw new AppError("Invalid or expired password reset token", 400);

  return {
    message: "Password reset token is valid",
  };
};
const submitNewPassword = async ({ token, newPassword }) => {
  const hashedToken = hashToken(token);

  const tokenRecord = await verificationCodeModel.findOne({
    token: hashedToken,
    type: TOKEN_TYPES.password_reset,
    expires_at: {
      $gt: new Date(),
    },
  });

  if (!tokenRecord)
    throw new AppError("Invalid or expired password reset token", 400);

  const hashedPassword = await bcrypt.hash(newPassword, 12);

  await User.updateOne(
    { _id: tokenRecord.user_id },
    {
      password: hashedPassword,
    },
  );

  await Session.deleteMany({
    user_id: tokenRecord.user_id,
  });

  await verificationCodeModel.deleteMany({
    user_id: tokenRecord.user_id,
    type: TOKEN_TYPES.password_reset,
  });

  return {
    message: "Password updated successfully",
  };
};
export {
  register,
  verifyEmail,
  login,
  resendVerification,
  logout,
  refreshToken,
  requestPasswordReset,
  verifyPasswordResetToken,
  submitNewPassword,
};
