"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const env_config_1 = require("./config/env.config");
const app = (0, express_1.default)();
app.get("/", (req, res) => {
    res.json({ message: "Social app is running" });
});
function initializeControllers() {
    // Initialize your controllers here
    // Example: app.use("/api/users", userController);
}
function initializeGlobalMiddleware() {
    // Initialize your global middleware here
    // Example: app.use(cors());
}
app.listen(env_config_1.port, () => {
    console.log(`Server is running on port ${env_config_1.port}`);
});
//# sourceMappingURL=index.js.map