export const TOKEN_EXPIRATION = Object.freeze({
  email_verification: 10 * 60 * 1000,
  password_reset: 10 * 60 * 1000,
  refresh_token: 7 * 24 * 60 * 60 * 1000,
  access_token: 15 * 60 * 1000,
});

export const TOKEN_TYPES = Object.freeze({
  email_verification: "email_verification",
  password_reset: "password_reset",
});

export const dummyHash =
  "$2a$10$vLsCj3I2SlNDFcETy/sqTufgXRCy8iYPjtWwSJXNCo1uvjOe2Y09O";
