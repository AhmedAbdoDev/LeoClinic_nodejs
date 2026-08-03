import { issueToken } from "./token.service.js";

export const sendTokenEmail = async ({
  user,
  type,
  expiresIn,
  sendEmail,
  reuseToken = true,
}) => {
  const token = await issueToken({
    userId: user._id,
    type,
    expiresIn,
    reuse: reuseToken,
  });
  if (!token) return false;
  await sendEmail({
    to: user.email,
    token,
  });
  return true;
};
