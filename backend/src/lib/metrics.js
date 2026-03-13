const metricsState = {
  startedAt: new Date().toISOString(),
  requestsTotal: 0,
  requestsByStatus: {},
  errorsTotal: 0,
  lastRequestAt: null,
  averageDurationMs: 0,
};

const recordRequestMetric = ({ statusCode, durationMs }) => {
  metricsState.requestsTotal += 1;
  metricsState.lastRequestAt = new Date().toISOString();
  metricsState.requestsByStatus[statusCode] = (metricsState.requestsByStatus[statusCode] || 0) + 1;

  const n = metricsState.requestsTotal;
  metricsState.averageDurationMs = Number(
    ((metricsState.averageDurationMs * (n - 1) + durationMs) / n).toFixed(2),
  );

  if (statusCode >= 500) {
    metricsState.errorsTotal += 1;
  }
};

const getMetricsSnapshot = () => ({ ...metricsState });

module.exports = {
  getMetricsSnapshot,
  recordRequestMetric,
};
