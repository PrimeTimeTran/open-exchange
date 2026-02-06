-- CreateEnum
CREATE TYPE "MembershipStatus" AS ENUM ('active', 'disabled', 'invited');

-- CreateEnum
CREATE TYPE "SubscriptionStatus" AS ENUM ('incomplete', 'incomplete_expired', 'trialing', 'active', 'past_due', 'canceled', 'unpaid', 'paused');

-- CreateEnum
CREATE TYPE "SubscriptionMode" AS ENUM ('user', 'tenant', 'membership', 'disabled');

-- CreateTable
CREATE TABLE "User" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT,
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "verifyEmailToken" TEXT,
    "verifyEmailTokenExpiresAt" TIMESTAMPTZ(3),
    "provider" TEXT,
    "providerId" TEXT,
    "passwordResetToken" TEXT,
    "passwordResetTokenExpiresAt" TIMESTAMPTZ(3),
    "expireSessionsOlderThan" TIMESTAMPTZ(3),

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "timestamp" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "entityName" TEXT NOT NULL,
    "entityId" UUID NOT NULL,
    "tenantId" UUID,
    "userId" UUID,
    "membershipId" UUID,
    "apiKeyId" UUID,
    "apiEndpoint" TEXT,
    "apiHttpResponseCode" TEXT,
    "operation" TEXT NOT NULL,
    "oldData" JSONB,
    "newData" JSONB,
    "transactionId" BIGINT NOT NULL DEFAULT txid_current(),

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ApiKey" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenantId" UUID NOT NULL DEFAULT NULLIF((current_setting('app.current_tenant_id'::text)), '')::uuid,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdByUserId" UUID DEFAULT NULLIF((current_setting('app.current_user_id'::text)), '')::uuid,
    "createdByMembershipId" UUID DEFAULT NULLIF((current_setting('app.current_membership_id'::text)), '')::uuid,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,
    "updatedByUserId" UUID DEFAULT NULLIF((current_setting('app.current_user_id'::text)), '')::uuid,
    "updatedByMembershipId" UUID DEFAULT NULLIF((current_setting('app.current_membership_id'::text)), '')::uuid,
    "name" TEXT NOT NULL,
    "keyPrefix" TEXT NOT NULL,
    "secret" TEXT NOT NULL,
    "scopes" TEXT[],
    "expiresAt" TIMESTAMPTZ(3),
    "disabledAt" TIMESTAMPTZ(3),
    "membershipId" UUID NOT NULL,

    CONSTRAINT "ApiKey_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Tenant" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdByUserId" UUID DEFAULT NULLIF((current_setting('app.current_user_id'::text)), '')::uuid,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,
    "updatedByUserId" UUID DEFAULT NULLIF((current_setting('app.current_user_id'::text)), '')::uuid,
    "name" TEXT NOT NULL,

    CONSTRAINT "Tenant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Membership" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenantId" UUID NOT NULL DEFAULT NULLIF((current_setting('app.current_tenant_id'::text)), '')::uuid,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdByUserId" UUID DEFAULT NULLIF((current_setting('app.current_user_id'::text)), '')::uuid,
    "createdByMembershipId" UUID DEFAULT NULLIF((current_setting('app.current_membership_id'::text)), '')::uuid,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,
    "updatedByUserId" UUID DEFAULT NULLIF((current_setting('app.current_user_id'::text)), '')::uuid,
    "updatedByMembershipId" UUID DEFAULT NULLIF((current_setting('app.current_membership_id'::text)), '')::uuid,
    "importHash" TEXT,
    "userId" UUID NOT NULL,
    "firstName" TEXT,
    "lastName" TEXT,
    "fullName" TEXT,
    "avatars" JSONB,
    "roles" TEXT[],
    "invitationToken" TEXT,
    "status" "MembershipStatus" NOT NULL DEFAULT 'active',

    CONSTRAINT "Membership_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Subscription" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenantId" UUID,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,
    "membershipId" UUID,
    "userId" UUID NOT NULL,
    "mode" "SubscriptionMode" NOT NULL,
    "isCancelAtEndPeriod" BOOLEAN NOT NULL DEFAULT false,
    "stripeCustomerId" TEXT NOT NULL,
    "stripeSubscriptionId" TEXT NOT NULL,
    "stripePriceId" TEXT NOT NULL,
    "status" "SubscriptionStatus" NOT NULL,

    CONSTRAINT "Subscription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Account" (
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
    "type" TEXT,
    "status" TEXT,
    "meta" JSONB,
    "userId" UUID,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Wallet" (
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
    "available" INTEGER,
    "locked" INTEGER,
    "total" INTEGER,
    "version" INTEGER,
    "meta" JSONB,
    "userId" UUID,
    "assetId" UUID,
    "accountId" UUID,

    CONSTRAINT "Wallet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Deposit" (
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
    "amount" INTEGER,
    "status" TEXT,
    "chain" TEXT,
    "txHash" TEXT,
    "fromAddress" TEXT,
    "confirmations" INTEGER,
    "requiredConfirmations" INTEGER,
    "detectedAt" TIMESTAMPTZ(3),
    "confirmedAt" TIMESTAMPTZ(3),
    "creditedAt" TIMESTAMPTZ(3),
    "meta" JSONB,
    "accountId" UUID,
    "assetId" UUID,

    CONSTRAINT "Deposit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Withdrawal" (
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
    "amount" INTEGER,
    "fee" INTEGER,
    "status" TEXT,
    "destinationAddress" TEXT,
    "destinationTag" TEXT,
    "chain" TEXT,
    "txHash" TEXT,
    "failureReason" TEXT,
    "requestedBy" TEXT,
    "approvedBy" TEXT,
    "approvedAt" TIMESTAMPTZ(3),
    "requestedAt" TIMESTAMPTZ(3),
    "broadcastAt" TIMESTAMPTZ(3),
    "confirmedAt" TIMESTAMPTZ(3),
    "confirmations" INTEGER,
    "meta" JSONB,
    "accountId" UUID,
    "assetId" UUID,

    CONSTRAINT "Withdrawal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Order" (
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
    "side" TEXT,
    "type" TEXT,
    "price" DECIMAL(65,30),
    "quantity" DECIMAL(65,30),
    "quantityFilled" DECIMAL(65,30),
    "status" TEXT,
    "timeInFore" TEXT,
    "meta" JSONB,
    "accountId" UUID,
    "instrumentId" UUID,

    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Asset" (
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
    "symbol" TEXT NOT NULL,
    "klass" TEXT,
    "precision" INTEGER,
    "isFractional" BOOLEAN NOT NULL DEFAULT false,
    "decimals" INTEGER,
    "meta" JSONB,

    CONSTRAINT "Asset_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Instrument" (
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
    "symbol" TEXT NOT NULL,
    "type" TEXT,
    "status" TEXT,
    "meta" JSONB,
    "underlyingAssetId" UUID,
    "quoteAssetId" UUID,

    CONSTRAINT "Instrument_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LedgerEvent" (
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
    "type" TEXT,
    "referenceId" TEXT,
    "referenceType" TEXT,
    "status" TEXT,
    "description" TEXT,
    "meta" JSONB,

    CONSTRAINT "LedgerEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LedgerEntry" (
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
    "amount" DECIMAL(65,30),
    "accountId" TEXT,
    "meta" JSONB,
    "eventId" UUID,

    CONSTRAINT "LedgerEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Trade" (
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
    "price" DECIMAL(65,30),
    "quantity" DECIMAL(65,30),
    "meta" JSONB,
    "instrumentId" UUID,

    CONSTRAINT "Trade_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Fill" (
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
    "side" TEXT,
    "price" DECIMAL(65,30),
    "quantity" DECIMAL(65,30),
    "fee" DECIMAL(65,30),
    "meta" JSONB,
    "tradeId" UUID,

    CONSTRAINT "Fill_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Post" (
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
    "title" TEXT,
    "body" TEXT,
    "files" JSONB,
    "images" JSONB,
    "type" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "meta" JSONB,
    "userId" UUID NOT NULL,

    CONSTRAINT "Post_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Comment" (
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
    "body" TEXT,
    "type" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "images" JSONB,
    "meta" JSONB,
    "userId" UUID NOT NULL,

    CONSTRAINT "Comment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Article" (
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
    "title" TEXT,
    "body" TEXT,
    "type" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "images" JSONB,
    "files" JSONB,
    "meta" JSONB,
    "userId" UUID,

    CONSTRAINT "Article_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Chat" (
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
    "name" TEXT,
    "media" JSONB,
    "meta" JSONB,
    "active" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Chat_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Chater" (
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
    "nickname" TEXT,
    "status" TEXT,
    "role" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "meta" JSONB,
    "userId" UUID,
    "chatId" UUID,

    CONSTRAINT "Chater_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Message" (
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
    "body" TEXT,
    "attachment" JSONB,
    "images" JSONB,
    "type" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "meta" JSONB,
    "chatId" UUID,
    "chaterId" UUID,
    "senderId" UUID,

    CONSTRAINT "Message_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FeeSchedule" (
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
    "scope" TEXT,
    "makerFeeBps" INTEGER,
    "takerFeeBps" INTEGER,
    "minFeeAmount" INTEGER,
    "effectiveFrom" TIMESTAMPTZ(3),
    "effectiveTo" TIMESTAMPTZ(3),
    "tier" TEXT,
    "accountId" TEXT,
    "instrumentId" TEXT,
    "meta" JSONB,

    CONSTRAINT "FeeSchedule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BalanceSnapshot" (
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
    "available" INTEGER,
    "locked" INTEGER,
    "total" INTEGER,
    "snapshotAt" TIMESTAMPTZ(3),
    "meta" JSONB,
    "accountId" UUID,
    "walletId" UUID,
    "assetId" UUID,

    CONSTRAINT "BalanceSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SystemAccount" (
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
    "type" TEXT,
    "name" TEXT,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "meta" JSONB,

    CONSTRAINT "SystemAccount_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Feedback" (
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
    "title" TEXT,
    "description" TEXT,
    "attachments" JSONB,
    "type" TEXT,
    "status" TEXT,
    "json" JSONB,
    "userId" UUID,

    CONSTRAINT "Feedback_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Job" (
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
    "title" TEXT,
    "team" TEXT,
    "location" TEXT,
    "type" TEXT,
    "remote" BOOLEAN NOT NULL DEFAULT false,
    "description" TEXT,
    "requirements" TEXT,
    "responsibilities" TEXT,
    "quantity" INTEGER,
    "salaryLow" INTEGER,
    "salaryHigh" INTEGER,
    "status" TEXT,
    "seniority" TEXT,
    "currency" TEXT,
    "meta" JSONB,

    CONSTRAINT "Job_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Listing" (
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
    "companyName" TEXT,
    "legalName" TEXT,
    "jurisdiction" TEXT,
    "incorporationDate" TEXT,
    "website" TEXT,
    "assetSymbol" TEXT NOT NULL,
    "assetClass" TEXT,
    "status" TEXT,
    "submittedAt" TEXT,
    "decisionAt" TEXT,
    "kycCompleted" BOOLEAN NOT NULL DEFAULT false,
    "docsSubmitted" BOOLEAN NOT NULL DEFAULT false,
    "riskDisclosureUrl" TEXT,
    "primaryContactName" TEXT,
    "primaryContactEmail" TEXT,
    "reviewedBy" TEXT,
    "notes" TEXT,
    "meta" JSONB,

    CONSTRAINT "Listing_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Referral" (
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
    "referrerUserId" TEXT,
    "referredUserId" TEXT,
    "referralCode" TEXT,
    "source" TEXT,
    "status" TEXT,
    "rewardType" TEXT,
    "rewardAmount" INTEGER,
    "rewardCurrency" TEXT,
    "rewardedAt" TIMESTAMPTZ(3),
    "meta" JSONB,

    CONSTRAINT "Referral_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
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
    "type" TEXT,
    "severity" TEXT,
    "title" TEXT,
    "body" TEXT,
    "actionUrl" TEXT,
    "scope" TEXT,
    "targetUserId" TEXT,
    "targetSegment" TEXT,
    "persistent" BOOLEAN NOT NULL DEFAULT false,
    "dismissible" BOOLEAN NOT NULL DEFAULT false,
    "requiresAck" BOOLEAN NOT NULL DEFAULT false,
    "meta" JSONB,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserNotification" (
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
    "readAt" TIMESTAMPTZ(3),
    "dismissedAt" TIMESTAMPTZ(3),
    "acknowledgedAt" TIMESTAMPTZ(3),
    "deliveryChannel" TEXT,
    "deliveredAt" TIMESTAMPTZ(3),
    "meta" JSONB,
    "notificationId" UUID,
    "userId" UUID,

    CONSTRAINT "UserNotification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Candidate" (
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
    "firstName" TEXT,
    "lastName" TEXT,
    "preferredName" TEXT,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "country" TEXT,
    "timezone" TEXT,
    "linkedinUrl" TEXT,
    "githubUrl" TEXT,
    "portfolioUrl" TEXT,
    "resumeUrl" TEXT,
    "resume" JSONB,
    "meta" JSONB,

    CONSTRAINT "Candidate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_buyOrderId_buys" (
    "A" UUID NOT NULL,
    "B" UUID NOT NULL
);

-- CreateTable
CREATE TABLE "_sellOrderId_sells" (
    "A" UUID NOT NULL,
    "B" UUID NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "ApiKey_secret_key" ON "ApiKey"("secret");

-- CreateIndex
CREATE UNIQUE INDEX "ApiKey_id_tenantId_key" ON "ApiKey"("id", "tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "ApiKey_id_tenantId_membershipId_key" ON "ApiKey"("id", "tenantId", "membershipId");

-- CreateIndex
CREATE UNIQUE INDEX "Membership_importHash_key" ON "Membership"("importHash");

-- CreateIndex
CREATE UNIQUE INDEX "Membership_invitationToken_key" ON "Membership"("invitationToken");

-- CreateIndex
CREATE UNIQUE INDEX "Membership_id_tenantId_key" ON "Membership"("id", "tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "Membership_userId_tenantId_key" ON "Membership"("userId", "tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "Subscription_stripeSubscriptionId_key" ON "Subscription"("stripeSubscriptionId");

-- CreateIndex
CREATE UNIQUE INDEX "Account_importHash_key" ON "Account"("importHash");

-- CreateIndex
CREATE UNIQUE INDEX "Account_id_tenantId_key" ON "Account"("id", "tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "Wallet_importHash_key" ON "Wallet"("importHash");

-- CreateIndex
CREATE UNIQUE INDEX "Wallet_id_tenantId_key" ON "Wallet"("id", "tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "Deposit_importHash_key" ON "Deposit"("importHash");

-- CreateIndex
CREATE UNIQUE INDEX "Deposit_id_tenantId_key" ON "Deposit"("id", "tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "Withdrawal_importHash_key" ON "Withdrawal"("importHash");

-- CreateIndex
CREATE UNIQUE INDEX "Withdrawal_id_tenantId_key" ON "Withdrawal"("id", "tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "Order_importHash_key" ON "Order"("importHash");

-- CreateIndex
CREATE UNIQUE INDEX "Order_id_tenantId_key" ON "Order"("id", "tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "Asset_importHash_key" ON "Asset"("importHash");

-- CreateIndex
CREATE UNIQUE INDEX "Asset_symbol_tenantId_key" ON "Asset"("symbol", "tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "Asset_id_tenantId_key" ON "Asset"("id", "tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "Instrument_importHash_key" ON "Instrument"("importHash");

-- CreateIndex
CREATE UNIQUE INDEX "Instrument_symbol_tenantId_key" ON "Instrument"("symbol", "tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "Instrument_id_tenantId_key" ON "Instrument"("id", "tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "LedgerEvent_importHash_key" ON "LedgerEvent"("importHash");

-- CreateIndex
CREATE UNIQUE INDEX "LedgerEvent_id_tenantId_key" ON "LedgerEvent"("id", "tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "LedgerEntry_importHash_key" ON "LedgerEntry"("importHash");

-- CreateIndex
CREATE UNIQUE INDEX "LedgerEntry_id_tenantId_key" ON "LedgerEntry"("id", "tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "Trade_importHash_key" ON "Trade"("importHash");

-- CreateIndex
CREATE UNIQUE INDEX "Trade_id_tenantId_key" ON "Trade"("id", "tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "Fill_importHash_key" ON "Fill"("importHash");

-- CreateIndex
CREATE UNIQUE INDEX "Fill_id_tenantId_key" ON "Fill"("id", "tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "Post_importHash_key" ON "Post"("importHash");

-- CreateIndex
CREATE UNIQUE INDEX "Post_id_tenantId_key" ON "Post"("id", "tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "Comment_importHash_key" ON "Comment"("importHash");

-- CreateIndex
CREATE UNIQUE INDEX "Comment_id_tenantId_key" ON "Comment"("id", "tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "Article_importHash_key" ON "Article"("importHash");

-- CreateIndex
CREATE UNIQUE INDEX "Article_id_tenantId_key" ON "Article"("id", "tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "Chat_importHash_key" ON "Chat"("importHash");

-- CreateIndex
CREATE UNIQUE INDEX "Chat_id_tenantId_key" ON "Chat"("id", "tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "Chater_importHash_key" ON "Chater"("importHash");

-- CreateIndex
CREATE UNIQUE INDEX "Chater_id_tenantId_key" ON "Chater"("id", "tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "Message_importHash_key" ON "Message"("importHash");

-- CreateIndex
CREATE UNIQUE INDEX "Message_id_tenantId_key" ON "Message"("id", "tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "FeeSchedule_importHash_key" ON "FeeSchedule"("importHash");

-- CreateIndex
CREATE UNIQUE INDEX "FeeSchedule_id_tenantId_key" ON "FeeSchedule"("id", "tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "BalanceSnapshot_importHash_key" ON "BalanceSnapshot"("importHash");

-- CreateIndex
CREATE UNIQUE INDEX "BalanceSnapshot_id_tenantId_key" ON "BalanceSnapshot"("id", "tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "SystemAccount_importHash_key" ON "SystemAccount"("importHash");

-- CreateIndex
CREATE UNIQUE INDEX "SystemAccount_id_tenantId_key" ON "SystemAccount"("id", "tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "Feedback_importHash_key" ON "Feedback"("importHash");

-- CreateIndex
CREATE UNIQUE INDEX "Feedback_id_tenantId_key" ON "Feedback"("id", "tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "Job_importHash_key" ON "Job"("importHash");

-- CreateIndex
CREATE UNIQUE INDEX "Job_id_tenantId_key" ON "Job"("id", "tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "Listing_importHash_key" ON "Listing"("importHash");

-- CreateIndex
CREATE UNIQUE INDEX "Listing_id_tenantId_key" ON "Listing"("id", "tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "Referral_importHash_key" ON "Referral"("importHash");

-- CreateIndex
CREATE UNIQUE INDEX "Referral_id_tenantId_key" ON "Referral"("id", "tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "Notification_importHash_key" ON "Notification"("importHash");

-- CreateIndex
CREATE UNIQUE INDEX "Notification_id_tenantId_key" ON "Notification"("id", "tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "UserNotification_importHash_key" ON "UserNotification"("importHash");

-- CreateIndex
CREATE UNIQUE INDEX "UserNotification_id_tenantId_key" ON "UserNotification"("id", "tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "Candidate_importHash_key" ON "Candidate"("importHash");

-- CreateIndex
CREATE UNIQUE INDEX "Candidate_id_tenantId_key" ON "Candidate"("id", "tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "_buyOrderId_buys_AB_unique" ON "_buyOrderId_buys"("A", "B");

-- CreateIndex
CREATE INDEX "_buyOrderId_buys_B_index" ON "_buyOrderId_buys"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_sellOrderId_sells_AB_unique" ON "_sellOrderId_sells"("A", "B");

-- CreateIndex
CREATE INDEX "_sellOrderId_sells_B_index" ON "_sellOrderId_sells"("B");

-- AddForeignKey
ALTER TABLE "ApiKey" ADD CONSTRAINT "ApiKey_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApiKey" ADD CONSTRAINT "ApiKey_createdByMembershipId_fkey" FOREIGN KEY ("createdByMembershipId") REFERENCES "Membership"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApiKey" ADD CONSTRAINT "ApiKey_updatedByMembershipId_fkey" FOREIGN KEY ("updatedByMembershipId") REFERENCES "Membership"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApiKey" ADD CONSTRAINT "ApiKey_membershipId_fkey" FOREIGN KEY ("membershipId") REFERENCES "Membership"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Membership" ADD CONSTRAINT "Membership_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Membership" ADD CONSTRAINT "Membership_createdByMembershipId_fkey" FOREIGN KEY ("createdByMembershipId") REFERENCES "Membership"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Membership" ADD CONSTRAINT "Membership_updatedByMembershipId_fkey" FOREIGN KEY ("updatedByMembershipId") REFERENCES "Membership"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Membership" ADD CONSTRAINT "Membership_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_membershipId_fkey" FOREIGN KEY ("membershipId") REFERENCES "Membership"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_createdByMembershipId_fkey" FOREIGN KEY ("createdByMembershipId") REFERENCES "Membership"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_updatedByMembershipId_fkey" FOREIGN KEY ("updatedByMembershipId") REFERENCES "Membership"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_archivedByMembershipId_fkey" FOREIGN KEY ("archivedByMembershipId") REFERENCES "Membership"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Membership"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Wallet" ADD CONSTRAINT "Wallet_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Wallet" ADD CONSTRAINT "Wallet_createdByMembershipId_fkey" FOREIGN KEY ("createdByMembershipId") REFERENCES "Membership"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Wallet" ADD CONSTRAINT "Wallet_updatedByMembershipId_fkey" FOREIGN KEY ("updatedByMembershipId") REFERENCES "Membership"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Wallet" ADD CONSTRAINT "Wallet_archivedByMembershipId_fkey" FOREIGN KEY ("archivedByMembershipId") REFERENCES "Membership"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Wallet" ADD CONSTRAINT "Wallet_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Membership"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Wallet" ADD CONSTRAINT "Wallet_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "Asset"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Wallet" ADD CONSTRAINT "Wallet_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Deposit" ADD CONSTRAINT "Deposit_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Deposit" ADD CONSTRAINT "Deposit_createdByMembershipId_fkey" FOREIGN KEY ("createdByMembershipId") REFERENCES "Membership"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Deposit" ADD CONSTRAINT "Deposit_updatedByMembershipId_fkey" FOREIGN KEY ("updatedByMembershipId") REFERENCES "Membership"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Deposit" ADD CONSTRAINT "Deposit_archivedByMembershipId_fkey" FOREIGN KEY ("archivedByMembershipId") REFERENCES "Membership"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Deposit" ADD CONSTRAINT "Deposit_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Deposit" ADD CONSTRAINT "Deposit_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "Asset"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Withdrawal" ADD CONSTRAINT "Withdrawal_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Withdrawal" ADD CONSTRAINT "Withdrawal_createdByMembershipId_fkey" FOREIGN KEY ("createdByMembershipId") REFERENCES "Membership"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Withdrawal" ADD CONSTRAINT "Withdrawal_updatedByMembershipId_fkey" FOREIGN KEY ("updatedByMembershipId") REFERENCES "Membership"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Withdrawal" ADD CONSTRAINT "Withdrawal_archivedByMembershipId_fkey" FOREIGN KEY ("archivedByMembershipId") REFERENCES "Membership"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Withdrawal" ADD CONSTRAINT "Withdrawal_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Withdrawal" ADD CONSTRAINT "Withdrawal_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "Asset"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_createdByMembershipId_fkey" FOREIGN KEY ("createdByMembershipId") REFERENCES "Membership"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_updatedByMembershipId_fkey" FOREIGN KEY ("updatedByMembershipId") REFERENCES "Membership"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_archivedByMembershipId_fkey" FOREIGN KEY ("archivedByMembershipId") REFERENCES "Membership"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_instrumentId_fkey" FOREIGN KEY ("instrumentId") REFERENCES "Instrument"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Asset" ADD CONSTRAINT "Asset_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Asset" ADD CONSTRAINT "Asset_createdByMembershipId_fkey" FOREIGN KEY ("createdByMembershipId") REFERENCES "Membership"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Asset" ADD CONSTRAINT "Asset_updatedByMembershipId_fkey" FOREIGN KEY ("updatedByMembershipId") REFERENCES "Membership"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Asset" ADD CONSTRAINT "Asset_archivedByMembershipId_fkey" FOREIGN KEY ("archivedByMembershipId") REFERENCES "Membership"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Instrument" ADD CONSTRAINT "Instrument_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Instrument" ADD CONSTRAINT "Instrument_createdByMembershipId_fkey" FOREIGN KEY ("createdByMembershipId") REFERENCES "Membership"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Instrument" ADD CONSTRAINT "Instrument_updatedByMembershipId_fkey" FOREIGN KEY ("updatedByMembershipId") REFERENCES "Membership"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Instrument" ADD CONSTRAINT "Instrument_archivedByMembershipId_fkey" FOREIGN KEY ("archivedByMembershipId") REFERENCES "Membership"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Instrument" ADD CONSTRAINT "Instrument_underlyingAssetId_fkey" FOREIGN KEY ("underlyingAssetId") REFERENCES "Asset"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Instrument" ADD CONSTRAINT "Instrument_quoteAssetId_fkey" FOREIGN KEY ("quoteAssetId") REFERENCES "Asset"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LedgerEvent" ADD CONSTRAINT "LedgerEvent_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LedgerEvent" ADD CONSTRAINT "LedgerEvent_createdByMembershipId_fkey" FOREIGN KEY ("createdByMembershipId") REFERENCES "Membership"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LedgerEvent" ADD CONSTRAINT "LedgerEvent_updatedByMembershipId_fkey" FOREIGN KEY ("updatedByMembershipId") REFERENCES "Membership"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LedgerEvent" ADD CONSTRAINT "LedgerEvent_archivedByMembershipId_fkey" FOREIGN KEY ("archivedByMembershipId") REFERENCES "Membership"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LedgerEntry" ADD CONSTRAINT "LedgerEntry_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LedgerEntry" ADD CONSTRAINT "LedgerEntry_createdByMembershipId_fkey" FOREIGN KEY ("createdByMembershipId") REFERENCES "Membership"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LedgerEntry" ADD CONSTRAINT "LedgerEntry_updatedByMembershipId_fkey" FOREIGN KEY ("updatedByMembershipId") REFERENCES "Membership"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LedgerEntry" ADD CONSTRAINT "LedgerEntry_archivedByMembershipId_fkey" FOREIGN KEY ("archivedByMembershipId") REFERENCES "Membership"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LedgerEntry" ADD CONSTRAINT "LedgerEntry_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "LedgerEvent"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Trade" ADD CONSTRAINT "Trade_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Trade" ADD CONSTRAINT "Trade_createdByMembershipId_fkey" FOREIGN KEY ("createdByMembershipId") REFERENCES "Membership"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Trade" ADD CONSTRAINT "Trade_updatedByMembershipId_fkey" FOREIGN KEY ("updatedByMembershipId") REFERENCES "Membership"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Trade" ADD CONSTRAINT "Trade_archivedByMembershipId_fkey" FOREIGN KEY ("archivedByMembershipId") REFERENCES "Membership"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Trade" ADD CONSTRAINT "Trade_instrumentId_fkey" FOREIGN KEY ("instrumentId") REFERENCES "Instrument"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Fill" ADD CONSTRAINT "Fill_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Fill" ADD CONSTRAINT "Fill_createdByMembershipId_fkey" FOREIGN KEY ("createdByMembershipId") REFERENCES "Membership"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Fill" ADD CONSTRAINT "Fill_updatedByMembershipId_fkey" FOREIGN KEY ("updatedByMembershipId") REFERENCES "Membership"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Fill" ADD CONSTRAINT "Fill_archivedByMembershipId_fkey" FOREIGN KEY ("archivedByMembershipId") REFERENCES "Membership"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Fill" ADD CONSTRAINT "Fill_tradeId_fkey" FOREIGN KEY ("tradeId") REFERENCES "Trade"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Post" ADD CONSTRAINT "Post_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Post" ADD CONSTRAINT "Post_createdByMembershipId_fkey" FOREIGN KEY ("createdByMembershipId") REFERENCES "Membership"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Post" ADD CONSTRAINT "Post_updatedByMembershipId_fkey" FOREIGN KEY ("updatedByMembershipId") REFERENCES "Membership"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Post" ADD CONSTRAINT "Post_archivedByMembershipId_fkey" FOREIGN KEY ("archivedByMembershipId") REFERENCES "Membership"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Post" ADD CONSTRAINT "Post_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Membership"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_createdByMembershipId_fkey" FOREIGN KEY ("createdByMembershipId") REFERENCES "Membership"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_updatedByMembershipId_fkey" FOREIGN KEY ("updatedByMembershipId") REFERENCES "Membership"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_archivedByMembershipId_fkey" FOREIGN KEY ("archivedByMembershipId") REFERENCES "Membership"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Membership"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Article" ADD CONSTRAINT "Article_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Article" ADD CONSTRAINT "Article_createdByMembershipId_fkey" FOREIGN KEY ("createdByMembershipId") REFERENCES "Membership"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Article" ADD CONSTRAINT "Article_updatedByMembershipId_fkey" FOREIGN KEY ("updatedByMembershipId") REFERENCES "Membership"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Article" ADD CONSTRAINT "Article_archivedByMembershipId_fkey" FOREIGN KEY ("archivedByMembershipId") REFERENCES "Membership"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Article" ADD CONSTRAINT "Article_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Membership"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Chat" ADD CONSTRAINT "Chat_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Chat" ADD CONSTRAINT "Chat_createdByMembershipId_fkey" FOREIGN KEY ("createdByMembershipId") REFERENCES "Membership"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Chat" ADD CONSTRAINT "Chat_updatedByMembershipId_fkey" FOREIGN KEY ("updatedByMembershipId") REFERENCES "Membership"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Chat" ADD CONSTRAINT "Chat_archivedByMembershipId_fkey" FOREIGN KEY ("archivedByMembershipId") REFERENCES "Membership"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Chater" ADD CONSTRAINT "Chater_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Chater" ADD CONSTRAINT "Chater_createdByMembershipId_fkey" FOREIGN KEY ("createdByMembershipId") REFERENCES "Membership"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Chater" ADD CONSTRAINT "Chater_updatedByMembershipId_fkey" FOREIGN KEY ("updatedByMembershipId") REFERENCES "Membership"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Chater" ADD CONSTRAINT "Chater_archivedByMembershipId_fkey" FOREIGN KEY ("archivedByMembershipId") REFERENCES "Membership"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Chater" ADD CONSTRAINT "Chater_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Membership"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Chater" ADD CONSTRAINT "Chater_chatId_fkey" FOREIGN KEY ("chatId") REFERENCES "Chat"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_createdByMembershipId_fkey" FOREIGN KEY ("createdByMembershipId") REFERENCES "Membership"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_updatedByMembershipId_fkey" FOREIGN KEY ("updatedByMembershipId") REFERENCES "Membership"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_archivedByMembershipId_fkey" FOREIGN KEY ("archivedByMembershipId") REFERENCES "Membership"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_chatId_fkey" FOREIGN KEY ("chatId") REFERENCES "Chat"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_chaterId_fkey" FOREIGN KEY ("chaterId") REFERENCES "Chater"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "Membership"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FeeSchedule" ADD CONSTRAINT "FeeSchedule_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FeeSchedule" ADD CONSTRAINT "FeeSchedule_createdByMembershipId_fkey" FOREIGN KEY ("createdByMembershipId") REFERENCES "Membership"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FeeSchedule" ADD CONSTRAINT "FeeSchedule_updatedByMembershipId_fkey" FOREIGN KEY ("updatedByMembershipId") REFERENCES "Membership"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FeeSchedule" ADD CONSTRAINT "FeeSchedule_archivedByMembershipId_fkey" FOREIGN KEY ("archivedByMembershipId") REFERENCES "Membership"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BalanceSnapshot" ADD CONSTRAINT "BalanceSnapshot_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BalanceSnapshot" ADD CONSTRAINT "BalanceSnapshot_createdByMembershipId_fkey" FOREIGN KEY ("createdByMembershipId") REFERENCES "Membership"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BalanceSnapshot" ADD CONSTRAINT "BalanceSnapshot_updatedByMembershipId_fkey" FOREIGN KEY ("updatedByMembershipId") REFERENCES "Membership"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BalanceSnapshot" ADD CONSTRAINT "BalanceSnapshot_archivedByMembershipId_fkey" FOREIGN KEY ("archivedByMembershipId") REFERENCES "Membership"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BalanceSnapshot" ADD CONSTRAINT "BalanceSnapshot_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BalanceSnapshot" ADD CONSTRAINT "BalanceSnapshot_walletId_fkey" FOREIGN KEY ("walletId") REFERENCES "Wallet"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BalanceSnapshot" ADD CONSTRAINT "BalanceSnapshot_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "Asset"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SystemAccount" ADD CONSTRAINT "SystemAccount_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SystemAccount" ADD CONSTRAINT "SystemAccount_createdByMembershipId_fkey" FOREIGN KEY ("createdByMembershipId") REFERENCES "Membership"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SystemAccount" ADD CONSTRAINT "SystemAccount_updatedByMembershipId_fkey" FOREIGN KEY ("updatedByMembershipId") REFERENCES "Membership"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SystemAccount" ADD CONSTRAINT "SystemAccount_archivedByMembershipId_fkey" FOREIGN KEY ("archivedByMembershipId") REFERENCES "Membership"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Feedback" ADD CONSTRAINT "Feedback_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Feedback" ADD CONSTRAINT "Feedback_createdByMembershipId_fkey" FOREIGN KEY ("createdByMembershipId") REFERENCES "Membership"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Feedback" ADD CONSTRAINT "Feedback_updatedByMembershipId_fkey" FOREIGN KEY ("updatedByMembershipId") REFERENCES "Membership"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Feedback" ADD CONSTRAINT "Feedback_archivedByMembershipId_fkey" FOREIGN KEY ("archivedByMembershipId") REFERENCES "Membership"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Feedback" ADD CONSTRAINT "Feedback_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Membership"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Job" ADD CONSTRAINT "Job_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Job" ADD CONSTRAINT "Job_createdByMembershipId_fkey" FOREIGN KEY ("createdByMembershipId") REFERENCES "Membership"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Job" ADD CONSTRAINT "Job_updatedByMembershipId_fkey" FOREIGN KEY ("updatedByMembershipId") REFERENCES "Membership"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Job" ADD CONSTRAINT "Job_archivedByMembershipId_fkey" FOREIGN KEY ("archivedByMembershipId") REFERENCES "Membership"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Listing" ADD CONSTRAINT "Listing_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Listing" ADD CONSTRAINT "Listing_createdByMembershipId_fkey" FOREIGN KEY ("createdByMembershipId") REFERENCES "Membership"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Listing" ADD CONSTRAINT "Listing_updatedByMembershipId_fkey" FOREIGN KEY ("updatedByMembershipId") REFERENCES "Membership"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Listing" ADD CONSTRAINT "Listing_archivedByMembershipId_fkey" FOREIGN KEY ("archivedByMembershipId") REFERENCES "Membership"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Referral" ADD CONSTRAINT "Referral_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Referral" ADD CONSTRAINT "Referral_createdByMembershipId_fkey" FOREIGN KEY ("createdByMembershipId") REFERENCES "Membership"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Referral" ADD CONSTRAINT "Referral_updatedByMembershipId_fkey" FOREIGN KEY ("updatedByMembershipId") REFERENCES "Membership"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Referral" ADD CONSTRAINT "Referral_archivedByMembershipId_fkey" FOREIGN KEY ("archivedByMembershipId") REFERENCES "Membership"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_createdByMembershipId_fkey" FOREIGN KEY ("createdByMembershipId") REFERENCES "Membership"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_updatedByMembershipId_fkey" FOREIGN KEY ("updatedByMembershipId") REFERENCES "Membership"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_archivedByMembershipId_fkey" FOREIGN KEY ("archivedByMembershipId") REFERENCES "Membership"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserNotification" ADD CONSTRAINT "UserNotification_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserNotification" ADD CONSTRAINT "UserNotification_createdByMembershipId_fkey" FOREIGN KEY ("createdByMembershipId") REFERENCES "Membership"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserNotification" ADD CONSTRAINT "UserNotification_updatedByMembershipId_fkey" FOREIGN KEY ("updatedByMembershipId") REFERENCES "Membership"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserNotification" ADD CONSTRAINT "UserNotification_archivedByMembershipId_fkey" FOREIGN KEY ("archivedByMembershipId") REFERENCES "Membership"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserNotification" ADD CONSTRAINT "UserNotification_notificationId_fkey" FOREIGN KEY ("notificationId") REFERENCES "Notification"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserNotification" ADD CONSTRAINT "UserNotification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Membership"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Candidate" ADD CONSTRAINT "Candidate_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Candidate" ADD CONSTRAINT "Candidate_createdByMembershipId_fkey" FOREIGN KEY ("createdByMembershipId") REFERENCES "Membership"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Candidate" ADD CONSTRAINT "Candidate_updatedByMembershipId_fkey" FOREIGN KEY ("updatedByMembershipId") REFERENCES "Membership"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Candidate" ADD CONSTRAINT "Candidate_archivedByMembershipId_fkey" FOREIGN KEY ("archivedByMembershipId") REFERENCES "Membership"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_buyOrderId_buys" ADD CONSTRAINT "_buyOrderId_buys_A_fkey" FOREIGN KEY ("A") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_buyOrderId_buys" ADD CONSTRAINT "_buyOrderId_buys_B_fkey" FOREIGN KEY ("B") REFERENCES "Trade"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_sellOrderId_sells" ADD CONSTRAINT "_sellOrderId_sells_A_fkey" FOREIGN KEY ("A") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_sellOrderId_sells" ADD CONSTRAINT "_sellOrderId_sells_B_fkey" FOREIGN KEY ("B") REFERENCES "Trade"("id") ON DELETE CASCADE ON UPDATE CASCADE;
