-- ===================================================================
-- SCRIPT DE LIMPIEZA PARA PIDE-APP DATABASE
-- Ejecutar ANTES del script de creación unificado
-- ===================================================================

-- ADVERTENCIA: Este script eliminará TODOS los datos existentes
-- Solo ejecutar en ambiente de desarrollo

-- PASO 1: Desconectar usuarios activos (solo en caso necesario)
-- ===================================================================
-- SELECT pg_terminate_backend(pg_stat_activity.pid)
-- FROM pg_stat_activity
-- WHERE pg_stat_activity.datname = current_database()
--   AND pid <> pg_backend_pid();

-- PASO 2: Eliminar todas las tablas y dependencias
-- ===================================================================

-- Eliminar vistas
DROP VIEW IF EXISTS menu_translated CASCADE;

-- Eliminar triggers
DROP TRIGGER IF EXISTS trigger_update_order_total ON order_items CASCADE;
DROP TRIGGER IF EXISTS trigger_log_initial_order_status ON orders CASCADE;
DROP TRIGGER IF EXISTS trg_validate_order_status ON orders CASCADE;
DROP TRIGGER IF EXISTS trg_set_timestamp_users ON users CASCADE;
DROP TRIGGER IF EXISTS trg_set_timestamp_orders ON orders CASCADE;
DROP TRIGGER IF EXISTS trg_set_timestamp_categories ON categories CASCADE;
DROP TRIGGER IF EXISTS trg_set_timestamp_establishments ON establishments CASCADE;
DROP TRIGGER IF EXISTS trg_set_timestamp_products ON products CASCADE;
DROP TRIGGER IF EXISTS trg_archive_product ON products CASCADE;
DROP TRIGGER IF EXISTS trg_set_timestamp_variants ON product_variants CASCADE;
DROP TRIGGER IF EXISTS trg_archive_variant ON product_variants CASCADE;

-- Eliminar funciones
DROP FUNCTION IF EXISTS trigger_set_timestamp() CASCADE;
DROP FUNCTION IF EXISTS archive_product() CASCADE;
DROP FUNCTION IF EXISTS archive_variant() CASCADE;
DROP FUNCTION IF EXISTS update_order_total() CASCADE;
DROP FUNCTION IF EXISTS log_initial_order_status() CASCADE;
DROP FUNCTION IF EXISTS validate_order_status_transition() CASCADE;

-- Eliminar tablas (orden importante por foreign keys)
DROP TABLE IF EXISTS order_status_history CASCADE;
DROP TABLE IF EXISTS order_items CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS product_variant_translations CASCADE;
DROP TABLE IF EXISTS product_variant_history CASCADE;
DROP TABLE IF EXISTS product_variants CASCADE;
DROP TABLE IF EXISTS product_translations CASCADE;
DROP TABLE IF EXISTS product_history CASCADE;
DROP TABLE IF EXISTS product_allergens CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS category_translations CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS allergen_translations CASCADE;
DROP TABLE IF EXISTS allergens CASCADE;
DROP TABLE IF EXISTS establishment_administrators CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS establishments CASCADE;

-- Eliminar tablas con nombres antiguos (si existen)
DROP TABLE IF EXISTS detallespedido CASCADE;
DROP TABLE IF EXISTS pedidos CASCADE;
DROP TABLE IF EXISTS productos_traducciones CASCADE;
DROP TABLE IF EXISTS categorias_traducciones CASCADE;
DROP TABLE IF EXISTS productos CASCADE;
DROP TABLE IF EXISTS categorias CASCADE;
DROP TABLE IF EXISTS usuarios CASCADE;
DROP TABLE IF EXISTS establecimientos CASCADE;

-- Eliminar tipos ENUM (incluye versiones antiguas)
DROP TYPE IF EXISTS "UserRole" CASCADE;
DROP TYPE IF EXISTS "OrderStatus" CASCADE;
DROP TYPE IF EXISTS "OrderItemStatus" CASCADE;
DROP TYPE IF EXISTS "RolUsuario" CASCADE;
DROP TYPE IF EXISTS "EstadoPedidoGeneral" CASCADE;
DROP TYPE IF EXISTS "EstadoItemPedido" CASCADE;

-- PASO 3: Eliminar secuencias huérfanas (si las hay)
-- ===================================================================
DROP SEQUENCE IF EXISTS establishments_establishment_id_seq CASCADE;
DROP SEQUENCE IF EXISTS users_user_id_seq CASCADE;
DROP SEQUENCE IF EXISTS categories_category_id_seq CASCADE;
DROP SEQUENCE IF EXISTS products_product_id_seq CASCADE;
DROP SEQUENCE IF EXISTS product_variants_variant_id_seq CASCADE;
DROP SEQUENCE IF EXISTS allergens_allergen_id_seq CASCADE;
DROP SEQUENCE IF EXISTS orders_order_id_seq CASCADE;
DROP SEQUENCE IF EXISTS order_items_order_item_id_seq CASCADE;

-- Secuencias con nombres antiguos
DROP SEQUENCE IF EXISTS establecimientos_id_establecimiento_seq CASCADE;
DROP SEQUENCE IF EXISTS usuarios_id_usuario_seq CASCADE;
DROP SEQUENCE IF EXISTS categorias_id_categoria_seq CASCADE;
DROP SEQUENCE IF EXISTS productos_id_producto_seq CASCADE;
DROP SEQUENCE IF EXISTS pedidos_id_pedido_seq CASCADE;

-- PASO 4: Limpiar extensiones innecesarias (opcional)
-- ===================================================================
-- Solo descomentar si es necesario
-- DROP EXTENSION IF EXISTS "uuid-ossp" CASCADE;

-- PASO 5: Verificar limpieza
-- ===================================================================
SELECT
  'Limpieza completada. Base de datos lista para recreación.' AS status,
  count(*) as tablas_restantes
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_type = 'BASE TABLE';

SELECT 'Ejecutar ahora: database-unified-creation.sql' AS siguiente_paso;
