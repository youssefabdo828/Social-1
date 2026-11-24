class HttpAppError extends Error {
  statusCode: number;
  data: unknown;
  code: string;

  constructor(
    message: string,
    statusCode: number = 400,
    data: object | null = null,
    code: string = "BAD_REQUEST"
  ) {
    super(message);
    this.statusCode = statusCode;
    this.data = data;
    this.code = code;
  }
}

export default HttpAppError;