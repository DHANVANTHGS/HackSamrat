const { AppError } = require("../lib/errors");
const { authService } = require("../services/auth.service");

const readBearerToken = (request) => {
  const header = request.headers.authorization || "";

  if (!header.startsWith("Bearer ")) {
    return null;
  }

  return header.slice("Bearer ".length).trim();
};

const requireAuth = async (request, response, next) => {
  try {
    const token = readBearerToken(request);
    request.auth = await authService.resolveSession(token);
    next();
  } catch (error) {
    next(error);
  }
};

const requireRoles = (...roles) => (request, response, next) => {
  if (!request.auth) {
    next(new AppError("Authentication required.", 401, "AUTH_REQUIRED"));
    return;
  }

  const hasRole = roles.some((role) => request.auth.roles.includes(role));

  if (!hasRole) {
    next(new AppError("Insufficient role for this action.", 403, "FORBIDDEN"));
    return;
  }

  next();
};

const requirePatientAccess = ({ patientIdParam = "patientId", requiredPermission } = {}) => async (request, response, next) => {
  try {
    if (!request.auth) {
      throw new AppError("Authentication required.", 401, "AUTH_REQUIRED");
    }

    const patientId = request.params[patientIdParam];

    if (!patientId) {
      throw new AppError("Patient id is required.", 400, "VALIDATION_ERROR");
    }

    const decision = await authService.evaluatePatientAccess(request.auth, patientId, { requiredPermission });

    if (!decision.allowed) {
      throw new AppError(decision.reason, 403, "CONSENT_REQUIRED", decision);
    }

    request.accessDecision = decision;
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = {
  readBearerToken,
  requireAuth,
  requirePatientAccess,
  requireRoles,
};
