ALTER TABLE "hacksamrat"."Claim"
ADD COLUMN "insurerReference" TEXT,
ADD COLUMN "insurerDecisionAt" TIMESTAMP(3),
ADD COLUMN "insurerDecision" TEXT,
ADD COLUMN "decisionNotes" TEXT,
ADD COLUMN "payoutAmount" DECIMAL(12,2),
ADD COLUMN "payoutReference" TEXT,
ADD COLUMN "payoutProcessedAt" TIMESTAMP(3);

CREATE TABLE "hacksamrat"."ClaimStatusHistory" (
    "id" TEXT NOT NULL,
    "claimId" TEXT NOT NULL,
    "actorUserId" TEXT,
    "fromStatus" "hacksamrat"."ClaimStatus",
    "toStatus" "hacksamrat"."ClaimStatus" NOT NULL,
    "note" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ClaimStatusHistory_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "ClaimStatusHistory_claimId_createdAt_idx" ON "hacksamrat"."ClaimStatusHistory"("claimId", "createdAt");

ALTER TABLE "hacksamrat"."ClaimStatusHistory"
ADD CONSTRAINT "ClaimStatusHistory_claimId_fkey"
FOREIGN KEY ("claimId") REFERENCES "hacksamrat"."Claim"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "hacksamrat"."ClaimStatusHistory"
ADD CONSTRAINT "ClaimStatusHistory_actorUserId_fkey"
FOREIGN KEY ("actorUserId") REFERENCES "hacksamrat"."User"("id")
ON DELETE SET NULL ON UPDATE CASCADE;
