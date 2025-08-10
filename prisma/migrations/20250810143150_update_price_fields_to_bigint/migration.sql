-- AlterTable
ALTER TABLE "payments" ALTER COLUMN "amount" SET DATA TYPE BIGINT,
ALTER COLUMN "refundAmount" SET DATA TYPE BIGINT;

-- AlterTable
ALTER TABLE "payouts" ALTER COLUMN "amount" SET DATA TYPE BIGINT;

-- AlterTable
ALTER TABLE "premium_features" ALTER COLUMN "price" SET DATA TYPE BIGINT;

-- AlterTable
ALTER TABLE "properties" ALTER COLUMN "price" SET DATA TYPE BIGINT;
