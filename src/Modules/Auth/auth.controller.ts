import { Router, type Request, type Response } from "express";
import authService from "./auth.service";
import { responseFormatter } from "../../Middlewares/response-formatter.middleware";
import { authenticate } from "../../Middlewares/authentication.middleware";
import { decodeRefreshToken } from "../../Middlewares/decodeRefreshToken.middleware";
import { validation } from "../../Middlewares/validation.middleware";
import * as validators from "./auth.validation";


const authController = Router();

authController.get("/health", (req, res) => {
 const result = authService.healthCheck();
  res.json(result);
});


authController.post("/signup",validation(validators.signup),responseFormatter(async (req: Request, res: Response) => {

    const result = await authService.signUp(req.body);
    return { message: "User created successfully", statusCode: 201, data: result };
}));

authController.post("/login",responseFormatter(async (req: Request, res: Response) => {

    const result = await authService.login(req.body);
   return { message: "User logged in successfully",statusCode:200, data: result };
}));

authController.post("/logout", authenticate, decodeRefreshToken, async (req: Request, res: Response) => {
  const result = await authService.logout(req.accessTokenData, req.refreshTokenData);
  res.status(200).json({ status: "User logged out successfully", data: result });
});


authController.patch("/confirm-email",validation(validators.loginConfirmation), async (req: Request, res: Response) => {
  const { email, otp } = req.body;
  const result = await authService.confirmEmail(email, otp);
  res.status(200).json({ message: "Email Confirmed successfully", data: result });
});


authController.post("/resend-email", validation(validators.resendEmail), async (req: Request, res: Response) => {
  const { email } = req.validate.body;
  const result = await authService.resendEmail(email);
  res.status(200).json({ message: "Verification code sent to your email", data: result });
});

authController.post(
  "/refresh-token",
  validation(validators.refreshToken),
  async (req, res) => {
    const result = await authService.refreshAccessToken(req.validate.body.refreshToken);
    res.status(200).json({ status: "Token refreshed successfully", data: result });
  });



  authController.post(
  "/forgot-password",
  validation(validators.forgotPassword),
  async (req, res) => {
    const { email } = req.validate.body;
    const result = await authService.forgotPassword(email);
    res.status(200).json({ message: "If the email exists, a verification code was sent", data: result });
  },
);

authController.patch(
  "/reset-password",
  validation(validators.resetPassword),
  async (req, res) => {
    const { email, otp, password } = req.validate.body;
    const result = await authService.resetPassword(email, otp, password);
    res.status(200).json({ message: "Password reset successfully", data: result });
  },
);


authController.post(
  "/google",
  validation(validators.googleSignIn),
  async (req, res) => {
    const { idToken } = req.validate.body;
    const result = await authService.googleSignIn(idToken);
    res.status(200).json({ status: "Signed in with Google successfully", data: result });
  },
);

export default authController;