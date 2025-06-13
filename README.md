# PromptHiveCO

PromptCraft is a modern, feature-rich platform for managing, comparing, and optimizing AI prompts. Built with Next.js 14, it provides a robust solution for prompt engineering and version control.

## 🚀 Features

- **Prompt Management**: Create, edit, and organize prompts with version control
- **Version Comparison**: Advanced diff visualization for prompt versions
- **Community Features**: Share and discover prompts from the community
- **Analytics**: Track prompt performance and usage
- **User Management**: Secure authentication with Clerk
- **Responsive Design**: Optimized for all devices
- **Dark Mode**: Full support for light and dark themes

## 🛠 Tech Stack

- **Framework**: Next.js 14.1.0
- **Language**: TypeScript
- **Database**: Prisma with PostgreSQL
- **Authentication**: Clerk
- **UI Components**: Radix UI
- **Styling**: Tailwind CSS
- **State Management**: Zustand, React Query
- **Testing**: Jest, Vitest, Playwright
- **Deployment**: Vercel

## 📋 Prerequisites

- Node.js 18.x or later
- Yarn or npm
- PostgreSQL database
- Clerk account for authentication
- AWS account (for S3 storage)

## 🚀 Getting Started

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/PromptCraft.git
   cd PromptCraft
   ```

2. **Install dependencies**
   ```bash
   yarn install
   ```

3. **Set up environment variables**
   Create a `.env.local` file in the root directory with the following variables:
   ```env
   # Database
   DATABASE_URL="postgresql://..."

   # Authentication
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
   CLERK_SECRET_KEY=your_clerk_secret_key

   # AWS
   AWS_ACCESS_KEY_ID=your_aws_access_key
   AWS_SECRET_ACCESS_KEY=your_aws_secret_key
   AWS_REGION=your_aws_region
   AWS_BUCKET_NAME=your_bucket_name

   # Other
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

4. **Set up the database**
   ```bash
   yarn prisma generate
   yarn prisma migrate dev
   ```

5. **Start the development server**
   ```bash
   yarn dev
   ```

Visit [http://localhost:3000](http://localhost:3000) to see your application.

## 🧪 Testing

```bash
# Run unit tests
yarn test

# Run tests in watch mode
yarn test:watch

# Run end-to-end tests
yarn test:e2e

# Check test coverage
yarn test:coverage
```

## 📦 Available Scripts

- `yarn dev` - Start development server
- `yarn build` - Build for production
- `yarn start` - Start production server
- `yarn lint` - Run ESLint
- `yarn format` - Format code with Prettier
- `yarn test` - Run tests
- `yarn analyze` - Analyze bundle size

## 🏗 Project Structure

```
/my-nextjs-app
├── /app             # Next.js App Router
├── /components      # Reusable UI components
├── /hooks          # Custom React hooks
├── /services       # API calls and external services
├── /utils          # Helper functions and utilities
├── /styles         # Global and component-specific styles
├── /public         # Static assets
├── /tests          # Unit and integration tests
├── /prisma         # Database schema and migrations
└── /types          # TypeScript type definitions
```

## 🏗 System Architecture

### Core Components

1. **Frontend Layer**
   - Next.js App Router for page routing and server components
   - React Server Components for improved performance
   - Client Components for interactive UI elements
   - Tailwind CSS for styling
   - Radix UI for accessible components

2. **Backend Layer**
   - Next.js API Routes for serverless functions
   - Prisma ORM for database operations
   - PostgreSQL for data persistence
   - Redis for caching and rate limiting

3. **Authentication & Authorization**
   - Clerk for user authentication
   - Role-based access control (RBAC)
   - JWT token management
   - Session handling

### Service Interactions

#### Internal Services

1. **Database Service**
   ```typescript
   // Example of database service interaction
   import { PrismaClient } from '@prisma/client'
   
   const prisma = new PrismaClient()
   
   export async function getPrompt(id: string) {
     return prisma.prompt.findUnique({
       where: { id },
       include: { versions: true }
     })
   }
   ```

2. **Cache Service**
   ```typescript
   // Example of Redis cache service
   import { Redis } from '@upstash/redis'
   
   const redis = new Redis({
     url: process.env.REDIS_URL,
     token: process.env.REDIS_TOKEN
   })
   
   export async function getCachedData(key: string) {
     return redis.get(key)
   }
   ```

3. **File Storage Service**
   ```typescript
   // Example of S3 storage service
   import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
   
   const s3Client = new S3Client({
     region: process.env.AWS_REGION
   })
   
   export async function uploadFile(file: Buffer, key: string) {
     return s3Client.send(new PutObjectCommand({
       Bucket: process.env.AWS_BUCKET_NAME,
       Key: key,
       Body: file
     }))
   }
   ```

#### External Services Integration

1. **Authentication Service (Clerk)**
   - User management
   - Social login integration
   - Session management
   - Webhook handling

2. **Analytics Service (Vercel)**
   - Performance monitoring
   - Error tracking
   - User behavior analytics
   - Real-time metrics

3. **Email Service (Resend)**
   - Transactional emails
   - Marketing campaigns
   - Email templates
   - Delivery tracking

4. **Payment Processing (Stripe)**
   - Subscription management
   - Payment processing
   - Invoice generation
   - Webhook handling

### Data Flow

1. **User Request Flow**
   ```
   Client → Next.js Edge Runtime → API Route → Service Layer → Database
   ```

2. **Authentication Flow**
   ```
   Client → Clerk → JWT Token → Protected Routes → User Context
   ```

3. **File Upload Flow**
   ```
   Client → API Route → S3 Upload → Database Update → Cache Invalidation
   ```

### Security Measures

1. **API Security**
   - Rate limiting with Upstash Redis
   - CORS configuration
   - Request validation with Zod
   - Input sanitization

2. **Data Security**
   - Encrypted data transmission
   - Secure session management
   - Regular security audits
   - GDPR compliance

3. **Infrastructure Security**
   - Vercel Edge Network
   - DDoS protection
   - SSL/TLS encryption
   - Regular backups

### Performance Optimization

1. **Caching Strategy**
   - Redis for API responses
   - Browser caching
   - CDN for static assets
   - Incremental Static Regeneration (ISR)

2. **Code Optimization**
   - Code splitting
   - Tree shaking
   - Image optimization
   - Bundle analysis

3. **Database Optimization**
   - Connection pooling
   - Query optimization
   - Index management
   - Regular maintenance

## 🔒 Authentication

This project uses Clerk for authentication. The `ClerkProvider` must wrap your application at the top level (in `components/Providers.tsx`).

```tsx
import { ClerkProvider } from '@clerk/nextjs';

export default function Providers({ children }) {
  return (
    <ClerkProvider>
      {/* other providers */}
      {children}
    </ClerkProvider>
  );
}
```

## 🚢 Deployment

The application is configured for deployment on Vercel. Follow these steps:

1. Push your code to GitHub
2. Import your repository in Vercel
3. Configure environment variables
4. Deploy!

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org)
- [Clerk](https://clerk.dev)
- [Prisma](https://prisma.io)
- [Radix UI](https://www.radix-ui.com)
- [Tailwind CSS](https://tailwindcss.com)

## 📞 Support

For support, please open an issue in the GitHub repository or contact the maintainers.

---

**Note**: This is a work in progress. Features and documentation will be updated regularly.
