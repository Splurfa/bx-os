# Deployment Guide

## Overview

This guide covers the complete deployment process for the Behavior Support System, from development to production. The application is built with React/TypeScript frontend and Supabase backend, designed for easy deployment to various hosting platforms.

## Prerequisites

### Development Environment

- **Node.js**: Version 18 or higher
- **npm**: Version 9 or higher (or yarn/pnpm equivalent)
- **Git**: For version control and deployment
- **Modern Browser**: Chrome, Firefox, Safari, or Edge

### Required Accounts

1. **Supabase Account**: For database and backend services
2. **Hosting Provider**: Vercel, Netlify, or similar
3. **Domain Provider**: For custom domain (optional)
4. **GitHub/GitLab**: For source control and CI/CD

## Environment Configuration

### Environment Variables

Create environment files for different deployment stages:

#### `.env.local` (Development)
```env
VITE_SUPABASE_URL=https://tuxvwpgwnnozubdpskhr.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR1eHZ3cGd3bm5venViZHBza2hyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM0ODk3NjgsImV4cCI6MjA2OTA2NTc2OH0.zukCQDiwyIfRKujGWwzLUkIsgv3RM3b8WtjdNWjHqnw
NODE_ENV=development
```

#### `.env.production` (Production)
```env
VITE_SUPABASE_URL=https://your-production-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-production-anon-key
NODE_ENV=production
```

### Supabase Configuration

#### Database Setup

1. **Create Supabase Project**
   ```bash
   # Install Supabase CLI
   npm install -g supabase
   
   # Initialize project
   supabase init
   
   # Link to remote project
   supabase link --project-ref your-project-ref
   ```

2. **Run Migrations**
   ```bash
   # Apply database migrations
   supabase db push
   
   # Generate TypeScript types
   supabase gen types typescript --local > src/integrations/supabase/types.ts
   ```

#### Authentication Configuration

Configure authentication providers in Supabase dashboard:

1. **Email Authentication**
   - Enable email/password authentication
   - Configure email templates
   - Set up SMTP for email delivery (production)

2. **Social Authentication** (Optional)
   - Google OAuth
   - Microsoft OAuth
   - Other providers as needed

#### Row Level Security (RLS)

Ensure all RLS policies are properly configured:

```sql
-- Verify RLS is enabled on all tables
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND rowsecurity = false;

-- Should return no results if all tables have RLS enabled
```

#### Database Performance

```sql
-- Create performance indexes
CREATE INDEX CONCURRENTLY idx_behavior_requests_queue 
ON behavior_requests(status, created_at) 
WHERE status = 'waiting';

CREATE INDEX CONCURRENTLY idx_behavior_history_analytics 
ON behavior_history(student_id, completed_at);

-- Analyze tables for query planner
ANALYZE;
```

## Build Process

### Development Build

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Development server runs on http://localhost:5173
```

### Production Build

```bash
# Create optimized production build
npm run build

# Build output in dist/ directory
# Preview production build locally
npm run preview
```

### Build Optimization

#### Vite Configuration

```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
  build: {
    target: 'esnext',
    minify: 'esbuild',
    sourcemap: false, // Disable in production for security
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          supabase: ['@supabase/supabase-js'],
          ui: ['@radix-ui/react-dialog', '@radix-ui/react-toast']
        }
      }
    }
  },
  optimizeDeps: {
    include: ['react', 'react-dom', '@supabase/supabase-js']
  }
});
```

#### Bundle Analysis

```bash
# Analyze bundle size
npm run build -- --analyze

# Or using rollup-plugin-analyzer
npm install --save-dev rollup-plugin-analyzer
```

## Deployment Platforms

### Vercel Deployment

#### Automatic Deployment

1. **Connect Repository**
   - Import project from GitHub/GitLab
   - Configure build settings
   - Set environment variables

2. **Vercel Configuration**

   Create `vercel.json`:
   ```json
   {
     "framework": "vite",
     "buildCommand": "npm run build",
     "outputDirectory": "dist",
     "installCommand": "npm install",
     "devCommand": "npm run dev",
     "env": {
       "VITE_SUPABASE_URL": "@vite_supabase_url",
       "VITE_SUPABASE_ANON_KEY": "@vite_supabase_anon_key"
     },
     "rewrites": [
       {
         "source": "/(.*)",
         "destination": "/index.html"
       }
     ]
   }
   ```

3. **Environment Variables**
   ```bash
   # Set via Vercel CLI
   vercel env add VITE_SUPABASE_URL production
   vercel env add VITE_SUPABASE_ANON_KEY production
   
   # Or via dashboard at vercel.com
   ```

#### Manual Deployment

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy from local machine
vercel --prod

# Deploy specific branch
vercel --prod --branch main
```

### Netlify Deployment

#### Automatic Deployment

1. **Connect Repository**
   - Link GitHub/GitLab repository
   - Configure build settings

2. **Build Settings**
   ```
   Build command: npm run build
   Publish directory: dist
   ```

3. **Netlify Configuration**

   Create `netlify.toml`:
   ```toml
   [build]
     command = "npm run build"
     publish = "dist"
   
   [build.environment]
     NODE_VERSION = "18"
   
   [[redirects]]
     from = "/*"
     to = "/index.html"
     status = 200
   
   [[headers]]
     for = "/*.js"
     [headers.values]
       Cache-Control = "public, max-age=31536000, immutable"
   
   [[headers]]
     for = "/*.css"
     [headers.values]
       Cache-Control = "public, max-age=31536000, immutable"
   ```

#### Manual Deployment

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Build and deploy
npm run build
netlify deploy --prod --dir=dist
```

### Self-Hosted Deployment

#### Docker Deployment

1. **Dockerfile**
   ```dockerfile
   # Build stage
   FROM node:18-alpine as builder
   
   WORKDIR /app
   COPY package*.json ./
   RUN npm ci --only=production
   
   COPY . .
   RUN npm run build
   
   # Production stage
   FROM nginx:alpine
   
   # Copy build files
   COPY --from=builder /app/dist /usr/share/nginx/html
   
   # Copy nginx configuration
   COPY nginx.conf /etc/nginx/nginx.conf
   
   EXPOSE 80
   CMD ["nginx", "-g", "daemon off;"]
   ```

2. **Nginx Configuration**
   ```nginx
   # nginx.conf
   events {
     worker_connections 1024;
   }
   
   http {
     include mime.types;
     default_type application/octet-stream;
     
     gzip on;
     gzip_vary on;
     gzip_min_length 1024;
     gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
     
     server {
       listen 80;
       server_name localhost;
       root /usr/share/nginx/html;
       index index.html;
       
       # Handle client-side routing
       location / {
         try_files $uri $uri/ /index.html;
       }
       
       # Cache static assets
       location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
         expires 1y;
         add_header Cache-Control "public, immutable";
       }
       
       # Security headers
       add_header X-Frame-Options "SAMEORIGIN" always;
       add_header X-Content-Type-Options "nosniff" always;
       add_header X-XSS-Protection "1; mode=block" always;
       add_header Referrer-Policy "strict-origin-when-cross-origin" always;
     }
   }
   ```

3. **Docker Compose**
   ```yaml
   version: '3.8'
   
   services:
     app:
       build: .
       ports:
         - "80:80"
       environment:
         - NODE_ENV=production
       restart: unless-stopped
       
     # Optional: Reverse proxy with SSL
     nginx-proxy:
       image: jwilder/nginx-proxy
       ports:
         - "443:443"
       volumes:
         - /var/run/docker.sock:/tmp/docker.sock:ro
         - ./certs:/etc/nginx/certs:ro
       restart: unless-stopped
   ```

#### Traditional Server Deployment

```bash
# Build application
npm run build

# Transfer files to server
rsync -avz dist/ user@server:/var/www/behavior-support/

# Configure web server (Apache/Nginx)
# Set up SSL certificate
# Configure domain
```

## Domain Configuration

### Custom Domain Setup

#### DNS Configuration

```
# DNS Records
A     @           192.168.1.100
CNAME www         your-app.vercel.app
CNAME api         your-project.supabase.co
```

#### SSL Certificate

Most hosting platforms provide automatic SSL:

- **Vercel**: Automatic SSL via Let's Encrypt
- **Netlify**: Automatic SSL via Let's Encrypt
- **Self-hosted**: Use Certbot for Let's Encrypt

```bash
# Manual SSL setup with Certbot
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

### Subdomain Configuration

```
# Production
app.yourschool.edu -> Main application

# Staging
staging.yourschool.edu -> Staging environment

# API
api.yourschool.edu -> Supabase endpoint (optional)
```

## CI/CD Pipeline

### GitHub Actions

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Run tests
      run: npm test
    
    - name: Run linting
      run: npm run lint
    
    - name: Type check
      run: npm run type-check

  build:
    needs: test
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Build application
      run: npm run build
      env:
        VITE_SUPABASE_URL: ${{ secrets.VITE_SUPABASE_URL }}
        VITE_SUPABASE_ANON_KEY: ${{ secrets.VITE_SUPABASE_ANON_KEY }}
    
    - name: Upload build artifacts
      uses: actions/upload-artifact@v3
      with:
        name: dist
        path: dist/

  deploy:
    needs: build
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    steps:
    - name: Deploy to Vercel
      uses: amondnet/vercel-action@v25
      with:
        vercel-token: ${{ secrets.VERCEL_TOKEN }}
        vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
        vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
        vercel-args: '--prod'
```

### Database Migrations

```yaml
# Add to deploy job
- name: Run database migrations
  run: |
    npx supabase link --project-ref ${{ secrets.SUPABASE_PROJECT_REF }}
    npx supabase db push
  env:
    SUPABASE_ACCESS_TOKEN: ${{ secrets.SUPABASE_ACCESS_TOKEN }}
```

## Environment Management

### Multiple Environments

#### Development
- Local Supabase instance or shared dev database
- Hot reloading and development tools
- Debug logging enabled

#### Staging
- Production-like environment for testing
- Same infrastructure as production
- Limited access for testing

#### Production
- Live user environment
- Optimized for performance and security
- Monitoring and alerting enabled

### Environment Switching

```typescript
// config/environment.ts
const environments = {
  development: {
    supabaseUrl: 'http://localhost:54321',
    supabaseKey: 'your-local-key',
    logLevel: 'debug'
  },
  staging: {
    supabaseUrl: 'https://staging-project.supabase.co',
    supabaseKey: 'your-staging-key',
    logLevel: 'info'
  },
  production: {
    supabaseUrl: 'https://prod-project.supabase.co',
    supabaseKey: 'your-prod-key',
    logLevel: 'error'
  }
};

export const config = environments[import.meta.env.NODE_ENV];
```

## Performance Optimization

### Build Optimization

```bash
# Analyze bundle size
npm run build -- --analyze

# Check for unused dependencies
npx depcheck

# Optimize images
npm install -g imagemin-cli
imagemin src/assets/*.{jpg,png} --out-dir=dist/assets/
```

### Runtime Performance

#### Service Worker (Optional)

```typescript
// public/sw.js
const CACHE_NAME = 'behavior-support-v1';
const urlsToCache = [
  '/',
  '/static/js/bundle.js',
  '/static/css/main.css'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => response || fetch(event.request))
  );
});
```

#### CDN Configuration

```javascript
// Configure CDN for static assets
const CDN_URL = 'https://cdn.yourschool.edu';

// Update asset URLs in production
if (import.meta.env.PROD) {
  // Use CDN for static assets
}
```

## Monitoring and Alerting

### Application Monitoring

#### Error Tracking

```typescript
// src/utils/errorTracking.ts
class ErrorTracker {
  static init() {
    window.addEventListener('error', this.handleError);
    window.addEventListener('unhandledrejection', this.handlePromiseRejection);
  }
  
  static handleError(event: ErrorEvent) {
    this.logError({
      message: event.message,
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
      stack: event.error?.stack
    });
  }
  
  static handlePromiseRejection(event: PromiseRejectionEvent) {
    this.logError({
      message: 'Unhandled Promise Rejection',
      reason: event.reason
    });
  }
  
  static logError(error: any) {
    // Send to logging service
    fetch('/api/log-error', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        error,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href
      })
    });
  }
}
```

#### Performance Monitoring

```typescript
// src/utils/performance.ts
class PerformanceMonitor {
  static measurePageLoad() {
    window.addEventListener('load', () => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      
      const metrics = {
        domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
        loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
        firstPaint: this.getFirstPaint(),
        firstContentfulPaint: this.getFirstContentfulPaint()
      };
      
      this.sendMetrics(metrics);
    });
  }
  
  static getFirstPaint() {
    const paintTiming = performance.getEntriesByType('paint');
    const firstPaint = paintTiming.find(entry => entry.name === 'first-paint');
    return firstPaint?.startTime || 0;
  }
  
  static sendMetrics(metrics: any) {
    // Send to analytics service
  }
}
```

### Infrastructure Monitoring

#### Health Checks

```typescript
// src/utils/healthCheck.ts
export const healthCheck = async () => {
  const checks = {
    database: await checkDatabaseConnection(),
    api: await checkApiEndpoints(),
    auth: await checkAuthService()
  };
  
  return {
    status: Object.values(checks).every(check => check.healthy) ? 'healthy' : 'unhealthy',
    checks,
    timestamp: new Date().toISOString()
  };
};

const checkDatabaseConnection = async () => {
  try {
    const { data, error } = await supabase.from('profiles').select('count').limit(1);
    return { healthy: !error, message: error?.message };
  } catch (err) {
    return { healthy: false, message: err.message };
  }
};
```

#### Uptime Monitoring

Use services like:
- **Pingdom**: Website uptime monitoring
- **StatusPage**: Status page for users
- **DataDog**: Comprehensive monitoring
- **New Relic**: Application performance monitoring

## Security Considerations

### Production Security

#### HTTPS Configuration

```nginx
# Force HTTPS redirect
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;
    
    ssl_certificate /path/to/certificate.crt;
    ssl_certificate_key /path/to/private.key;
    
    # Security headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
}
```

#### Content Security Policy

```html
<!-- Add to index.html -->
<meta http-equiv="Content-Security-Policy" content="
  default-src 'self';
  script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.supabase.co;
  style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
  font-src 'self' https://fonts.gstatic.com;
  img-src 'self' data: https:;
  connect-src 'self' https://tuxvwpgwnnozubdpskhr.supabase.co wss://tuxvwpgwnnozubdpskhr.supabase.co;
">
```

#### Environment Security

```bash
# Secure environment variables
export VITE_SUPABASE_URL="$(cat /run/secrets/supabase_url)"
export VITE_SUPABASE_ANON_KEY="$(cat /run/secrets/supabase_anon_key)"

# Set proper file permissions
chmod 600 .env.production
chown www-data:www-data .env.production
```

## Backup and Recovery

### Database Backups

```bash
# Automated backup script
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="backup_${DATE}.sql"

# Export database
supabase db dump --file $BACKUP_FILE

# Upload to cloud storage
aws s3 cp $BACKUP_FILE s3://your-backup-bucket/

# Cleanup old local backups
find . -name "backup_*.sql" -mtime +7 -delete
```

### Application Backups

```bash
# Backup application and configuration
tar -czf app_backup_$(date +%Y%m%d).tar.gz \
  dist/ \
  .env.production \
  nginx.conf \
  docker-compose.yml

# Store in secure location
```

### Recovery Procedures

1. **Database Recovery**
   ```bash
   # Restore from backup
   supabase db reset
   psql -h localhost -p 54322 -U postgres -d postgres < backup_file.sql
   ```

2. **Application Recovery**
   ```bash
   # Restore application files
   tar -xzf app_backup_date.tar.gz
   
   # Restart services
   docker-compose up -d
   ```

## Troubleshooting

### Common Issues

#### Build Failures

```bash
# Clear caches
rm -rf node_modules
rm package-lock.json
npm install

# Check Node.js version
node --version  # Should be 18+

# Verify environment variables
npm run build -- --debug
```

#### Deployment Issues

```bash
# Check logs
vercel logs
netlify logs

# Verify environment variables
vercel env ls
netlify env:list

# Test build locally
npm run build
npm run preview
```

#### Database Connection Issues

```javascript
// Test database connection
const testConnection = async () => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('count')
      .limit(1);
    
    if (error) {
      console.error('Database error:', error);
    } else {
      console.log('Database connected successfully');
    }
  } catch (err) {
    console.error('Connection failed:', err);
  }
};
```

### Performance Issues

#### Slow Load Times

1. **Analyze bundle size**
   ```bash
   npm run build -- --analyze
   ```

2. **Check network requests**
   - Use browser dev tools
   - Identify slow API calls
   - Optimize database queries

3. **Enable compression**
   ```nginx
   gzip on;
   gzip_types text/css application/javascript application/json;
   ```

#### Database Performance

```sql
-- Check slow queries
SELECT query, mean_time, calls 
FROM pg_stat_statements 
WHERE mean_time > 1000 
ORDER BY mean_time DESC;

-- Analyze table performance
EXPLAIN ANALYZE SELECT * FROM behavior_requests WHERE status = 'waiting';
```

## Maintenance

### Regular Tasks

#### Daily
- Check application health
- Monitor error rates
- Review system logs

#### Weekly
- Analyze performance metrics
- Review backup status
- Check security alerts

#### Monthly
- Update dependencies
- Security audit
- Performance review
- Backup testing

### Updates and Patches

#### Dependency Updates

```bash
# Check for updates
npm outdated

# Update packages
npm update

# Major version updates
npm install package@latest

# Security audit
npm audit
npm audit fix
```

#### Security Patches

```bash
# Check for security vulnerabilities
npm audit

# Apply security fixes
npm audit fix

# Manual fixes for high-severity issues
npm install package@secure-version
```

### Long-term Maintenance

#### Database Maintenance

```sql
-- Vacuum and analyze
VACUUM ANALYZE;

-- Reindex
REINDEX DATABASE your_database;

-- Update statistics
ANALYZE;
```

#### Archive Old Data

```sql
-- Archive old behavior history (older than 2 years)
INSERT INTO behavior_history_archive 
SELECT * FROM behavior_history 
WHERE completed_at < NOW() - INTERVAL '2 years';

DELETE FROM behavior_history 
WHERE completed_at < NOW() - INTERVAL '2 years';
```

This comprehensive deployment guide ensures a robust, secure, and maintainable production deployment of the Behavior Support System.