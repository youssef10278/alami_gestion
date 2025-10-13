-- CreateEnum
CREATE TYPE "CreditPaymentCheckStatus" AS ENUM ('PENDING', 'CASHED', 'BOUNCED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "ReturnStatus" AS ENUM ('GOOD', 'DEFECTIVE', 'UNUSABLE');

-- AlterEnum
ALTER TYPE "SaleStatus" ADD VALUE 'PARTIAL';

-- DropForeignKey
ALTER TABLE "public"."CreditPayment" DROP CONSTRAINT "CreditPayment_saleId_fkey";

-- AlterTable
ALTER TABLE "CreditPayment" ADD COLUMN     "paymentMethod" TEXT NOT NULL DEFAULT 'CASH',
ALTER COLUMN "saleId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "defectiveStock" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "company_settings" ADD COLUMN     "quoteTheme" TEXT NOT NULL DEFAULT 'modern',
ADD COLUMN     "showTermsAndConditions" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "showValidityPeriod" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "termsAndConditionsText" TEXT NOT NULL DEFAULT 'Conditions générales de vente disponibles sur demande.',
ADD COLUMN     "validityPeriodText" TEXT NOT NULL DEFAULT 'Ce devis est valable 30 jours à compter de la date d''émission.';

-- CreateTable
CREATE TABLE "ProductReturn" (
    "id" TEXT NOT NULL,
    "invoiceId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "returnStatus" "ReturnStatus" NOT NULL,
    "reason" TEXT,
    "restockedQuantity" INTEGER NOT NULL DEFAULT 0,
    "processedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProductReturn_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "credit_payment_checks" (
    "id" TEXT NOT NULL,
    "creditPaymentId" TEXT NOT NULL,
    "checkNumber" TEXT NOT NULL,
    "issuer" TEXT NOT NULL,
    "beneficiary" TEXT NOT NULL,
    "checkDate" TIMESTAMP(3) NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "status" "CreditPaymentCheckStatus" NOT NULL DEFAULT 'PENDING',
    "cashedDate" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "credit_payment_checks_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ProductReturn_invoiceId_idx" ON "ProductReturn"("invoiceId");

-- CreateIndex
CREATE INDEX "ProductReturn_productId_idx" ON "ProductReturn"("productId");

-- CreateIndex
CREATE INDEX "ProductReturn_returnStatus_idx" ON "ProductReturn"("returnStatus");

-- CreateIndex
CREATE INDEX "ProductReturn_createdAt_idx" ON "ProductReturn"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "credit_payment_checks_creditPaymentId_key" ON "credit_payment_checks"("creditPaymentId");

-- CreateIndex
CREATE INDEX "credit_payment_checks_checkNumber_idx" ON "credit_payment_checks"("checkNumber");

-- CreateIndex
CREATE INDEX "credit_payment_checks_status_idx" ON "credit_payment_checks"("status");

-- CreateIndex
CREATE INDEX "credit_payment_checks_checkDate_idx" ON "credit_payment_checks"("checkDate");

-- CreateIndex
CREATE INDEX "credit_payment_checks_creditPaymentId_idx" ON "credit_payment_checks"("creditPaymentId");

-- AddForeignKey
ALTER TABLE "CreditPayment" ADD CONSTRAINT "CreditPayment_saleId_fkey" FOREIGN KEY ("saleId") REFERENCES "Sale"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductReturn" ADD CONSTRAINT "ProductReturn_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "Invoice"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductReturn" ADD CONSTRAINT "ProductReturn_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "credit_payment_checks" ADD CONSTRAINT "credit_payment_checks_creditPaymentId_fkey" FOREIGN KEY ("creditPaymentId") REFERENCES "CreditPayment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
