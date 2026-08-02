import * as authService from "./auth.service.js";
const register = async (req, res, next) => {
  res.json({
    message: "Register endpoint",
  });
};
const login = async (req, res, next) => {
  res.json({
    message: "login endpoint",
  });
};

export { register, login };
