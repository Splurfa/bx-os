# Style Guide - Behavior Support System

## Typography Hierarchy

Our typography system uses the Inter font family with a responsive, mobile-first approach. All typography classes are defined in `src/index.css` as utility classes.

### Typography Classes

```css
/* Display Text - Hero headings */
.text-display
@apply text-4xl md:text-5xl font-bold tracking-tight;

/* Primary Headings */
.text-h1
@apply text-3xl md:text-4xl font-bold tracking-tight;

/* Secondary Headings */
.text-h2
@apply text-2xl md:text-3xl font-semibold tracking-tight;

/* Tertiary Headings */
.text-h3
@apply text-xl md:text-2xl font-semibold;

/* Quaternary Headings */
.text-h4
@apply text-lg md:text-xl font-medium;

/* Minor Headings */
.text-h5
@apply text-base md:text-lg font-medium;

/* Body Text Variants */
.text-body-large
@apply text-lg leading-relaxed;

.text-body
@apply text-base leading-relaxed;

.text-body-small
@apply text-sm leading-relaxed;

/* Caption Text */
.text-caption
@apply text-xs text-muted-foreground;
```

### Usage Examples

```tsx
// Page titles
<h1 className="text-h1">Teacher Dashboard</h1>

// Section headings
<h2 className="text-h2">Active Queue</h2>

// Card titles
<h3 className="text-h3">Behavior Request</h3>

// Body content
<p className="text-body">Please complete all reflection questions...</p>

// Metadata and timestamps
<span className="text-caption">Created 2 minutes ago</span>
```

## Color System

Our color system is built with HSL values and semantic tokens defined in CSS custom properties. All colors support both light and dark modes.

### Primary Colors

```css
:root {
  --primary: 217 91% 59%;        /* Blue - Primary actions */
  --primary-foreground: 0 0% 100%;
  
  --secondary: 240 100% 98%;      /* Light gray - Secondary actions */
  --secondary-foreground: 220 27% 18%;
  
  --destructive: 0 93% 73%;       /* Red - Destructive actions */
  --destructive-foreground: 0 0% 100%;
}
```

### Behavior Category Colors

Each behavior category has its own semantic color for consistent identification:

```css
--behavior-disruptive: 25 100% 61%;      /* Orange */
--behavior-social: 326 100% 74%;         /* Pink */
--behavior-avoidance: 142 76% 47%;       /* Green */
--behavior-eloping: 217 91% 59%;         /* Blue */
--behavior-minor-physical: 270 100% 80%; /* Purple */
--behavior-major-physical: 0 93% 73%;    /* Red */
```

### Queue Status Colors

```css
--queue-active: 217 91% 59%;     /* Blue - In progress */
--queue-waiting: 45 93% 58%;     /* Yellow - Waiting */
--queue-completed: 142 76% 47%;  /* Green - Completed */
--queue-urgent: 0 93% 73%;       /* Red - Urgent */
```

### Color Usage Guidelines

1. **Use semantic tokens**: Always use `hsl(var(--primary))` instead of hardcoded colors
2. **Behavior colors**: Use behavior-specific colors for category identification
3. **Status colors**: Use queue status colors for visual status communication
4. **Accessibility**: Ensure proper contrast ratios (WCAG AA compliance)

## Spacing System

Our spacing system provides consistent layouts across the application with responsive scaling.

### Spacing Classes

```css
/* Page-level spacing */
.spacing-page
@apply p-4 md:p-6 lg:p-8;

/* Section spacing */
.spacing-section
@apply space-y-6 md:space-y-8;

/* Content spacing */
.spacing-content
@apply space-y-4;

/* Tight spacing for related elements */
.spacing-tight
@apply space-y-2;
```

### Container System

```css
/* Main page container */
.container-page
@apply container mx-auto max-w-7xl spacing-page;

/* Content container */
.container-content
@apply max-w-4xl mx-auto;

/* Narrow container for forms */
.container-narrow
@apply max-w-2xl mx-auto;
```

## Icon Standards

Icons use consistent sizing based on content hierarchy and are responsive across breakpoints.

### Icon Size Classes

```css
/* Large icons for h1/h2 headings */
.icon-h1
@apply w-8 h-8 md:w-10 md:h-10;

.icon-h2
@apply w-6 h-6 md:w-8 md:h-8;

/* Medium icons for h3 headings */
.icon-h3
@apply w-5 h-5 md:w-6 md:h-6;

/* Small icons for inline use */
.icon-inline
@apply w-4 h-4;

/* Tiny icons for metadata */
.icon-small
@apply w-3 h-3;
```

### Icon Usage Guidelines

1. **Consistent sizing**: Use predefined size classes
2. **Lucide React**: Primary icon library
3. **Semantic naming**: Choose icons that clearly represent their function
4. **Accessibility**: Include proper aria-labels for icon-only buttons

```tsx
import { Clock, User, AlertTriangle } from 'lucide-react';

// Large section icon
<Clock className="icon-h2" />

// Inline status icon
<AlertTriangle className="icon-inline text-queue-urgent" />

// Small metadata icon
<User className="icon-small" />
```

## Layout Patterns

### Card Layouts

Standard card component with consistent spacing and shadows:

```tsx
<Card className="shadow-card">
  <CardHeader className="spacing-tight">
    <CardTitle className="text-h3">Card Title</CardTitle>
  </CardHeader>
  <CardContent className="spacing-content">
    {/* Card content */}
  </CardContent>
</Card>
```

### Dashboard Grids

Responsive grid layouts for dashboard components:

```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {items.map(item => (
    <Card key={item.id}>{/* Card content */}</Card>
  ))}
</div>
```

### Form Layouts

Consistent form styling with proper spacing:

```tsx
<form className="spacing-content">
  <div className="spacing-tight">
    <Label className="text-body-small font-medium">Field Label</Label>
    <Input placeholder="Enter value..." />
  </div>
  <Button type="submit" className="w-full">Submit</Button>
</form>
```

## Mobile/Desktop Responsive Guidelines

### Breakpoint Strategy

Our responsive design follows a mobile-first approach:

- **Mobile**: Default (< 768px)
- **Tablet**: `md:` (768px+)
- **Desktop**: `lg:` (1024px+)
- **Large Desktop**: `xl:` (1280px+)

### Responsive Patterns

```tsx
{/* Mobile-specific adjustments */}
{isMobile ? (
  <div className="p-4 text-sm">Mobile Layout</div>
) : (
  <div className="p-6 text-base">Desktop Layout</div>
)}

{/* Responsive classes */}
<div className="text-sm md:text-base lg:text-lg">
  Responsive Text
</div>

{/* Grid adjustments */}
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
  {/* Responsive grid */}
</div>
```

### Mobile Considerations

1. **Touch targets**: Minimum 44px touch targets for buttons
2. **Typography**: Smaller base sizes on mobile
3. **Spacing**: Reduced padding and margins on mobile
4. **Navigation**: Simplified navigation patterns
5. **Performance**: Optimized for mobile performance

## Animation and Transitions

### Standard Animations

```css
/* Fade in animation */
.fade-in {
  opacity: 0;
  animation: fadeIn 0.6s ease-out forwards;
}

/* Slide up animation */
.slide-up {
  transform: translateY(20px);
  opacity: 0;
  animation: slideUp 0.8s ease-out forwards;
}

/* Scale in animation */
.scale-in {
  transform: scale(0.95);
  opacity: 0;
  animation: scaleIn 0.7s ease-out forwards;
}

/* Gentle floating animation */
.floating {
  animation: float 3s ease-in-out infinite;
}
```

### Stagger Animation Classes

```css
.stagger-1 { animation-delay: 0.1s; }
.stagger-2 { animation-delay: 0.2s; }
.stagger-3 { animation-delay: 0.3s; }
.stagger-4 { animation-delay: 0.4s; }
.stagger-5 { animation-delay: 0.5s; }
```

### Modal and Dialog Animations

```css
.modal-backdrop {
  backdrop-filter: blur(8px);
}

.modal-enter {
  transform: scale(0.95) translateY(20px);
  opacity: 0;
  animation: modalEnter 0.3s ease-out forwards;
}
```

## Component Variants

### Button Variants

Our button system includes semantic variants:

```tsx
// Primary action
<Button variant="default">Create Request</Button>

// Secondary action  
<Button variant="outline">Cancel</Button>

// Destructive action
<Button variant="destructive">Delete</Button>

// Ghost button
<Button variant="ghost">Learn More</Button>
```

### Badge Variants

Status badges with semantic colors:

```tsx
// Behavior category badges
<Badge className="bg-behavior-disruptive text-white">Disruptive</Badge>

// Status badges  
<Badge className="bg-queue-waiting text-white">Waiting</Badge>

// Priority badges
<Badge variant="destructive">Urgent</Badge>
```

## Accessibility Guidelines

### Color Contrast

- **WCAG AA compliance**: Minimum 4.5:1 contrast ratio for normal text
- **WCAG AAA compliance**: 7:1 contrast ratio for enhanced accessibility
- **Color blindness**: Don't rely solely on color to convey information

### Focus Management

```tsx
// Proper focus indicators
<Button className="focus:ring-2 focus:ring-offset-2 focus:ring-primary">
  Accessible Button
</Button>

// Skip links for navigation
<a href="#main-content" className="sr-only focus:not-sr-only">
  Skip to main content
</a>
```

### ARIA Labels

```tsx
// Icon buttons need labels
<Button aria-label="Delete behavior request">
  <Trash2 className="icon-inline" />
</Button>

// Loading states
<div aria-live="polite" aria-busy="true">
  Loading...
</div>
```

## File Organization

### Style File Structure

```
src/
├── index.css              # Design system definitions
├── App.css                # Global app styles
└── components/
    └── ui/                 # Styled UI components
        ├── button.tsx      # Button variants
        ├── card.tsx        # Card components
        ├── badge.tsx       # Badge variants
        └── ...
```

### CSS Class Naming

1. **Utility-first**: Use Tailwind utility classes
2. **Semantic classes**: Create meaningful class names in index.css
3. **Component-specific**: Use CSS Modules for component-specific styles
4. **BEM methodology**: When custom CSS is needed

## Best Practices

### Performance

1. **Purge unused styles**: Tailwind automatically removes unused styles
2. **Critical CSS**: Inline critical styles for faster loading
3. **Font loading**: Use font-display: swap for better performance

### Maintainability

1. **Design tokens**: Use CSS custom properties for consistency
2. **Component variants**: Create reusable component variants
3. **Documentation**: Document all custom styles and patterns
4. **Testing**: Test styles across different devices and browsers

### Team Collaboration

1. **Style guide**: Reference this guide for consistency
2. **Code reviews**: Review styles for adherence to guidelines
3. **Design system**: Maintain and evolve the design system
4. **Communication**: Discuss style changes with the team

This style guide ensures consistent, accessible, and maintainable styling across the entire Behavior Support System application.