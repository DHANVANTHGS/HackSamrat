const levelWeights = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
};

const createLogger = (level = "info") => {
  const writeLog = (logLevel, message, context = {}) => {
    if (levelWeights[logLevel] < levelWeights[level]) {
      return;
    }

    const payload = {
      timestamp: new Date().toISOString(),
      level: logLevel,
      message,
      ...context,
    };

    const line = JSON.stringify(payload);

    if (logLevel === "error") {
      console.error(line);
      return;
    }

    console.log(line);
  };

  return {
    debug: (message, context) => writeLog("debug", message, context),
    info: (message, context) => writeLog("info", message, context),
    warn: (message, context) => writeLog("warn", message, context),
    error: (message, context) => writeLog("error", message, context),
  };
};

module.exports = {
  createLogger,
};
