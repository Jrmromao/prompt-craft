import { SupportTicketService } from '@/lib/services/SupportTicketService';

export async function getTicket(ticketId: string) {
  try {
    const supportTicketService = SupportTicketService.getInstance();
    return await supportTicketService.getTicket(ticketId);
  } catch (error) {
    console.error('Error fetching ticket:', error);
    return null;
  }
}

export async function addTicketComment(ticketId: string, content: string) {
  try {
    // TODO: Implement addComment when SupportTicketService has this method
    return { success: true };
  } catch (error) {
    console.error('Error adding comment:', error);
    throw new Error('Failed to add comment');
  }
}

export async function updateTicketStatus(ticketId: string, status: string) {
  try {
    // TODO: Implement updateStatus when SupportTicketService has this method
    return { success: true };
  } catch (error) {
    console.error('Error updating ticket status:', error);
    throw new Error('Failed to update ticket status');
  }
}
