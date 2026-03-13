const {
  PrismaClient,
  UserRoleType,
  UserStatus,
  SessionStatus,
  MedicalRecordType,
  ClaimStatus,
  NotificationType,
  AuditAction,
  AnchorStatus,
  AccessScope,
} = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");
const bcrypt = require("bcryptjs");
const dotenv = require("dotenv");

dotenv.config();

const schema = process.env.POSTGRES_SCHEMA || "public";
const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }, { schema }),
});

const seedIds = {
  doctorVerification: "seed-doctor-verification-1",
  medicalRecord: "seed-medical-record-1",
  accessGrant: "seed-access-grant-1",
  notification: "seed-notification-1",
  aiConversation: "seed-ai-conversation-1",
  aiMessage: "seed-ai-message-1",
  auditLog: "seed-audit-log-1",
  blockchainAnchor: "seed-blockchain-anchor-1",
};

async function main() {
  const doctorPasswordHash = await bcrypt.hash("Doctor@123", 12);

  const permissions = [
    { key: "records.read", description: "Read medical records" },
    { key: "records.write", description: "Upload medical records" },
    { key: "claims.manage", description: "Manage claims" },
    { key: "audit.read", description: "Read audit logs" },
  ];

  for (const permission of permissions) {
    await prisma.permission.upsert({
      where: { key: permission.key },
      update: permission,
      create: permission,
    });
  }

  const patientRole = await prisma.role.upsert({
    where: { name: "patient" },
    update: { description: "Patient access role" },
    create: { name: "patient", description: "Patient access role" },
  });

  const doctorRole = await prisma.role.upsert({
    where: { name: "doctor" },
    update: { description: "Doctor access role" },
    create: { name: "doctor", description: "Doctor access role" },
  });

  const adminRole = await prisma.role.upsert({
    where: { name: "admin" },
    update: { description: "Administrator role" },
    create: { name: "admin", description: "Administrator role" },
  });

  const permissionMap = Object.fromEntries(
    (
      await prisma.permission.findMany({
        where: { key: { in: permissions.map((permission) => permission.key) } },
      })
    ).map((permission) => [permission.key, permission.id]),
  );

  for (const [roleId, permissionId] of [
    [patientRole.id, permissionMap["records.read"]],
    [doctorRole.id, permissionMap["records.read"]],
    [doctorRole.id, permissionMap["records.write"]],
    [adminRole.id, permissionMap["claims.manage"]],
    [adminRole.id, permissionMap["audit.read"]],
  ]) {
    await prisma.rolePermission.upsert({
      where: { roleId_permissionId: { roleId, permissionId } },
      update: {},
      create: { roleId, permissionId },
    });
  }

  const organization = await prisma.organization.upsert({
    where: { registrationId: "ORG-HS-001" },
    update: { name: "HackSamrat Health Network", type: "HOSPITAL_GROUP" },
    create: {
      name: "HackSamrat Health Network",
      type: "HOSPITAL_GROUP",
      registrationId: "ORG-HS-001",
    },
  });

  const hospital = await prisma.hospital.upsert({
    where: { code: "HSH-CENTRAL" },
    update: {
      name: "HackSamrat Central Hospital",
      city: "Hyderabad",
      state: "Telangana",
      country: "India",
      organizationId: organization.id,
    },
    create: {
      code: "HSH-CENTRAL",
      name: "HackSamrat Central Hospital",
      city: "Hyderabad",
      state: "Telangana",
      country: "India",
      organizationId: organization.id,
    },
  });

  const patientUser = await prisma.user.upsert({
    where: { email: "patient.demo@hacksamrat.local" },
    update: {
      phone: "+919900000001",
      firstName: "Priya",
      lastName: "Sharma",
      role: UserRoleType.PATIENT,
      status: UserStatus.ACTIVE,
    },
    create: {
      email: "patient.demo@hacksamrat.local",
      phone: "+919900000001",
      firstName: "Priya",
      lastName: "Sharma",
      role: UserRoleType.PATIENT,
      status: UserStatus.ACTIVE,
    },
  });

  const doctorUser = await prisma.user.upsert({
    where: { email: "doctor.demo@hacksamrat.local" },
    update: {
      phone: "+919900000002",
      firstName: "Arjun",
      lastName: "Reddy",
      passwordHash: doctorPasswordHash,
      role: UserRoleType.DOCTOR,
      status: UserStatus.ACTIVE,
    },
    create: {
      email: "doctor.demo@hacksamrat.local",
      phone: "+919900000002",
      firstName: "Arjun",
      lastName: "Reddy",
      passwordHash: doctorPasswordHash,
      role: UserRoleType.DOCTOR,
      status: UserStatus.ACTIVE,
    },
  });

  await prisma.userRole.upsert({
    where: { userId_roleId: { userId: patientUser.id, roleId: patientRole.id } },
    update: {},
    create: { userId: patientUser.id, roleId: patientRole.id },
  });

  await prisma.userRole.upsert({
    where: { userId_roleId: { userId: doctorUser.id, roleId: doctorRole.id } },
    update: {},
    create: { userId: doctorUser.id, roleId: doctorRole.id },
  });

  const patient = await prisma.patient.upsert({
    where: { userId: patientUser.id },
    update: {
      patientCode: "PAT-0001",
      gender: "female",
      bloodGroup: "O+",
      healthSummary: "Asthma history. No active admission.",
      emergencyContactName: "Rohan Sharma",
      emergencyContactPhone: "+919900000099",
    },
    create: {
      userId: patientUser.id,
      patientCode: "PAT-0001",
      gender: "female",
      bloodGroup: "O+",
      healthSummary: "Asthma history. No active admission.",
      emergencyContactName: "Rohan Sharma",
      emergencyContactPhone: "+919900000099",
    },
  });

  const doctor = await prisma.doctor.upsert({
    where: { userId: doctorUser.id },
    update: {
      doctorCode: "DOC-0001",
      specialty: "Pulmonology",
      licenseNumber: "LIC-HS-0001",
      verificationStatus: "VERIFIED",
      organizationId: organization.id,
      hospitalId: hospital.id,
    },
    create: {
      userId: doctorUser.id,
      doctorCode: "DOC-0001",
      specialty: "Pulmonology",
      licenseNumber: "LIC-HS-0001",
      verificationStatus: "VERIFIED",
      organizationId: organization.id,
      hospitalId: hospital.id,
    },
  });

  await prisma.doctorVerification.upsert({
    where: { id: seedIds.doctorVerification },
    update: {
      doctorId: doctor.id,
      verificationType: "LICENSE",
      status: "VERIFIED",
      verifiedAt: new Date(),
      notes: "Seeded verification entry",
    },
    create: {
      id: seedIds.doctorVerification,
      doctorId: doctor.id,
      verificationType: "LICENSE",
      status: "VERIFIED",
      verifiedAt: new Date(),
      notes: "Seeded verification entry",
    },
  });

  await prisma.emergencyAccessSetting.upsert({
    where: { patientId: patient.id },
    update: {
      enabled: true,
      allowCriticalOnly: true,
      unlockWindowMinutes: 45,
    },
    create: {
      patientId: patient.id,
      enabled: true,
      allowCriticalOnly: true,
      unlockWindowMinutes: 45,
    },
  });

  const policy = await prisma.insurancePolicy.upsert({
    where: { policyNumber: "POL-HS-2026-0001" },
    update: {
      patientId: patient.id,
      organizationId: organization.id,
      providerName: "HackSamrat Assurance",
      planName: "Gold Plus",
      coverageLimit: "500000.00",
      usedCoverage: "125000.00",
      premiumAmount: "15000.00",
      validFrom: new Date("2026-01-01T00:00:00.000Z"),
      validTo: new Date("2026-12-31T23:59:59.000Z"),
    },
    create: {
      patientId: patient.id,
      organizationId: organization.id,
      providerName: "HackSamrat Assurance",
      policyNumber: "POL-HS-2026-0001",
      planName: "Gold Plus",
      coverageLimit: "500000.00",
      usedCoverage: "125000.00",
      premiumAmount: "15000.00",
      validFrom: new Date("2026-01-01T00:00:00.000Z"),
      validTo: new Date("2026-12-31T23:59:59.000Z"),
    },
  });

  await prisma.insuranceBenefit.upsert({
    where: { insurancePolicyId_benefitCode: { insurancePolicyId: policy.id, benefitCode: "CONSULT" } },
    update: {
      label: "Consultation Coverage",
      annualLimit: "50000.00",
      usedAmount: "12000.00",
      description: "Outpatient consultation benefits",
    },
    create: {
      insurancePolicyId: policy.id,
      benefitCode: "CONSULT",
      label: "Consultation Coverage",
      annualLimit: "50000.00",
      usedAmount: "12000.00",
      description: "Outpatient consultation benefits",
    },
  });

  const claim = await prisma.claim.upsert({
    where: { claimNumber: "CLM-HS-2026-0001" },
    update: {
      patientId: patient.id,
      insurancePolicyId: policy.id,
      status: ClaimStatus.UNDER_REVIEW,
      title: "Pulmonary treatment reimbursement",
      description: "Claim for outpatient pulmonary treatment and diagnostics.",
      amountClaimed: "24000.00",
      submittedAt: new Date("2026-02-15T10:00:00.000Z"),
    },
    create: {
      patientId: patient.id,
      insurancePolicyId: policy.id,
      claimNumber: "CLM-HS-2026-0001",
      status: ClaimStatus.UNDER_REVIEW,
      title: "Pulmonary treatment reimbursement",
      description: "Claim for outpatient pulmonary treatment and diagnostics.",
      amountClaimed: "24000.00",
      submittedAt: new Date("2026-02-15T10:00:00.000Z"),
    },
  });

  const record = await prisma.medicalRecord.upsert({
    where: { id: seedIds.medicalRecord },
    update: {
      patientId: patient.id,
      uploadedByUserId: patientUser.id,
      uploadedByDoctorId: doctor.id,
      title: "Pulmonary consultation summary",
      description: "Initial seed medical record",
      recordType: MedicalRecordType.REPORT,
      verificationStatus: "VERIFIED",
      source: "hospital-portal",
    },
    create: {
      id: seedIds.medicalRecord,
      patientId: patient.id,
      uploadedByUserId: patientUser.id,
      uploadedByDoctorId: doctor.id,
      title: "Pulmonary consultation summary",
      description: "Initial seed medical record",
      recordType: MedicalRecordType.REPORT,
      verificationStatus: "VERIFIED",
      source: "hospital-portal",
    },
  });

  await prisma.recordFile.upsert({
    where: { storageKey: `records/${patient.patientCode}/consultation-summary.pdf` },
    update: {
      medicalRecordId: record.id,
      originalName: "consultation-summary.pdf",
      mimeType: "application/pdf",
      fileSizeBytes: 204800,
    },
    create: {
      medicalRecordId: record.id,
      storageKey: `records/${patient.patientCode}/consultation-summary.pdf`,
      originalName: "consultation-summary.pdf",
      mimeType: "application/pdf",
      fileSizeBytes: 204800,
    },
  });

  await prisma.claimDocument.upsert({
    where: { storageKey: `claims/${claim.claimNumber}/invoice.pdf` },
    update: {
      claimId: claim.id,
      originalName: "invoice.pdf",
      mimeType: "application/pdf",
      fileSizeBytes: 102400,
    },
    create: {
      claimId: claim.id,
      storageKey: `claims/${claim.claimNumber}/invoice.pdf`,
      originalName: "invoice.pdf",
      mimeType: "application/pdf",
      fileSizeBytes: 102400,
    },
  });

  await prisma.accessGrant.upsert({
    where: { id: seedIds.accessGrant },
    update: {
      patientId: patient.id,
      doctorId: doctor.id,
      scope: AccessScope.FULL_RECORDS,
      status: "ACTIVE",
      reason: "Seeded care-team access",
    },
    create: {
      id: seedIds.accessGrant,
      patientId: patient.id,
      doctorId: doctor.id,
      scope: AccessScope.FULL_RECORDS,
      status: "ACTIVE",
      reason: "Seeded care-team access",
    },
  });

  await prisma.notification.upsert({
    where: { id: seedIds.notification },
    update: {
      userId: patientUser.id,
      type: NotificationType.CLAIM_UPDATE,
      title: "Claim moved to under review",
      message: "Your seeded demo claim is now under review.",
    },
    create: {
      id: seedIds.notification,
      userId: patientUser.id,
      type: NotificationType.CLAIM_UPDATE,
      title: "Claim moved to under review",
      message: "Your seeded demo claim is now under review.",
    },
  });

  const session = await prisma.session.upsert({
    where: { token: "seed-session-token-patient" },
    update: {
      userId: patientUser.id,
      refreshToken: "seed-session-refresh-patient",
      status: SessionStatus.ACTIVE,
      expiresAt: new Date("2026-12-31T23:59:59.000Z"),
    },
    create: {
      userId: patientUser.id,
      token: "seed-session-token-patient",
      refreshToken: "seed-session-refresh-patient",
      status: SessionStatus.ACTIVE,
      expiresAt: new Date("2026-12-31T23:59:59.000Z"),
    },
  });

  await prisma.webAuthnCredential.upsert({
    where: { credentialId: "seed-webauthn-credential-1" },
    update: {
      userId: patientUser.id,
      publicKey: "seed-public-key",
      transports: ["internal"],
    },
    create: {
      userId: patientUser.id,
      credentialId: "seed-webauthn-credential-1",
      publicKey: "seed-public-key",
      transports: ["internal"],
    },
  });

  const conversation = await prisma.aIConversation.upsert({
    where: { id: seedIds.aiConversation },
    update: {
      userId: patientUser.id,
      patientId: patient.id,
      title: "Insurance assistant demo",
      lastMessageAt: new Date(),
    },
    create: {
      id: seedIds.aiConversation,
      userId: patientUser.id,
      patientId: patient.id,
      title: "Insurance assistant demo",
      lastMessageAt: new Date(),
    },
  });

  await prisma.aIMessage.upsert({
    where: { id: seedIds.aiMessage },
    update: {
      conversationId: conversation.id,
      role: "assistant",
      content: "Your claim is currently under review and pending insurer verification.",
      grounded: true,
    },
    create: {
      id: seedIds.aiMessage,
      conversationId: conversation.id,
      role: "assistant",
      content: "Your claim is currently under review and pending insurer verification.",
      grounded: true,
    },
  });

  const auditLog = await prisma.auditLog.upsert({
    where: { id: seedIds.auditLog },
    update: {
      actorUserId: patientUser.id,
      action: AuditAction.CLAIM_CREATED,
      targetResource: "claim",
      targetResourceId: claim.id,
      reason: "Seeded bootstrap audit event",
      metadata: { sessionId: session.id },
    },
    create: {
      id: seedIds.auditLog,
      actorUserId: patientUser.id,
      action: AuditAction.CLAIM_CREATED,
      targetResource: "claim",
      targetResourceId: claim.id,
      reason: "Seeded bootstrap audit event",
      metadata: { sessionId: session.id },
    },
  });

  await prisma.blockchainAnchor.upsert({
    where: { id: seedIds.blockchainAnchor },
    update: {
      auditLogId: auditLog.id,
      sourceEntityType: "audit_log",
      sourceEntityId: auditLog.id,
      digest: "0xseededblockchaindigest",
      chainName: "polygon-amoy",
      status: AnchorStatus.PENDING,
    },
    create: {
      id: seedIds.blockchainAnchor,
      auditLogId: auditLog.id,
      sourceEntityType: "audit_log",
      sourceEntityId: auditLog.id,
      digest: "0xseededblockchaindigest",
      chainName: "polygon-amoy",
      status: AnchorStatus.PENDING,
    },
  });

  console.log("Seed completed successfully.");
}

main()
  .catch((error) => {
    console.error("Seed failed", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

