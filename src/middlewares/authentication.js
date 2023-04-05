const jwt = require("jsonwebtoken");
const config = require("../config");
const { verifyToken } = require("../utils/jwt");
const { PrismaClient } = require("@prisma/client");
const { ResponseSuccess, ResponseError } = require("../utils/response");

const model = new PrismaClient();

const extractTokenFromHeaderString = (token = "") => {
  if (token === "") return [null, "Token is missing"];

  const parts = token?.split(" ");

  if (parts.length < 2 || parts[0] !== "Bearer" || parts[1] === "") {
    return [null, "Token invalid"];
  }

  return [parts[1], null];
};

const authenticate = async (req, res, next) => {
  try {
    const [token, error] = extractTokenFromHeaderString(
      req.header("Authorization")
    );

    if (error) {
      return res.json(ResponseError(401, error, null));
    }

    const payload = jwt.verify(token, config.secretKey);

    const { taiKhoan } = payload;

    const user = await model.NguoiDung.findFirst({
      where: { tai_khoan: taiKhoan },
    });
    req.user = user;
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      res.status(401).json(401, "Token is Expired");
    }
  }
};

const authorize =
  (...allowRoles) =>
  (req, res, next) => {
    const { loai_nguoi_dung } = req.user;

    const isAllow = allowRoles.some((item) => item === loai_nguoi_dung);

    if (!isAllow) {
      return res.status(403).json(403, "Forbidden");
    }

    next();
  };

module.exports = {
  authenticate,
  authorize,
};
