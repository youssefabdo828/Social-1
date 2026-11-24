"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.port = void 0;
const dotenv_1 = require("dotenv");
const node_path_1 = require("node:path");
(0, dotenv_1.config)({ path: (0, node_path_1.resolve)(`./.${process.env.NODE_ENV || "dev"}.env`) });
exports.port = Number(process.env.PORT) || 3000;
//# sourceMappingURL=env.config.js.map