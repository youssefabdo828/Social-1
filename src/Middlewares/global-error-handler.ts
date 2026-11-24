import fs from "node:fs";
import type { ErrorRequestHandler } from "express";

interface IHttpError extends Error {
  statusCode?: number;
  code?: string;
  data?: unknown;
}

const globalErrorHandler: ErrorRequestHandler = (err: IHttpError, req, res, _next) => {
  console.error(err);

  if (req.file?.path) {
    fs.unlink(req.file.path, () => {});
  }

  let statusCode = err.statusCode || 500;
  let message = err.message || "Internal Server Error";
  let code = err.code;

  if (err.name === "TokenExpiredError") {
    statusCode = 401;
    message = "Token expired";
    code = "TOKEN_EXPIRED";
  } else if (err.name === "JsonWebTokenError") {
    statusCode = 401;
    message = "Invalid token";
    code = "INVALID_TOKEN";
  }

  res.status(statusCode).json({
    message,
    errorbody: err.data,
    code,
  });
};

export default globalErrorHandler;