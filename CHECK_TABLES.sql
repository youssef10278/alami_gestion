-- ============================================================================
-- SCRIPT DE VÉRIFICATION - Tables Expense et ExpenseCategory
-- ============================================================================

-- 1. Vérifier si les tables existent
SELECT 
    table_name,
    table_type
FROM information_schema.tables
WHERE table_schema = 'public'
    AND table_name IN ('ExpenseCategory', 'Expense')
ORDER BY table_name;

-- 2. Si les tables existent, vérifier leur structure
-- Structure de ExpenseCategory
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'ExpenseCategory'
ORDER BY ordinal_position;

-- Structure de Expense
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'Expense'
ORDER BY ordinal_position;

-- 3. Compter les catégories
SELECT COUNT(*) as total_categories
FROM "ExpenseCategory"
WHERE "isActive" = true;

-- 4. Lister toutes les catégories
SELECT 
    "id",
    "name",
    "icon",
    "color",
    "isActive"
FROM "ExpenseCategory"
ORDER BY "name";

