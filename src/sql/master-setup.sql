-- ===================================================================
-- SCRIPT MAESTRO PARA PIDE-APP DATABASE
-- Ejecuta todos los scripts en el orden correcto
-- ===================================================================

\echo '============================================='
\echo 'INICIANDO CONFIGURACIÓN COMPLETA DE BASE DE DATOS'
\echo 'PIDE-APP - Script Maestro Unificado'
\echo '============================================='

\echo ''
\echo 'PASO 1: Ejecutando limpieza de base de datos...'
\i database-cleanup.sql

\echo ''
\echo 'PASO 2: Creando estructura completa...'
\i database-unified-creation.sql

\echo ''
\echo 'PASO 3: Insertando datos de ejemplo...'
\i sample-data-unified.sql

\echo ''
\echo '============================================='
\echo 'CONFIGURACIÓN COMPLETA FINALIZADA'
\echo '============================================='

-- Verificación final completa
\echo ''
\echo 'VERIFICACIÓN FINAL:'

SELECT
  'Base de datos configurada correctamente' AS status,
  current_database() AS database_name,
  current_user AS connected_user,
  version() AS postgresql_version;

\echo ''
\echo 'TABLAS CREADAS:'
SELECT
  schemaname,
  tablename,
  tableowner
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;

\echo ''
\echo 'TIPOS ENUM CREADOS:'
SELECT
  typname as enum_name,
  array_agg(enumlabel ORDER BY enumsortorder) as enum_values
FROM pg_type t
JOIN pg_enum e ON t.oid = e.enumtypid
WHERE typname IN ('UserRole', 'OrderStatus', 'OrderItemStatus')
GROUP BY typname
ORDER BY typname;

\echo ''
\echo 'TRIGGERS ACTIVOS:'
SELECT
  trigger_name,
  event_manipulation,
  event_object_table
FROM information_schema.triggers
WHERE trigger_schema = 'public'
ORDER BY event_object_table, trigger_name;

\echo ''
\echo 'RESUMEN DE DATOS:'
SELECT
  (SELECT COUNT(*) FROM establishments) AS establecimientos,
  (SELECT COUNT(*) FROM users) AS usuarios,
  (SELECT COUNT(*) FROM categories) AS categorias,
  (SELECT COUNT(*) FROM products) AS productos,
  (SELECT COUNT(*) FROM product_variants) AS variantes,
  (SELECT COUNT(*) FROM allergens) AS alergenos,
  (SELECT COUNT(*) FROM orders) AS pedidos;

\echo ''
\echo '============================================='
\echo 'CONFIGURACIÓN COMPLETADA EXITOSAMENTE'
\echo 'La base de datos está lista para usar con Prisma'
\echo '============================================='
