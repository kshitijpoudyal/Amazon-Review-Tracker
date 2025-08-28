# Common Dashboard Components

This directory contains reusable components extracted from PayPalDashboard and ProductDashboard to promote code reuse and consistency.

## Components

### `DashboardContainer`
A simple wrapper component that provides consistent spacing for dashboard content.

**Props:**
- `children`: React.ReactNode
- `className?`: string (optional additional CSS classes)

**Usage:**
```tsx
<DashboardContainer>
  <YourContent />
</DashboardContainer>
```

### `DashboardLayout`
A layout wrapper that can provide either full-page layout (with glass effect and gradient background) or simple spacing layout.

**Props:**
- `children`: React.ReactNode
- `useFullPageLayout?`: boolean (default: false)

**Usage:**
```tsx
// Full page layout (like PayPalDashboard)
<DashboardLayout useFullPageLayout>
  <YourContent />
</DashboardLayout>

// Simple layout (like ProductDashboard)
<DashboardLayout>
  <YourContent />
</DashboardLayout>
```

### `DashboardStats`
A generic statistics grid component that displays stat cards in a responsive grid.

**Props:**
- `stats`: StatItem[] - Array of stat objects
- `loading?`: boolean (default: false)

**StatItem Interface:**
```tsx
interface StatItem {
  value: string | number;
  label: string;
  className?: string;
}
```

**Usage:**
```tsx
const stats = [
  { value: '$1,234.56', label: 'Total Revenue', className: 'text-green-600' },
  { value: 42, label: 'Total Items' }
];

<DashboardStats stats={stats} loading={false} />
```

### `DashboardError`
A consistent error display component.

**Props:**
- `error`: string - The error message
- `title?`: string (default: 'Error')
- `icon?`: string (default: '❌')
- `additionalInfo?`: React.ReactNode (optional additional content)

**Usage:**
```tsx
<DashboardError 
  error="Failed to load data" 
  title="Loading Error"
  additionalInfo={<p>Please try again later</p>}
/>
```

### `DashboardLoading`
A consistent loading spinner component.

**Props:**
- `message?`: string (default: 'Loading...')
- `fullHeight?`: boolean (default: false)

**Usage:**
```tsx
<DashboardLoading message="Loading products..." />
<DashboardLoading fullHeight message="Initializing..." />
```

### `DashboardActions`
A component for rendering action buttons with consistent styling.

**Props:**
- `actions`: ActionButton[] - Array of action button configurations
- `loading?`: boolean (default: false)

**ActionButton Interface:**
```tsx
interface ActionButton {
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
  icon?: string;
  disabled?: boolean;
}
```

**Usage:**
```tsx
const actions = [
  { 
    label: 'Add Item', 
    onClick: () => setShowForm(true), 
    icon: '➕',
    variant: 'primary' 
  },
  { 
    label: 'Delete All', 
    onClick: handleDeleteAll, 
    variant: 'danger' 
  }
];

<DashboardActions actions={actions} loading={isLoading} />
```

### `DashboardSection`
A wrapper component for dashboard sections with optional titles and consistent padding.

**Props:**
- `children`: React.ReactNode
- `title?`: string (optional section title)
- `className?`: string (optional additional CSS classes)
- `padding?`: boolean (default: true)
- `border?`: boolean (default: true)

**Usage:**
```tsx
<DashboardSection title="Data Import" border={false}>
  <YourImportComponent />
</DashboardSection>
```

## Hook

### `useDashboardState`
A custom hook for managing common dashboard state (like form visibility).

**Options:**
```tsx
interface UseDashboardStateOptions {
  onShowForm?: () => void;
  onHideForm?: () => void;
}
```

**Returns:**
```tsx
{
  showAddForm: boolean;
  setShowAddForm: (show: boolean) => void;
  handleShowAddForm: () => void;
  handleHideAddForm: () => void;
  toggleAddForm: () => void;
}
```

**Usage:**
```tsx
const { showAddForm, handleShowAddForm, handleHideAddForm } = useDashboardState({
  onHideForm: () => console.log('Form hidden')
});
```

## Benefits

1. **Consistency**: All dashboards now use the same visual patterns
2. **Maintainability**: Changes to common patterns only need to be made in one place
3. **Reusability**: These components can be used in future dashboard implementations
4. **Type Safety**: All components are fully typed with TypeScript
5. **Performance**: Shared components reduce bundle duplication
6. **Developer Experience**: Consistent APIs make development faster

## Migration

Both `PayPalDashboard` and `ProductDashboard` have been successfully migrated to use these common components, resulting in:

- **Reduced code duplication**: ~200 lines of code eliminated
- **Improved consistency**: Both dashboards now have identical styling patterns
- **Better maintainability**: Single source of truth for common UI patterns
- **Enhanced developer experience**: Reusable patterns for future features
