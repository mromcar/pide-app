## Convenciones de nomenclatura

- URLs públicas: `/restaurant/{id}` (cara al cliente)
- URLs admin: `/establishment/{id}` (cara al negocio)
- APIs: `/api/restaurants/{restaurantId}` (pero internamente `establishment_id`)
- Base de datos: `establishment_id` (modelo canónico)

### 🎯 REGLA PRINCIPAL: snake_case en TODO el proyecto

#### Base de Datos

- Tablas: `establishments`, `orders`, `order_items`
- Columnas: `order_id`, `establishment_id`, `created_at`
- Índices: `idx_orders_establishment_id`

#### Backend (APIs, Servicios, Tipos)

- Propiedades: `order_id`, `table_number`, `created_at`
- Parámetros de función: `establishment_id`, `user_id`
- Nombres de archivo: `order.service.ts`, `order_item.dto.ts`

#### Frontend (Componentes, Hooks)

- Props de componentes: `establishment_id`, `order_id`
- Estados: `selected_order`, `is_loading`
- Nombres de archivo: `OrderManagement.tsx` (PascalCase solo para componentes)

#### URLs y Rutas

- URLs públicas: `/restaurant/{id}` (cara al cliente)
- URLs admin: `/establishment/{id}` (cara al negocio)
- APIs: `/api/restaurants/{restaurant_id}` (snake_case en parámetros)
- Rutas de archivos: `[restaurant_id]`, `[order_id]`

#### Excepciones Permitidas

- Nombres de componentes React: `PascalCase` (OrderCard.tsx)
- Nombres de hooks: `camelCase` (useOrderManagement)
- Clases CSS: `kebab-case` (order-card, table-number)
- Variables de entorno: `UPPER_SNAKE_CASE`

### ❌ Evitar Completamente

- `camelCase` en propiedades de datos
- Mezclar convenciones en el mismo contexto
- Transformaciones manuales entre casos
