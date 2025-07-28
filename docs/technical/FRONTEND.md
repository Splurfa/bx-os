# Frontend Documentation

## Architecture Overview

This application is built using React 18 with TypeScript, utilizing modern patterns and best practices for maintainable, scalable code.

### Technology Stack

- **React 18**: Component-based UI library with hooks
- **TypeScript**: Type-safe JavaScript
- **Tailwind CSS**: Utility-first CSS framework with custom design system
- **React Router DOM**: Client-side routing
- **React Query**: Server state management
- **Radix UI**: Accessibility-first component primitives
- **Shadcn/ui**: Pre-built component library based on Radix
- **Class Variance Authority**: Component variant management
- **Lucide React**: Icon library

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # Shadcn/ui components (buttons, cards, etc.)
│   ├── AdminDashboard.tsx
│   ├── TeacherDashboard.tsx
│   ├── KioskOne.tsx
│   ├── KioskTwo.tsx
│   ├── KioskThree.tsx
│   └── ...
├── contexts/           # React context providers
│   ├── AuthContext.tsx
│   ├── KioskContext.tsx
│   └── MockAuthContext.tsx
├── hooks/              # Custom React hooks
│   ├── useSupabaseQueue.ts
│   ├── useQueue.ts
│   ├── useActiveSessions.ts
│   └── use-toast.ts
├── pages/              # Page components
│   ├── AuthPage.tsx
│   ├── Index.tsx
│   └── ...
├── integrations/       # External service integrations
│   └── supabase/
└── lib/               # Utility functions
    └── utils.ts
```

## Component Architecture

### Core Components

#### Dashboard Components

**AdminDashboard.tsx**
- Unified kiosk management interface
- Real-time monitoring of all system components
- Queue management and reflection review
- User management interface
- Session monitoring
- Mobile-responsive design with tabs and collapsible sections

**TeacherDashboard.tsx**
- Simplified interface for teachers
- Behavior Support Request (BSR) creation
- Queue monitoring
- Reflection review and approval
- Floating action button for quick BSR creation

**Kiosk Components (KioskOne, KioskTwo, KioskThree)**
- Student-facing reflection interfaces
- Multi-step workflow: Welcome → Password → Reflection → Completion
- Auto-activation and session management
- Responsive design for tablet/desktop usage
- Built-in security with password protection

#### UI Components (src/components/ui/)

Built on Radix UI primitives with Tailwind styling:

- **Button**: Multiple variants (default, destructive, outline, secondary, ghost, link)
- **Card**: Container component with header, content, and description
- **Input**: Form input with validation states
- **Select**: Dropdown selection component
- **Toast**: Notification system (Shadcn + Sonner implementations)
- **Tabs**: Navigation between sections
- **Badge**: Status indicators
- **Dialog/Modal**: Overlay components
- **Switch**: Toggle controls

### State Management

#### Context Providers

**AuthContext**
```tsx
interface AuthContextType {
  user: User | null;
  session: Session | null;
  signIn: (email: string, password: string) => Promise<{error?: AuthError}>;
  signUp: (email: string, password: string, userData: any) => Promise<{error?: AuthError}>;
  signOut: () => Promise<void>;
  loading: boolean;
}
```

**KioskContext**
```tsx
interface KioskContextType {
  kiosks: Kiosk[];
  activateKiosk: (kioskId: number) => Promise<number>;
  deactivateKiosk: (kioskId: number) => Promise<void>;
  deactivateAllKiosks: () => Promise<void>;
  updateKioskStudent: (kioskId: number, studentId?: string, requestId?: string) => void;
  loading: boolean;
}
```

#### Custom Hooks

**useSupabaseQueue**
- Manages behavior request queue with real-time updates
- Handles reflection submission and approval workflow
- Provides queue manipulation functions (add, approve, clear)
- Formats time-elapsed displays
- Maintains connection to Supabase database

**useActiveSessions**
- Tracks active user sessions across the system
- Monitors device types and locations
- Provides session management capabilities

### Routing

React Router DOM handles client-side navigation:

```tsx
<Routes>
  <Route path="/" element={<Index />} />
  <Route path="/auth" element={<AuthPage />} />
  <Route path="/teacher" element={<ProtectedRoute><TeacherDashboard /></ProtectedRoute>} />
  <Route path="/admin-dashboard" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
  <Route path="/kiosk-1" element={<KioskOne />} />
  <Route path="/kiosk-2" element={<KioskTwo />} />
  <Route path="/kiosk-3" element={<KioskThree />} />
  <Route path="*" element={<NotFound />} />
</Routes>
```

## Design System

### Color Palette

Defined in `src/index.css` using HSL values:

```css
:root {
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  --primary: 221.2 83.2% 53.3%;
  --primary-foreground: 210 40% 98%;
  --secondary: 210 40% 96%;
  --muted: 210 40% 96%;
  --accent: 210 40% 96%;
  --destructive: 0 84.2% 60.2%;
  --border: 214.3 31.8% 91.4%;
  --input: 214.3 31.8% 91.4%;
  --ring: 221.2 83.2% 53.3%;
}
```

### Component Variants

Using Class Variance Authority (CVA) for consistent component variants:

```tsx
const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md text-sm font-medium",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border border-input bg-background hover:bg-accent",
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

### Responsive Design

Mobile-first approach using Tailwind breakpoints:

- **sm**: 640px and up
- **md**: 768px and up  
- **lg**: 1024px and up
- **xl**: 1280px and up

Key responsive patterns:
```tsx
// Grid layouts
className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"

// Text sizing
className="text-xl sm:text-3xl"

// Spacing
className="p-3 sm:p-6"

// Component sizing
className="w-12 h-12 sm:w-14 sm:h-14"
```

## Data Flow

### Real-time Updates

The application uses Supabase real-time subscriptions for live data updates:

1. **Queue Updates**: Behavior requests are monitored in real-time
2. **Kiosk Status**: Activation/deactivation events propagate immediately
3. **Session Tracking**: Active sessions are updated live
4. **Reflection Reviews**: Teacher approvals/revisions update instantly

### Error Handling

Comprehensive error handling with user feedback:

```tsx
try {
  await apiCall();
  toast({
    title: "Success",
    description: "Operation completed successfully",
  });
} catch (error) {
  console.error('Operation failed:', error);
  toast({
    variant: "destructive",
    title: "Error",
    description: "Operation failed. Please try again.",
  });
}
```

## Performance Optimizations

### Code Splitting

- Page-level components are automatically code-split by React Router
- Heavy components use React.lazy() for dynamic imports
- Bundle analysis available via Vite build tools

### Memoization

Strategic use of React.memo() and useMemo() for expensive calculations:

```tsx
const ExpensiveComponent = React.memo(({ data }) => {
  const processedData = useMemo(() => 
    data.map(item => heavyProcessing(item)), 
    [data]
  );
  return <div>{processedData}</div>;
});
```

### State Updates

Optimized state updates to prevent unnecessary re-renders:

```tsx
const handleUpdate = useCallback((id: string, value: string) => {
  setItems(prev => prev.map(item => 
    item.id === id ? { ...item, value } : item
  ));
}, []);
```

## Testing Strategy

### Component Testing

- Unit tests for utility functions
- Component integration tests with React Testing Library
- Mock service workers for API testing
- Accessibility testing with axe-core

### User Flow Testing

- End-to-end testing for critical workflows
- Cross-browser compatibility testing
- Mobile device testing on actual hardware
- Performance testing under load

## Deployment

### Build Process

Vite handles the build process with optimizations:

```bash
npm run build
```

Output includes:
- Minified JavaScript bundles
- CSS with unused styles removed
- Optimized images and assets
- Service worker for caching (if configured)

### Environment Configuration

Environment variables for different deployment stages:

```env
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-anon-key
```

## Development Guidelines

### Code Style

- Prettier for code formatting
- ESLint for code quality
- TypeScript strict mode enabled
- Consistent naming conventions (camelCase for variables, PascalCase for components)

### Component Guidelines

1. **Single Responsibility**: Each component should have one clear purpose
2. **Props Interface**: Always define TypeScript interfaces for props
3. **Error Boundaries**: Wrap components that might fail
4. **Loading States**: Show loading indicators for async operations
5. **Accessibility**: Include ARIA labels and keyboard navigation

### Performance Guidelines

1. **Avoid Inline Functions**: Use useCallback for event handlers
2. **Minimize Re-renders**: Use React.memo() for expensive components
3. **Optimize Images**: Use appropriate formats and sizes
4. **Bundle Analysis**: Regularly check bundle size and dependencies

## Future Enhancements

### Planned Features

1. **Progressive Web App (PWA)**: Offline support and app-like experience
2. **Real-time Collaboration**: Multiple teachers reviewing simultaneously
3. **Advanced Analytics**: Behavior pattern analysis and reporting
4. **Mobile App**: Native iOS/Android applications using Capacitor
5. **Internationalization**: Multi-language support
6. **Dark Mode**: System-aware theme switching

### Technical Debt

1. **Component Consolidation**: Merge similar kiosk components
2. **Hook Optimization**: Reduce duplicate logic in custom hooks
3. **Type Safety**: Improve TypeScript coverage to 100%
4. **Performance Monitoring**: Add real-time performance tracking
5. **Error Tracking**: Implement comprehensive error logging