# Developer Guide

## Getting Started

This guide provides comprehensive information for developers working on the Behavior Support System. It covers setup, development workflow, coding standards, and contribution guidelines.

## Prerequisites

### Required Software

- **Node.js**: Version 18.0.0 or higher
- **npm**: Version 9.0.0 or higher (or yarn/pnpm)
- **Git**: Latest version
- **VS Code**: Recommended IDE with extensions

### Recommended VS Code Extensions

```json
{
  "recommendations": [
    "bradlc.vscode-tailwindcss",
    "esbenp.prettier-vscode",
    "dbaeumer.vscode-eslint",
    "ms-vscode.vscode-typescript-next",
    "formulahendry.auto-rename-tag",
    "christian-kohler.path-intellisense",
    "ms-vscode.vscode-json",
    "redhat.vscode-yaml"
  ]
}
```

### Browser Developer Tools

- **React Developer Tools**: For React component debugging
- **Redux DevTools**: For state management debugging (if using Redux)
- **Supabase Chrome Extension**: For database debugging

## Project Setup

### Initial Setup

```bash
# Clone the repository
git clone https://github.com/your-org/behavior-support-system.git
cd behavior-support-system

# Install dependencies
npm install

# Copy environment template
cp .env.example .env.local

# Set up Supabase (see Database Setup section)
```

### Environment Configuration

#### Local Development

Create `.env.local`:
```env
VITE_SUPABASE_URL=https://tuxvwpgwnnozubdpskhr.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR1eHZ3cGd3bm5venViZHBza2hyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM0ODk3NjgsImV4cCI6MjA2OTA2NTc2OH0.zukCQDiwyIfRKujGWwzLUkIsgv3RM3b8WtjdNWjHqnw
NODE_ENV=development
```

### Database Setup

#### Local Supabase Development

```bash
# Install Supabase CLI
npm install -g supabase

# Initialize Supabase locally
supabase init

# Start local Supabase stack
supabase start

# Apply migrations
supabase db reset

# Generate types
supabase gen types typescript --local > src/integrations/supabase/types.ts
```

#### Using Remote Development Database

If using a shared development database:

```bash
# Link to remote project
supabase link --project-ref your-dev-project-ref

# Pull latest schema
supabase db pull

# Generate types
supabase gen types typescript --project-id your-project-ref > src/integrations/supabase/types.ts
```

### Running the Application

```bash
# Start development server
npm run dev

# Server runs on http://localhost:5173
# Hot reloading enabled for instant updates
```

## Development Workflow

### Git Workflow

#### Branch Naming Convention

```
feature/add-reflection-system
bugfix/fix-queue-ordering
hotfix/security-patch
docs/update-api-documentation
refactor/simplify-auth-flow
```

#### Commit Message Format

Follow Conventional Commits specification:

```
feat: add student reflection system
fix: resolve queue ordering issue
docs: update API documentation
style: format code with prettier
refactor: simplify authentication flow
test: add unit tests for queue management
chore: update dependencies
```

#### Pull Request Process

1. **Create Feature Branch**
   ```bash
   git checkout -b feature/new-feature
   ```

2. **Make Changes**
   - Follow coding standards
   - Add tests for new functionality
   - Update documentation

3. **Commit Changes**
   ```bash
   git add .
   git commit -m "feat: add new feature"
   ```

4. **Push and Create PR**
   ```bash
   git push origin feature/new-feature
   # Create pull request via GitHub/GitLab
   ```

5. **Code Review Process**
   - Automated checks must pass
   - At least one approval required
   - Address review feedback
   - Squash and merge when approved

### Development Commands

```bash
# Development
npm run dev              # Start development server
npm run dev:debug        # Start with debugging enabled

# Building
npm run build            # Production build
npm run preview          # Preview production build

# Code Quality
npm run lint             # Run ESLint
npm run lint:fix         # Fix linting issues
npm run type-check       # TypeScript type checking
npm run format           # Format with Prettier

# Testing
npm run test             # Run tests
npm run test:watch       # Run tests in watch mode
npm run test:coverage    # Run tests with coverage

# Database
npm run db:start         # Start local Supabase
npm run db:reset         # Reset local database
npm run db:seed          # Seed with test data
npm run db:types         # Generate TypeScript types
```

## Code Organization

### File Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # Base UI components (Shadcn)
│   ├── AdminDashboard.tsx
│   ├── TeacherDashboard.tsx
│   └── ...
├── contexts/           # React context providers
│   ├── AuthContext.tsx
│   ├── KioskContext.tsx
│   └── ...
├── hooks/              # Custom React hooks
│   ├── useSupabaseQueue.ts
│   ├── useAuth.ts
│   └── ...
├── pages/              # Page components
│   ├── AuthPage.tsx
│   ├── Index.tsx
│   └── ...
├── integrations/       # External service integrations
│   └── supabase/
├── lib/               # Utility functions
│   └── utils.ts
├── types/             # TypeScript type definitions
│   └── index.ts
└── styles/            # Global styles
    ├── index.css
    └── components.css
```

### Component Architecture

#### Component Types

1. **Page Components**: Top-level route components
2. **Layout Components**: Structural components (headers, sidebars)
3. **Feature Components**: Business logic components
4. **UI Components**: Reusable interface elements

#### Component Structure

```typescript
// components/ExampleComponent.tsx
import React from 'react';
import { cn } from '@/lib/utils';

interface ExampleComponentProps {
  title: string;
  children?: React.ReactNode;
  className?: string;
  onAction?: () => void;
}

const ExampleComponent: React.FC<ExampleComponentProps> = ({
  title,
  children,
  className,
  onAction
}) => {
  // Hooks
  const [state, setState] = React.useState(false);
  
  // Event handlers
  const handleClick = React.useCallback(() => {
    setState(true);
    onAction?.();
  }, [onAction]);
  
  // Render
  return (
    <div className={cn("base-styles", className)}>
      <h2>{title}</h2>
      {children}
      <button onClick={handleClick}>Action</button>
    </div>
  );
};

export default ExampleComponent;
```

### Custom Hooks

#### Hook Structure

```typescript
// hooks/useExample.ts
import { useState, useEffect, useCallback } from 'react';

interface UseExampleOptions {
  initialValue?: string;
  onSuccess?: (data: any) => void;
  onError?: (error: Error) => void;
}

export const useExample = (options: UseExampleOptions = {}) => {
  const { initialValue = '', onSuccess, onError } = options;
  
  const [data, setData] = useState(initialValue);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch logic here
      const result = await api.fetchData();
      
      setData(result);
      onSuccess?.(result);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      setError(error);
      onError?.(error);
    } finally {
      setLoading(false);
    }
  }, [onSuccess, onError]);
  
  useEffect(() => {
    fetchData();
  }, [fetchData]);
  
  return {
    data,
    loading,
    error,
    refetch: fetchData
  };
};
```

## Coding Standards

### TypeScript Guidelines

#### Type Definitions

```typescript
// types/index.ts

// Use interfaces for object shapes
interface User {
  id: string;
  name: string;
  email: string;
  role: 'teacher' | 'admin';
}

// Use types for unions and computed types
type UserRole = User['role'];
type UserWithoutId = Omit<User, 'id'>;

// Use enums for constants
enum BehaviorType {
  DISRUPTION = 'disruption',
  DEFIANCE = 'defiance',
  INAPPROPRIATE_LANGUAGE = 'inappropriate_language'
}

// Generic types for reusable patterns
interface ApiResponse<T> {
  data: T;
  error?: string;
  meta?: {
    count: number;
    page: number;
  };
}
```

#### Component Props

```typescript
// Define props interfaces
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  children: React.ReactNode;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
}

// Use React.FC for functional components
const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  disabled = false,
  children,
  onClick
}) => {
  // Component implementation
};
```

### React Best Practices

#### State Management

```typescript
// Use useState for local state
const [isOpen, setIsOpen] = useState(false);

// Use useReducer for complex state
const [state, dispatch] = useReducer(reducer, initialState);

// Use context for global state
const { user, signIn, signOut } = useAuth();
```

#### Effect Management

```typescript
// Cleanup effects
useEffect(() => {
  const subscription = api.subscribe(handleUpdate);
  
  return () => {
    subscription.unsubscribe();
  };
}, []);

// Dependency arrays
useEffect(() => {
  fetchData(userId);
}, [userId]); // Include all dependencies

// Custom hooks for complex effects
const useDataFetching = (url: string) => {
  // Effect logic here
};
```

#### Performance Optimization

```typescript
// Memoize expensive calculations
const expensiveValue = useMemo(() => {
  return data.map(item => processItem(item));
}, [data]);

// Memoize callbacks
const handleClick = useCallback((id: string) => {
  onItemClick(id);
}, [onItemClick]);

// Memoize components
const MemoizedComponent = React.memo(Component);
```

### CSS and Styling

#### Tailwind CSS Usage

```typescript
// Use semantic classes
<div className="bg-background text-foreground p-4 rounded-lg shadow-md">

// Use responsive classes
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">

// Use hover and focus states
<button className="bg-primary hover:bg-primary/90 focus:ring-2 focus:ring-ring">

// Use design system tokens
<div className="bg-gradient-primary text-primary-foreground">
```

#### Component Variants

```typescript
// Use cva for component variants
import { cva, type VariantProps } from 'class-variance-authority';

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-md font-medium transition-colors',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/90',
        destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
        outline: 'border border-input bg-background hover:bg-accent',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 rounded-md px-3',
        lg: 'h-11 rounded-md px-8',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

interface ButtonProps 
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}
```

## Testing Guidelines

### Testing Strategy

#### Unit Tests

```typescript
// components/__tests__/Button.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import Button from '../Button';

describe('Button', () => {
  it('renders with correct text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });
  
  it('calls onClick when clicked', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    
    fireEvent.click(screen.getByText('Click me'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
  
  it('applies variant classes correctly', () => {
    render(<Button variant="destructive">Delete</Button>);
    expect(screen.getByText('Delete')).toHaveClass('bg-destructive');
  });
});
```

#### Integration Tests

```typescript
// __tests__/BehaviorRequestFlow.test.tsx
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import TeacherDashboard from '../components/TeacherDashboard';
import { AuthProvider } from '../contexts/AuthContext';

const renderWithProviders = (component: React.ReactNode) => {
  return render(
    <BrowserRouter>
      <AuthProvider>
        {component}
      </AuthProvider>
    </BrowserRouter>
  );
};

describe('Behavior Request Flow', () => {
  it('allows teacher to create behavior request', async () => {
    const user = userEvent.setup();
    renderWithProviders(<TeacherDashboard />);
    
    // Click add button
    await user.click(screen.getByText('Add Request'));
    
    // Fill form
    await user.type(screen.getByLabelText('Student Name'), 'John Doe');
    await user.selectOptions(screen.getByLabelText('Mood'), 'frustrated');
    
    // Submit form
    await user.click(screen.getByText('Submit'));
    
    // Verify request appears in queue
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });
  });
});
```

#### Mock Data

```typescript
// __tests__/mocks/data.ts
export const mockUser = {
  id: '123',
  email: 'teacher@school.edu',
  role: 'teacher' as const
};

export const mockBehaviorRequest = {
  id: '456',
  student_id: '789',
  teacher_id: '123',
  mood: 'frustrated' as const,
  behaviors: ['disruption'],
  status: 'waiting' as const,
  created_at: '2024-01-01T00:00:00Z'
};
```

#### Mock Services

```typescript
// __tests__/mocks/supabase.ts
export const mockSupabase = {
  from: jest.fn(() => ({
    select: jest.fn(() => ({
      data: [],
      error: null
    })),
    insert: jest.fn(() => ({
      data: [mockBehaviorRequest],
      error: null
    })),
    update: jest.fn(() => ({
      data: [mockBehaviorRequest],
      error: null
    })),
    delete: jest.fn(() => ({
      data: null,
      error: null
    }))
  }))
};
```

### Test Configuration

#### Jest Configuration

```javascript
// jest.config.js
module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/src/test/setup.ts'],
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/src/$1'
  },
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/test/**'
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  }
};
```

#### Test Setup

```typescript
// src/test/setup.ts
import '@testing-library/jest-dom';
import { setupServer } from 'msw/node';
import { handlers } from './mocks/handlers';

// Setup MSW server
export const server = setupServer(...handlers);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
```

## Database Development

### Schema Changes

#### Creating Migrations

```sql
-- Create new migration file
-- supabase/migrations/20240101000000_add_feature.sql

-- Add new table
CREATE TABLE public.new_table (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.new_table ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view own records" 
ON public.new_table 
FOR SELECT 
USING (auth.uid() = user_id);

-- Add indexes
CREATE INDEX idx_new_table_name ON public.new_table(name);
```

#### Applying Migrations

```bash
# Apply to local database
supabase db reset

# Apply to remote database (staging/production)
supabase db push --project-ref your-project-ref

# Generate updated types
supabase gen types typescript --project-id your-project-ref > src/integrations/supabase/types.ts
```

### Database Testing

#### Seed Data

```sql
-- supabase/seed.sql
INSERT INTO public.students (name, grade, class_name) VALUES
  ('Alice Johnson', '5th', '5A'),
  ('Bob Smith', '4th', '4B'),
  ('Carol Davis', '6th', '6A');

INSERT INTO public.profiles (id, full_name, email, role) VALUES
  ('11111111-1111-1111-1111-111111111111', 'Jane Teacher', 'jane@school.edu', 'teacher'),
  ('22222222-2222-2222-2222-222222222222', 'John Admin', 'john@school.edu', 'admin');
```

#### Database Tests

```typescript
// __tests__/database/queries.test.ts
import { supabase } from '@/integrations/supabase/client';

describe('Database Queries', () => {
  beforeEach(async () => {
    // Setup test data
    await supabase.from('students').delete().neq('id', '');
  });
  
  it('creates student record', async () => {
    const { data, error } = await supabase
      .from('students')
      .insert({ name: 'Test Student', grade: '5th' })
      .select()
      .single();
    
    expect(error).toBeNull();
    expect(data.name).toBe('Test Student');
  });
});
```

## Performance Guidelines

### React Performance

#### Component Optimization

```typescript
// Avoid unnecessary re-renders
const ExpensiveComponent = React.memo(({ data }) => {
  return <div>{data.map(item => <Item key={item.id} {...item} />)}</div>;
});

// Optimize list rendering
const VirtualizedList = () => {
  return (
    <FixedSizeList
      height={600}
      itemCount={items.length}
      itemSize={50}
      itemData={items}
    >
      {ItemRenderer}
    </FixedSizeList>
  );
};
```

#### State Optimization

```typescript
// Separate frequently changing state
const [count, setCount] = useState(0);
const [userName, setUserName] = useState('');

// Use state reducers for complex state
const [state, dispatch] = useReducer(reducer, {
  items: [],
  loading: false,
  error: null
});
```

### Database Performance

#### Query Optimization

```typescript
// Select only needed columns
const { data } = await supabase
  .from('behavior_requests')
  .select('id, status, student:students(name)')
  .eq('status', 'waiting');

// Use indexes for filtering
const { data } = await supabase
  .from('behavior_history')
  .select('*')
  .gte('completed_at', startDate)
  .lte('completed_at', endDate)
  .order('completed_at', { ascending: false });

// Implement pagination
const { data } = await supabase
  .from('behavior_history')
  .select('*')
  .range(0, 49)  // First 50 records
  .order('created_at', { ascending: false });
```

#### Real-time Optimization

```typescript
// Optimize subscriptions
const subscription = supabase
  .channel('specific_updates')
  .on('postgres_changes', 
    { 
      event: 'UPDATE', 
      schema: 'public', 
      table: 'behavior_requests',
      filter: 'status=eq.waiting'  // Filter at database level
    },
    handleUpdate
  )
  .subscribe();

// Cleanup subscriptions
useEffect(() => {
  return () => subscription.unsubscribe();
}, []);
```

## Security Guidelines

### Input Validation

```typescript
// Validate all user inputs
import { z } from 'zod';

const behaviorRequestSchema = z.object({
  student_id: z.string().uuid(),
  mood: z.enum(['happy', 'sad', 'angry', 'frustrated', 'anxious']),
  behaviors: z.array(z.string()).min(1),
  urgent: z.boolean().default(false),
  notes: z.string().optional()
});

const validateBehaviorRequest = (data: unknown) => {
  return behaviorRequestSchema.parse(data);
};
```

### XSS Prevention

```typescript
// Sanitize user content
import DOMPurify from 'dompurify';

const sanitizeHtml = (dirty: string) => {
  return DOMPurify.sanitize(dirty);
};

// Use safe rendering
const UserContent: React.FC<{ content: string }> = ({ content }) => {
  const safeContent = sanitizeHtml(content);
  return <div dangerouslySetInnerHTML={{ __html: safeContent }} />;
};
```

### Authentication Security

```typescript
// Check authentication status
const useAuthGuard = () => {
  const { user, loading } = useAuth();
  
  if (loading) return { isAuthorized: false, loading: true };
  if (!user) return { isAuthorized: false, loading: false };
  
  return { isAuthorized: true, loading: false, user };
};

// Role-based access control
const useRoleGuard = (requiredRole: string) => {
  const { user } = useAuth();
  
  return user?.role === requiredRole || user?.role === 'admin';
};
```

## Debugging

### Development Tools

#### React DevTools

```typescript
// Add display names for debugging
const useCustomHook = () => {
  // Hook logic
};

useCustomHook.displayName = 'useCustomHook';

const Component = () => {
  // Component logic
};

Component.displayName = 'Component';
```

#### Console Debugging

```typescript
// Structured logging
const logger = {
  debug: (message: string, data?: any) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[DEBUG] ${message}`, data);
    }
  },
  
  error: (message: string, error?: Error) => {
    console.error(`[ERROR] ${message}`, error);
  },
  
  warn: (message: string, data?: any) => {
    console.warn(`[WARN] ${message}`, data);
  }
};
```

#### Network Debugging

```typescript
// Log API calls
const apiClient = {
  async request(endpoint: string, options: RequestInit) {
    console.log(`API Request: ${endpoint}`, options);
    
    try {
      const response = await fetch(endpoint, options);
      console.log(`API Response: ${endpoint}`, response.status);
      return response;
    } catch (error) {
      console.error(`API Error: ${endpoint}`, error);
      throw error;
    }
  }
};
```

### Common Issues

#### State Issues

```typescript
// Debug state changes
useEffect(() => {
  console.log('State changed:', state);
}, [state]);

// Track prop changes
useEffect(() => {
  console.log('Props changed:', props);
}, [props]);
```

#### Performance Issues

```typescript
// Profile component renders
const Component = () => {
  console.log('Component rendering');
  
  // Component logic
};

// Track expensive operations
const expensiveOperation = () => {
  console.time('expensiveOperation');
  const result = heavyCalculation();
  console.timeEnd('expensiveOperation');
  return result;
};
```

## Contribution Guidelines

### Code Review Checklist

#### Functionality
- [ ] Feature works as intended
- [ ] Edge cases are handled
- [ ] Error handling is appropriate
- [ ] User experience is smooth

#### Code Quality
- [ ] Code follows project conventions
- [ ] Functions are pure when possible
- [ ] Components are properly typed
- [ ] No console.log statements in production code

#### Performance
- [ ] No unnecessary re-renders
- [ ] Database queries are optimized
- [ ] Large lists use virtualization
- [ ] Images are optimized

#### Security
- [ ] User inputs are validated
- [ ] XSS prevention measures in place
- [ ] Authentication checks are present
- [ ] Sensitive data is not exposed

#### Testing
- [ ] Unit tests for new functionality
- [ ] Integration tests for workflows
- [ ] Edge cases are tested
- [ ] Tests pass consistently

#### Documentation
- [ ] Code is self-documenting
- [ ] Complex logic is commented
- [ ] API changes are documented
- [ ] README is updated if needed

### Release Process

1. **Feature Freeze**
   - No new features after cutoff
   - Bug fixes only

2. **Testing Phase**
   - Run full test suite
   - Manual testing of critical paths
   - Performance testing

3. **Release Preparation**
   - Update version numbers
   - Generate changelog
   - Update documentation

4. **Deployment**
   - Deploy to staging
   - Smoke testing
   - Deploy to production
   - Monitor for issues

### Communication

#### Issue Reporting

```markdown
## Bug Report

**Description**
Brief description of the issue

**Steps to Reproduce**
1. Go to...
2. Click on...
3. See error

**Expected Behavior**
What should happen

**Actual Behavior**
What actually happens

**Environment**
- Browser: Chrome 91
- OS: macOS 12
- Version: 1.2.3

**Screenshots**
If applicable
```

#### Feature Requests

```markdown
## Feature Request

**Problem Statement**
What problem does this solve?

**Proposed Solution**
How should it work?

**Alternatives Considered**
Other approaches considered

**Additional Context**
Any other relevant information
```

This developer guide provides a comprehensive foundation for contributing to the Behavior Support System project while maintaining code quality, performance, and security standards.