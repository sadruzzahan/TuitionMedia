# TuitionMedia - Detailed Code Structure Analysis

## Complete File-by-File Code Summary

This document provides a comprehensive analysis of every file in the TuitionMedia project, detailing the specific functionality and purpose of each component.

---

## 📁 Root Configuration Files

### `package.json`
- **Purpose**: Root package manager configuration for the monorepo
- **Key Content**: 
  - Defines project as "tuition-media" with pnpm workspace support
  - Contains Turborepo scripts for build, dev, lint, and clean operations
  - Database management scripts (generate, migrate, studio)
  - Node.js version requirement (>=20)

### `pnpm-workspace.yaml`
- **Purpose**: Defines workspace structure for pnpm
- **Content**: Standard workspace configuration including `apps/*` and `packages/*`

### `turbo.json`
- **Purpose**: Turborepo task configuration for optimized builds
- **Key Features**:
  - Build task with dependency management and output caching
  - Dev task with cache disabled for hot reloading
  - Lint task with build dependencies
  - Clean task for cache clearing

### `tsconfig.base.json`
- **Purpose**: Base TypeScript configuration for all packages
- **Content**: Shared compiler options and path mappings

---

## 📁 Backend Application (`apps/backend/`)

### 🔧 Core Application Files

#### `src/main.ts`
- **Purpose**: NestJS application bootstrap and server startup
- **Key Functionality**:
  - Creates NestJS application instance
  - Configures CORS for frontend integration
  - Starts server on port 3001 (or environment PORT)
  - Error handling for startup failures

#### `src/app.module.ts`
- **Purpose**: Root application module that imports all feature modules
- **Dependencies**: ConfigModule, PrismaModule, AuthModule, TuitionRequestModule, ApplicationModule
- **Structure**: Standard NestJS module with controllers and providers

#### `src/app.controller.ts`
- **Purpose**: Root-level controller for basic health checks
- **Endpoints**: `GET /health` - Returns service status
- **Functionality**: Simple health check endpoint

#### `src/app.service.ts`
- **Purpose**: Root-level service for application-wide operations
- **Methods**: `getHealth()` - Returns status object

---

### 🔐 Authentication Module (`src/auth/`)

#### `auth.module.ts`
- **Purpose**: NestJS module for authentication features
- **Imports**: JwtModule, PassportModule
- **Providers**: AuthService, JwtStrategy, JwtAuthGuard, RolesGuard
- **Controllers**: AuthController
- **Exports**: AuthService

#### `auth.controller.ts`
- **Purpose**: HTTP endpoints for user authentication and profile management
- **Key Endpoints**:
  - `POST /auth/register` - User registration with role-based profiles
  - `POST /auth/login` - User authentication with JWT
  - `GET /auth/me` - Get current user profile
  - `PUT /auth/profile` - Update basic user information
  - `GET/PUT /auth/tutor-profile` - Tutor profile management
  - `GET/PUT /auth/student-profile` - Student profile management
- **Security**: JWT authentication and role-based access control

#### `auth.service.ts`
- **Purpose**: Core authentication business logic
- **Key Methods**:
  - `register()` - User registration with password hashing and profile creation
  - `login()` - Authentication with password verification
  - `validateUser()` - JWT payload validation
  - Profile management methods for tutors and students
- **Security**: bcrypt password hashing, JWT token generation

#### `jwt-auth.guard.ts`
- **Purpose**: JWT authentication guard for protected routes
- **Functionality**: Extends NestJS Passport JWT guard with custom error handling

#### `jwt.strategy.ts`
- **Purpose**: JWT strategy for Passport authentication
- **Functionality**: Extracts and validates JWT tokens from requests

#### `roles.decorator.ts`
- **Purpose**: Decorator for defining required user roles on endpoints
- **Usage**: `@Roles("TUTOR")` on controller methods

#### `roles.guard.ts`
- **Purpose**: Guard for enforcing role-based access control
- **Functionality**: Checks if user has required role for endpoint access

---

### 📚 Tuition Request Module (`src/tuition-request/`)

#### `tuition-request.module.ts`
- **Purpose**: Module for tuition request management
- **Components**: Controller, Service, PrismaService dependency

#### `tuition-request.controller.ts`
- **Purpose**: HTTP endpoints for tuition request CRUD operations
- **Key Endpoints**:
  - `GET /tuition-requests` - List requests with filters
  - `GET /tuition-requests/open` - Get open requests for tutors
  - `GET /tuition-requests/my` - Get student's own requests
  - `GET /tuition-requests/:id` - Get specific request details
  - `POST /tuition-requests` - Create new request (students only)
  - `DELETE /tuition-requests/:id/close` - Close request (students only)
  - `PUT /tuition-requests/:id` - Update request
- **Security**: Role-based access control and ownership validation

#### `tuition-request.service.ts`
- **Purpose**: Business logic for tuition request operations
- **Key Methods**:
  - `create()` - Create new tuition request with validation
  - `findAll()` - List requests with filtering and search
  - `findOpenForTutors()` - Get available requests for tutor applications
  - `findById()` - Get detailed request with applications
  - `findByStudentId()` - Get student's requests
  - `close()` - Close request (ownership validation)
  - `update()` - Update request (ownership/admin validation)
- **Features**: Decimal handling for budget, relationship includes

---

### 📄 Application Module (`src/application/`)

#### `application.module.ts`
- **Purpose**: Module for tutor application management
- **Components**: Controller, Service, PrismaService dependency

#### `application.controller.ts`
- **Purpose**: HTTP endpoints for application management
- **Key Endpoints**:
  - `POST /applications` - Submit application (tutors only)
  - `GET /applications/request/:requestId` - Get request's applications (students only)
  - `GET /applications/my` - Get tutor's own applications (tutors only)
  - `POST /applications/:id/accept` - Accept application (students only)
  - `POST /applications/:id/reject` - Reject application (students only)
- **Security**: Strict role and ownership validation

#### `application.service.ts`
- **Purpose**: Business logic for application operations
- **Key Methods**:
  - `create()` - Submit application with duplicate prevention
  - `findByRequest()` - Get applications for specific request
  - `findByTutor()` - Get tutor's application history
  - `accept()` - Accept application with transaction handling
  - `reject()` - Reject application
- **Features**: Transaction-based acceptance, automatic rejection of other applications

---

### 🗄️ Database Module (`src/prisma/`)

#### `prisma.module.ts`
- **Purpose**: Prisma ORM module configuration
- **Providers**: PrismaService
- **Exports**: PrismaService for use in other modules

#### `prisma.service.ts`
- **Purpose**: Prisma client service for database operations
- **Functionality**: Provides Prisma client instance with connection management

---

### 🔧 Common Utilities (`src/common/`)

#### `zod-validation.pipe.ts`
- **Purpose**: Validation pipe using Zod schemas
- **Functionality**: Automatic request validation using shared schemas
- **Integration**: Used with `@UsePipes()` decorator

---

### 📊 Database Schema (`prisma/`)

#### `schema.prisma`
- **Purpose**: Complete database schema definition
- **Models**: 14 interconnected models (User, TuitionRequest, Application, etc.)
- **Features**: 
  - Role-based user system (STUDENT, TUTOR, ADMIN)
  - Comprehensive relationships and constraints
  - Enums for status management
  - Indexes for performance optimization
  - Cascade deletions for data integrity

---

## 📁 Frontend Application (`apps/frontend/`)

### 🔧 Core Configuration Files

#### `next.config.ts`
- **Purpose**: Next.js configuration
- **Content**: Standard Next.js setup with potential customizations

#### `tailwind.config.ts`
- **Purpose**: Tailwind CSS configuration
- **Features**: Custom theme, animations, glassmorphism utilities

#### `components.json`
- **Purpose**: shadcn/ui component configuration
- **Content**: Component library setup and styling preferences

#### `tsconfig.json`
- **Purpose**: TypeScript configuration for frontend
- **Content**: Extends base config with frontend-specific settings

---

### 🎨 UI Components (`src/components/`)

#### `ui/button.tsx`
- **Purpose**: Reusable button component with multiple variants
- **Variants**: default, destructive, outline, secondary, ghost, link, gradient, glass
- **Features**: Hover animations, scale effects, gradient backgrounds

#### `ui/card.tsx`
- **Purpose**: Card container component
- **Functionality**: Standard card layout with header and content sections

#### `ui/input.tsx`
- **Purpose**: Text input component
- **Features**: Consistent styling with glassmorphism theme

#### `ui/textarea.tsx`
- **Purpose**: Textarea input component
- **Features**: Multi-line text input with consistent styling

#### `ui/label.tsx`
- **Purpose**: Form label component
- **Functionality**: Accessible label for form inputs

#### `ui/dialog.tsx`
- **Purpose**: Modal dialog component
- **Features**: Overlay dialogs with header, content, and footer

#### `ui/form.tsx`
- **Purpose**: Form integration component
- **Functionality**: React Hook Form integration

#### `ui/dropdown-menu.tsx`
- **Purpose**: Dropdown menu component
- **Features**: Accessible dropdown with keyboard navigation

#### `ui/toast.tsx`
- **Purpose**: Notification toast component
- **Functionality**: Non-intrusive user notifications

#### `toaster.tsx`
- **Purpose**: Toast container and management
- **Functionality**: Global toast system for user feedback

---

### 🗂️ Layout Components (`src/app/`)

#### `layout.tsx`
- **Purpose**: Root layout component
- **Features**: Dark theme setup, global toast integration, metadata configuration

#### `page.tsx` (Landing)
- **Purpose**: Homepage/landing page
- **Features**: Hero section, feature cards, animated backgrounds, call-to-action buttons
- **Animations**: Motion components, floating orbs, gradient effects

---

### 🔐 Public Routes (`src/app/(public)/`)

#### `layout.tsx`
- **Purpose**: Layout for public (unauthenticated) routes
- **Functionality**: Simple layout for login/signup pages

#### `login/page.tsx`
- **Purpose**: User login page
- **Features**: Email/password form, authentication, redirect logic
- **State**: Form validation, loading states, error handling

#### `signup/page.tsx`
- **Purpose**: User registration page
- **Features**: Role selection (Student/Tutor), account creation
- **Validation**: Email format, password requirements, form validation

---

### 📊 Dashboard Routes (`src/app/(dashboard)/`)

#### `layout.tsx`
- **Purpose**: Dashboard layout for authenticated users
- **Features**: Navigation, user context, authentication guards

#### `dashboard/page.tsx`
- **Purpose**: Dashboard router based on user role
- **Functionality**: Redirects to appropriate dashboard (student/tutor)

---

### 🎓 Student Dashboard (`src/app/(dashboard)/dashboard/student/`)

#### `page.tsx`
- **Purpose**: Student's tuition requests list
- **Features**: Request cards, status indicators, application counts
- **Actions**: Create new request, view request details

#### `new/page.tsx`
- **Purpose**: Create new tuition request form
- **Features**: Multi-step form, validation, budget/location options
- **State**: Form management, submission handling

#### `[id]/page.tsx`
- **Purpose**: Individual tuition request detail page
- **Features**: Request details, application management, accept/reject actions
- **Functionality**: Application review, request closing, status updates

---

### 👨‍🏫 Tutor Dashboard (`src/app/(dashboard)/dashboard/tutor/`)

#### `page.tsx`
- **Purpose**: Tutor job board - browse open requests
- **Features**: Search/filter functionality, request cards, application dialog
- **Components**: Advanced filtering, subject-based search, application submission

#### `applications/page.tsx`
- **Purpose**: Tutor's application history
- **Features**: Application status tracking, request details
- **States**: Pending, accepted, rejected applications

---

### 🔧 Core Services (`src/lib/`)

#### `api.ts`
- **Purpose**: HTTP client for API communication
- **Features**: JWT token management, error handling, typed responses
- **Methods**: apiGet, apiPost, apiPut, apiDelete with TypeScript generics

#### `utils.ts`
- **Purpose**: Utility functions
- **Content**: Common helper functions, class name utilities

---

### 🗃️ State Management (`src/store/`)

#### `auth-store.ts`
- **Purpose**: Global authentication state management
- **Features**: Zustand store with persistence, user data, token management
- **Methods**: setAuth, logout, hydrate for state restoration

---

### 🎣 Custom Hooks (`src/hooks/`)

#### `use-toast.ts`
- **Purpose**: Toast notification hook
- **Functionality**: Global toast system for user feedback

---

## 📦 Shared Package (`packages/shared-schema/`)

### `src/index.ts`
- **Purpose**: Shared Zod schemas and TypeScript types
- **Schemas**:
  - `RegisterUserSchema` - User registration validation
  - `LoginUserSchema` - Login validation
  - `CreateTuitionRequestSchema` - Request creation validation
  - `CreateApplicationSchema` - Application submission validation
- **Types**: Generated TypeScript types from Zod schemas
- **Usage**: Shared between frontend and backend for type safety

---

## 📄 Documentation Files

### `README.md`
- **Purpose**: Project overview and setup instructions
- **Content**: Technology stack, prerequisites, setup guide, project structure

### `SETUP-DATABASE.md`
- **Purpose**: Database setup instructions
- **Content**: PostgreSQL configuration, migration steps

### `COMPREHENSIVE_PROJECT_ANALYSIS.md`
- **Purpose**: High-level project analysis
- **Content**: Architecture overview, feature analysis, technical details

---

## 🔧 Development Configuration

### Environment Files
- `.env.example` - Environment variable templates
- `.env.local` - Local environment configuration
- `.env` - Backend environment variables

### Build Configuration
- `next-env.d.ts` - Next.js TypeScript definitions
- `postcss.config.mjs` - PostCSS configuration for Tailwind
- `.npmrc` - npm configuration settings

### Package Files
- `package.json` (frontend) - Frontend dependencies and scripts
- `package.json` (backend) - Backend dependencies and scripts
- `package.json` (shared-schema) - Shared package configuration

---

## 📊 File Functionality Summary

### Authentication Flow
1. **Registration**: `signup/page.tsx` → `auth.controller.ts` → `auth.service.ts`
2. **Login**: `login/page.tsx` → `auth.controller.ts` → `auth.service.ts`
3. **Profile Management**: Dashboard → `auth.controller.ts` → `auth.service.ts`

### Tuition Request Flow
1. **Create Request**: `student/new/page.tsx` → `tuition-request.controller.ts` → `tuition-request.service.ts`
2. **Browse Requests**: `tutor/page.tsx` → `tuition-request.controller.ts` → `tuition-request.service.ts`
3. **Request Details**: `student/[id]/page.tsx` → `tuition-request.controller.ts` → `tuition-request.service.ts`

### Application Flow
1. **Submit Application**: `tutor/page.tsx` → `application.controller.ts` → `application.service.ts`
2. **Review Applications**: `student/[id]/page.tsx` → `application.controller.ts` → `application.service.ts`
3. **Track Applications**: `tutor/applications/page.tsx` → `application.controller.ts` → `application.service.ts`

### Data Flow Architecture
- **Frontend**: React components → API client (`api.ts`) → HTTP requests
- **Backend**: Controllers → Services → Prisma ORM → PostgreSQL
- **Validation**: Shared Zod schemas ensure type safety across stack
- **Authentication**: JWT tokens with role-based access control

This comprehensive structure demonstrates a well-organized, full-stack application with clear separation of concerns, type safety, and modern development practices.
