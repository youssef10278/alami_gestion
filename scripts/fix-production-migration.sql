-- Script pour résoudre la migration échouée en production Railway
-- À exécuter directement dans la console PostgreSQL de Railway

-- 1. Marquer la migration échouée comme terminée
UPDATE "_prisma_migrations" 
SET finished_at = NOW(), 
    logs = 'Migration manually resolved - replaced by 20251013113457_add_return_system_v2'
WHERE migration_name = '20251013104557_add_product_return_system' 
AND finished_at IS NULL;

-- 2. Vérifier que la migration est maintenant marquée comme terminée
SELECT migration_name, started_at, finished_at, logs 
FROM "_prisma_migrations" 
WHERE migration_name = '20251013104557_add_product_return_system';

-- 3. Optionnel : Voir toutes les migrations
SELECT migration_name, started_at, finished_at 
FROM "_prisma_migrations" 
ORDER BY started_at DESC;
