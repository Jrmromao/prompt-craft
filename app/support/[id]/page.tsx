import { TicketDetail } from '@/components/support/TicketDetail';

export default async function TicketPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  return (
    <div className="container py-8">
      <TicketDetail ticketId={resolvedParams.id} />
    </div>
  );
}
