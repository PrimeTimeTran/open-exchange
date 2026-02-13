/*
  Warnings:

  - You are about to alter the column `quantity` on the `Fill` table. The data in that column could be lost. The data in that column will be cast from `Decimal(72,0)` to `Decimal(72,20)`.
  - You are about to alter the column `fee` on the `Fill` table. The data in that column could be lost. The data in that column will be cast from `Decimal(72,0)` to `Decimal(72,20)`.
  - You are about to alter the column `quantity` on the `Order` table. The data in that column could be lost. The data in that column will be cast from `Decimal(72,0)` to `Decimal(72,20)`.
  - You are about to alter the column `quantityFilled` on the `Order` table. The data in that column could be lost. The data in that column will be cast from `Decimal(72,0)` to `Decimal(72,20)`.
  - You are about to alter the column `quantity` on the `Trade` table. The data in that column could be lost. The data in that column will be cast from `Decimal(72,0)` to `Decimal(72,20)`.

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
ALTER COLUMN "updatedByMembershipId" SET DEFAULT NULLIF((current_setting('app.current_membership_id'::text)), '')::uuid,
ALTER COLUMN "quantity" SET DATA TYPE DECIMAL(72,20),
ALTER COLUMN "fee" SET DATA TYPE DECIMAL(72,20);

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
ALTER TABLE "MarketMaker" ALTER COLUMN "tenantId" SET DEFAULT NULLIF((current_setting('app.current_tenant_id'::text)), '')::uuid,
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
ALTER COLUMN "updatedByMembershipId" SET DEFAULT NULLIF((current_setting('app.current_membership_id'::text)), '')::uuid,
ALTER COLUMN "quantity" SET DATA TYPE DECIMAL(72,20),
ALTER COLUMN "quantityFilled" SET DATA TYPE DECIMAL(72,20);

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
ALTER COLUMN "updatedByMembershipId" SET DEFAULT NULLIF((current_setting('app.current_membership_id'::text)), '')::uuid,
ALTER COLUMN "quantity" SET DATA TYPE DECIMAL(72,20);

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
