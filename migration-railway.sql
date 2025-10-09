-- Migration pour Railway : Solution Hybride de Gestion des Paiements de Crédit

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
ALTER TYPE "SaleStatus" ADD VALUE IF NOT EXISTS 'PARTIAL';

