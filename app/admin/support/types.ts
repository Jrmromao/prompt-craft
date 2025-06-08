import { TicketStatus, Category, Priority } from '@prisma/client';

export interface Message {
  id: string;
  content: string;
  createdAt: Date;
  user: {
    id: string;
    name: string | null;
    imageUrl: string | null;
  };
}

export interface Ticket {
  id: string;
  title: string;
  description: string;
  status: TicketStatus;
  priority: Priority;
  category: Category;
  createdAt: Date;
  updatedAt: Date;
  messages: Message[];
  user: {
    id: string;
    name: string | null;
    imageUrl: string | null;
  };
}
