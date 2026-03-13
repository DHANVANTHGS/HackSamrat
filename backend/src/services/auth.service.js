const {
  generateAuthenticationOptions,
  generateRegistrationOptions,
  verifyAuthenticationResponse,
  verifyRegistrationResponse,
} = require("@simplewebauthn/server");

const { config } = require("../config/env");
const { AppError } = require("../lib/errors");
const { comparePassword, fromBase64Url, generateToken, hashToken, toBase64Url } = require("../lib/security");
const { accessGrantRepository } = require("../repositories/access-grant.repository");
const { authChallengeRepository } = require("../repositories/auth-challenge.repository");
const { doctorRepository } = require("../repositories/doctor.repository");
const { sessionRepository } = require("../repositories/session.repository");
const { userRepository } = require("../repositories/user.repository");
const { webAuthnCredentialRepository } = require("../repositories/webauthn-credential.repository");
const { auditService } = require("./audit.service");

const anonymousAttemptStore = new Map();

const normalizeRoles = (user) => {
  const roles = new Set([user.role]);

  for (const assignment of user.roleAssignments || []) {
    roles.add(String(assignment.role.name || "").toUpperCase());
  }

  return Array.from(roles);
};

const collectPermissions = (user) => {
  const permissions = new Set();

  for (const assignment of user.roleAssignments || []) {
    for (const rolePermission of assignment.role.permissions || []) {
      permissions.add(rolePermission.permission.key);
    }
  }

  return Array.from(permissions);
};

const buildSessionResponse = (user, sessionToken, sessionRecord) => ({
  token: sessionToken,
  tokenType: "Bearer",
  expiresAt: sessionRecord.expiresAt,
  sessionId: sessionRecord.id,
  user: {
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    role: user.role,
    roles: normalizeRoles(user),
    permissions: collectPermissions(user),
    patientId: user.patient?.id ?? null,
    doctorId: user.doctor?.id ?? null,
  },
});

const getAttemptKey = (identifier, ipAddress) => `${identifier}:${ipAddress || "unknown"}`;

const ensureAnonymousAttemptsAllowed = (identifier, ipAddress) => {
  const key = getAttemptKey(identifier, ipAddress);
  const entry = anonymousAttemptStore.get(key);

  if (!entry) {
    return;
  }

  if (entry.lockedUntil && entry.lockedUntil > Date.now()) {
    throw new AppError("Too many failed attempts. Try again later.", 429, "AUTH_RATE_LIMITED");
  }

  if (entry.lockedUntil && entry.lockedUntil <= Date.now()) {
    anonymousAttemptStore.delete(key);
  }
};

const recordAnonymousFailure = (identifier, ipAddress) => {
  const key = getAttemptKey(identifier, ipAddress);
  const entry = anonymousAttemptStore.get(key) || { count: 0, lockedUntil: null };
  entry.count += 1;

  if (entry.count >= config.auth.maxLoginAttempts) {
    entry.lockedUntil = Date.now() + config.auth.lockoutMinutes * 60 * 1000;
  }

  anonymousAttemptStore.set(key, entry);
};

const clearAnonymousFailures = (identifier, ipAddress) => {
  anonymousAttemptStore.delete(getAttemptKey(identifier, ipAddress));
};

const ensureUserIsUnlocked = (user) => {
  if (user.lockedUntil && user.lockedUntil > new Date()) {
    throw new AppError("Account temporarily locked. Try again later.", 423, "ACCOUNT_LOCKED");
  }
};

const issueSession = async (user, requestContext) => {
  const rawToken = generateToken();
  const tokenHash = hashToken(rawToken);
  const expiresAt = new Date(Date.now() + config.auth.sessionTtlHours * 60 * 60 * 1000);

  const session = await sessionRepository.createSession({
    userId: user.id,
    token: tokenHash,
    status: "ACTIVE",
    ipAddress: requestContext.ipAddress,
    userAgent: requestContext.userAgent,
    expiresAt,
    lastSeenAt: new Date(),
  });

  return buildSessionResponse(user, rawToken, session);
};

const resolvePatientUserByEmail = async (email) => {
  const user = await userRepository.findPatientByEmail(email);

  if (!user || user.role !== "PATIENT" || !user.patient) {
    throw new AppError("Patient account not found.", 404, "PATIENT_NOT_FOUND");
  }

  ensureUserIsUnlocked(user);
  return user;
};

const saveChallenge = async (userId, type, challenge, requestContext) => {
  const expiresAt = new Date(Date.now() + config.auth.webauthnChallengeTtlMinutes * 60 * 1000);

  await authChallengeRepository.replaceActiveChallenge({
    userId,
    type,
    challenge,
    expiresAt,
    ipAddress: requestContext.ipAddress,
    userAgent: requestContext.userAgent,
  });
};

const requireChallenge = async (userId, type) => {
  const challenge = await authChallengeRepository.findValidChallenge(userId, type);

  if (!challenge) {
    throw new AppError("Challenge expired or not found.", 400, "CHALLENGE_NOT_FOUND");
  }

  return challenge;
};

const permissionScopeMap = {
  medical_records_read: new Set(["FULL_RECORDS", "PRESCRIPTIONS", "IMAGING"]),
  medical_records_write: new Set(["FULL_RECORDS", "PRESCRIPTIONS", "IMAGING"]),
  prescriptions: new Set(["FULL_RECORDS", "PRESCRIPTIONS"]),
  imaging: new Set(["FULL_RECORDS", "IMAGING"]),
  insurance: new Set(["FULL_RECORDS", "INSURANCE"]),
  claims: new Set(["FULL_RECORDS", "CLAIMS"]),
};

const getGrantScopesForPermission = (requiredPermission) => {
  if (!requiredPermission) {
    return null;
  }

  return permissionScopeMap[requiredPermission] || new Set(["FULL_RECORDS"]);
};

const authService = {
  async doctorLogin({ email, password, ipAddress, userAgent }) {
    ensureAnonymousAttemptsAllowed(email, ipAddress);

    const user = await userRepository.findDoctorByEmail(email);

    if (!user || user.role !== "DOCTOR" || !user.doctor || !user.passwordHash) {
      recordAnonymousFailure(email, ipAddress);
      await auditService.logAuthEvent({
        action: "LOGIN_FAILURE",
        targetResource: "user",
        reason: "Invalid doctor credentials",
        metadata: { email, strategy: "password" },
        ipAddress,
        userAgent,
      });
      throw new AppError("Invalid email or password.", 401, "INVALID_CREDENTIALS");
    }

    ensureUserIsUnlocked(user);

    const passwordMatches = await comparePassword(password, user.passwordHash);

    if (!passwordMatches) {
      await userRepository.recordFailedLogin(user.id, {
        maxAttempts: config.auth.maxLoginAttempts,
        lockoutMinutes: config.auth.lockoutMinutes,
      });
      await auditService.logAuthEvent({
        actorUserId: user.id,
        action: "LOGIN_FAILURE",
        targetResource: "user",
        targetResourceId: user.id,
        reason: "Invalid doctor credentials",
        metadata: { strategy: "password" },
        ipAddress,
        userAgent,
      });
      throw new AppError("Invalid email or password.", 401, "INVALID_CREDENTIALS");
    }

    await userRepository.resetLoginState(user.id, new Date());
    clearAnonymousFailures(email, ipAddress);

    const session = await issueSession(user, { ipAddress, userAgent });

    await auditService.logAuthEvent({
      actorUserId: user.id,
      action: "LOGIN_SUCCESS",
      targetResource: "session",
      targetResourceId: session.sessionId,
      reason: "Doctor login successful",
      metadata: { strategy: "password" },
      ipAddress,
      userAgent,
    });

    return session;
  },

  async startPatientRegistration({ email, ipAddress, userAgent }) {
    const user = await resolvePatientUserByEmail(email);
    const credentials = await webAuthnCredentialRepository.findByUserId(user.id);

    const options = await generateRegistrationOptions({
      rpName: config.auth.webauthn.rpName,
      rpID: config.auth.webauthn.rpId,
      userName: user.email,
      userID: Buffer.from(user.id),
      userDisplayName: `${user.firstName} ${user.lastName}`.trim(),
      attestationType: "none",
      excludeCredentials: credentials.map((credential) => ({
        id: credential.credentialId,
        transports: credential.transports,
      })),
      authenticatorSelection: {
        residentKey: "preferred",
        userVerification: "preferred",
      },
    });

    await saveChallenge(user.id, "WEBAUTHN_REGISTRATION", options.challenge, { ipAddress, userAgent });

    return {
      userId: user.id,
      patientId: user.patient.id,
      options,
    };
  },

  async verifyPatientRegistration({ email, response, ipAddress, userAgent }) {
    const user = await resolvePatientUserByEmail(email);
    const challenge = await requireChallenge(user.id, "WEBAUTHN_REGISTRATION");

    const verification = await verifyRegistrationResponse({
      response,
      expectedChallenge: challenge.challenge,
      expectedOrigin: config.auth.webauthn.origin,
      expectedRPID: config.auth.webauthn.rpId,
    });

    if (!verification.verified) {
      await auditService.logAuthEvent({
        actorUserId: user.id,
        action: "LOGIN_FAILURE",
        targetResource: "webauthn_registration",
        targetResourceId: user.id,
        reason: "Patient WebAuthn registration verification failed",
        metadata: { strategy: "webauthn_registration" },
        ipAddress,
        userAgent,
      });
      throw new AppError("WebAuthn registration could not be verified.", 400, "WEBAUTHN_REGISTRATION_FAILED");
    }

    const { credential, credentialDeviceType, credentialBackedUp } = verification.registrationInfo;

    await webAuthnCredentialRepository.upsertCredential({
      userId: user.id,
      credentialId: credential.id,
      publicKey: toBase64Url(credential.publicKey),
      counter: credential.counter,
      transports: response.response.transports || [],
      deviceType: credentialDeviceType,
      backedUp: credentialBackedUp,
      credentialType: "WEBAUTHN",
    });

    await authChallengeRepository.consume(challenge.id);
    await userRepository.resetLoginState(user.id, new Date());

    const session = await issueSession(user, { ipAddress, userAgent });

    await auditService.logAuthEvent({
      actorUserId: user.id,
      action: "LOGIN_SUCCESS",
      targetResource: "session",
      targetResourceId: session.sessionId,
      reason: "Patient WebAuthn registration completed",
      metadata: { strategy: "webauthn_registration" },
      ipAddress,
      userAgent,
    });

    return session;
  },

  async startPatientAuthentication({ email, ipAddress, userAgent }) {
    ensureAnonymousAttemptsAllowed(email, ipAddress);

    const user = await resolvePatientUserByEmail(email);
    const credentials = await webAuthnCredentialRepository.findByUserId(user.id);

    if (!credentials.length) {
      throw new AppError("No WebAuthn credentials registered for this patient.", 400, "WEBAUTHN_NOT_REGISTERED");
    }

    const options = await generateAuthenticationOptions({
      rpID: config.auth.webauthn.rpId,
      allowCredentials: credentials.map((credential) => ({
        id: credential.credentialId,
        transports: credential.transports,
      })),
      userVerification: "preferred",
    });

    await saveChallenge(user.id, "WEBAUTHN_AUTHENTICATION", options.challenge, { ipAddress, userAgent });

    return {
      userId: user.id,
      patientId: user.patient.id,
      options,
    };
  },

  async verifyPatientAuthentication({ email, response, ipAddress, userAgent }) {
    ensureAnonymousAttemptsAllowed(email, ipAddress);

    const user = await resolvePatientUserByEmail(email);
    const challenge = await requireChallenge(user.id, "WEBAUTHN_AUTHENTICATION");
    const storedCredential = await webAuthnCredentialRepository.findByCredentialId(response.id);

    if (!storedCredential || storedCredential.userId !== user.id) {
      recordAnonymousFailure(email, ipAddress);
      await auditService.logAuthEvent({
        actorUserId: user.id,
        action: "LOGIN_FAILURE",
        targetResource: "webauthn_authentication",
        targetResourceId: user.id,
        reason: "WebAuthn credential not found",
        metadata: { strategy: "webauthn_authentication" },
        ipAddress,
        userAgent,
      });
      throw new AppError("WebAuthn credential not found.", 404, "WEBAUTHN_CREDENTIAL_NOT_FOUND");
    }

    const verification = await verifyAuthenticationResponse({
      response,
      expectedChallenge: challenge.challenge,
      expectedOrigin: config.auth.webauthn.origin,
      expectedRPID: config.auth.webauthn.rpId,
      credential: {
        id: storedCredential.credentialId,
        publicKey: fromBase64Url(storedCredential.publicKey),
        counter: storedCredential.counter,
        transports: storedCredential.transports,
      },
    });

    if (!verification.verified) {
      await userRepository.recordFailedLogin(user.id, {
        maxAttempts: config.auth.maxLoginAttempts,
        lockoutMinutes: config.auth.lockoutMinutes,
      });
      recordAnonymousFailure(email, ipAddress);
      await auditService.logAuthEvent({
        actorUserId: user.id,
        action: "LOGIN_FAILURE",
        targetResource: "webauthn_authentication",
        targetResourceId: user.id,
        reason: "Patient WebAuthn authentication failed",
        metadata: { strategy: "webauthn_authentication" },
        ipAddress,
        userAgent,
      });
      throw new AppError("WebAuthn authentication failed.", 401, "WEBAUTHN_AUTHENTICATION_FAILED");
    }

    await webAuthnCredentialRepository.updateCounter(
      storedCredential.id,
      verification.authenticationInfo.newCounter,
      verification.authenticationInfo.credentialDeviceType,
      verification.authenticationInfo.credentialBackedUp,
    );
    await authChallengeRepository.consume(challenge.id);
    await userRepository.resetLoginState(user.id, new Date());
    clearAnonymousFailures(email, ipAddress);

    const session = await issueSession(user, { ipAddress, userAgent });

    await auditService.logAuthEvent({
      actorUserId: user.id,
      action: "LOGIN_SUCCESS",
      targetResource: "session",
      targetResourceId: session.sessionId,
      reason: "Patient WebAuthn authentication succeeded",
      metadata: { strategy: "webauthn_authentication" },
      ipAddress,
      userAgent,
    });

    return session;
  },

  async resolveSession(rawToken) {
    if (!rawToken) {
      throw new AppError("Authentication token is required.", 401, "AUTH_REQUIRED");
    }

    const tokenHash = hashToken(rawToken);
    const session = await sessionRepository.findActiveByToken(tokenHash);

    if (!session) {
      throw new AppError("Session is invalid or expired.", 401, "INVALID_SESSION");
    }

    await sessionRepository.touch(session.id);

    return {
      sessionId: session.id,
      userId: session.user.id,
      roles: normalizeRoles(session.user),
      permissions: collectPermissions(session.user),
      user: session.user,
      patientId: session.user.patient?.id ?? null,
      doctorId: session.user.doctor?.id ?? null,
      expiresAt: session.expiresAt,
      token: rawToken,
    };
  },

  async logout(authContext, requestContext) {
    await sessionRepository.revoke(authContext.sessionId);
    await auditService.logAuthEvent({
      actorUserId: authContext.userId,
      action: "LOGOUT_SUCCESS",
      targetResource: "session",
      targetResourceId: authContext.sessionId,
      reason: "Session revoked by logout",
      metadata: { strategy: "session" },
      ipAddress: requestContext.ipAddress,
      userAgent: requestContext.userAgent,
    });
  },

  async evaluatePatientAccess(authContext, patientId, options = {}) {
    const requiredScope = getGrantScopesForPermission(options.requiredPermission);

    if (authContext.roles.includes("ADMIN") || authContext.roles.includes("SUPPORT")) {
      return { allowed: true, scopes: ["FULL_RECORDS"], reason: "Administrative access" };
    }

    if (authContext.roles.includes("PATIENT") && authContext.patientId === patientId) {
      return { allowed: true, scopes: ["FULL_RECORDS"], reason: "Patient self access" };
    }

    if (!authContext.roles.includes("DOCTOR") || !authContext.doctorId) {
      return { allowed: false, scopes: [], reason: "Role not permitted" };
    }

    const doctor = await doctorRepository.findByUserId(authContext.userId);

    if (!doctor) {
      return { allowed: false, scopes: [], reason: "Doctor profile not found" };
    }

    const grants = await accessGrantRepository.findActiveForDoctorPatient(doctor.id, patientId);

    if (!grants.length) {
      return { allowed: false, scopes: [], reason: "No active patient consent grant" };
    }

    const scopes = grants.map((grant) => grant.scope);

    if (requiredScope) {
      const hasScope = scopes.some((scope) => requiredScope.has(scope));

      if (!hasScope) {
        return {
          allowed: false,
          scopes,
          reason: "Consent grant does not include the required scope",
        };
      }
    }

    return {
      allowed: true,
      scopes,
      reason: "Access granted by patient consent",
      grants,
      doctor,
    };
  },
};

module.exports = {
  authService,
};
