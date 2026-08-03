import verificationCodeModel from "../models/verificationCode.model.js";
import { generateSecurityToken } from "../utils/jwt.js";

export const issueToken = async ({ userId, type, expiresIn, reuse = true }) => {
  if (reuse) {
    const existing = await verificationCodeModel.findOne({
      user_id: userId,
      type,
      expires_at: { $gt: new Date() },
    });
    if (existing) return null;
  }

  const { rawToken, hashedToken } = generateSecurityToken();

  await verificationCodeModel.create({
    user_id: userId,
    type,
    token: hashedToken,
    expires_at: new Date(Date.now() + expiresIn),
  });

  return rawToken;
};
