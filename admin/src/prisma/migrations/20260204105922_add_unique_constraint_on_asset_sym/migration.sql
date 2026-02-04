/*
  Warnings:

  - A unique constraint covering the columns `[symbol,tenantId]` on the table `Asset` will be added. If there are existing duplicate values, this will fail.

*/
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
ALTER TABLE "Chat" ALTER COLUMN "tenantId" SET DEFAULT NULLIF((current_setting('app.current_tenant_id'::text)), '')::uuid,
ALTER COLUMN "createdByUserId" SET DEFAULT NULLIF((current_setting('app.current_user_id'::text)), '')::uuid,
ALTER COLUMN "createdByMembershipId" SET DEFAULT NULLIF((current_setting('app.current_membership_id'::text)), '')::uuid,
ALTER COLUMN "updatedByUserId" SET DEFAULT NULLIF((current_setting('app.current_user_id'::text)), '')::uuid,
ALTER COLUMN "updatedByMembershipId" SET DEFAULT NULLIF((current_setting('app.current_membership_id'::text)), '')::uuid;

-- AlterTable
ALTER TABLE "Chatee" ALTER COLUMN "tenantId" SET DEFAULT NULLIF((current_setting('app.current_tenant_id'::text)), '')::uuid,
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

-- CreateIndex
CREATE UNIQUE INDEX "Asset_symbol_tenantId_key" ON "Asset"("symbol", "tenantId");
