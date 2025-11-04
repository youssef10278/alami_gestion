-- ============================================================================
-- MIGRATION: Ajout du Module Gestion des Dépenses
-- Date: 2025-01-04
-- Application: Alami Gestion
-- Base de données: PostgreSQL (Railway)
-- ============================================================================

-- ============================================================================
-- ÉTAPE 1: Création des Tables
-- ============================================================================

-- Table: ExpenseCategory
-- Description: Catégories de dépenses (Loyer, Salaires, Électricité, etc.)
CREATE TABLE IF NOT EXISTS "ExpenseCategory" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "color" TEXT DEFAULT '#3b82f6',
    "icon" TEXT DEFAULT '💰',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ExpenseCategory_pkey" PRIMARY KEY ("id")
);

-- Table: Expense
-- Description: Dépenses de l'entreprise
CREATE TABLE IF NOT EXISTS "Expense" (
    "id" TEXT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "description" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "categoryId" TEXT NOT NULL,
    "paymentMethod" "PaymentMethod" NOT NULL DEFAULT 'CASH',
    "reference" TEXT,
    "receipt" TEXT,
    "notes" TEXT,
    "userId" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Expense_pkey" PRIMARY KEY ("id")
);

-- ============================================================================
-- ÉTAPE 2: Création des Index
-- ============================================================================

-- Index pour ExpenseCategory
CREATE UNIQUE INDEX IF NOT EXISTS "ExpenseCategory_name_key" ON "ExpenseCategory"("name");
CREATE INDEX IF NOT EXISTS "ExpenseCategory_name_idx" ON "ExpenseCategory"("name");
CREATE INDEX IF NOT EXISTS "ExpenseCategory_isActive_idx" ON "ExpenseCategory"("isActive");

-- Index pour Expense
CREATE INDEX IF NOT EXISTS "Expense_categoryId_idx" ON "Expense"("categoryId");
CREATE INDEX IF NOT EXISTS "Expense_userId_idx" ON "Expense"("userId");
CREATE INDEX IF NOT EXISTS "Expense_date_idx" ON "Expense"("date");
CREATE INDEX IF NOT EXISTS "Expense_isActive_idx" ON "Expense"("isActive");

-- ============================================================================
-- ÉTAPE 3: Ajout des Foreign Keys
-- ============================================================================

-- Foreign Key: Expense -> ExpenseCategory
ALTER TABLE "Expense" 
DROP CONSTRAINT IF EXISTS "Expense_categoryId_fkey";

ALTER TABLE "Expense" 
ADD CONSTRAINT "Expense_categoryId_fkey" 
FOREIGN KEY ("categoryId") REFERENCES "ExpenseCategory"("id") 
ON DELETE RESTRICT ON UPDATE CASCADE;

-- Foreign Key: Expense -> User
ALTER TABLE "Expense" 
DROP CONSTRAINT IF EXISTS "Expense_userId_fkey";

ALTER TABLE "Expense" 
ADD CONSTRAINT "Expense_userId_fkey" 
FOREIGN KEY ("userId") REFERENCES "User"("id") 
ON DELETE RESTRICT ON UPDATE CASCADE;

-- ============================================================================
-- ÉTAPE 4: Seed des Catégories par Défaut (15 catégories)
-- ============================================================================

-- Fonction pour générer un CUID (identifiant unique)
-- Note: Utilisez une extension ou générez les IDs côté application
-- Pour simplifier, nous utilisons gen_random_uuid() converti en texte

-- Catégorie 1: Loyer
INSERT INTO "ExpenseCategory" ("id", "name", "icon", "color", "description", "isActive", "createdAt", "updatedAt")
SELECT 
    'exp_cat_' || replace(gen_random_uuid()::text, '-', ''),
    'Loyer',
    '🏢',
    '#3b82f6',
    'Loyer des locaux commerciaux',
    true,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
WHERE NOT EXISTS (
    SELECT 1 FROM "ExpenseCategory" WHERE "name" = 'Loyer'
);

-- Catégorie 2: Salaires
INSERT INTO "ExpenseCategory" ("id", "name", "icon", "color", "description", "isActive", "createdAt", "updatedAt")
SELECT 
    'exp_cat_' || replace(gen_random_uuid()::text, '-', ''),
    'Salaires',
    '💰',
    '#10b981',
    'Salaires et charges sociales',
    true,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
WHERE NOT EXISTS (
    SELECT 1 FROM "ExpenseCategory" WHERE "name" = 'Salaires'
);

-- Catégorie 3: Électricité
INSERT INTO "ExpenseCategory" ("id", "name", "icon", "color", "description", "isActive", "createdAt", "updatedAt")
SELECT 
    'exp_cat_' || replace(gen_random_uuid()::text, '-', ''),
    'Électricité',
    '⚡',
    '#f59e0b',
    'Factures d''électricité',
    true,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
WHERE NOT EXISTS (
    SELECT 1 FROM "ExpenseCategory" WHERE "name" = 'Électricité'
);

-- Catégorie 4: Eau
INSERT INTO "ExpenseCategory" ("id", "name", "icon", "color", "description", "isActive", "createdAt", "updatedAt")
SELECT 
    'exp_cat_' || replace(gen_random_uuid()::text, '-', ''),
    'Eau',
    '💧',
    '#06b6d4',
    'Factures d''eau',
    true,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
WHERE NOT EXISTS (
    SELECT 1 FROM "ExpenseCategory" WHERE "name" = 'Eau'
);

-- Catégorie 5: Internet
INSERT INTO "ExpenseCategory" ("id", "name", "icon", "color", "description", "isActive", "createdAt", "updatedAt")
SELECT 
    'exp_cat_' || replace(gen_random_uuid()::text, '-', ''),
    'Internet',
    '🌐',
    '#8b5cf6',
    'Abonnement internet et téléphonie',
    true,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
WHERE NOT EXISTS (
    SELECT 1 FROM "ExpenseCategory" WHERE "name" = 'Internet'
);

-- Catégorie 6: Téléphone
INSERT INTO "ExpenseCategory" ("id", "name", "icon", "color", "description", "isActive", "createdAt", "updatedAt")
SELECT 
    'exp_cat_' || replace(gen_random_uuid()::text, '-', ''),
    'Téléphone',
    '📱',
    '#ec4899',
    'Factures téléphoniques',
    true,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
WHERE NOT EXISTS (
    SELECT 1 FROM "ExpenseCategory" WHERE "name" = 'Téléphone'
);

-- Catégorie 7: Fournitures
INSERT INTO "ExpenseCategory" ("id", "name", "icon", "color", "description", "isActive", "createdAt", "updatedAt")
SELECT 
    'exp_cat_' || replace(gen_random_uuid()::text, '-', ''),
    'Fournitures',
    '📦',
    '#6366f1',
    'Fournitures de bureau et consommables',
    true,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
WHERE NOT EXISTS (
    SELECT 1 FROM "ExpenseCategory" WHERE "name" = 'Fournitures'
);

-- Catégorie 8: Marketing
INSERT INTO "ExpenseCategory" ("id", "name", "icon", "color", "description", "isActive", "createdAt", "updatedAt")
SELECT 
    'exp_cat_' || replace(gen_random_uuid()::text, '-', ''),
    'Marketing',
    '📢',
    '#f43f5e',
    'Publicité et marketing',
    true,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
WHERE NOT EXISTS (
    SELECT 1 FROM "ExpenseCategory" WHERE "name" = 'Marketing'
);

-- Catégorie 9: Transport
INSERT INTO "ExpenseCategory" ("id", "name", "icon", "color", "description", "isActive", "createdAt", "updatedAt")
SELECT 
    'exp_cat_' || replace(gen_random_uuid()::text, '-', ''),
    'Transport',
    '🚗',
    '#14b8a6',
    'Frais de transport et carburant',
    true,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
WHERE NOT EXISTS (
    SELECT 1 FROM "ExpenseCategory" WHERE "name" = 'Transport'
);

-- Catégorie 10: Entretien
INSERT INTO "ExpenseCategory" ("id", "name", "icon", "color", "description", "isActive", "createdAt", "updatedAt")
SELECT 
    'exp_cat_' || replace(gen_random_uuid()::text, '-', ''),
    'Entretien',
    '🔧',
    '#84cc16',
    'Entretien et réparations',
    true,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
WHERE NOT EXISTS (
    SELECT 1 FROM "ExpenseCategory" WHERE "name" = 'Entretien'
);

-- Catégorie 11: Assurance
INSERT INTO "ExpenseCategory" ("id", "name", "icon", "color", "description", "isActive", "createdAt", "updatedAt")
SELECT 
    'exp_cat_' || replace(gen_random_uuid()::text, '-', ''),
    'Assurance',
    '🛡️',
    '#0ea5e9',
    'Assurances diverses',
    true,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
WHERE NOT EXISTS (
    SELECT 1 FROM "ExpenseCategory" WHERE "name" = 'Assurance'
);

-- Catégorie 12: Taxes
INSERT INTO "ExpenseCategory" ("id", "name", "icon", "color", "description", "isActive", "createdAt", "updatedAt")
SELECT 
    'exp_cat_' || replace(gen_random_uuid()::text, '-', ''),
    'Taxes',
    '📊',
    '#ef4444',
    'Taxes et impôts',
    true,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
WHERE NOT EXISTS (
    SELECT 1 FROM "ExpenseCategory" WHERE "name" = 'Taxes'
);

-- Catégorie 13: Formation
INSERT INTO "ExpenseCategory" ("id", "name", "icon", "color", "description", "isActive", "createdAt", "updatedAt")
SELECT 
    'exp_cat_' || replace(gen_random_uuid()::text, '-', ''),
    'Formation',
    '📚',
    '#a855f7',
    'Formation du personnel',
    true,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
WHERE NOT EXISTS (
    SELECT 1 FROM "ExpenseCategory" WHERE "name" = 'Formation'
);

-- Catégorie 14: Repas
INSERT INTO "ExpenseCategory" ("id", "name", "icon", "color", "description", "isActive", "createdAt", "updatedAt")
SELECT 
    'exp_cat_' || replace(gen_random_uuid()::text, '-', ''),
    'Repas',
    '🍽️',
    '#f97316',
    'Frais de repas et restauration',
    true,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
WHERE NOT EXISTS (
    SELECT 1 FROM "ExpenseCategory" WHERE "name" = 'Repas'
);

-- Catégorie 15: Autre
INSERT INTO "ExpenseCategory" ("id", "name", "icon", "color", "description", "isActive", "createdAt", "updatedAt")
SELECT 
    'exp_cat_' || replace(gen_random_uuid()::text, '-', ''),
    'Autre',
    '📝',
    '#64748b',
    'Autres dépenses',
    true,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
WHERE NOT EXISTS (
    SELECT 1 FROM "ExpenseCategory" WHERE "name" = 'Autre'
);

-- ============================================================================
-- ÉTAPE 5: Vérification
-- ============================================================================

-- Vérifier que les tables ont été créées
SELECT 
    'ExpenseCategory' as table_name,
    COUNT(*) as total_categories
FROM "ExpenseCategory"
UNION ALL
SELECT 
    'Expense' as table_name,
    COUNT(*) as total_expenses
FROM "Expense";

-- Afficher toutes les catégories créées
SELECT 
    "id",
    "name",
    "icon",
    "color",
    "description",
    "isActive"
FROM "ExpenseCategory"
ORDER BY "name";

-- ============================================================================
-- FIN DE LA MIGRATION
-- ============================================================================

-- Message de confirmation
DO $$
BEGIN
    RAISE NOTICE '✅ Migration terminée avec succès !';
    RAISE NOTICE '📊 Tables créées: ExpenseCategory, Expense';
    RAISE NOTICE '🏷️ Catégories créées: 15';
    RAISE NOTICE '🚀 Le module Gestion des Dépenses est maintenant actif !';
END $$;

