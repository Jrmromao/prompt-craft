import { TicketForm } from '@/components/support/TicketForm';

export default function NewTicketPage() {
  return (
    <div className="container py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">New Support Ticket</h1>
          <p className="text-muted-foreground">Create a new support ticket to get help</p>
        </div>
      </div>
      <TicketForm />
    </div>
  );
}
