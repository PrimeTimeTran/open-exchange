-- AlterTable
ALTER TABLE "Account" ALTER COLUMN "tenantId" SET DEFAULT NULLIF((current_setting('app.current_tenant_id'::text)), '')::uuid,
ALTER COLUMN "createdByUserId" SET DEFAULT NULLIF((current_setting('app.current_user_id'::text)), '')::uuid,
ALTER COLUMN "createdByMembershipId" SET DEFAULT NULLIF((current_setting('app.current_membership_id'::text)), '')::uuid,
ALTER COLUMN "updatedByUserId" SET DEFAULT NULLIF((current_setting('app.current_user_id'::text)), '')::uuid,
ALTER COLUMN "updatedByMembershipId" SET DEFAULT NULLIF((current_setting('app.current_membership_id'::text)), '')::uuid;

-- AlterTable
ALTER TABLE "ApiKey" ALTER COLUMN "tenantId" SET DEFAULT NULLIF((current_setting('app.current_tenant_id'::text)), '')::uuid,
ALTER COLUMN "createdByUserId" SET DEFAULT NULLIF((current_setting('app.current_user_id'::text)), '')::uuid,
ALTER COLUMN "createdByMembershipId" SET DEFAULT NULLIF((current_setting('app.current_membership_id'::text)), '')::uuid,
ALTER COLUMN "updatedByUserId" SET DEFAULT NULLIF((current_setting('app.current_user_id'::text)), '')::uuid,
ALTER COLUMN "updatedByMembershipId" SET DEFAULT NULLIF((current_setting('app.current_membership_id'::text)), '')::uuid;

-- AlterTable
ALTER TABLE "Article" ALTER COLUMN "tenantId" SET DEFAULT NULLIF((current_setting('app.current_tenant_id'::text)), '')::uuid,
ALTER COLUMN "createdByUserId" SET DEFAULT NULLIF((current_setting('app.current_user_id'::text)), '')::uuid,
ALTER COLUMN "createdByMembershipId" SET DEFAULT NULLIF((current_setting('app.current_membership_id'::text)), '')::uuid,
ALTER COLUMN "updatedByUserId" SET DEFAULT NULLIF((current_setting('app.current_user_id'::text)), '')::uuid,
ALTER COLUMN "updatedByMembershipId" SET DEFAULT NULLIF((current_setting('app.current_membership_id'::text)), '')::uuid;

-- AlterTable
ALTER TABLE "Asset" ALTER COLUMN "tenantId" SET DEFAULT NULLIF((current_setting('app.current_tenant_id'::text)), '')::uuid,
ALTER COLUMN "createdByUserId" SET DEFAULT NULLIF((current_setting('app.current_user_id'::text)), '')::uuid,
ALTER COLUMN "createdByMembershipId" SET DEFAULT NULLIF((current_setting('app.current_membership_id'::text)), '')::uuid,
ALTER COLUMN "updatedByUserId" SET DEFAULT NULLIF((current_setting('app.current_user_id'::text)), '')::uuid,
ALTER COLUMN "updatedByMembershipId" SET DEFAULT NULLIF((current_setting('app.current_membership_id'::text)), '')::uuid;

-- AlterTable
ALTER TABLE "BalanceSnapshot" ALTER COLUMN "tenantId" SET DEFAULT NULLIF((current_setting('app.current_tenant_id'::text)), '')::uuid,
ALTER COLUMN "createdByUserId" SET DEFAULT NULLIF((current_setting('app.current_user_id'::text)), '')::uuid,
ALTER COLUMN "createdByMembershipId" SET DEFAULT NULLIF((current_setting('app.current_membership_id'::text)), '')::uuid,
ALTER COLUMN "updatedByUserId" SET DEFAULT NULLIF((current_setting('app.current_user_id'::text)), '')::uuid,
ALTER COLUMN "updatedByMembershipId" SET DEFAULT NULLIF((current_setting('app.current_membership_id'::text)), '')::uuid;

-- AlterTable
ALTER TABLE "Candidate" ALTER COLUMN "tenantId" SET DEFAULT NULLIF((current_setting('app.current_tenant_id'::text)), '')::uuid,
ALTER COLUMN "createdByUserId" SET DEFAULT NULLIF((current_setting('app.current_user_id'::text)), '')::uuid,
ALTER COLUMN "createdByMembershipId" SET DEFAULT NULLIF((current_setting('app.current_membership_id'::text)), '')::uuid,
ALTER COLUMN "updatedByUserId" SET DEFAULT NULLIF((current_setting('app.current_user_id'::text)), '')::uuid,
ALTER COLUMN "updatedByMembershipId" SET DEFAULT NULLIF((current_setting('app.current_membership_id'::text)), '')::uuid;

-- AlterTable
ALTER TABLE "Chat" ALTER COLUMN "tenantId" SET DEFAULT NULLIF((current_setting('app.current_tenant_id'::text)), '')::uuid,
ALTER COLUMN "createdByUserId" SET DEFAULT NULLIF((current_setting('app.current_user_id'::text)), '')::uuid,
ALTER COLUMN "createdByMembershipId" SET DEFAULT NULLIF((current_setting('app.current_membership_id'::text)), '')::uuid,
ALTER COLUMN "updatedByUserId" SET DEFAULT NULLIF((current_setting('app.current_user_id'::text)), '')::uuid,
ALTER COLUMN "updatedByMembershipId" SET DEFAULT NULLIF((current_setting('app.current_membership_id'::text)), '')::uuid;

-- AlterTable
ALTER TABLE "Chater" ALTER COLUMN "tenantId" SET DEFAULT NULLIF((current_setting('app.current_tenant_id'::text)), '')::uuid,
ALTER COLUMN "createdByUserId" SET DEFAULT NULLIF((current_setting('app.current_user_id'::text)), '')::uuid,
ALTER COLUMN "createdByMembershipId" SET DEFAULT NULLIF((current_setting('app.current_membership_id'::text)), '')::uuid,
ALTER COLUMN "updatedByUserId" SET DEFAULT NULLIF((current_setting('app.current_user_id'::text)), '')::uuid,
ALTER COLUMN "updatedByMembershipId" SET DEFAULT NULLIF((current_setting('app.current_membership_id'::text)), '')::uuid;

-- AlterTable
ALTER TABLE "Comment" ALTER COLUMN "tenantId" SET DEFAULT NULLIF((current_setting('app.current_tenant_id'::text)), '')::uuid,
ALTER COLUMN "createdByUserId" SET DEFAULT NULLIF((current_setting('app.current_user_id'::text)), '')::uuid,
ALTER COLUMN "createdByMembershipId" SET DEFAULT NULLIF((current_setting('app.current_membership_id'::text)), '')::uuid,
ALTER COLUMN "updatedByUserId" SET DEFAULT NULLIF((current_setting('app.current_user_id'::text)), '')::uuid,
ALTER COLUMN "updatedByMembershipId" SET DEFAULT NULLIF((current_setting('app.current_membership_id'::text)), '')::uuid;

-- AlterTable
ALTER TABLE "Deposit" ALTER COLUMN "tenantId" SET DEFAULT NULLIF((current_setting('app.current_tenant_id'::text)), '')::uuid,
ALTER COLUMN "createdByUserId" SET DEFAULT NULLIF((current_setting('app.current_user_id'::text)), '')::uuid,
ALTER COLUMN "createdByMembershipId" SET DEFAULT NULLIF((current_setting('app.current_membership_id'::text)), '')::uuid,
ALTER COLUMN "updatedByUserId" SET DEFAULT NULLIF((current_setting('app.current_user_id'::text)), '')::uuid,
ALTER COLUMN "updatedByMembershipId" SET DEFAULT NULLIF((current_setting('app.current_membership_id'::text)), '')::uuid;

-- AlterTable
ALTER TABLE "FeeSchedule" ALTER COLUMN "tenantId" SET DEFAULT NULLIF((current_setting('app.current_tenant_id'::text)), '')::uuid,
ALTER COLUMN "createdByUserId" SET DEFAULT NULLIF((current_setting('app.current_user_id'::text)), '')::uuid,
ALTER COLUMN "createdByMembershipId" SET DEFAULT NULLIF((current_setting('app.current_membership_id'::text)), '')::uuid,
ALTER COLUMN "updatedByUserId" SET DEFAULT NULLIF((current_setting('app.current_user_id'::text)), '')::uuid,
ALTER COLUMN "updatedByMembershipId" SET DEFAULT NULLIF((current_setting('app.current_membership_id'::text)), '')::uuid;

-- AlterTable
ALTER TABLE "Feedback" ALTER COLUMN "tenantId" SET DEFAULT NULLIF((current_setting('app.current_tenant_id'::text)), '')::uuid,
ALTER COLUMN "createdByUserId" SET DEFAULT NULLIF((current_setting('app.current_user_id'::text)), '')::uuid,
ALTER COLUMN "createdByMembershipId" SET DEFAULT NULLIF((current_setting('app.current_membership_id'::text)), '')::uuid,
ALTER COLUMN "updatedByUserId" SET DEFAULT NULLIF((current_setting('app.current_user_id'::text)), '')::uuid,
ALTER COLUMN "updatedByMembershipId" SET DEFAULT NULLIF((current_setting('app.current_membership_id'::text)), '')::uuid;

-- AlterTable
ALTER TABLE "Fill" ALTER COLUMN "tenantId" SET DEFAULT NULLIF((current_setting('app.current_tenant_id'::text)), '')::uuid,
ALTER COLUMN "createdByUserId" SET DEFAULT NULLIF((current_setting('app.current_user_id'::text)), '')::uuid,
ALTER COLUMN "createdByMembershipId" SET DEFAULT NULLIF((current_setting('app.current_membership_id'::text)), '')::uuid,
ALTER COLUMN "updatedByUserId" SET DEFAULT NULLIF((current_setting('app.current_user_id'::text)), '')::uuid,
ALTER COLUMN "updatedByMembershipId" SET DEFAULT NULLIF((current_setting('app.current_membership_id'::text)), '')::uuid;

-- AlterTable
ALTER TABLE "Instrument" ALTER COLUMN "tenantId" SET DEFAULT NULLIF((current_setting('app.current_tenant_id'::text)), '')::uuid,
ALTER COLUMN "createdByUserId" SET DEFAULT NULLIF((current_setting('app.current_user_id'::text)), '')::uuid,
ALTER COLUMN "createdByMembershipId" SET DEFAULT NULLIF((current_setting('app.current_membership_id'::text)), '')::uuid,
ALTER COLUMN "updatedByUserId" SET DEFAULT NULLIF((current_setting('app.current_user_id'::text)), '')::uuid,
ALTER COLUMN "updatedByMembershipId" SET DEFAULT NULLIF((current_setting('app.current_membership_id'::text)), '')::uuid;

-- AlterTable
ALTER TABLE "Job" ALTER COLUMN "tenantId" SET DEFAULT NULLIF((current_setting('app.current_tenant_id'::text)), '')::uuid,
ALTER COLUMN "createdByUserId" SET DEFAULT NULLIF((current_setting('app.current_user_id'::text)), '')::uuid,
ALTER COLUMN "createdByMembershipId" SET DEFAULT NULLIF((current_setting('app.current_membership_id'::text)), '')::uuid,
ALTER COLUMN "updatedByUserId" SET DEFAULT NULLIF((current_setting('app.current_user_id'::text)), '')::uuid,
ALTER COLUMN "updatedByMembershipId" SET DEFAULT NULLIF((current_setting('app.current_membership_id'::text)), '')::uuid;

-- AlterTable
ALTER TABLE "LedgerEntry" ALTER COLUMN "tenantId" SET DEFAULT NULLIF((current_setting('app.current_tenant_id'::text)), '')::uuid,
ALTER COLUMN "createdByUserId" SET DEFAULT NULLIF((current_setting('app.current_user_id'::text)), '')::uuid,
ALTER COLUMN "createdByMembershipId" SET DEFAULT NULLIF((current_setting('app.current_membership_id'::text)), '')::uuid,
ALTER COLUMN "updatedByUserId" SET DEFAULT NULLIF((current_setting('app.current_user_id'::text)), '')::uuid,
ALTER COLUMN "updatedByMembershipId" SET DEFAULT NULLIF((current_setting('app.current_membership_id'::text)), '')::uuid;

-- AlterTable
ALTER TABLE "LedgerEvent" ALTER COLUMN "tenantId" SET DEFAULT NULLIF((current_setting('app.current_tenant_id'::text)), '')::uuid,
ALTER COLUMN "createdByUserId" SET DEFAULT NULLIF((current_setting('app.current_user_id'::text)), '')::uuid,
ALTER COLUMN "createdByMembershipId" SET DEFAULT NULLIF((current_setting('app.current_membership_id'::text)), '')::uuid,
ALTER COLUMN "updatedByUserId" SET DEFAULT NULLIF((current_setting('app.current_user_id'::text)), '')::uuid,
ALTER COLUMN "updatedByMembershipId" SET DEFAULT NULLIF((current_setting('app.current_membership_id'::text)), '')::uuid;

-- AlterTable
ALTER TABLE "Listing" ALTER COLUMN "tenantId" SET DEFAULT NULLIF((current_setting('app.current_tenant_id'::text)), '')::uuid,
ALTER COLUMN "createdByUserId" SET DEFAULT NULLIF((current_setting('app.current_user_id'::text)), '')::uuid,
ALTER COLUMN "createdByMembershipId" SET DEFAULT NULLIF((current_setting('app.current_membership_id'::text)), '')::uuid,
ALTER COLUMN "updatedByUserId" SET DEFAULT NULLIF((current_setting('app.current_user_id'::text)), '')::uuid,
ALTER COLUMN "updatedByMembershipId" SET DEFAULT NULLIF((current_setting('app.current_membership_id'::text)), '')::uuid;

-- AlterTable
ALTER TABLE "Membership" ALTER COLUMN "tenantId" SET DEFAULT NULLIF((current_setting('app.current_tenant_id'::text)), '')::uuid,
ALTER COLUMN "createdByUserId" SET DEFAULT NULLIF((current_setting('app.current_user_id'::text)), '')::uuid,
ALTER COLUMN "createdByMembershipId" SET DEFAULT NULLIF((current_setting('app.current_membership_id'::text)), '')::uuid,
ALTER COLUMN "updatedByUserId" SET DEFAULT NULLIF((current_setting('app.current_user_id'::text)), '')::uuid,
ALTER COLUMN "updatedByMembershipId" SET DEFAULT NULLIF((current_setting('app.current_membership_id'::text)), '')::uuid;

-- AlterTable
ALTER TABLE "Message" ALTER COLUMN "tenantId" SET DEFAULT NULLIF((current_setting('app.current_tenant_id'::text)), '')::uuid,
ALTER COLUMN "createdByUserId" SET DEFAULT NULLIF((current_setting('app.current_user_id'::text)), '')::uuid,
ALTER COLUMN "createdByMembershipId" SET DEFAULT NULLIF((current_setting('app.current_membership_id'::text)), '')::uuid,
ALTER COLUMN "updatedByUserId" SET DEFAULT NULLIF((current_setting('app.current_user_id'::text)), '')::uuid,
ALTER COLUMN "updatedByMembershipId" SET DEFAULT NULLIF((current_setting('app.current_membership_id'::text)), '')::uuid;

-- AlterTable
ALTER TABLE "Notification" ALTER COLUMN "tenantId" SET DEFAULT NULLIF((current_setting('app.current_tenant_id'::text)), '')::uuid,
ALTER COLUMN "createdByUserId" SET DEFAULT NULLIF((current_setting('app.current_user_id'::text)), '')::uuid,
ALTER COLUMN "createdByMembershipId" SET DEFAULT NULLIF((current_setting('app.current_membership_id'::text)), '')::uuid,
ALTER COLUMN "updatedByUserId" SET DEFAULT NULLIF((current_setting('app.current_user_id'::text)), '')::uuid,
ALTER COLUMN "updatedByMembershipId" SET DEFAULT NULLIF((current_setting('app.current_membership_id'::text)), '')::uuid;

-- AlterTable
ALTER TABLE "Order" ALTER COLUMN "tenantId" SET DEFAULT NULLIF((current_setting('app.current_tenant_id'::text)), '')::uuid,
ALTER COLUMN "createdByUserId" SET DEFAULT NULLIF((current_setting('app.current_user_id'::text)), '')::uuid,
ALTER COLUMN "createdByMembershipId" SET DEFAULT NULLIF((current_setting('app.current_membership_id'::text)), '')::uuid,
ALTER COLUMN "updatedByUserId" SET DEFAULT NULLIF((current_setting('app.current_user_id'::text)), '')::uuid,
ALTER COLUMN "updatedByMembershipId" SET DEFAULT NULLIF((current_setting('app.current_membership_id'::text)), '')::uuid;

-- AlterTable
ALTER TABLE "Post" ALTER COLUMN "tenantId" SET DEFAULT NULLIF((current_setting('app.current_tenant_id'::text)), '')::uuid,
ALTER COLUMN "createdByUserId" SET DEFAULT NULLIF((current_setting('app.current_user_id'::text)), '')::uuid,
ALTER COLUMN "createdByMembershipId" SET DEFAULT NULLIF((current_setting('app.current_membership_id'::text)), '')::uuid,
ALTER COLUMN "updatedByUserId" SET DEFAULT NULLIF((current_setting('app.current_user_id'::text)), '')::uuid,
ALTER COLUMN "updatedByMembershipId" SET DEFAULT NULLIF((current_setting('app.current_membership_id'::text)), '')::uuid;

-- AlterTable
ALTER TABLE "Referral" ALTER COLUMN "tenantId" SET DEFAULT NULLIF((current_setting('app.current_tenant_id'::text)), '')::uuid,
ALTER COLUMN "createdByUserId" SET DEFAULT NULLIF((current_setting('app.current_user_id'::text)), '')::uuid,
ALTER COLUMN "createdByMembershipId" SET DEFAULT NULLIF((current_setting('app.current_membership_id'::text)), '')::uuid,
ALTER COLUMN "updatedByUserId" SET DEFAULT NULLIF((current_setting('app.current_user_id'::text)), '')::uuid,
ALTER COLUMN "updatedByMembershipId" SET DEFAULT NULLIF((current_setting('app.current_membership_id'::text)), '')::uuid;

-- AlterTable
ALTER TABLE "SystemAccount" ALTER COLUMN "tenantId" SET DEFAULT NULLIF((current_setting('app.current_tenant_id'::text)), '')::uuid,
ALTER COLUMN "createdByUserId" SET DEFAULT NULLIF((current_setting('app.current_user_id'::text)), '')::uuid,
ALTER COLUMN "createdByMembershipId" SET DEFAULT NULLIF((current_setting('app.current_membership_id'::text)), '')::uuid,
ALTER COLUMN "updatedByUserId" SET DEFAULT NULLIF((current_setting('app.current_user_id'::text)), '')::uuid,
ALTER COLUMN "updatedByMembershipId" SET DEFAULT NULLIF((current_setting('app.current_membership_id'::text)), '')::uuid;

-- AlterTable
ALTER TABLE "Tenant" ALTER COLUMN "createdByUserId" SET DEFAULT NULLIF((current_setting('app.current_user_id'::text)), '')::uuid,
ALTER COLUMN "updatedByUserId" SET DEFAULT NULLIF((current_setting('app.current_user_id'::text)), '')::uuid;

-- AlterTable
ALTER TABLE "Trade" ALTER COLUMN "tenantId" SET DEFAULT NULLIF((current_setting('app.current_tenant_id'::text)), '')::uuid,
ALTER COLUMN "createdByUserId" SET DEFAULT NULLIF((current_setting('app.current_user_id'::text)), '')::uuid,
ALTER COLUMN "createdByMembershipId" SET DEFAULT NULLIF((current_setting('app.current_membership_id'::text)), '')::uuid,
ALTER COLUMN "updatedByUserId" SET DEFAULT NULLIF((current_setting('app.current_user_id'::text)), '')::uuid,
ALTER COLUMN "updatedByMembershipId" SET DEFAULT NULLIF((current_setting('app.current_membership_id'::text)), '')::uuid;

-- AlterTable
ALTER TABLE "UserNotification" ALTER COLUMN "tenantId" SET DEFAULT NULLIF((current_setting('app.current_tenant_id'::text)), '')::uuid,
ALTER COLUMN "createdByUserId" SET DEFAULT NULLIF((current_setting('app.current_user_id'::text)), '')::uuid,
ALTER COLUMN "createdByMembershipId" SET DEFAULT NULLIF((current_setting('app.current_membership_id'::text)), '')::uuid,
ALTER COLUMN "updatedByUserId" SET DEFAULT NULLIF((current_setting('app.current_user_id'::text)), '')::uuid,
ALTER COLUMN "updatedByMembershipId" SET DEFAULT NULLIF((current_setting('app.current_membership_id'::text)), '')::uuid;

-- AlterTable
ALTER TABLE "Wallet" ALTER COLUMN "tenantId" SET DEFAULT NULLIF((current_setting('app.current_tenant_id'::text)), '')::uuid,
ALTER COLUMN "createdByUserId" SET DEFAULT NULLIF((current_setting('app.current_user_id'::text)), '')::uuid,
ALTER COLUMN "createdByMembershipId" SET DEFAULT NULLIF((current_setting('app.current_membership_id'::text)), '')::uuid,
ALTER COLUMN "updatedByUserId" SET DEFAULT NULLIF((current_setting('app.current_user_id'::text)), '')::uuid,
ALTER COLUMN "updatedByMembershipId" SET DEFAULT NULLIF((current_setting('app.current_membership_id'::text)), '')::uuid;

-- AlterTable
ALTER TABLE "Withdrawal" ALTER COLUMN "tenantId" SET DEFAULT NULLIF((current_setting('app.current_tenant_id'::text)), '')::uuid,
ALTER COLUMN "createdByUserId" SET DEFAULT NULLIF((current_setting('app.current_user_id'::text)), '')::uuid,
ALTER COLUMN "createdByMembershipId" SET DEFAULT NULLIF((current_setting('app.current_membership_id'::text)), '')::uuid,
ALTER COLUMN "updatedByUserId" SET DEFAULT NULLIF((current_setting('app.current_user_id'::text)), '')::uuid,
ALTER COLUMN "updatedByMembershipId" SET DEFAULT NULLIF((current_setting('app.current_membership_id'::text)), '')::uuid;

-- CreateTable
CREATE TABLE "MarketMaker" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenantId" UUID NOT NULL DEFAULT NULLIF((current_setting('app.current_tenant_id'::text)), '')::uuid,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdByUserId" UUID DEFAULT NULLIF((current_setting('app.current_user_id'::text)), '')::uuid,
    "createdByMembershipId" UUID DEFAULT NULLIF((current_setting('app.current_membership_id'::text)), '')::uuid,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,
    "updatedByUserId" UUID DEFAULT NULLIF((current_setting('app.current_user_id'::text)), '')::uuid,
    "updatedByMembershipId" UUID DEFAULT NULLIF((current_setting('app.current_membership_id'::text)), '')::uuid,
    "archivedAt" TIMESTAMPTZ(3),
    "archivedByMembershipId" UUID,
    "importHash" TEXT,
    "organizationName" TEXT NOT NULL,
    "contactEmail" TEXT,
    "contactPhone" TEXT,
    "status" TEXT,
    "tier" TEXT,
    "marketsSupported" TEXT,
    "minQuoteSize" INTEGER,
    "maxQuoteSize" INTEGER,
    "spreadLimit" INTEGER,
    "quoteObligation" BOOLEAN NOT NULL DEFAULT false,
    "dailyVolumeTarget" INTEGER,
    "makerFee" INTEGER,
    "takerFee" INTEGER,
    "rebateRate" INTEGER,
    "rebateBalance" INTEGER,
    "apiAccess" BOOLEAN NOT NULL DEFAULT false,
    "maxOrdersPerSecond" INTEGER,
    "directMarketAccess" BOOLEAN NOT NULL DEFAULT false,
    "contractSignedAt" TIMESTAMPTZ(3),
    "obligationViolationCount" INTEGER,
    "auditLog" JSONB,
    "notesInternal" TEXT,
    "specialOrderTypes" TEXT,

    CONSTRAINT "MarketMaker_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "MarketMaker_importHash_key" ON "MarketMaker"("importHash");

-- CreateIndex
CREATE UNIQUE INDEX "MarketMaker_id_tenantId_key" ON "MarketMaker"("id", "tenantId");

-- AddForeignKey
ALTER TABLE "MarketMaker" ADD CONSTRAINT "MarketMaker_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MarketMaker" ADD CONSTRAINT "MarketMaker_createdByMembershipId_fkey" FOREIGN KEY ("createdByMembershipId") REFERENCES "Membership"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MarketMaker" ADD CONSTRAINT "MarketMaker_updatedByMembershipId_fkey" FOREIGN KEY ("updatedByMembershipId") REFERENCES "Membership"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MarketMaker" ADD CONSTRAINT "MarketMaker_archivedByMembershipId_fkey" FOREIGN KEY ("archivedByMembershipId") REFERENCES "Membership"("id") ON DELETE SET NULL ON UPDATE CASCADE;
