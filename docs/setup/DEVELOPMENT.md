# Development Environment

Development workflow and environment setup for the Student Behavior Reflection System.

## Development Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS + Shadcn/ui
- **Backend**: Supabase (PostgreSQL + Auth + Real-time)
- **State Management**: React Context + Custom Hooks
- **Build Tool**: Vite
- **Package Manager**: npm

## Available Scripts

```bash
npm run dev          # Start development server (localhost:5173)
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

## Development Workflow

### 1. Code Structure
```
src/
├── components/      # Reusable UI components
├── contexts/        # React Context providers
├── hooks/           # Custom React hooks
├── pages/           # Route-level components
├── lib/             # Utility functions
└── integrations/    # External service integrations
```

### 2. Key Development Areas

**Critical Files** (handle with care):
- `src/hooks/useSupabaseQueue.ts` - Queue management (has known issues)
- `src/contexts/AuthContext.tsx` - Authentication state
- `src/integrations/supabase/client.ts` - Database connection

**Main Components**:
- `src/components/TeacherDashboard.tsx` - Teacher interface
- `src/components/AdminDashboard.tsx` - Admin interface
- `src/components/KioskOne.tsx` - Student kiosk

### 3. Database Development

**Local Database**: Connected to shared Supabase instance
- No local database setup needed
- Changes sync across development environments
- Test data is shared

**Schema Changes**: Use Supabase migrations
```bash
# Create new migration
supabase migration new migration_name
```

### 4. Real-time Features

The app uses Supabase real-time subscriptions for:
- Queue updates
- Session monitoring
- Kiosk status changes

Test real-time features with multiple browser tabs.

## Testing Strategy

### Manual Testing Checklist
- [ ] Login with teacher/admin accounts
- [ ] Create behavior request from kiosk
- [ ] Process request in teacher dashboard
- [ ] Monitor real-time updates
- [ ] Test queue operations (⚠️ Clear queue is broken)

### Known Development Issues
- **Clear Queue Broken**: See [Critical Issues](../issues/CRITICAL_ISSUES.md)
- **PWA Service Worker**: Registration fails in dev mode (non-blocking)

## Debugging Tools

### Browser DevTools
- Console for error messages
- Network tab for API calls
- Application tab for localStorage/auth

### Supabase Dashboard
- Direct database queries
- Real-time logs
- Auth user management

## Best Practices

### Code Style
- Use TypeScript strictly
- Follow existing component patterns
- Prefer functional components with hooks
- Use semantic CSS classes from design system

### State Management
- Use contexts for global state
- Custom hooks for data fetching
- Local state for component-specific data

### Performance
- Lazy load pages with React.lazy()
- Memoize expensive computations
- Optimize re-renders with React.memo

## Environment Variables

Required for development:
```
VITE_SUPABASE_URL=https://tuxvwpgwnnozubdpskhr.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Getting Help

- [Project Overview](../overview/PROJECT_SUMMARY.md) - Understand the system
- [Frontend Architecture](../technical/FRONTEND.md) - Component structure
- [API Documentation](../technical/API.md) - Database operations
- [Known Issues](../issues/KNOWN_ISSUES.md) - Current problems