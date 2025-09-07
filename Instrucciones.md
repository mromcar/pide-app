# 📋 INSTRUCCIONES PARA DESARROLLO - PIDE APP

> **Este archivo debe ser consultado SIEMPRE antes de generar, modificar o sugerir código en este proyecto.**

## 🎯 INFORMACIÓN DEL PROYECTO

- **Nombre**: Pide App - Sistema de pedidos para restaurantes con QR
- **Stack**: Next.js 14, TypeScript, Prisma, PostgreSQL, NextAuth.js, Tailwind CSS
- **Arquitectura**: Full-stack con separación Admin/Public APIs
- **Última actualización**: Enero 2025

---

## 📂 ESTRUCTURA DEL PROYECTO

```
src/
├── app/[lang]/              # Rutas internacionalizadas
│   ├── admin/               # Panel administrativo (roles específicos)
│   ├── menu/                # Vista pública del menú (QR)
│   └── ...
├── app/api/                 # API Routes
│   ├── admin/               # Endpoints admin (autenticados)
│   ├── menu/                # Endpoints públicos
│   ├── orders/              # Gestión de pedidos
│   └── super-admin/         # Solo general_admin
├── components/              # Componentes React organizados por funcionalidad
│   ├── admin/               # Componentes específicos de admin
│   ├── auth/                # Autenticación y protección
│   ├── management/          # Gestión de menú (NUEVOS)
│   └── ...
├── services/                # Lógica de negocio (Database Services - Classes)
├── services/api/            # Cliente API (Frontend calls)
├── types/                   # Definiciones de tipos organizadas
│   ├── dtos/                # Request/Response types
│   ├── entities/            # Database entity types
│   ├── serialized/          # JSON-safe response types
│   └── errors/              # API error types
├── schemas/                 # Validación con Zod
├── translations/            # Sistema de internacionalización
│   ├── modules/admin/       # Traducciones de administración
│   └── types/               # Tipos de traducciones
└── styles/                  # Sistema de estilos híbrido
    ├── components/          # Estilos por componente
    └── pages/               # Estilos específicos por página
```

---

## 🔧 CONVENCIONES DE CÓDIGO OBLIGATORIAS

### 📋 **Nomenclatura por Capa**

#### **Base de Datos (PostgreSQL)**

```sql
-- ✅ CORRECTO: snake_case
user_id, establishment_id, created_at
'client', 'waiter', 'cook', 'establishment_admin', 'general_admin'
```

#### **Backend (Node.js/TypeScript)**

```typescript
// ✅ CORRECTO: camelCase en TODO el código
const userId = data.userId
const establishmentId = params.establishmentId
export class CategoryService { ... }
```

#### **Frontend (React/TypeScript)**

```typescript
// ✅ CORRECTO: camelCase
const { userId, establishmentId } = data
session.user.role === 'establishment_admin' // roles en snake_case
```

#### **CSS/Estilos**

```css
/* ✅ CORRECTO: kebab-case con prefijos funcionales */
.admin-card {
}
.menu-management {
}
.product-grid {
}
.order-list {
}
```

### 🔄 **Transformaciones de Datos**

```
DB (snake_case) → Backend (camelCase) → API Response (camelCase) → Frontend (camelCase)
```

---

## 🏗️ PATRONES ARQUITECTÓNICOS OBLIGATORIOS

### **1. Servicios de Base de Datos (Classes estáticas)**

```typescript
// ✅ USAR SIEMPRE este patrón para servicios
export class CategoryService {
  static async getAll(establishmentId: number): Promise<Category[]> {
    // Lógica de base de datos aquí
  }

  static async create(data: CreateCategoryDTO): Promise<Category> {
    // Lógica de creación aquí
  }
}
```

### **2. API Routes (Next.js 14 App Router)**

```typescript
// ✅ ESTRUCTURA OBLIGATORIA para endpoints
export async function GET(request: Request, { params }: { params: { establishmentId: string } }) {
  try {
    // 1. Validar parámetros
    // 2. Verificar autenticación (si necesario)
    // 3. Llamar al servicio correspondiente
    // 4. Transformar datos a camelCase
    // 5. Retornar respuesta
  } catch (error) {
    // Manejo de errores consistente
  }
}
```

### **3. Componentes React (Functional + Hooks)**

```typescript
// ✅ ESTRUCTURA OBLIGATORIA para componentes
'use client' // Si usa hooks del cliente

import { useState, useEffect } from 'react'
import { useTranslation } from '@/hooks/useTranslation'
import type { ComponentProps } from '@/types/management'

export function ComponentName({ prop1, prop2 }: ComponentProps) {
  const { t } = useTranslation(languageCode)

  // Estados y lógica

  return (
    <div className="component-name">
      {/* JSX con clases CSS apropiadas */}
    </div>
  )
}
```

---

## 🎨 SISTEMA DE ESTILOS OBLIGATORIO

### **Estrategia Híbrida**

1. **Variables CSS** para valores que pueden cambiar
2. **Tailwind utilities** para spacing, layout, responsive
3. **CSS personalizado** para componentes complejos
4. **Prefijos por funcionalidad** para evitar conflictos

### **Ejemplo de Uso Correcto**

```jsx
// ✅ COMBINAR CSS personalizado + Tailwind
<div className="admin-card p-6 bg-white border border-gray-200">
  <h2 className="admin-card-title text-xl font-semibold mb-4">{t.title}</h2>
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    <div className="product-card">...</div>
  </div>
</div>
```

### **Prefijos CSS Obligatorios**

- `.admin-*` → Componentes de administración
- `.menu-*` → Componentes de menú
- `.order-*` → Componentes de pedidos
- `.auth-*` → Componentes de autenticación
- `.product-*` → Componentes de productos
- `.category-*` → Componentes de categorías

---

## 🔐 ROLES Y PERMISOS

### **Roles Disponibles**

```typescript
type UserRole = 'client' | 'waiter' | 'cook' | 'establishment_admin' | 'general_admin'
```

### **Matriz de Permisos**

| Endpoint                                  | client | waiter | cook | establishment_admin | general_admin |
| ----------------------------------------- | ------ | ------ | ---- | ------------------- | ------------- |
| `/api/menu/*`                             | ✅     | ✅     | ✅   | ✅                  | ✅            |
| `/api/orders` (POST)                      | ✅     | ✅     | ✅   | ✅                  | ✅            |
| `/api/admin/establishments/*/menu/*`      | ❌     | ✅     | ✅   | ✅                  | ✅            |
| `/api/admin/establishments/*/employees/*` | ❌     | ❌     | ❌   | ✅                  | ✅            |
| `/api/super-admin/*`                      | ❌     | ❌     | ❌   | ❌                  | ✅            |

---

## 🌐 INTERNACIONALIZACIÓN OBLIGATORIA

### **Estructura de Traducciones**

```typescript
// ✅ USAR SIEMPRE traducciones, NUNCA texto hardcodeado
const { t } = useTranslation(languageCode)

// ✅ CORRECTO
<h1>{t.establishmentAdmin.menuManagement.title}</h1>

// ❌ INCORRECTO
<h1>Gestión de Menú</h1>
```

### **Idiomas Soportados**

- `es` (Español) - Idioma por defecto
- `en` (Inglés)
- `fr` (Francés)

---

## 📝 VALIDACIÓN CON ZOD OBLIGATORIA

```typescript
// ✅ CREAR SCHEMAS para toda validación de datos
import { z } from 'zod'

export const CreateCategorySchema = z.object({
  establishmentId: z.number().positive(),
  translations: z.array(
    z.object({
      languageCode: z.enum(['es', 'en', 'fr']),
      name: z.string().min(1).max(100),
      description: z.string().optional(),
    })
  ),
})

export type CreateCategoryDTO = z.infer<typeof CreateCategorySchema>
```

---

## 🚫 PROHIBICIONES ABSOLUTAS

### **❌ NO HACER NUNCA:**

1. **Texto hardcodeado** - Usar siempre traducciones

```typescript
// ❌ PROHIBIDO
<button>Crear Categoría</button>

// ✅ CORRECTO
<button>{t.establishmentAdmin.categories.actions.create}</button>
```

2. **Interfaces en archivos TSX** - Mover a archivos de tipos

```typescript
// ❌ PROHIBIDO en .tsx
interface ComponentProps { ... }

// ✅ CORRECTO en src/types/management.ts
export interface ComponentProps { ... }
```

3. **Fetch directo sin servicios API**

```typescript
// ❌ PROHIBIDO
const response = await fetch('/api/categories')

// ✅ CORRECTO
import { getAllCategories } from '@/services/api/category.api'
const categories = await getAllCategories(establishmentId)
```

4. **Estilos inline o sin prefijos**

```typescript
// ❌ PROHIBIDO
<div style={{ padding: '16px' }}>
<div className="card">

// ✅ CORRECTO
<div className="admin-card p-4">
```

5. **Lógica de BD directa en API Routes**

```typescript
// ❌ PROHIBIDO
export async function GET() {
  const categories = await prisma.category.findMany()
}

// ✅ CORRECTO
export async function GET() {
  const categories = await CategoryService.getAll()
}
```

---

## 📋 CHECKLIST ANTES DE GENERAR CÓDIGO

### **✅ Verificar SIEMPRE:**

- [ ] **Tipos definidos** en archivos separados (no en .tsx)
- [ ] **Traducciones implementadas** (no texto hardcodeado)
- [ ] **Convenciones de nomenclatura** correctas por capa
- [ ] **Servicios API** utilizados (no fetch directo)
- [ ] **Validación Zod** implementada para datos
- [ ] **Clases CSS** con prefijos correctos
- [ ] **Roles y permisos** verificados para endpoints
- [ ] **Estructura de carpetas** respetada
- [ ] **Transformación de datos** camelCase en frontend
- [ ] **Imports organizados** y paths absolutos (@/)

---

## 🎯 EJEMPLOS DE IMPLEMENTACIÓN CORRECTA

### **Crear un nuevo componente de gestión:**

1. **Definir tipos** en `src/types/management.ts`
2. **Crear servicio API** en `src/services/api/`
3. **Implementar endpoint** en `src/app/api/admin/`
4. **Crear componente** en `src/components/management/`
5. **Definir estilos** en `src/styles/components/`
6. **Agregar traducciones** en `src/translations/modules/admin/`

### **Estructura de respuesta API estándar:**

```typescript
// ✅ SIEMPRE usar esta estructura
return Response.json({
  success: true,
  data: transformedData, // camelCase
  message: 'Operation completed successfully',
})
```

---

## 🔗 ARCHIVOS DE REFERENCIA CLAVE

1. **`specifications/Arquitectura`** - Documentación completa del proyecto
2. **`src/types/management.ts`** - Tipos de componentes de gestión
3. **`src/translations/types/admin.ts`** - Tipos de traducciones
4. **`src/styles/base.css`** - Variables CSS del sistema de diseño
5. **`prisma/schema.prisma`** - Esquema de base de datos

---

## 🚀 COMANDOS DE DESARROLLO

```bash
# Desarrollo
npm run dev

# Generar tipos Prisma
npx prisma generate

# Ejecutar migraciones
npx prisma migrate dev

# Verificar tipos
npm run type-check

# Build
npm run build
```

---

> **⚠️ IMPORTANTE: Estos estándares son OBLIGATORIOS. Cualquier código que no siga estas convenciones debe ser rechazado y corregido.**

---

**Última actualización:** Enero 2025
**Versión:** 1.0.0
