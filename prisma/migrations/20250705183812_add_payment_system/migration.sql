/*
  Warnings:

  - You are about to drop the column `price` on the `availability` table. All the data in the column will be lost.
  - You are about to drop the column `guests` on the `bookings` table. All the data in the column will be lost.
  - You are about to drop the column `paystackPaymentId` on the `bookings` table. All the data in the column will be lost.
  - You are about to drop the column `totalPrice` on the `bookings` table. All the data in the column will be lost.
  - Added the required column `updatedAt` to the `availability` table without a default value. This is not possible if the table is not empty.
  - Added the required column `adults` to the `bookings` table without a default value. This is not possible if the table is not empty.
  - Added the required column `basePrice` to the `bookings` table without a default value. This is not possible if the table is not empty.
  - Added the required column `numberOfGuests` to the `bookings` table without a default value. This is not possible if the table is not empty.
  - Added the required column `totalAmount` to the `bookings` table without a default value. This is not possible if the table is not empty.
  - Added the required column `totalNights` to the `bookings` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('CARD', 'BANK_TRANSFER', 'USSD', 'MOBILE_MONEY', 'WALLET');

-- CreateEnum
CREATE TYPE "PaymentType" AS ENUM ('BOOKING_PAYMENT', 'SECURITY_DEPOSIT', 'CLEANING_FEE', 'SERVICE_FEE', 'PREMIUM_FEATURE', 'SUBSCRIPTION', 'REFUND');

-- CreateEnum
CREATE TYPE "PremiumFeatureType" AS ENUM ('PREMIUM_LISTING', 'FEATURED_LISTING', 'TOP_PLACEMENT', 'PRIORITY_SUPPORT', 'ANALYTICS_DASHBOARD', 'MULTIPLE_PROPERTY_MANAGEMENT', 'CUSTOM_BRANDING');

-- CreateEnum
CREATE TYPE "PayoutStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'CANCELLED');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "BookingStatus" ADD VALUE 'CHECKED_IN';
ALTER TYPE "BookingStatus" ADD VALUE 'CHECKED_OUT';

-- AlterEnum
ALTER TYPE "PaymentStatus" ADD VALUE 'PARTIALLY_REFUNDED';

-- AlterTable
ALTER TABLE "availability" DROP COLUMN "price",
ADD COLUMN     "customPrice" INTEGER,
ADD COLUMN     "minimumStay" INTEGER,
ADD COLUMN     "notes" TEXT,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "bookings" DROP COLUMN "guests",
DROP COLUMN "paystackPaymentId",
DROP COLUMN "totalPrice",
ADD COLUMN     "adults" INTEGER NOT NULL,
ADD COLUMN     "basePrice" INTEGER NOT NULL,
ADD COLUMN     "cancellationReason" TEXT,
ADD COLUMN     "cancelledAt" TIMESTAMP(3),
ADD COLUMN     "cancelledBy" TEXT,
ADD COLUMN     "children" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "currency" "Currency" NOT NULL DEFAULT 'NGN',
ADD COLUMN     "discounts" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "guestNotes" TEXT,
ADD COLUMN     "hostNotes" TEXT,
ADD COLUMN     "numberOfGuests" INTEGER NOT NULL,
ADD COLUMN     "paidAt" TIMESTAMP(3),
ADD COLUMN     "paymentIntentId" TEXT,
ADD COLUMN     "refundAmount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "refundedAt" TIMESTAMP(3),
ADD COLUMN     "securityDeposit" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "specialRequests" TEXT,
ADD COLUMN     "totalAmount" INTEGER NOT NULL,
ADD COLUMN     "totalNights" INTEGER NOT NULL,
ALTER COLUMN "checkIn" SET DATA TYPE DATE,
ALTER COLUMN "checkOut" SET DATA TYPE DATE;

-- AlterTable
ALTER TABLE "reviews" ADD COLUMN     "bookingId" TEXT;

-- CreateTable
CREATE TABLE "payments" (
    "id" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "currency" "Currency" NOT NULL DEFAULT 'NGN',
    "paymentMethod" "PaymentMethod" NOT NULL,
    "paymentType" "PaymentType" NOT NULL,
    "paystackReference" TEXT,
    "paystackAuthorizationCode" TEXT,
    "paystackChannel" TEXT,
    "paystackFees" INTEGER NOT NULL DEFAULT 0,
    "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "gatewayResponse" TEXT,
    "paidAt" TIMESTAMP(3),
    "refundAmount" INTEGER NOT NULL DEFAULT 0,
    "refundedAt" TIMESTAMP(3),
    "refundReason" TEXT,
    "bookingId" TEXT,
    "userId" TEXT NOT NULL,
    "premiumFeatureId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "premium_features" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "price" INTEGER NOT NULL,
    "currency" "Currency" NOT NULL DEFAULT 'NGN',
    "duration" INTEGER,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "featureType" "PremiumFeatureType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "premium_features_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_subscriptions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "premiumFeatureId" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "autoRenew" BOOLEAN NOT NULL DEFAULT false,
    "lastPaymentId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_subscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payouts" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "currency" "Currency" NOT NULL DEFAULT 'NGN',
    "bankCode" TEXT NOT NULL,
    "accountNumber" TEXT NOT NULL,
    "accountName" TEXT NOT NULL,
    "status" "PayoutStatus" NOT NULL DEFAULT 'PENDING',
    "paystackTransferCode" TEXT,
    "failureReason" TEXT,
    "processedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payouts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "payments_paystackReference_key" ON "payments"("paystackReference");

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "bookings"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "bookings"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_premiumFeatureId_fkey" FOREIGN KEY ("premiumFeatureId") REFERENCES "premium_features"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_subscriptions" ADD CONSTRAINT "user_subscriptions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_subscriptions" ADD CONSTRAINT "user_subscriptions_premiumFeatureId_fkey" FOREIGN KEY ("premiumFeatureId") REFERENCES "premium_features"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_subscriptions" ADD CONSTRAINT "user_subscriptions_lastPaymentId_fkey" FOREIGN KEY ("lastPaymentId") REFERENCES "payments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payouts" ADD CONSTRAINT "payouts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
