-- ============================================================
-- SCRIPT À EXÉCUTER SUR RAILWAY
-- ============================================================
-- Ce script ajoute les colonnes manquantes pour les devis
-- Exécution : Copier-coller dans Railway Shell ou psql
-- ============================================================

-- 1. Ajouter quoteTheme
ALTER TABLE company_settings 
ADD COLUMN IF NOT EXISTS "quoteTheme" TEXT NOT NULL DEFAULT 'modern';

-- 2. Ajouter showValidityPeriod
ALTER TABLE company_settings 
ADD COLUMN IF NOT EXISTS "showValidityPeriod" BOOLEAN NOT NULL DEFAULT true;

-- 3. Ajouter validityPeriodText
ALTER TABLE company_settings 
ADD COLUMN IF NOT EXISTS "validityPeriodText" TEXT NOT NULL DEFAULT 'Ce devis est valable 30 jours à compter de la date d''émission.';

-- 4. Ajouter showTermsAndConditions
ALTER TABLE company_settings 
ADD COLUMN IF NOT EXISTS "showTermsAndConditions" BOOLEAN NOT NULL DEFAULT true;

-- 5. Ajouter termsAndConditionsText
ALTER TABLE company_settings 
ADD COLUMN IF NOT EXISTS "termsAndConditionsText" TEXT NOT NULL DEFAULT 'Conditions générales de vente disponibles sur demande.';

-- ============================================================
-- VÉRIFICATION
-- ============================================================

-- Afficher toutes les colonnes de company_settings
SELECT column_name, data_type, column_default, is_nullable
FROM information_schema.columns 
WHERE table_name = 'company_settings'
ORDER BY ordinal_position;

-- Afficher uniquement les colonnes de devis
SELECT column_name, data_type, column_default
FROM information_schema.columns 
WHERE table_name = 'company_settings' 
  AND column_name IN ('quoteTheme', 'showValidityPeriod', 'validityPeriodText', 'showTermsAndConditions', 'termsAndConditionsText')
ORDER BY column_name;

-- ============================================================
-- RÉSULTAT ATTENDU
-- ============================================================
-- Vous devriez voir 5 lignes avec :
-- - quoteTheme | text | 'modern'::text
-- - showTermsAndConditions | boolean | true
-- - showValidityPeriod | boolean | true
-- - termsAndConditionsText | text | 'Conditions générales...'
-- - validityPeriodText | text | 'Ce devis est valable...'
-- ============================================================

