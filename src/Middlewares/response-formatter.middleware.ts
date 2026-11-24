import { Request, Response, NextFunction } from "express";



export const responseFormatter = (handler: Function) => {
 return async (req: Request, res: Response, next: NextFunction) => {
 const result = await handler(req, res, next);
 if(res.headersSent) return;
 return res.status(result.statusCode || 200).json({ success: true, message: "Request successful", data: result, metadata: result.metadata });
 }
}