# Installation & Setup Guide

This guide will help you set up the Student Behavior Reflection System for development.

## Prerequisites

- Node.js 18+ and npm
- Git
- Modern web browser
- Supabase account (optional for development)

## Quick Start

1. **Clone the repository**
   ```bash
   git clone [repository-url]
   cd bx-os
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Add your Supabase credentials:
   ```
   VITE_SUPABASE_URL=https://tuxvwpgwnnozubdpskhr.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Access the application**
   - Open http://localhost:5173
   - Use demo accounts (see [Demo Accounts](#demo-accounts))

## Demo Accounts

```
Teacher: teacher@school.edu / teacher123
Admin: admin@school.edu / admin123
```

## Database Setup

The Supabase database is already configured with:
- ✅ All tables and relationships
- ✅ Row Level Security (RLS) policies
- ✅ Database functions and triggers
- ✅ Sample data for testing

## Troubleshooting

### Common Issues
- **Build errors**: Clear node_modules and reinstall
- **Database connection**: Verify environment variables
- **Auth issues**: Check Supabase configuration

### Getting Help
- Check [Known Issues](../issues/KNOWN_ISSUES.md)
- Review [Troubleshooting Guide](../issues/TROUBLESHOOTING.md)
- See [Critical Issues](../issues/CRITICAL_ISSUES.md) for urgent problems

## Next Steps

After setup, see:
- [Development Environment](./DEVELOPMENT.md) for development workflows
- [Project Overview](../overview/PROJECT_SUMMARY.md) for understanding the system
- [Frontend Documentation](../technical/FRONTEND.md) for architecture details