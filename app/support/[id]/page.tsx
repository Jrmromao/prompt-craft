import { TicketDetail } from '@/components/support/TicketDetail';

export default async function TicketPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  return (
    <div className="container py-8">
      <TicketDetail ticketId={params.id} />
    </div>
  );
}
