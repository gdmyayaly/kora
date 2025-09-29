# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

**Development server:**
```bash
ng serve
```

**Development server with external access:**
```bash
ng serve --host 0.0.0.0 --port 4200
```

**Build:**
```bash
ng build
```

**Watch build:**
```bash
ng build --watch --configuration development
```

**Tests:**
```bash
ng test
```

**Generate components:**
```bash
ng generate component component-name
```

**Production build:**
```bash
ng build --configuration production
```

**Code formatting (Prettier):**
- Configured in `package.json` with 100 character width
- Single quotes preferred
- Special Angular parser for HTML files

## Architecture Overview

This is an Angular 20 application named "Korametrics" - a comprehensive business management platform for French companies, handling accounting, sales, purchases, payroll, and tax declarations. Built with modern Angular practices using standalone components and signals for state management.

### Technology Stack
- **Angular 20.2.0** with standalone components
- **Tailwind CSS 4.1.13** for styling
- **Chart.js 4.5.0** with ng2-charts for data visualization
- **RxJS 7.8.0** for reactive programming
- **French locale** (fr-FR) as default
- **TypeScript 5.9.2** with strict typing
- **Prettier** code formatting (100 char width, single quotes)

### Routing Architecture

The application uses a sophisticated **dual-layout routing pattern**:

- **Public routes:** `/signin` - No layout wrapper
- **Protected routes:** All other routes wrapped with `DualHeaderLayout` and protected by `AuthGuard`
- **Hierarchical business modules:** Each business function (achats, ventes, salaires, declarations, comptabilite) has child routes
- **Lazy loading:** All routes use dynamic imports for code splitting

Example structure:
```
/achats/fournisseurs      → Suppliers page within Purchases module
/ventes/nouvelle-facture  → New invoice page within Sales module
/salaires/employes        → Employees page within Payroll module
```

### Layout System

**DualHeaderLayout** is a sophisticated layout component that has been **refactored into smaller components**:

- `MainHeaderComponent`: Top header with logo, user actions, theme toggle, notifications
- `NavigationTabsComponent`: Tab-based navigation with hover/click dropdowns for submenus

**Key Navigation Features:**
- **Desktop:** Hover or click tabs to reveal dropdowns with sub-navigation
- **Mobile:** Collapsible sidebar with expandable menu sections
- **Breadcrumb:** Dynamic breadcrumb based on current route
- **Trial Banner:** Contextual banner for trial users with expiration date

**Navigation Behavior:**
- Tabs with submenus (Achats, Ventes, etc.) display dropdowns but don't navigate directly
- Tabs without submenus (Dashboard) navigate directly via RouterLink
- All sub-navigation uses proper Angular routing for SEO and accessibility

### State Management Architecture

**Signal-First Approach:**
- All components use Angular signals (`signal()`, `computed()`, `effect()`)
- Services expose readonly signals via `asReadonly()` pattern
- State updates through `set()` and `update()` methods
- No RxJS observables in component state (only for HTTP and router events)

**Key Services:**
- `AuthService`: JWT-based authentication with auto-refresh
- `ThemeService`: Dark/light theme with system detection and animated transitions
- `ToastService`: Centralized notification system with auto-dismiss
- `CompanyService`: Multi-tenant company management
- `WorkspaceService`: Workspace/tenant management
- `NotificationService`: Real-time notification handling
- `FullscreenService`: Browser fullscreen API wrapper
- `ChartService`: Centralized chart configuration and theming
- Business data services: `VentesDataService`, `SalairesDataService`, `ComptabiliteDataService`, `DeclarationsDataService`

### Authentication System

**JWT-based authentication** with refresh token rotation:
- Route protection via `AuthGuard`
- Automatic token refresh before expiration
- User profile management with subscription status
- Multi-company/tenant support

### Component Architecture

**Standalone Components:**
- No NgModules - everything is standalone
- Modern `input()` and `output()` functions instead of decorators
- `OnPush` change detection strategy
- Signal-based reactive patterns

**UI Component Pattern:**
- Shared UI components in `src/app/components/ui/`
- Business page components in `src/app/pages/`
- Layout components handle navigation and structure

### Form Handling

**Event Handling Pattern:**
```typescript
// Correct way to handle form events with strict TypeScript
protected onInputChange(field: keyof FormData, event: Event): void {
  const target = event.target as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
  this.updateFormField(field, target.value);
}
```

Avoid direct `$event.target.value` in templates due to strict TypeScript requirements.

### Business Domain Structure

The application manages core business functions:

- **Achats (Purchases):** Suppliers, purchase invoices, expense reports
- **Ventes (Sales):** Customers, sales invoices, articles/products
- **Salaires (Payroll):** Employees, monthly payroll, pay slips, statistics
- **Déclarations (Declarations):** Calendar view, declaration management
- **Comptabilité (Accounting):** Purchase journal, sales journal, payroll journal

### Styling System

- **Tailwind CSS v4.1.13** for utility-first styling
- **CSS Custom Properties** for theme variables
- **Dark/Light Theme Support** with smooth transitions
- **Responsive Design** with mobile-first approach

### Chart Integration System

**Chart.js with ng2-charts:**
- `ChartService`: Centralized service for chart configuration, themes, and data formatting
- `BaseChartComponent`: Reusable chart wrapper with loading states, error handling, and export functionality
- Specialized components: `LineChartComponent`, `BarChartComponent`, `PieChartComponent`
- Theme-aware color palettes that sync with application theme
- Responsive design with mobile-optimized chart layouts
- Built-in export functionality (PNG, JPG formats)

**Chart Configuration:**
- Charts are configured in `app.config.ts` with `provideCharts(withDefaultRegisterables())`
- French locale formatting for numbers and currency (XOF)
- Custom interfaces in `chart.interface.ts` for type safety
- Sample data generation utilities for development

### Interface Architecture

**Domain-Specific Interfaces:**
- `achats.interface.ts`: Purchase-related data structures
- `ventes.interface.ts`: Sales and invoicing structures
- `salaires.interface.ts`: Payroll and employee structures
- `declarations.interface.ts`: Tax declaration structures
- `comptabilite.interface.ts`: Accounting journal structures
- `company.interface.ts`: Company and organization structures
- `workspace.interface.ts`: Workspace and tenant structures
- `chart.interface.ts`: Chart data and configuration structures

### HTTP and Authentication

**Authentication Flow:**
- `AuthInterceptor` automatically adds JWT tokens to requests
- Token refresh handled automatically before expiration
- Multi-tenant support via company/workspace context
- French locale set globally (`fr-FR`)

### Development Best Practices

- Follow the `.claude/CLAUDE.md` coding standards for Angular/TypeScript
- Use signal-based patterns consistently
- Implement proper TypeScript event handling
- Maintain proper route structure with lazy loading
- Test navigation functionality after changes to routing/layout
- When adding new charts, extend the existing chart component system
- Maintain French localization throughout the application