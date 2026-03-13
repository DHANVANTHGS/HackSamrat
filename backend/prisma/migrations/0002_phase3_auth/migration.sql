ALTER TYPE "hacksamrat"."AuditAction" ADD VALUE IF NOT EXISTS 'LOGOUT_SUCCESS';

CREATE TYPE "hacksamrat"."AuthChallengeType" AS ENUM ('WEBAUTHN_REGISTRATION', 'WEBAUTHN_AUTHENTICATION');

ALTER TABLE "hacksamrat"."User"
ADD COLUMN "failedLoginAttempts" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "lockedUntil" TIMESTAMP(3);

CREATE TABLE "hacksamrat"."AuthChallenge" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "hacksamrat"."AuthChallengeType" NOT NULL,
    "challenge" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "consumedAt" TIMESTAMP(3),
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AuthChallenge_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "AuthChallenge_challenge_key" ON "hacksamrat"."AuthChallenge"("challenge");
CREATE INDEX "AuthChallenge_userId_type_expiresAt_idx" ON "hacksamrat"."AuthChallenge"("userId", "type", "expiresAt");

ALTER TABLE "hacksamrat"."AuthChallenge"
ADD CONSTRAINT "AuthChallenge_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "hacksamrat"."User"("id")
ON DELETE CASCADE ON UPDATE CASCADE;
