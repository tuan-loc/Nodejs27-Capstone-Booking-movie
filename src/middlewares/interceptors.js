const { ResponseSuccess, ResponseError } = require("../utils/response");

const responseInterceptor = (req, res, next) => {
  const originalJson = res;
  res = function (code = 400, payload, message = "") {
    if (code >= 200 && code < 300) {
      const formattedData = ResponseSuccess(code, payload, message);
      return originalJson.call(res, formattedData);
    }

    const formattedData = ResponseError(code, payload, message);
    return originalJson.call(res, formattedData);
  };

  next();
};

module.exports = {
  responseInterceptor,
};
