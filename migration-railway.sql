-- ========================================
-- MIGRATION RAILWAY : SOLUTION HYBRIDE + CHÈQUES DE CRÉDIT
-- ========================================

-- Étape 1 : Ajouter la colonne paymentMethod avec valeur par défaut
ALTER TABLE "CreditPayment" ADD COLUMN IF NOT EXISTS "paymentMethod" TEXT NOT NULL DEFAULT 'CASH';

-- Étape 2 : Supprimer la contrainte de clé étrangère existante sur saleId
ALTER TABLE "CreditPayment" DROP CONSTRAINT IF EXISTS "CreditPayment_saleId_fkey";

-- Étape 3 : Modifier saleId pour le rendre nullable
ALTER TABLE "CreditPayment" ALTER COLUMN "saleId" DROP NOT NULL;

-- Étape 4 : Recréer la contrainte de clé étrangère
ALTER TABLE "CreditPayment" ADD CONSTRAINT "CreditPayment_saleId_fkey"
  FOREIGN KEY ("saleId") REFERENCES "Sale"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Étape 5 : Ajouter le statut PARTIAL à l'enum SaleStatus
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum
        WHERE enumlabel = 'PARTIAL'
        AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'SaleStatus')
    ) THEN
        ALTER TYPE "SaleStatus" ADD VALUE 'PARTIAL';
    END IF;
END $$;

-- Étape 6 : Créer l'enum CreditPaymentCheckStatus
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'CreditPaymentCheckStatus') THEN
        CREATE TYPE "CreditPaymentCheckStatus" AS ENUM ('PENDING', 'CASHED', 'BOUNCED', 'CANCELLED');
    END IF;
END $$;

-- Étape 7 : Créer la table credit_payment_checks
CREATE TABLE IF NOT EXISTS "credit_payment_checks" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "creditPaymentId" TEXT NOT NULL UNIQUE,
    "checkNumber" TEXT NOT NULL,
    "issuer" TEXT NOT NULL,
    "beneficiary" TEXT NOT NULL,
    "checkDate" TIMESTAMP(3) NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "status" "CreditPaymentCheckStatus" NOT NULL DEFAULT 'PENDING',
    "cashedDate" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "credit_payment_checks_creditPaymentId_fkey"
        FOREIGN KEY ("creditPaymentId") REFERENCES "CreditPayment"("id")
        ON DELETE CASCADE ON UPDATE CASCADE
);

-- Étape 8 : Créer les index pour credit_payment_checks
CREATE INDEX IF NOT EXISTS "credit_payment_checks_checkNumber_idx" ON "credit_payment_checks"("checkNumber");
CREATE INDEX IF NOT EXISTS "credit_payment_checks_status_idx" ON "credit_payment_checks"("status");
CREATE INDEX IF NOT EXISTS "credit_payment_checks_checkDate_idx" ON "credit_payment_checks"("checkDate");
CREATE INDEX IF NOT EXISTS "credit_payment_checks_creditPaymentId_idx" ON "credit_payment_checks"("creditPaymentId");

