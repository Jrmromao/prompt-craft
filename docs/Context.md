# Application Context & Architecture

This document provides an overview of our application's architecture, organization, and development practices.

## Business Overview

PromptCraft is a prompt management application that helps users create, test, and manage AI prompts. The application offers four pricing tiers with different features and capabilities.

### Pricing Tiers

1. **Free Tier**
   - 3 Private Prompts
   - 100 Testing Runs/month
   - Access to Public Prompts
   - Basic Analytics
   - Community Support
   - Basic Prompt Templates
   - Pay-as-you-go Credits: $0.08/credit (min. 100 credits)
   - Uses DeepSeek & GPT-3.5 AI Models

2. **Pro Tier** ($19/month)
   - 20 Private Prompts
   - 500 Testing Runs/month
   - Advanced Analytics
   - Priority Support
   - Custom Templates
   - Team Collaboration (up to 3 users)
   - API Access
   - Version Control
   - Performance Metrics
   - Pay-as-you-go Credits: $0.06/credit (min. 500 credits)
   - Uses DeepSeek & GPT-3.5 AI Models
   - BYOK (Bring Your Own Key)

3. **Elite Tier** ($49/month)
   - Unlimited Private Prompts
   - Unlimited Testing Runs
   - Advanced AI Parameters
   - Team Collaboration (up to 10 users)
   - Custom Integrations
   - Advanced Analytics
   - Priority Support
   - Custom Model Fine-tuning
   - White-label Solutions
   - SLA Guarantee
   - Unlimited credits included
   - Uses Premium AI Model
   - BYOK (Bring Your Own Key)

4. **Enterprise Tier** (Custom Pricing)
   - Everything in Elite
   - Unlimited Team Members
   - Custom AI Model Fine-tuning
   - Dedicated Account Manager
   - Custom API Integration
   - Advanced Security
   - Compliance Features
   - Custom Training
   - Custom Development
   - SLA Guarantee
   - Unlimited credits included
   - Uses Premium AI Model (custom options available)
   - BYOK (Bring Your Own Key)

### Business Rules

1. **Credit System**
   - Credits are used for API calls and model usage
   - Different models have different credit costs
   - Credits reset monthly for subscription plans
   - Pay-as-you-go credits can be purchased at any time

2. **Access Control**
   - Free tier users have limited access to features
   - Pro and Elite users get priority access
   - Enterprise users have custom access levels
   - BYOK (Bring Your Own Key) available for Pro+ tiers

3. **Usage Limits**
   - Free tier: 100 testing runs/month
   - Pro tier: 500 testing runs/month
   - Elite tier: Unlimited testing runs
   - Enterprise tier: Custom limits

4. **Team Management**
   - Pro tier: Up to 3 team members
   - Elite tier: Up to 10 team members
   - Enterprise tier: Unlimited team members

5. **API Access**
   - Free tier: DeepSeek & GPT-3.5
   - Pro tier: DeepSeek & GPT-3.5 + BYOK
   - Elite tier: Premium models + BYOK
   - Enterprise tier: Custom model options

## Tech Stack

### Core Technologies
- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: Clerk
- **Styling**: Tailwind CSS
- **UI Components**: Custom components with shadcn/ui
- **State Management**: React Context + Server Components
- **API**: Next.js API Routes
- **Payment Processing**: Stripe

## Project Structure

```plaintext
/my-nextjs-app
│── /app                 # Next.js App Router
│   ├── /api            # API Routes
│   ├── /admin          # Admin Dashboard
│   ├── /components     # Page-specific components
│   └── /constants      # App-wide constants
│── /components         # Shared UI components
│── /hooks             # Custom React hooks
│── /lib              # Core utilities and services
│   ├── /services     # Business logic services
│   ├── /utils        # Helper functions
│   └── /validations  # Zod schemas
│── /public           # Static assets
│── /styles           # Global styles
│── /tests            # Test files
│── /docs             # Documentation
```

## Design Principles

Our application follows strict design principles as outlined in `APP_DESIGN_PRINCIPLES.md`:

1. **Accessibility (a11y)**
   - ARIA labels and roles
   - Keyboard navigation
   - High contrast ratios
   - Semantic HTML

2. **Color Scheme**
   - Primary: Purple (#9333ea) to Pink (#db2777) gradient
   - Consistent use of colors for actions and states
   - Dark/light mode support

3. **Typography**
   - Inter font family
   - Clear hierarchy with font weights
   - Responsive text sizing

4. **Responsive Design**
   - Mobile-first approach
   - Flexible layouts
   - Breakpoint testing

## Code Organization

### Services Pattern
We use a singleton pattern for services to ensure consistent state management:

```typescript
export class Service {
  private static instance: Service;
  
  private constructor() {}
  
  public static getInstance(): Service {
    if (!Service.instance) {
      Service.instance = new Service();
    }
    return Service.instance;
  }
}
```

### API Routes
- RESTful endpoints in `/app/api`
- Authentication via Clerk middleware
- Rate limiting and error handling
- Consistent response format

### Database Access
- Prisma ORM for type-safe database access
- Service layer abstraction
- Transaction support for complex operations

## Development Practices

### Type Safety
- Strict TypeScript configuration
- Zod for runtime validation
- Prisma for database type safety

### Error Handling
- Custom `ServiceError` class
- Consistent error responses
- Error logging and monitoring

### Testing
- Unit tests for services
- Integration tests for API routes
- E2E tests for critical flows

### Security
- Input validation
- Authentication checks
- Rate limiting
- Secure headers

### Performance
- Server Components where possible
- Image optimization
- Code splitting
- Caching strategies

## Tools & Utilities

### Development Tools
- ESLint for code linting
- Prettier for code formatting
- Husky for git hooks
- Jest for testing

### Monitoring & Logging
- Audit logging system
- Error tracking
- Performance monitoring

### Deployment
- Vercel for hosting
- GitHub for version control
- CI/CD pipelines

## Best Practices

1. **Code Quality**
   - Clean Code principles
   - DRY (Don't Repeat Yourself)
   - SOLID principles
   - Meaningful naming

2. **State Management**
   - Server Components for data fetching
   - React Context for global state
   - Local state for UI components

3. **API Design**
   - RESTful principles
   - Consistent error handling
   - Rate limiting
   - Input validation

4. **Security**
   - Authentication checks
   - Input sanitization
   - Secure headers
   - Regular security audits

5. **Performance**
   - Code splitting
   - Image optimization
   - Caching strategies
   - Bundle size monitoring

## Documentation

- Component documentation
- API documentation
- Architecture decisions
- Setup instructions

## Contributing

1. Follow the established code style
2. Write tests for new features
3. Update documentation
4. Use conventional commits
5. Create pull requests with clear descriptions

---

This document serves as a guide for understanding our application's architecture and development practices. It should be updated as the application evolves. 