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
    "meta" JSONB,
    "files" JSONB,
    "images" JSONB,
    "type" TEXT[] DEFAULT ARRAY[]::TEXT[],
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
    "meta" JSONB,
    "type" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "images" JSONB,
    "userId" UUID NOT NULL,

    CONSTRAINT "Comment_pkey" PRIMARY KEY ("id")
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
    "meta" JSONB,
    "side" TEXT,
    "type" TEXT,
    "price" DECIMAL(65,30),
    "quantity" DECIMAL(65,30),
    "status" TEXT,
    "timeInFore" TEXT,
    "quantityFilled" DECIMAL(65,30),
    "userId" UUID,
    "accountId" UUID,
    "instrumentId" UUID,

    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
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
    "meta" JSONB,
    "type" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "images" JSONB,
    "files" JSONB,
    "userId" UUID,

    CONSTRAINT "Article_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Item" (
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
    "caption" TEXT,
    "description" TEXT,
    "price" DECIMAL(65,30),
    "photos" JSONB,
    "category" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "meta" JSONB,
    "files" JSONB,

    CONSTRAINT "Item_pkey" PRIMARY KEY ("id")
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
CREATE TABLE "Chatee" (
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
    "userId" UUID,
    "chatId" UUID,

    CONSTRAINT "Chatee_pkey" PRIMARY KEY ("id")
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
    "chateeId" UUID,
    "senderId" UUID,

    CONSTRAINT "Message_pkey" PRIMARY KEY ("id")
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
    "type" TEXT,
    "precision" INTEGER,
    "isFractional" BOOLEAN NOT NULL DEFAULT false,
    "meta" JSONB,

    CONSTRAINT "Asset_pkey" PRIMARY KEY ("id")
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

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
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
    "type" TEXT,
    "meta" JSONB,
    "status" TEXT,
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
    "referenceType" TEXT,

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
    "instrumentId" UUID,

    CONSTRAINT "Trade_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TradeFill" (
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
    "tradeId" UUID,

    CONSTRAINT "TradeFill_pkey" PRIMARY KEY ("id")
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
CREATE UNIQUE INDEX "Post_importHash_key" ON "Post"("importHash");

-- CreateIndex
CREATE UNIQUE INDEX "Post_id_tenantId_key" ON "Post"("id", "tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "Comment_importHash_key" ON "Comment"("importHash");

-- CreateIndex
CREATE UNIQUE INDEX "Comment_id_tenantId_key" ON "Comment"("id", "tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "Order_importHash_key" ON "Order"("importHash");

-- CreateIndex
CREATE UNIQUE INDEX "Order_id_tenantId_key" ON "Order"("id", "tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "Article_importHash_key" ON "Article"("importHash");

-- CreateIndex
CREATE UNIQUE INDEX "Article_id_tenantId_key" ON "Article"("id", "tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "Item_importHash_key" ON "Item"("importHash");

-- CreateIndex
CREATE UNIQUE INDEX "Item_id_tenantId_key" ON "Item"("id", "tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "Chat_importHash_key" ON "Chat"("importHash");

-- CreateIndex
CREATE UNIQUE INDEX "Chat_id_tenantId_key" ON "Chat"("id", "tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "Chatee_importHash_key" ON "Chatee"("importHash");

-- CreateIndex
CREATE UNIQUE INDEX "Chatee_id_tenantId_key" ON "Chatee"("id", "tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "Message_importHash_key" ON "Message"("importHash");

-- CreateIndex
CREATE UNIQUE INDEX "Message_id_tenantId_key" ON "Message"("id", "tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "Asset_importHash_key" ON "Asset"("importHash");

-- CreateIndex
CREATE UNIQUE INDEX "Asset_id_tenantId_key" ON "Asset"("id", "tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "Account_importHash_key" ON "Account"("importHash");

-- CreateIndex
CREATE UNIQUE INDEX "Account_id_tenantId_key" ON "Account"("id", "tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "Instrument_importHash_key" ON "Instrument"("importHash");

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
CREATE UNIQUE INDEX "TradeFill_importHash_key" ON "TradeFill"("importHash");

-- CreateIndex
CREATE UNIQUE INDEX "TradeFill_id_tenantId_key" ON "TradeFill"("id", "tenantId");

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
ALTER TABLE "Order" ADD CONSTRAINT "Order_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_createdByMembershipId_fkey" FOREIGN KEY ("createdByMembershipId") REFERENCES "Membership"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_updatedByMembershipId_fkey" FOREIGN KEY ("updatedByMembershipId") REFERENCES "Membership"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_archivedByMembershipId_fkey" FOREIGN KEY ("archivedByMembershipId") REFERENCES "Membership"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Membership"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_instrumentId_fkey" FOREIGN KEY ("instrumentId") REFERENCES "Instrument"("id") ON DELETE SET NULL ON UPDATE CASCADE;

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
ALTER TABLE "Item" ADD CONSTRAINT "Item_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Item" ADD CONSTRAINT "Item_createdByMembershipId_fkey" FOREIGN KEY ("createdByMembershipId") REFERENCES "Membership"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Item" ADD CONSTRAINT "Item_updatedByMembershipId_fkey" FOREIGN KEY ("updatedByMembershipId") REFERENCES "Membership"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Item" ADD CONSTRAINT "Item_archivedByMembershipId_fkey" FOREIGN KEY ("archivedByMembershipId") REFERENCES "Membership"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Chat" ADD CONSTRAINT "Chat_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Chat" ADD CONSTRAINT "Chat_createdByMembershipId_fkey" FOREIGN KEY ("createdByMembershipId") REFERENCES "Membership"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Chat" ADD CONSTRAINT "Chat_updatedByMembershipId_fkey" FOREIGN KEY ("updatedByMembershipId") REFERENCES "Membership"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Chat" ADD CONSTRAINT "Chat_archivedByMembershipId_fkey" FOREIGN KEY ("archivedByMembershipId") REFERENCES "Membership"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Chatee" ADD CONSTRAINT "Chatee_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Chatee" ADD CONSTRAINT "Chatee_createdByMembershipId_fkey" FOREIGN KEY ("createdByMembershipId") REFERENCES "Membership"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Chatee" ADD CONSTRAINT "Chatee_updatedByMembershipId_fkey" FOREIGN KEY ("updatedByMembershipId") REFERENCES "Membership"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Chatee" ADD CONSTRAINT "Chatee_archivedByMembershipId_fkey" FOREIGN KEY ("archivedByMembershipId") REFERENCES "Membership"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Chatee" ADD CONSTRAINT "Chatee_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Membership"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Chatee" ADD CONSTRAINT "Chatee_chatId_fkey" FOREIGN KEY ("chatId") REFERENCES "Chat"("id") ON DELETE SET NULL ON UPDATE CASCADE;

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
ALTER TABLE "Message" ADD CONSTRAINT "Message_chateeId_fkey" FOREIGN KEY ("chateeId") REFERENCES "Chatee"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "Membership"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Asset" ADD CONSTRAINT "Asset_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Asset" ADD CONSTRAINT "Asset_createdByMembershipId_fkey" FOREIGN KEY ("createdByMembershipId") REFERENCES "Membership"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Asset" ADD CONSTRAINT "Asset_updatedByMembershipId_fkey" FOREIGN KEY ("updatedByMembershipId") REFERENCES "Membership"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Asset" ADD CONSTRAINT "Asset_archivedByMembershipId_fkey" FOREIGN KEY ("archivedByMembershipId") REFERENCES "Membership"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_createdByMembershipId_fkey" FOREIGN KEY ("createdByMembershipId") REFERENCES "Membership"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_updatedByMembershipId_fkey" FOREIGN KEY ("updatedByMembershipId") REFERENCES "Membership"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_archivedByMembershipId_fkey" FOREIGN KEY ("archivedByMembershipId") REFERENCES "Membership"("id") ON DELETE SET NULL ON UPDATE CASCADE;

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
ALTER TABLE "TradeFill" ADD CONSTRAINT "TradeFill_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TradeFill" ADD CONSTRAINT "TradeFill_createdByMembershipId_fkey" FOREIGN KEY ("createdByMembershipId") REFERENCES "Membership"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TradeFill" ADD CONSTRAINT "TradeFill_updatedByMembershipId_fkey" FOREIGN KEY ("updatedByMembershipId") REFERENCES "Membership"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TradeFill" ADD CONSTRAINT "TradeFill_archivedByMembershipId_fkey" FOREIGN KEY ("archivedByMembershipId") REFERENCES "Membership"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TradeFill" ADD CONSTRAINT "TradeFill_tradeId_fkey" FOREIGN KEY ("tradeId") REFERENCES "Trade"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_buyOrderId_buys" ADD CONSTRAINT "_buyOrderId_buys_A_fkey" FOREIGN KEY ("A") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_buyOrderId_buys" ADD CONSTRAINT "_buyOrderId_buys_B_fkey" FOREIGN KEY ("B") REFERENCES "Trade"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_sellOrderId_sells" ADD CONSTRAINT "_sellOrderId_sells_A_fkey" FOREIGN KEY ("A") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_sellOrderId_sells" ADD CONSTRAINT "_sellOrderId_sells_B_fkey" FOREIGN KEY ("B") REFERENCES "Trade"("id") ON DELETE CASCADE ON UPDATE CASCADE;
