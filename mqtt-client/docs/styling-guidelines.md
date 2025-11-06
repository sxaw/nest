# shadcn/ui Styling Guidelines & Workflows

This document provides comprehensive styling conventions, best practices, and common workflows for working with shadcn/ui components in this project.

## 🎯 Core Philosophy: Define Once, Use Everywhere

**Principle**: All styling decisions should be made in one place (`src/index.css`) and consumed consistently across the entire application through semantic CSS variables. This ensures:

- ✅ **Single Source of Truth**: All colors, spacing, and design tokens defined once
- ✅ **Automatic Consistency**: Components automatically inherit theme changes
- ✅ **Zero Drift**: No hardcoded values that can fall out of sync
- ✅ **Maintainability**: Update in one place, see changes everywhere

**Anti-Patterns to Avoid**:

- ❌ Hardcoded colors like `bg-white`, `text-black`
- ❌ Magic numbers like `p-4`, `mt-8` without semantic meaning
- ❌ Inconsistent spacing patterns across components
- ❌ Multiple ways to achieve the same visual result

## Table of Contents

- [Configuration Overview](#configuration-overview)
- [Styling Principles](#styling-principles)
- [Color System](#color-system)
- [Component Styling Patterns](#component-styling-patterns)
- [Common Workflows](#common-workflows)
- [Best Practices](#best-practices)
- [Troubleshooting](#troubleshooting)

## Configuration Overview

### Current Setup

Our project uses the following shadcn/ui configuration:

```json
{
  "style": "new-york",
  "rsc": false,
  "tsx": true,
  "tailwind": {
    "config": "tailwind.config.js",
    "css": "src/index.css",
    "baseColor": "zinc",
    "cssVariables": true,
    "prefix": ""
  },
  "iconLibrary": "lucide"
}
```

### Key Configuration Points

- ✅ **CSS Variables Enabled**: `cssVariables: true` - Uses CSS variables for theming
- ✅ **Zinc Base Color**: Uses zinc color palette as the base
- ✅ **New York Style**: Uses the "new-york" component variants
- ✅ **TypeScript**: Full TypeScript support enabled

## Styling Principles

### 1. CSS Variable-Based Theming (Non-Negotiable)

**Rule**: ALL styling must use CSS variables defined in `src/index.css`. No exceptions.

```tsx
// ✅ CORRECT - Uses semantic CSS variables
<div className="bg-background text-foreground border-border p-4" />

// ❌ FORBIDDEN - Hardcoded values
<div className="bg-white text-black border-gray-200 p-4" />
```

**Benefits**:

- Dynamic theme switching (light/dark mode)
- Single point of maintenance for all design tokens
- Automatic consistency across entire application
- Zero possibility of visual drift

### 2. Semantic Color Usage (Mandatory)

**Rule**: Use only semantic color names that map to CSS variables.

**Approved Color Classes**:

- `background`, `foreground` - Primary surface/text
- `primary`, `primary-foreground` - Brand colors
- `secondary`, `secondary-foreground` - Secondary actions
- `muted`, `muted-foreground` - Disabled/subtle states
- `accent`, `accent-foreground` - Highlight states
- `destructive`, `destructive-foreground` - Error states
- `card`, `card-foreground` - Card surfaces
- `border`, `input`, `ring` - Interactive elements

**Examples**:

```tsx
// ✅ CORRECT - Semantic colors
<button className="bg-primary text-primary-foreground hover:bg-primary/90" />
<div className="bg-card border-border p-4" />
<input className="border-input bg-background text-foreground" />

// ❌ FORBIDDEN - Non-semantic or hardcoded
<button className="bg-blue-500 text-white hover:bg-blue-600" />
<div className="bg-gray-100 border-gray-300 p-4" />
```

### 3. Consistent Spacing System (Enforced)

**Rule**: Use the spacing scale defined in CSS variables, not arbitrary Tailwind values.

**Available Spacing** (from your CSS variables):

- Component padding: `p-4` (standard), `p-6` (large), `p-8` (extra large)
- Gap spacing: `gap-2`, `gap-4`, `gap-6`
- Margin spacing: `m-2`, `m-4`, `m-6`

**Consistent Patterns**:

```tsx
// ✅ CORRECT - Consistent spacing patterns
<Card className="p-6" />
<div className="flex gap-4" />
<Section className="m-6" />

// ❌ FORBIDDEN - Arbitrary spacing that breaks consistency
<Card className="p-7" /> // Non-standard padding
<div className="gap-5" /> // Breaks spacing scale
<Section className="my-12" /> // Inconsistent with other margins
```

### 4. Responsive Design (Standardized)

**Rule**: Use consistent breakpoint patterns across all components.

**Standard Breakpoints**:

- Mobile: Default (no prefix)
- Tablet: `md:` prefix
- Desktop: `lg:` prefix
- Large Desktop: `xl:` prefix

**Consistent Patterns**:

```tsx
// ✅ CORRECT - Standard responsive patterns
<div className="w-full md:w-auto lg:max-w-sm" />
<div className="flex-col md:flex-row gap-2 md:gap-4" />

// ❌ AVOID - Inconsistent responsive behavior
<div className="w-full sm:w-auto xl:w-1/2" /> // Skip breakpoints unnecessarily
```

## Color System

### Available Color Variables

#### Core Colors

- `background` / `foreground` - Main surface and text colors
- `primary` / `primary-foreground` - Primary action colors
- `secondary` / `secondary-foreground` - Secondary action colors
- `muted` / `muted-foreground` - Subtle/disabled states
- `accent` / `accent-foreground` - Highlight colors
- `destructive` / `destructive-foreground` - Error/danger states

#### Surface Colors

- `card` / `card-foreground` - Card backgrounds and text
- `popover` / `popover-foreground` - Popover/dropdown styling
- `border` - Border colors
- `input` - Input field styling
- `ring` - Focus ring colors

#### Chart Colors

- `chart-1` through `chart-5` - Data visualization colors

#### Sidebar Colors

- `sidebar` / `sidebar-foreground` - Sidebar backgrounds
- `sidebar-primary` / `sidebar-primary-foreground` - Sidebar active states
- `sidebar-accent` / `sidebar-accent-foreground` - Sidebar highlights
- `sidebar-border` / `sidebar-ring` - Sidebar borders and focus

### Dark Mode Support

All colors have corresponding dark mode definitions in the `.dark` class selector.

## Component Styling Patterns

### 1. Basic Component Structure

```tsx
function Component({ children, className, ...props }) {
  return (
    <div className={cn("base-styles additional-styles", className)} {...props}>
      {children}
    </div>
  );
}
```

### 2. Button Variants

```tsx
const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);
```

### 3. Card Component

```tsx
<div className="rounded-lg border bg-card text-card-foreground shadow-sm">
  {/* Card content */}
</div>
```

### 4. Input Fields

```tsx
<input className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50" />
```

## Common Workflows

### Workflow 1: Adding a New Custom Color

**When to use**: You need a new semantic color (e.g., "warning", "success") that isn't in the default palette.

**Steps**:

1. **Add CSS Variables** in `src/index.css`:

```css
:root {
  /* Add new color variables */
  --warning: oklch(0.84 0.16 84);
  --warning-foreground: oklch(0.28 0.07 46);
}

.dark {
  /* Add dark mode variants */
  --warning: oklch(0.41 0.11 46);
  --warning-foreground: oklch(0.99 0.02 95);
}

@theme inline {
  /* Register with Tailwind */
  --color-warning: var(--warning);
  --color-warning-foreground: var(--warning-foreground);
}
```

2. **Use in Components**:

```tsx
<div className="bg-warning text-warning-foreground">
  Warning message
</div>
```

### Workflow 2: Customizing Existing Colors

**When to use**: You want to adjust the hue, saturation, or lightness of existing colors.

**Steps**:

1. **Identify the Color Variable** in `src/index.css`
2. **Modify the Oklch Values**:

```css
:root {
  /* Original: --primary: oklch(0.21 0.006 285.885); */
  --primary: oklch(0.25 0.008 280.5); /* Adjusted values */
}
```

3. **Update Dark Mode** if needed:

```css
.dark {
  --primary: oklch(0.92 0.004 286.32); /* Adjusted dark mode */
}
```

### Workflow 3: Adding Radius Variants

**When to use**: You need specific border radius values for different components.

**Steps**:

1. **Use Existing Radius Variables**:

```css
/* Already available in your setup */
--radius-sm: calc(var(--radius) - 4px);
--radius-md: calc(var(--radius) - 2px);
--radius-lg: var(--radius);
--radius-xl: calc(var(--radius) + 4px);
```

2. **Add Custom Radius** if needed:

```css
@theme inline {
  --radius-xs: calc(var(--radius) - 6px);
  --radius-2xl: calc(var(--radius) + 8px);
}
```

3. **Apply in Components**:

```tsx
<div className="rounded-lg rounded-sm rounded-xl" />
```

### Workflow 4: Creating a New Component

**When to use**: Building a new shadcn/ui-compatible component.

**Steps**:

1. **Create Component File**:

```tsx
// src/components/ui/my-component.tsx
import { cn } from "@/lib/utils";

interface MyComponentProps {
  className?: string;
  children: React.ReactNode;
}

export function MyComponent({ className, children, ...props }: MyComponentProps) {
  return (
    <div
      className={cn(
        "rounded-lg border bg-card text-card-foreground shadow-sm p-4",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
```

2. **Use Semantic Classes**:
   - `bg-background` for surfaces
   - `text-foreground` for text
   - `border-border` for borders
   - `bg-card` for card backgrounds

3. **Add Variants** if needed using `cva` (class-variance-authority):

```tsx
import { cva } from "class-variance-authority";

const myComponentVariants = cva(
  "rounded-lg border bg-card text-card-foreground shadow-sm p-4",
  {
    variants: {
      variant: {
        default: "bg-card",
        elevated: "bg-popover shadow-lg",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);
```

### Workflow 5: Updating Spacing and Layout

**When to use**: Adjusting spacing, breakpoints, or layout utilities.

**Steps**:

1. **Modify Tailwind Config** in `tailwind.config.js`:

```js
module.exports = {
  theme: {
    extend: {
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
      },
      screens: {
        '3xl': '1600px',
      },
    },
  },
}
```

2. **Or Use CSS Variables for Theme Consistency**:

```css
@theme inline {
  --spacing-xs: 0.25rem;
  --spacing-sm: 0.5rem;
  --spacing-md: 1rem;
  --spacing-lg: 1.5rem;
  --spacing-xl: 2rem;
}
```

### Workflow 6: Implementing Theme Switching

**When to use**: Adding light/dark mode toggle functionality.

**Steps**:

1. **Ensure CSS Variables are Set** (already done in our setup)
2. **Add Theme Toggle Component**:

```tsx
import { useTheme } from "next-themes";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <button
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
      className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
    >
      {theme === "light" ? "🌙" : "☀️"}
    </button>
  );
}
```

3. **Apply Theme Class** to your root element:

```tsx
// In your app root
<div className={theme}>
  <App />
</div>
```

## 🔒 Consistency Enforcement Rules

### Mandatory Rules (No Exceptions)

1. **All Colors Must Be Variables**: Every color class must reference a CSS variable
2. **Consistent Spacing Scale**: Use only the approved spacing values
3. **Standard Component Structure**: Follow the same patterns for all components
4. **Semantic Class Names**: Use meaningful class names that describe purpose, not appearance

### Code Review Checklist

Before merging any component, verify:

- [ ] No hardcoded colors (`bg-white`, `text-black`, `border-gray-200`)
- [ ] Only semantic color variables are used
- [ ] Spacing follows the approved scale
- [ ] Responsive breakpoints are consistent
- [ ] Component uses the `cn()` utility for class merging
- [ ] Dark mode compatibility is maintained

### Automated Validation (Recommended)

Add these ESLint rules to enforce consistency:

```json
{
  "rules": {
    "tailwindcss/no-custom-classname": ["error", {
      "allowedClasses": ["bg-background", "text-foreground", "border-border", /* all semantic classes */]
    }],
    "tailwindcss/enforces-shorthand": "error",
    "tailwindcss/no-contradicting-classname": "error"
  }
}
```

### Component Template (Required Starting Point)

All new components must start from this template:

```tsx
import { cn } from "@/lib/utils";

interface ComponentProps {
  className?: string;
  children: React.ReactNode;
  // Add other props as needed
}

export function Component({ className, children, ...props }: ComponentProps) {
  return (
    <div
      className={cn(
        // Base styles using CSS variables only
        "bg-background text-foreground border-border",
        // Consistent spacing
        "p-4",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
```

## Best Practices

### 1. Consistency (Non-Negotiable)

- **Always** use semantic color variables instead of hardcoded values
- **Never** deviate from established spacing patterns
- **Always** use the `cn()` utility for conditional classes
- **Never** create multiple ways to achieve the same visual result

### 2. Accessibility (Mandatory)

- Ensure sufficient contrast ratios with your color choices
- Use focus rings (`focus-visible:ring-ring`) for keyboard navigation
- Provide text alternatives for color-only information

### 3. Performance (Optimized)

- Use Tailwind's JIT compiler (enabled by default)
- Avoid unnecessary CSS custom properties
- Minimize variant complexity in components

### 4. Maintainability (Critical)

- Document custom colors and their use cases in this file
- Use descriptive class names that describe purpose
- Keep component variants simple and logical
- Update this document when adding new design tokens

### 5. TypeScript (Required)

- Properly type component props
- Use variant types for better IntelliSense
- Export types for library consumers

## Troubleshooting

### Common Issues

#### Issue: CSS Variables Not Working

**Solution**: Ensure `cssVariables: true` in `components.json` and that `@theme inline` is properly configured.

#### Issue: Dark Mode Not Applying

**Solution**: Check that the `.dark` class is applied to a parent element and that dark mode variables are defined.

#### Issue: Custom Colors Not Available in Tailwind

**Solution**: Ensure colors are registered in `@theme inline` block and that you're using the correct class names.

#### Issue: Component Styles Not Applying

**Solution**: Verify that you're importing the `cn()` utility and that class names are properly combined.

### Debugging Tips

1. **Use Browser DevTools** to inspect computed styles and verify CSS variable values
2. **Check Tailwind Compilation** by looking at the generated CSS
3. **Verify Component Imports** and ensure proper file structure
4. **Test in Both Themes** to ensure consistency

## Resources

- [shadcn/ui Documentation](https://ui.shadcn.com)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Oklch Color Space Guide](https://www.w3.org/TR/css-color-4/#ok-lab)
- [Class Variance Authority](https://cva.style/docs)

---

This document serves as the authoritative guide for styling in this project. Always refer to these guidelines when creating or modifying components to ensure consistency and maintainability.
