# Prompt Craft

A comprehensive prompt engineering and cost optimization platform built with Next.js, Prisma, and Supabase.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your configuration

# Set up the database
npx prisma generate
npx prisma db push

# Start the development server
npm run dev
```

## 📁 Project Structure

```
├── app/                    # Next.js app directory
├── components/             # Reusable UI components
├── docs/                   # Documentation
│   ├── deployment/         # Deployment guides
│   ├── development/        # Development docs
│   ├── phases/            # Project phases
│   ├── reports/           # Analysis reports
│   ├── security/          # Security documentation
│   ├── testing/           # Testing documentation
│   └── ux-design/         # UX/UI documentation
├── lib/                    # Utility functions
├── prisma/                 # Database schema and migrations
├── public/                 # Static assets
└── types/                  # TypeScript type definitions
```

## 🛠️ Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run test` - Run tests
- `npm run lint` - Run ESLint

## 📚 Documentation

All documentation has been organized in the `docs/` directory:

- **[Deployment Guide](docs/deployment/)** - Production deployment instructions
- **[Development Docs](docs/development/)** - Development setup and guidelines
- **[Testing](docs/testing/)** - Testing strategies and reports
- **[Security](docs/security/)** - Security audits and compliance
- **[UX Design](docs/ux-design/)** - User experience documentation

## 🔧 Environment Variables

See `.env.example` for required environment variables.

## 📄 License

MIT License - see LICENSE file for details.