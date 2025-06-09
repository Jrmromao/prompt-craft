export interface Version {
  id: string;
  version: string;
  content: string;
  description?: string;
  createdAt: string;
  tags: string[];
  prompt: {
    user: {
      name: string | null;
      email: string | null;
      imageUrl: string | null;
    } | null;
  };
} 