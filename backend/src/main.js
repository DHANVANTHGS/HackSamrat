const { app, logger } = require("./app");
const { config } = require("./config/env");

app.listen(config.port, () => {
  logger.info("server.started", {
    appName: config.appName,
    port: config.port,
    apiPrefix: config.apiPrefix,
    nodeEnv: config.nodeEnv,
  });
});
