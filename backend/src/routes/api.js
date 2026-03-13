const express = require("express");

const { config } = require("../config/env");
const { getDependencyStatus } = require("../lib/readiness");
const accessGrantRoutes = require("../modules/access-grants/routes");
const adminRoutes = require("../modules/admin/routes");
const aiRoutes = require("../modules/ai/routes");
const authRoutes = require("../modules/auth/routes");
const blockchainRoutes = require("../modules/blockchain/routes");
const claimsRoutes = require("../modules/claims/routes");
const doctorRoutes = require("../modules/doctors/routes");
const emergencyRoutes = require("../modules/emergency/routes");
const insuranceRoutes = require("../modules/insurance/routes");
const notificationsRoutes = require("../modules/notifications/routes");
const patientRoutes = require("../modules/patients/routes");
const metaRoutes = require("../modules/meta/routes");

const router = express.Router();

router.get("/health", (request, response) => {
  response.json({
    success: true,
    data: {
      status: "ok",
      service: config.appName,
      timestamp: new Date().toISOString(),
    },
  });
});

router.get("/ready", async (request, response) => {
  const dependencies = await getDependencyStatus(config);
  const isReady = dependencies.postgres.connected !== false;

  response.status(isReady ? 200 : 503).json({
    success: isReady,
    data: {
      status: isReady ? "ready" : "degraded",
      dependencies,
    },
  });
});

router.use("/auth", authRoutes);
router.use("/patients", patientRoutes);
router.use("/patients/me/ai", aiRoutes);
router.use("/doctors", doctorRoutes);
router.use("/insurance", insuranceRoutes);
router.use("/claims", claimsRoutes);
router.use("/notifications", notificationsRoutes);
router.use("/access-grants", accessGrantRoutes);
router.use("/emergency", emergencyRoutes);
router.use("/blockchain", blockchainRoutes);
router.use("/admin", adminRoutes);
router.use("/meta", metaRoutes);

module.exports = router;
