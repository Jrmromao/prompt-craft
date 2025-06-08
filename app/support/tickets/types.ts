import { TicketStatus } from '@prisma/client';

export type TicketPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export interface User {
  id: string;
  name: string | null;
  email: string;
}

export interface Message {
  id: string;
  content: string;
  createdAt: Date;
  user: User;
}

export interface Ticket {
  id: string;
  title: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
  category: string;
  createdAt: Date;
  updatedAt: Date;
  user: User;
  messages: Message[];
}
