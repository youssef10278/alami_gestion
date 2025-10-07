-- CreateEnum
CREATE TYPE "SaleCheckStatus" AS ENUM ('PENDING', 'CASHED', 'BOUNCED', 'CANCELLED');

-- AlterEnum
ALTER TYPE "PaymentMethod" ADD VALUE 'CHECK';

-- CreateTable
CREATE TABLE "sale_checks" (
    "id" TEXT NOT NULL,
    "saleId" TEXT NOT NULL,
    "checkNumber" TEXT NOT NULL,
    "issuer" TEXT NOT NULL,
    "beneficiary" TEXT NOT NULL,
    "checkDate" TIMESTAMP(3) NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "status" "SaleCheckStatus" NOT NULL DEFAULT 'PENDING',
    "cashedDate" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sale_checks_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "sale_checks_saleId_key" ON "sale_checks"("saleId");

-- CreateIndex
CREATE INDEX "sale_checks_checkNumber_idx" ON "sale_checks"("checkNumber");

-- CreateIndex
CREATE INDEX "sale_checks_status_idx" ON "sale_checks"("status");

-- CreateIndex
CREATE INDEX "sale_checks_checkDate_idx" ON "sale_checks"("checkDate");

-- CreateIndex
CREATE INDEX "sale_checks_saleId_idx" ON "sale_checks"("saleId");

-- AddForeignKey
ALTER TABLE "sale_checks" ADD CONSTRAINT "sale_checks_saleId_fkey" FOREIGN KEY ("saleId") REFERENCES "Sale"("id") ON DELETE CASCADE ON UPDATE CASCADE;
