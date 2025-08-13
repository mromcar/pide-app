# Scripts SQL Unificados para PIDE-APP Database

## 📋 Descripción

Este directorio contiene los scripts SQL unificados y sincronizados con el Prisma Schema para configurar completamente la base de datos de PIDE-APP en NeonDB PostgreSQL.

## 🗂️ Archivos incluidos

### Scripts principales

- **`master-setup.sql`** - Script maestro que ejecuta todo automáticamente
- **`database-cleanup.sql`** - Limpia la base de datos completamente
- **`database-unified-creation.sql`** - Crea toda la estructura (tablas, triggers, etc.)
- **`sample-data-unified.sql`** - Inserta datos de ejemplo para testing

### Scripts legacy (no usar)

- `Creación de tablas definitiva.sql` - ⚠️ Archivo anterior sin unificar
- `Insertar datos de ejemplo.sql` - ⚠️ Archivo anterior sin actualizar

## 🚀 Uso recomendado

### Opción 1: Ejecutar script maestro (recomendado)

```sql
-- Conectar a tu base de datos NeonDB
\i master-setup.sql
```

### Opción 2: Ejecutar scripts individuales

```sql
-- 1. Limpiar base de datos
\i database-cleanup.sql

-- 2. Crear estructura
\i database-unified-creation.sql

-- 3. Insertar datos de ejemplo (opcional)
\i sample-data-unified.sql
```

## ⚠️ Advertencias importantes

1. **DATOS PERDIDOS**: Los scripts de limpieza eliminarán TODOS los datos existentes
2. **SOLO DESARROLLO**: No ejecutar en producción con datos reales
3. **BACKUP**: Hacer backup antes de ejecutar en cualquier ambiente

## 🏗️ Estructura creada

### Tablas principales

- `establishments` - Establecimientos/restaurantes
- `users` - Usuarios del sistema (clientes, camareros, cocineros, admins)
- `establishment_administrators` - Relación admin-establecimiento

### Tablas de menú

- `categories` / `category_translations` - Categorías de productos
- `products` / `product_translations` - Productos del menú
- `product_variants` / `product_variant_translations` - Variantes de productos
- `product_history` / `product_variant_history` - Historial de cambios

### Tablas de alérgenos

- `allergens` / `allergen_translations` - Alérgenos
- `product_allergens` - Relación producto-alérgeno

### Tablas de pedidos

- `orders` - Pedidos principales
- `order_items` - Items de cada pedido
- `order_status_history` - Historial de cambios de estado

### Tipos ENUM

- `UserRole`: client, waiter, cook, establishment_admin, general_admin
- `OrderStatus`: pending, preparing, ready, delivered, cancelled, completed
- `OrderItemStatus`: pending, preparing, ready, delivered

## 🔧 Funcionalidades automáticas

### Triggers implementados

- **Timestamps automáticos** en todas las tablas principales
- **Cálculo automático** del total de pedidos
- **Historial automático** de cambios en productos y variantes
- **Validación de transiciones** de estado de pedidos
- **Registro automático** de cambios de estado

### Índices para optimización

- Índices en campos más consultados (status, is_active, etc.)
- Índices compuestos para traducciones
- Índices para foreign keys principales

## 📊 Datos de ejemplo incluidos

### Establecimientos

- Bar La Plaza (Madrid)
- Café Central (Sevilla)
- Restaurante El Rincón (Barcelona)

### Usuarios de ejemplo

- Administradores de cada establecimiento
- Personal (camareros y cocineros)
- Clientes ejemplo
- Super administrador

### Menú completo

- Categorías traducidas (ES/EN/FR)
- Productos con descripciones
- Variantes con precios
- Alérgenos asignados

### Pedidos de ejemplo

- Pedidos en diferentes estados
- Items con cantidades y precios
- Historial de cambios de estado

## 🔄 Sincronización con Prisma

Los scripts están **100% sincronizados** con:

- `prisma/schema.prisma`
- Naming conventions de Prisma
- Relaciones y constraints definidas
- Tipos de datos exactos

## 📝 Notas técnicas

### Compatibilidad

- ✅ PostgreSQL 12+
- ✅ NeonDB
- ✅ Prisma 5.x

### Características especiales

- Soporte para OAuth (Google/Apple ID)
- Password hash opcional para usuarios OAuth
- Soft delete con campo `deleted_at`
- Multilingual con tablas de traducción
- Generación automática de `item_total_price`

## 🆘 Troubleshooting

### Error: "relation already exists"

```sql
-- Ejecutar primero el script de limpieza
\i database-cleanup.sql
```

### Error: "type already exists"

```sql
-- Los ENUMs se eliminan automáticamente en cleanup
-- Verificar que se ejecutó database-cleanup.sql primero
```

### Error de permisos

```sql
-- Asegurar que el usuario tiene permisos de CREATE
GRANT CREATE ON DATABASE your_database TO your_user;
```

## 📞 Soporte

Si encuentras problemas:

1. Revisar los logs de PostgreSQL
2. Verificar versión de PostgreSQL (debe ser 12+)
3. Confirmar permisos de usuario
4. Ejecutar scripts en el orden correcto

---

**Última actualización**: Agosto 2025
**Versión**: 1.0 - Unificada y sincronizada con Prisma
