# 🏗️ System Architecture Overview

## High-Level Architecture

<lov-mermaid>
graph TB
    subgraph "🌐 Frontend Layer"
        A[React Application]
        B[Teacher Dashboard]
        C[Student Kiosks]
        D[Admin Panel]
    end
    
    subgraph "🔗 Backend Services"
        E[Supabase Database]
        F[Authentication]
        G[Real-time Updates]
        H[Edge Functions]
    end
    
    A --> E
    B --> F
    C --> G
    D --> H
    
    style A fill:#e3f2fd,stroke:#1976d2,stroke-width:2px
    style E fill:#f1f8e9,stroke:#388e3c,stroke-width:2px
</lov-mermaid>

## Technology Stack

- **Frontend**: React + TypeScript + Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Auth + Real-time)
- **Deployment**: Lovable Platform
- **Security**: Row Level Security (RLS) + JWT Authentication

---

*This overview provides the foundational architecture understanding. For detailed technical specifications, see the complete system architecture documentation.*