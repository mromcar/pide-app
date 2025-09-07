# GitHub Copilot Instructions for Pide App

> **Restaurant QR Menu Management System** - Next.js 14, TypeScript, Prisma, NextAuth.js

## 🎯 Project Overview

This is a multi-role restaurant management system with QR-based menu ordering:

- **Customers**: Scan QR, view menu, place orders (no auth required)
- **Restaurant Admin**: Manage menu, categories, products, variants, allergens
- **General Admin**: Platform-wide management across establishments

**Stack**: Next.js 14 (App Router), TypeScript, Prisma ORM, PostgreSQL, NextAuth.js (JWT), Tailwind CSS

---

## 📂 Architecture Patterns

### File Organization

```
src/
├── app/[lang]/              # Internationalized routes
│   ├── admin/               # Admin panel (authenticated)
│   └── menu/[establishmentId]/ # Public QR menu
├── app/api/                 # API endpoints
│   ├── admin/               # Restaurant admin APIs
│   ├── menu/                # Public menu APIs
│   └── super-admin/         # General admin APIs
├── components/              # React components by domain
├── services/                # Database operations (class-based)
├── services/api/            # Frontend API client
├── types/                   # Type definitions by category
├── schemas/                 # Zod validation schemas
├── translations/            # i18n modules
└── styles/                  # Hybrid CSS system
```

### Key Conventions

- **Routes**: Use `[lang]` dynamic segments for i18n
- **API**: Separate admin/public endpoints with middleware protection
- **Components**: Domain-organized, with specific admin/management folders
- **Types**: Split into dtos/, entities/, serialized/, errors/
- **Services**: Class-based with clear separation of concerns

---

## 🔐 Authentication & Authorization

### NextAuth Configuration

```typescript
// src/app/api/auth/[...nextauth]/route.ts
export const authOptions: NextAuthOptions = {
  session: { strategy: 'jwt' },
  callbacks: {
    jwt: async ({ token, user }) => {
      // Add role and establishmentId to token
    },
    session: async ({ session, token }) => {
      // Map token data to session
    },
  },
}
```

### Role-Based Access

- **restaurant_admin**: Manage own establishment
- **general_admin**: Platform-wide access
- **employee**: Limited establishment access

### Route Protection Patterns

```typescript
// Use AuthGuard component
<AuthGuard allowedRoles={['restaurant_admin']} establishmentId={params.establishmentId}>
  <AdminContent />
</AuthGuard>

// Or middleware protection in src/middleware.ts
export async function middleware(request: NextRequest) {
  // Session validation and role checks
}
```

---

## 🌐 Internationalization

### Language Support

- **Supported**: English (en), Spanish (es), French (fr)
- **Default**: Spanish (es)
- **Detection**: URL segment `[lang]` + Accept-Language header

### Translation Structure

```typescript
// src/translations/modules/admin/{en,es,fr}.ts
export const adminTranslations = {
  navigation: { dashboard: "Dashboard" },
  actions: { save: "Save", cancel: "Cancel" },
  errors: { unauthorized: "Access denied" }
}

// Usage in components
const t = useTranslation('admin');
return <h1>{t.navigation.dashboard}</h1>;
```

### Translation Rules

- **Keys**: Use nested objects with dot notation
- **Files**: Separate by module (admin, menu, orders, etc.)
- **Missing**: Always provide fallback to Spanish
- **Types**: Generate from Spanish translations as source of truth

---

## 🎨 Styling System

### Hybrid Approach

- **Primary**: Tailwind CSS utilities
- **Custom**: Component-specific CSS modules
- **Organization**: Styles mirror component structure

### Naming Conventions

```css
/* Custom CSS Classes */
.admin-dashboard-header {}        /* kebab-case */
.menu-item-card {}               /* descriptive, prefixed */
.form-input-error {}             /* state-based naming */

/* File Organization */
src/styles/
├── globals.css                  /* Global Tailwind + resets */
├── components/                  /* Component-specific styles */
│   ├── admin-dashboard.css
│   └── menu-item-card.css
└── pages/                       /* Page-specific styles */
```

### Tailwind Configuration

```javascript
// tailwind.config.js - Extended with custom colors, spacing
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: { primary: {...}, secondary: {...} },
      spacing: { '18': '4.5rem' }
    }
  }
}
```

---

## 🗄️ Database & API Patterns

### Prisma Schema Conventions

```prisma
// Enums in snake_case
enum UserRole {
  restaurant_admin
  general_admin
  employee
}

// Models in PascalCase with clear relationships
model User {
  id            String    @id @default(cuid())
  email         String    @unique
  role          UserRole
  establishmentAdministrator EstablishmentAdministrator?
}
```

### API Route Structure

```typescript
// src/app/api/admin/establishments/[id]/route.ts
export async function GET(request: Request, { params }: { params: { id: string } }) {
  // 1. Validate session/permissions
  // 2. Validate request data with Zod
  // 3. Call service layer
  // 4. Return typed response
}
```

### Service Layer Pattern

```typescript
// src/services/establishment.service.ts
export class EstablishmentService {
  static async getById(id: string): Promise<EstablishmentDTO> {
    // Database operations with Prisma
    // Transform to DTO
  }
}
```

### Type Organization

```typescript
// src/types/dtos/establishment.ts - API request/response
export interface EstablishmentDTO {
  id: string
  name: string
  // Serializable data only
}

// src/types/entities/establishment.ts - Database models
export interface EstablishmentEntity extends EstablishmentDTO {
  createdAt: Date
  // Full database model
}
```

---

## 🧩 Component Patterns

### Component Organization

```typescript
// src/components/management/MenuManagement.tsx
interface MenuManagementProps {
  establishmentId: string
  initialData?: MenuData
}

export function MenuManagement({ establishmentId, initialData }: MenuManagementProps) {
  const t = useTranslation('admin')
  // Component logic
}
```

### State Management

- **Local State**: useState, useReducer for component state
- **Global State**: Context API for auth, language
- **Server State**: SWR/TanStack Query for API data
- **Form State**: react-hook-form with Zod validation

### Error Handling

```typescript
// Consistent error boundaries and user feedback
try {
  await apiCall()
  toast.success(t.actions.saved)
} catch (error) {
  toast.error(t.errors.saveFailed)
}
```

---

## 🚀 Development Workflow

### Essential Commands

```bash
# Development
npm run dev                      # Start dev server
npm run build                    # Production build
npm run type-check              # TypeScript validation

# Database
npx prisma generate             # Generate client
npx prisma db push              # Push schema changes
npx prisma studio              # Database GUI

# Code Quality
npm run lint                    # ESLint
npm run lint:fix               # Auto-fix issues
npm run format                 # Prettier formatting
```

### Git Workflow

- **Branches**: feature/_, bugfix/_, hotfix/\*
- **Commits**: Conventional commits format
- **PRs**: Require type-check, lint, and build success

---

## ⚠️ Critical Guidelines

### Security

- **Always** validate user permissions in API routes
- **Never** expose sensitive data in client-side code
- **Always** sanitize user inputs with Zod schemas
- **Use** middleware for authentication checks

### Performance

- **Lazy load** components and routes where possible
- **Optimize** images with Next.js Image component
- **Cache** API responses appropriately
- **Minimize** bundle size with dynamic imports

### Code Quality

- **Prefer** TypeScript strict mode
- **Use** consistent naming conventions
- **Write** self-documenting code with clear types
- **Follow** separation of concerns principle
- **Implement** proper error boundaries

### Internationalization

- **Never** hardcode user-facing text
- **Always** use translation keys
- **Provide** fallbacks for missing translations
- **Test** with different locales

---

## 🔄 When Making Changes

1. **Read existing code** to understand patterns
2. **Follow established conventions** for naming, structure, types
3. **Update translations** if adding new user-facing text
4. **Test authentication/authorization** if touching protected routes
5. **Validate types** and run type-check before committing
6. **Consider accessibility** and responsive design
7. **Update documentation** if changing core patterns

---

## 📋 Code Generation Guidelines

### For New Components

- Use functional components with TypeScript
- Include proper prop interfaces
- Add internationalization support
- Follow established styling patterns
- Include error handling and loading states

### For New API Routes

- Implement proper authentication middleware
- Use Zod for request validation
- Return consistent response formats
- Include proper error handling
- Follow REST conventions

### For Database Changes

- Update Prisma schema
- Generate new migration
- Update corresponding TypeScript types
- Test data integrity

**Remember**: This is a production restaurant management system. Prioritize security, user experience, and maintainability in all code generation and suggestions.
