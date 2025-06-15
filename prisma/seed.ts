import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const templates = [
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
  },
  {
    name: "SEO Blog Post Generator",
    description: "Create SEO-optimized blog posts that rank well and engage readers",
    content: "Write a comprehensive blog post about [topic] targeting [audience]. Include:\n- A compelling headline with power words\n- An engaging introduction that hooks readers\n- 3-5 main sections with clear H2 headings\n- Data-backed insights and examples\n- A strong call-to-action\n- 5-7 relevant keywords naturally integrated\n- Meta description optimized for CTR",
    type: "zero-shot",
    complexity: "beginner",
    example: "Write a blog post about AI in healthcare for a general audience.",
    bestPractices: [
      "Use keywords naturally",
      "Write engaging headlines",
      "Provide actionable insights",
      "Optimize for readability",
      "Include a call-to-action"
    ],
    successMetrics: {
      clarity: 85,
      specificity: 80,
      effectiveness: 87
    },
    isPublic: true,
    tags: ["blog-post", "seo", "content-marketing", "writing"],
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
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
