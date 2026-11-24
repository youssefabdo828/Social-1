import HttpAppError from "./app.error";

export class BadRequestException extends HttpAppError {
  constructor(message = "bad request", data: object | null, code = "BAD_REQUEST") {
    super(message, 400, data, code);
  }
}       

export class ConflictException extends HttpAppError {
  constructor(message = "Conflict", data: object | null, code = "CONFLICT") {
    super(message, 409, data, code);
  }
}

export class NotFoundException extends HttpAppError {
  constructor(message = "Not found", data: object | null, code = "NOT_FOUND") {
    super(message, 404, data, code);
  }
}

export class UnauthorizedException extends HttpAppError {
  constructor(message = "Unauthorized", data: object | null, code = "UNAUTHORIZED") {
    super(message, 401, data, code);
  }
}

export class ForbiddenException extends HttpAppError {
  constructor(message = "Forbidden", data: object | null, code = "FORBIDDEN") {
    super(message, 403, data, code);
  }
}

export class TooManyRequestsException extends HttpAppError {
  constructor(message: string, data?: object | null, code?: string) {
    super(message, 429, data, code);
  }
}