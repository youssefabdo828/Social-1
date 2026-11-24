import express from "express";
import authController from "./Modules/Auth/auth.controller";
import userController from "./Modules/User/user.controller";
import envConfig from "./config/env.config";
import connectDB from "./DB/db.connection";
import { redisConnection } from "./common/Clients/redis.client";
import globalErrorHandler from "./Middlewares/global-error-handler";

const port = envConfig.port || 3000;

const app: express.Application = express();





function initializeControllers(app: express.Application) {

app.get("/", (req, res) => {
  res.json({ message: "Social app is running" });
});

app.use('/auth', authController);
app.use('/user', userController);


  app.use((req, res, next) => {
    res.status(404).json({ message: "Route not found" });
  });

  app.use(globalErrorHandler);
}



function initializeGlobalMiddleware(app: express.Application) {
  app.use(express.json());
}

initializeGlobalMiddleware(app);
initializeControllers(app);

connectDB();
redisConnection();

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});