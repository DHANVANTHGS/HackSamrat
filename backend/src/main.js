const { app, logger } = require("./app");
const { config } = require("./config/env");

const server = app.listen(config.port, () => {
  logger.info("server.started", {
    appName: config.appName,
    port: config.port,
    apiPrefix: config.apiPrefix,
    nodeEnv: config.nodeEnv,
  });
});

// Debug: Keep the event loop alive to see if the server responds
setInterval(() => {
  // console.log("Keep-alive heartbeat...");
}, 5000);

process.on('exit', (code) => {
  console.log(`Process about to exit with code: ${code}`);
  console.trace("Exit stack trace:");
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});
