"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = require("./app");
const config_1 = require("./config");
app_1.app.listen(config_1.config.port, () => {
    app_1.logger.info("server.started", {
        appName: config_1.config.appName,
        port: config_1.config.port,
        apiPrefix: config_1.config.apiPrefix,
        nodeEnv: config_1.config.nodeEnv,
    });
});
//# sourceMappingURL=main.js.map