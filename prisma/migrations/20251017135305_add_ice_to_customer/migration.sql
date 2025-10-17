-- AlterTable
ALTER TABLE "Customer" ADD COLUMN     "ice" TEXT;

-- CreateIndex
CREATE INDEX "Customer_ice_idx" ON "Customer"("ice");
