-- Script SQL pour ajouter les colonnes manquantes pour les devis
-- À exécuter sur Railway si les migrations ne fonctionnent pas

-- Vérifier si les colonnes existent déjà
DO $$ 
BEGIN
    -- Ajouter quoteTheme si elle n'existe pas
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'company_settings' AND column_name = 'quoteTheme'
    ) THEN
        ALTER TABLE company_settings 
        ADD COLUMN "quoteTheme" TEXT NOT NULL DEFAULT 'modern';
        RAISE NOTICE 'Colonne quoteTheme ajoutée';
    ELSE
        RAISE NOTICE 'Colonne quoteTheme existe déjà';
    END IF;

    -- Ajouter showValidityPeriod si elle n'existe pas
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'company_settings' AND column_name = 'showValidityPeriod'
    ) THEN
        ALTER TABLE company_settings 
        ADD COLUMN "showValidityPeriod" BOOLEAN NOT NULL DEFAULT true;
        RAISE NOTICE 'Colonne showValidityPeriod ajoutée';
    ELSE
        RAISE NOTICE 'Colonne showValidityPeriod existe déjà';
    END IF;

    -- Ajouter validityPeriodText si elle n'existe pas
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'company_settings' AND column_name = 'validityPeriodText'
    ) THEN
        ALTER TABLE company_settings 
        ADD COLUMN "validityPeriodText" TEXT NOT NULL DEFAULT 'Ce devis est valable 30 jours à compter de la date d''émission.';
        RAISE NOTICE 'Colonne validityPeriodText ajoutée';
    ELSE
        RAISE NOTICE 'Colonne validityPeriodText existe déjà';
    END IF;

    -- Ajouter showTermsAndConditions si elle n'existe pas
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'company_settings' AND column_name = 'showTermsAndConditions'
    ) THEN
        ALTER TABLE company_settings 
        ADD COLUMN "showTermsAndConditions" BOOLEAN NOT NULL DEFAULT true;
        RAISE NOTICE 'Colonne showTermsAndConditions ajoutée';
    ELSE
        RAISE NOTICE 'Colonne showTermsAndConditions existe déjà';
    END IF;

    -- Ajouter termsAndConditionsText si elle n'existe pas
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'company_settings' AND column_name = 'termsAndConditionsText'
    ) THEN
        ALTER TABLE company_settings 
        ADD COLUMN "termsAndConditionsText" TEXT NOT NULL DEFAULT 'Conditions générales de vente disponibles sur demande.';
        RAISE NOTICE 'Colonne termsAndConditionsText ajoutée';
    ELSE
        RAISE NOTICE 'Colonne termsAndConditionsText existe déjà';
    END IF;

END $$;

-- Vérifier les colonnes ajoutées
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'company_settings' 
  AND column_name IN ('quoteTheme', 'showValidityPeriod', 'validityPeriodText', 'showTermsAndConditions', 'termsAndConditionsText')
ORDER BY column_name;

