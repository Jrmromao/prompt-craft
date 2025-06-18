import { TicketDetail } from '@/components/support/TicketDetail';

export default async function TicketPage({ params }: { params: { id: string } }) {
  return (
    <div className="container py-8">
      <TicketDetail ticketId={params.id} />
    </div>
  );
}
