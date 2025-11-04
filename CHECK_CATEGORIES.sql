-- 🔍 Vérifier les catégories existantes dans la base de données

-- 1. Compter le nombre total de catégories
SELECT COUNT(*) as "Nombre de catégories" 
FROM "ExpenseCategory";

-- 2. Lister toutes les catégories
SELECT 
  id,
  name as "Nom",
  description as "Description",
  color as "Couleur",
  icon as "Icône",
  "isActive" as "Active",
  "createdAt" as "Date de création"
FROM "ExpenseCategory"
ORDER BY name ASC;

-- 3. Vérifier si les catégories par défaut existent
SELECT 
  CASE 
    WHEN EXISTS (SELECT 1 FROM "ExpenseCategory" WHERE name = 'Loyer') THEN '✅ Existe'
    ELSE '❌ N''existe pas'
  END as "Loyer",
  CASE 
    WHEN EXISTS (SELECT 1 FROM "ExpenseCategory" WHERE name = 'Salaires') THEN '✅ Existe'
    ELSE '❌ N''existe pas'
  END as "Salaires",
  CASE 
    WHEN EXISTS (SELECT 1 FROM "ExpenseCategory" WHERE name = 'Électricité') THEN '✅ Existe'
    ELSE '❌ N''existe pas'
  END as "Électricité",
  CASE 
    WHEN EXISTS (SELECT 1 FROM "ExpenseCategory" WHERE name = 'Eau') THEN '✅ Existe'
    ELSE '❌ N''existe pas'
  END as "Eau",
  CASE 
    WHEN EXISTS (SELECT 1 FROM "ExpenseCategory" WHERE name = 'Internet') THEN '✅ Existe'
    ELSE '❌ N''existe pas'
  END as "Internet";

-- 4. Compter les catégories actives vs inactives
SELECT 
  "isActive" as "Active",
  COUNT(*) as "Nombre"
FROM "ExpenseCategory"
GROUP BY "isActive";

-- 5. Vérifier s'il y a des doublons
SELECT 
  name as "Nom",
  COUNT(*) as "Nombre de doublons"
FROM "ExpenseCategory"
GROUP BY name
HAVING COUNT(*) > 1;

