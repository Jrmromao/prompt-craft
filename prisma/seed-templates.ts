import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const templates = [
  {
    name: "SEO Blog Post",
    description: "Create an SEO-optimized blog post with proper structure and keywords",
    content: "Write a blog post about [topic] that:\n- Has a compelling headline\n- Includes relevant keywords\n- Uses proper H1, H2, H3 structure\n- Has a clear introduction and conclusion\n- Includes internal and external links\n- Is optimized for readability\n- Has a call-to-action",
    type: "zero-shot",
    complexity: "intermediate",
    example: "Write a blog post about 'AI in Healthcare' that follows SEO best practices and engages readers with real-world applications.",
    bestPractices: [
      "Use keyword research to identify target terms",
      "Keep paragraphs short and scannable",
      "Include relevant statistics and data",
      "Add meta description and title tags",
      "Optimize images with alt text"
    ],
    successMetrics: {
      clarity: 90,
      specificity: 85,
      effectiveness: 88
    },
    isPublic: true,
    tags: ["seo", "content", "blog", "marketing"],
    usageCount: 0,
    rating: 0
  },
  {
    name: "Social Media Post",
    description: "Generate engaging social media content for different platforms",
    content: "Create a [platform] post about [topic] that:\n- Is within character limits\n- Uses appropriate hashtags\n- Includes a call-to-action\n- Is engaging and shareable\n- Matches platform tone\n- Includes relevant emojis",
    type: "few-shot",
    complexity: "beginner",
    example: "Create a Twitter post about 'New Product Launch' that's engaging and within 280 characters.",
    bestPractices: [
      "Keep it concise and clear",
      "Use platform-specific features",
      "Include relevant hashtags",
      "Add visual elements when possible",
      "Time posts for optimal engagement"
    ],
    successMetrics: {
      clarity: 95,
      specificity: 80,
      effectiveness: 85
    },
    isPublic: true,
    tags: ["social-media", "marketing", "content"],
    usageCount: 0,
    rating: 0
  },
  {
    name: "API Documentation",
    description: "Generate clear and comprehensive API documentation",
    content: "Document the [API endpoint] that:\n- Describes the endpoint purpose\n- Lists all parameters\n- Shows request/response examples\n- Includes error handling\n- Provides authentication details\n- Shows rate limits",
    type: "chain-of-thought",
    complexity: "advanced",
    example: "Document a REST API endpoint for user authentication that includes all necessary details for implementation.",
    bestPractices: [
      "Use clear and consistent formatting",
      "Include code examples in multiple languages",
      "Document all possible error responses",
      "Provide authentication examples",
      "Include rate limiting information"
    ],
    successMetrics: {
      clarity: 85,
      specificity: 95,
      effectiveness: 90
    },
    isPublic: true,
    tags: ["api", "documentation", "technical"],
    usageCount: 0,
    rating: 0
  },
  {
    name: "Code Review",
    description: "Generate a comprehensive code review with best practices",
    content: "Review the following code:\n[code]\nFocus on:\n- Code quality and readability\n- Performance considerations\n- Security best practices\n- Testing coverage\n- Documentation\n- Maintainability",
    type: "chain-of-thought",
    complexity: "advanced",
    example: "Review a React component that handles user authentication and form validation.",
    bestPractices: [
      "Check for security vulnerabilities",
      "Review error handling",
      "Verify test coverage",
      "Check code style consistency",
      "Review documentation"
    ],
    successMetrics: {
      clarity: 90,
      specificity: 95,
      effectiveness: 92
    },
    isPublic: true,
    tags: ["code-review", "development", "best-practices"],
    usageCount: 0,
    rating: 0
  },
  {
    name: "Data Analysis Report",
    description: "Create a comprehensive data analysis report",
    content: "Analyze the following data about [topic]:\n[data]\nInclude:\n- Executive summary\n- Key findings\n- Data visualization\n- Statistical analysis\n- Recommendations\n- Methodology",
    type: "few-shot",
    complexity: "intermediate",
    example: "Analyze sales data for Q1 2024 and provide insights with visualizations.",
    bestPractices: [
      "Use clear data visualization",
      "Include statistical significance",
      "Provide actionable insights",
      "Explain methodology",
      "Include error margins"
    ],
    successMetrics: {
      clarity: 88,
      specificity: 90,
      effectiveness: 85
    },
    isPublic: true,
    tags: ["data-analysis", "reporting", "business"],
    usageCount: 0,
    rating: 0
  }
];

async function main() {
  console.log('Seeding templates...');
  
  for (const template of templates) {
    await prisma.promptTemplate.create({
      data: template
    });
  }

  console.log('Seeding completed.');
}

main()
  .catch((e) => {
    console.error('Error seeding templates:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 