require("dotenv").config();

module.exports = {
  secretKey: process.env.SECRET_KEY,
  expiresIn: process.env.EXPIRES_IN,
  url: process.env.URL_IMAGE,
};
