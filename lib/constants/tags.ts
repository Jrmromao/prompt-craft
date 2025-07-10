export interface Tag {
  id: string;
  name: string;
  category: 'purpose' | 'domain' | 'skill' | 'platform' | 'language';
  description: string;
}

export const PREDEFINED_TAGS: Tag[] = [
  // Purpose tags
  {
    id: 'content-creation',
    name: 'Content Creation',
    category: 'purpose',
    description: 'For creating various types of content'
  },
  {
    id: 'code-generation',
    name: 'Code Generation',
    category: 'purpose',
    description: 'For generating code snippets and solutions'
  },
  {
    id: 'data-analysis',
    name: 'Data Analysis',
    category: 'purpose',
    description: 'For analyzing and interpreting data'
  },
  
  // Domain tags
  {
    id: 'business',
    name: 'Business',
    category: 'domain',
    description: 'Business and professional use cases'
  },
  {
    id: 'education',
    name: 'Education',
    category: 'domain',
    description: 'Educational and learning materials'
  },
  {
    id: 'marketing',
    name: 'Marketing',
    category: 'domain',
    description: 'Marketing and promotional content'
  },
  {
    id: 'research',
    name: 'Research',
    category: 'domain',
    description: 'Academic and research purposes'
  },
  
  // Skill tags
  {
    id: 'writing',
    name: 'Writing',
    category: 'skill',
    description: 'Writing and content creation'
  },
  {
    id: 'programming',
    name: 'Programming',
    category: 'skill',
    description: 'Software development and coding'
  },
  {
    id: 'analysis',
    name: 'Analysis',
    category: 'skill',
    description: 'Data and information analysis'
  },
  
  // Platform tags
  {
    id: 'web',
    name: 'Web',
    category: 'platform',
    description: 'Web-based applications and content'
  },
  {
    id: 'mobile',
    name: 'Mobile',
    category: 'platform',
    description: 'Mobile applications and content'
  },
  {
    id: 'desktop',
    name: 'Desktop',
    category: 'platform',
    description: 'Desktop applications and software'
  },
  
  // Language tags
  {
    id: 'python',
    name: 'Python',
    category: 'language',
    description: 'Python programming language'
  },
  {
    id: 'javascript',
    name: 'JavaScript',
    category: 'language',
    description: 'JavaScript programming language'
  },
  {
    id: 'typescript',
    name: 'TypeScript',
    category: 'language',
    description: 'TypeScript programming language'
  }
]; 