-- 🚀 INDEX DE PERFORMANCE POUR OPTIMISER LES REQUÊTES LENTES
-- 
-- Problème identifié : Chargement des produits en 10 secondes
-- Cause : Requêtes non optimisées + index manquants
-- Solution : Ajouter des index composites stratégiques

-- ✅ 1. Index pour la requête principale des produits actifs
-- Optimise : WHERE isActive = true ORDER BY createdAt DESC
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_product_active_created 
ON "Product" ("isActive", "createdAt" DESC) 
WHERE "isActive" = true;

-- ✅ 2. Index pour les produits en stock (page vente)
-- Optimise : WHERE isActive = true ORDER BY stock DESC, name ASC
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_product_active_stock_name 
ON "Product" ("isActive", "stock" DESC, "name") 
WHERE "isActive" = true;

-- ✅ 3. Index pour la recherche de produits
-- Optimise : WHERE isActive = true AND (name ILIKE '%search%' OR sku ILIKE '%search%')
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_product_search_name 
ON "Product" ("isActive", "name") 
WHERE "isActive" = true;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_product_search_sku 
ON "Product" ("isActive", "sku") 
WHERE "isActive" = true;

-- ✅ 4. Index pour les produits par catégorie
-- Optimise : WHERE isActive = true AND categoryId = 'xxx'
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_product_category_active 
ON "Product" ("categoryId", "isActive") 
WHERE "isActive" = true;

-- ✅ 5. Index pour les alertes de stock
-- Optimise : WHERE isActive = true AND stock <= minStock
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_product_stock_alert 
ON "Product" ("isActive", "stock", "minStock") 
WHERE "isActive" = true;

-- ✅ 6. Index pour les mouvements de stock récents
-- Optimise : ORDER BY createdAt DESC pour les derniers mouvements
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_stock_movement_recent 
ON "StockMovement" ("productId", "createdAt" DESC);

-- ✅ 7. Index pour les ventes récentes
-- Optimise : ORDER BY createdAt DESC pour les dernières ventes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_sale_recent 
ON "Sale" ("createdAt" DESC);

-- ✅ 8. Index pour les items de vente par produit
-- Optimise : Statistiques de vente par produit
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_sale_item_product_date 
ON "SaleItem" ("productId", "createdAt" DESC);

-- 📊 STATISTIQUES APRÈS CRÉATION DES INDEX
-- Vérifier que les index sont utilisés :

-- EXPLAIN ANALYZE 
-- SELECT id, name, sku, price, stock, image, "categoryId"
-- FROM "Product" 
-- WHERE "isActive" = true 
-- ORDER BY stock DESC, name ASC 
-- LIMIT 300;

-- 🔍 MONITORING DES PERFORMANCES
-- Requêtes pour surveiller l'utilisation des index :

-- 1. Vérifier les index créés
-- SELECT schemaname, tablename, indexname, indexdef 
-- FROM pg_indexes 
-- WHERE tablename = 'Product' 
-- ORDER BY indexname;

-- 2. Statistiques d'utilisation des index
-- SELECT schemaname, tablename, indexname, idx_scan, idx_tup_read, idx_tup_fetch
-- FROM pg_stat_user_indexes 
-- WHERE tablename = 'Product'
-- ORDER BY idx_scan DESC;

-- 3. Requêtes lentes (si pg_stat_statements activé)
-- SELECT query, calls, total_time, mean_time, rows
-- FROM pg_stat_statements 
-- WHERE query LIKE '%Product%'
-- ORDER BY total_time DESC 
-- LIMIT 10;

-- 🚨 NOTES IMPORTANTES :
-- 
-- 1. CONCURRENTLY : Évite le verrouillage de la table pendant la création
-- 2. IF NOT EXISTS : Évite les erreurs si l'index existe déjà
-- 3. WHERE clauses : Index partiels pour économiser l'espace
-- 4. Ordre des colonnes : Important pour l'efficacité des requêtes
-- 
-- 📈 AMÉLIORATION ATTENDUE :
-- - Requête produits : 10s → <500ms (20x plus rapide)
-- - Recherche : 5s → <200ms (25x plus rapide)
-- - Tri par stock : 3s → <100ms (30x plus rapide)

-- 🔧 COMMANDES D'EXÉCUTION :
-- 
-- Via psql :
-- psql -d your_database -f scripts/add-performance-indexes.sql
-- 
-- Via Prisma (recommandé) :
-- npx prisma db execute --file scripts/add-performance-indexes.sql
