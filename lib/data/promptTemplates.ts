export interface PromptTemplate {
  id: string;
  title: string;
  category: string;
  content: string;
  variables: string[];
  tags: string[];
  description: string;
}

export const PROMPT_TEMPLATES: PromptTemplate[] = [
  {
    id: 'email-marketing',
    title: 'Marketing Email Generator',
    category: 'Marketing',
    description: 'Create compelling marketing emails',
    content: `Write a compelling marketing email for {product_name}.

Target audience: {target_audience}
Key benefit: {key_benefit}
Call to action: {cta}

Tone: Professional yet friendly
Length: 150-200 words`,
    variables: ['product_name', 'target_audience', 'key_benefit', 'cta'],
    tags: ['email', 'marketing', 'sales'],
  },
  {
    id: 'blog-post',
    title: 'Blog Post Outline',
    category: 'Content',
    description: 'Generate detailed blog post outlines',
    content: `Create a detailed blog post outline about {topic}.

Target keywords: {keywords}
Word count: {word_count}
Audience level: {audience_level}

Include:
- Engaging introduction
- 5-7 main sections with subheadings
- Conclusion with clear CTA`,
    variables: ['topic', 'keywords', 'word_count', 'audience_level'],
    tags: ['blog', 'content', 'seo'],
  },
  {
    id: 'social-media',
    title: 'Social Media Post',
    category: 'Social Media',
    description: 'Engaging social media content',
    content: `Create an engaging {platform} post about {topic}.

Tone: {tone}
Include: {include_elements}
Max length: {max_length} characters

Add relevant hashtags and emojis.`,
    variables: ['platform', 'topic', 'tone', 'include_elements', 'max_length'],
    tags: ['social', 'twitter', 'linkedin'],
  },
  {
    id: 'product-description',
    title: 'Product Description',
    category: 'E-commerce',
    description: 'Compelling product descriptions',
    content: `Write a compelling product description for {product_name}.

Key features: {features}
Target customer: {target_customer}
Unique selling point: {usp}

Focus on benefits, not just features. Make it scannable with bullet points.`,
    variables: ['product_name', 'features', 'target_customer', 'usp'],
    tags: ['ecommerce', 'product', 'sales'],
  },
  {
    id: 'code-documentation',
    title: 'Code Documentation',
    category: 'Development',
    description: 'Clear technical documentation',
    content: `Write clear documentation for this {code_type}:

Function/Class name: {name}
Purpose: {purpose}
Parameters: {parameters}
Return value: {return_value}

Include usage examples and edge cases.`,
    variables: ['code_type', 'name', 'purpose', 'parameters', 'return_value'],
    tags: ['code', 'documentation', 'technical'],
  },
  {
    id: 'meeting-summary',
    title: 'Meeting Summary',
    category: 'Business',
    description: 'Concise meeting summaries',
    content: `Summarize this meeting:

Meeting topic: {topic}
Attendees: {attendees}
Key discussion points: {discussion_points}
Decisions made: {decisions}
Action items: {action_items}

Format as a clear, scannable summary.`,
    variables: ['topic', 'attendees', 'discussion_points', 'decisions', 'action_items'],
    tags: ['business', 'meeting', 'summary'],
  },
  {
    id: 'customer-support',
    title: 'Customer Support Response',
    category: 'Support',
    description: 'Helpful support responses',
    content: `Write a helpful customer support response for this issue:

Customer issue: {issue}
Product/Service: {product}
Customer sentiment: {sentiment}

Tone: Empathetic and solution-focused
Include: Acknowledgment, solution, and follow-up offer`,
    variables: ['issue', 'product', 'sentiment'],
    tags: ['support', 'customer-service', 'communication'],
  },
  {
    id: 'job-description',
    title: 'Job Description',
    category: 'HR',
    description: 'Attractive job postings',
    content: `Create a job description for {job_title}.

Company: {company_name}
Key responsibilities: {responsibilities}
Required skills: {required_skills}
Nice-to-have: {nice_to_have}

Make it engaging and inclusive. Highlight company culture and benefits.`,
    variables: ['job_title', 'company_name', 'responsibilities', 'required_skills', 'nice_to_have'],
    tags: ['hr', 'recruiting', 'jobs'],
  },
  {
    id: 'press-release',
    title: 'Press Release',
    category: 'PR',
    description: 'Professional press releases',
    content: `Write a press release for {announcement}.

Company: {company_name}
Key details: {details}
Quote from: {quote_source}
Contact: {contact_info}

Follow AP style. Include compelling headline and lead paragraph.`,
    variables: ['announcement', 'company_name', 'details', 'quote_source', 'contact_info'],
    tags: ['pr', 'media', 'announcement'],
  },
  {
    id: 'video-script',
    title: 'Video Script',
    category: 'Content',
    description: 'Engaging video scripts',
    content: `Write a video script about {topic}.

Video length: {duration}
Target audience: {audience}
Key message: {message}
Call to action: {cta}

Include: Hook, main content, and strong CTA. Mark timing for each section.`,
    variables: ['topic', 'duration', 'audience', 'message', 'cta'],
    tags: ['video', 'script', 'content'],
  },
];

export const TEMPLATE_CATEGORIES = [
  'All',
  'Marketing',
  'Content',
  'Social Media',
  'E-commerce',
  'Development',
  'Business',
  'Support',
  'HR',
  'PR',
];
