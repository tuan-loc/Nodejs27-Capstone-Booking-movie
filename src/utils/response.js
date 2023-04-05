const ResponseSuccess = (code, data, message = "") => {
  const resp = { success: true };

  if (message) {
    resp.message = message;
  }

  return { data, ...resp };
};

const ResponseError = (code, error, message = "") => {
  const resp = { success: false };

  if (message) {
    resp.message = message;
  }

  if (Array.isArray(error) && error.length > 0) {
    resp.errors = error.map((e) => e.message);
  } else if (typeof error === "object") {
    resp.errors = { error: message };
  } else {
    resp.errors = [error];
  }

  if (code) {
    resp.statusCode = code;
  }

  return resp;
};

module.exports = {
  ResponseSuccess,
  ResponseError,
};
