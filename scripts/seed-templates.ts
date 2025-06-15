import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const templates = [
  {
    name: 'SEO Blog Post',
    description: 'Create an SEO-optimized blog post with proper structure and keywords',
    content: `Write a comprehensive blog post about [TOPIC] that is optimized for SEO. Include:
- A compelling headline with target keywords
- An engaging introduction
- Clear section headings (H2, H3)
- Relevant internal and external links
- A strong conclusion with a call to action
- Meta description and title tag suggestions`,
    type: 'zero-shot',
    complexity: 'intermediate',
    example: `Write a comprehensive blog post about "Sustainable Living" that is optimized for SEO. Include:
- A compelling headline with target keywords like "sustainable living", "eco-friendly", "green lifestyle"
- An engaging introduction that hooks readers with a surprising statistic about environmental impact
- Clear section headings (H2, H3) covering topics like "Reducing Carbon Footprint", "Eco-Friendly Home Tips"
- Relevant internal and external links to authoritative sources
- A strong conclusion with a call to action encouraging readers to start their sustainable journey
- Meta description: "Discover practical tips for sustainable living and reducing your environmental impact. Learn how to create an eco-friendly lifestyle that benefits both you and the planet."`,
    bestPractices: [
      'Research and include relevant keywords naturally throughout the content',
      'Use descriptive headings that include target keywords',
      'Include statistics and data to support claims',
      'Optimize meta description with a clear value proposition',
      'Ensure content is scannable with bullet points and short paragraphs'
    ],
    successMetrics: {
      clarity: 90,
      specificity: 85,
      effectiveness: 88
    },
    tags: ['blog', 'seo', 'content', 'marketing'],
    isPublic: true,
    rating: 4.8
  },
  {
    name: 'Social Media Post',
    description: 'Generate engaging social media content for various platforms',
    content: `Create a social media post for [PLATFORM] about [TOPIC] that:
- Captures attention in the first few words
- Uses appropriate hashtags
- Includes a call to action
- Maintains brand voice
- Optimizes for platform-specific best practices`,
    type: 'few-shot',
    complexity: 'beginner',
    example: `Create a social media post for Instagram about "New Product Launch":

Example 1:
"✨ Exciting news! Our new eco-friendly water bottle is here! 🌱 Made from recycled materials, it keeps your drinks cold for 24 hours. Perfect for your sustainable lifestyle. #EcoLiving #SustainableChoice #NewLaunch"

Example 2:
"🚀 The wait is over! Introducing our revolutionary smart home device. Control your home with just your voice. Early bird discount available now! #SmartHome #TechInnovation #LimitedOffer"`,
    bestPractices: [
      'Keep posts concise and visually appealing',
      'Use platform-specific features (polls, stories, reels)',
      'Include relevant emojis to increase engagement',
      'Research trending hashtags in your niche',
      'Time posts for optimal engagement'
    ],
    successMetrics: {
      clarity: 95,
      specificity: 80,
      effectiveness: 85
    },
    tags: ['social', 'marketing', 'engagement'],
    isPublic: true,
    rating: 4.5
  },
  {
    name: 'API Documentation',
    description: 'Generate comprehensive API documentation with examples',
    content: `Create API documentation for [API_NAME] that includes:
- Endpoint descriptions
- Request/response formats
- Authentication details
- Code examples in multiple languages
- Error handling
- Rate limiting information`,
    type: 'chain-of-thought',
    complexity: 'advanced',
    example: `Let's document the User Management API:

1. First, let's identify the key endpoints:
   - GET /users - List all users
   - POST /users - Create a new user
   - GET /users/{id} - Get user details
   - PUT /users/{id} - Update user
   - DELETE /users/{id} - Delete user

2. For each endpoint, we need to document:
   - HTTP method and path
   - Request parameters
   - Request body schema
   - Response format
   - Error codes
   - Authentication requirements

3. Let's create a complete example for the POST /users endpoint:
   Request:
   POST /api/v1/users
   Authorization: Bearer {token}
   Content-Type: application/json

   {
     "name": "John Doe",
     "email": "john@example.com",
     "role": "user"
   }

   Response:
   201 Created
   {
     "id": "user_123",
     "name": "John Doe",
     "email": "john@example.com",
     "role": "user",
     "created_at": "2024-03-15T10:00:00Z"
   }`,
    bestPractices: [
      'Use clear and consistent formatting',
      'Include real-world examples',
      'Document all possible error responses',
      'Provide code samples in multiple languages',
      'Include authentication and rate limiting details'
    ],
    successMetrics: {
      clarity: 85,
      specificity: 95,
      effectiveness: 90
    },
    tags: ['api', 'documentation', 'technical'],
    isPublic: true,
    rating: 4.7
  },
  {
    name: 'Code Review',
    description: 'Generate a detailed code review with best practices',
    content: `Review the following code and provide:
- Code quality assessment
- Security considerations
- Performance optimization suggestions
- Best practices recommendations
- Specific improvement examples`,
    type: 'chain-of-thought',
    complexity: 'advanced',
    example: `Let's review this authentication middleware:

1. First, analyze the code structure:
\`\`\`javascript
const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization;
  if (!token) return res.status(401).json({ error: 'No token provided' });
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};
\`\`\`

2. Identify potential issues:
   - No token format validation
   - Missing error handling for malformed tokens
   - No token expiration check
   - No rate limiting
   - No logging of failed attempts

3. Suggest improvements:
   - Add token format validation
   - Implement proper error handling
   - Add token expiration check
   - Implement rate limiting
   - Add security logging`,
    bestPractices: [
      'Check for security vulnerabilities',
      'Review code style and consistency',
      'Verify error handling',
      'Assess performance implications',
      'Ensure proper documentation'
    ],
    successMetrics: {
      clarity: 88,
      specificity: 92,
      effectiveness: 90
    },
    tags: ['code', 'review', 'best-practices'],
    isPublic: false,
    rating: 4.6
  },
  {
    name: 'Data Analysis Report',
    description: 'Create a comprehensive data analysis report',
    content: `Generate a data analysis report for [DATASET] that includes:
- Executive summary
- Methodology
- Key findings
- Visualizations
- Recommendations
- Technical appendix`,
    type: 'few-shot',
    complexity: 'intermediate',
    example: `Let's analyze customer satisfaction survey data:

Example 1:
Executive Summary:
- Overall satisfaction score: 4.2/5
- Key improvement areas: Response time, Product quality
- Positive trends: Customer service, Ease of use

Methodology:
- Sample size: 1,000 customers
- Survey period: Q1 2024
- Response rate: 65%

Key Findings:
1. Customer Service: 4.5/5
2. Product Quality: 3.8/5
3. Response Time: 3.5/5
4. Ease of Use: 4.3/5

Example 2:
[Similar structure with different metrics and findings]`,
    bestPractices: [
      'Use clear and concise language',
      'Include relevant visualizations',
      'Provide actionable insights',
      'Support findings with data',
      'Include methodology details'
    ],
    successMetrics: {
      clarity: 90,
      specificity: 88,
      effectiveness: 92
    },
    tags: ['data', 'analysis', 'report'],
    isPublic: true,
    rating: 4.9
  },
  {
    name: 'Business Proposal',
    description: 'Generate a professional business proposal',
    content: `Create a business proposal for [PROJECT] that includes:
- Executive summary
- Problem statement
- Proposed solution
- Implementation plan
- Budget and timeline
- Expected outcomes`,
    type: 'zero-shot',
    complexity: 'intermediate',
    example: `Create a business proposal for "Digital Transformation Initiative":

Executive Summary:
Our proposed digital transformation initiative will modernize operations, improve efficiency, and drive growth. The $500,000 investment will yield a 200% ROI within 18 months.

Problem Statement:
Current manual processes are causing:
- 30% productivity loss
- $100,000 annual operational costs
- Customer satisfaction below industry average

Proposed Solution:
- Implement cloud-based ERP system
- Automate key business processes
- Enhance data analytics capabilities
- Improve customer experience

Implementation Plan:
Phase 1: Assessment (Month 1-2)
Phase 2: Development (Month 3-6)
Phase 3: Deployment (Month 7-8)
Phase 4: Optimization (Month 9-12)`,
    bestPractices: [
      'Use clear and professional language',
      'Include relevant data and statistics',
      'Provide detailed implementation steps',
      'Include realistic timelines',
      'Support claims with research'
    ],
    successMetrics: {
      clarity: 92,
      specificity: 90,
      effectiveness: 88
    },
    tags: ['business', 'proposal', 'professional'],
    isPublic: true,
    rating: 4.7
  },
  {
    name: 'Lesson Plan',
    description: 'Create a detailed lesson plan with learning objectives',
    content: `Develop a lesson plan for [SUBJECT] that includes:
- Learning objectives
- Required materials
- Step-by-step instructions
- Assessment methods
- Differentiation strategies
- Extension activities`,
    type: 'few-shot',
    complexity: 'beginner',
    example: `Let's create a lesson plan for "Introduction to Python Programming":

Example 1:
Learning Objectives:
- Understand basic Python syntax
- Write simple programs
- Use variables and data types

Materials:
- Computers with Python installed
- Projector for demonstrations
- Practice worksheets

Step-by-Step:
1. Introduction (10 min)
2. Basic Syntax (20 min)
3. Variables & Data Types (30 min)
4. Practice Exercises (30 min)
5. Review & Q&A (10 min)

Example 2:
[Similar structure with different content]`,
    bestPractices: [
      'Set clear, measurable objectives',
      'Include engaging activities',
      'Provide assessment criteria',
      'Consider different learning styles',
      'Include extension activities'
    ],
    successMetrics: {
      clarity: 95,
      specificity: 85,
      effectiveness: 90
    },
    tags: ['education', 'lesson-plan', 'teaching'],
    isPublic: false,
    rating: 4.4
  },
  {
    name: 'Technical Specification',
    description: 'Generate a detailed technical specification document',
    content: `Create a technical specification for [PROJECT] that includes:
- System architecture
- Component descriptions
- API specifications
- Data models
- Security requirements
- Performance criteria`,
    type: 'chain-of-thought',
    complexity: 'advanced',
    example: `Let's create a technical specification for a "Real-time Chat Application":

1. System Architecture:
   - Frontend: React.js with WebSocket client
   - Backend: Node.js with Express
   - Database: MongoDB for messages, Redis for real-time
   - Message Queue: RabbitMQ for handling high load

2. Component Descriptions:
   - Chat Service: Handles message routing
   - User Service: Manages authentication
   - Presence Service: Tracks online status
   - Notification Service: Handles alerts

3. API Specifications:
   POST /api/messages
   - Purpose: Send new message
   - Request Body: { roomId, content, type }
   - Response: { messageId, timestamp }
   - Error Codes: 400, 401, 403, 500`,
    bestPractices: [
      'Use clear technical language',
      'Include detailed diagrams',
      'Specify all interfaces',
      'Document security measures',
      'Define performance metrics'
    ],
    successMetrics: {
      clarity: 85,
      specificity: 95,
      effectiveness: 90
    },
    tags: ['technical', 'specification', 'documentation'],
    isPublic: true,
    rating: 4.8
  }
];

async function main() {
  try {
    console.log('🌱 Starting template seeding...');

    // Clear existing templates
    console.log('🗑️  Clearing existing templates...');
    await prisma.promptTemplate.deleteMany({});
    console.log('✅ Cleared existing templates');

    // Create a test user if it doesn't exist
    const testUser = await prisma.user.upsert({
      where: { email: 'test@example.com' },
      update: {},
      create: {
        email: 'test@example.com',
        name: 'Test User',
        clerkId: 'test_clerk_id',
      },
    });

    // Seed templates
    console.log('📝 Seeding templates...');
    for (const template of templates) {
      await prisma.promptTemplate.create({
        data: {
          ...template,
          userId: testUser.id,
        },
      });
    }

    console.log('✅ Successfully seeded templates');
  } catch (error) {
    console.error('❌ Error seeding templates:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();