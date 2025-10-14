import { auth } from '@clerk/nextjs/server';
import { SupportService } from '@/lib/services/supportService';

async function getTickets(userId: string) {
  const supportService = SupportService.getInstance();
  return supportService.getTickets(userId);
}

export default async function TicketsPage() {
  const { userId } = await auth();

  if (!userId) {
    return null;
  }

  const tickets = await getTickets(userId);

  const statusColors = {
    OPEN: 'bg-green-500',
    IN_PROGRESS: 'bg-blue-500',
    RESOLVED: 'bg-blue-500',
    CLOSED: 'bg-gray-500',
  };

  const priorityColors = {
    LOW: 'bg-gray-500',
    MEDIUM: 'bg-blue-500',
    HIGH: 'bg-orange-500',
    URGENT: 'bg-red-500',
  };

  return (
    <div className="container mx-auto py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Support Tickets</h1>
      </div>

      <div className="rounded-xl bg-white p-6 shadow-md">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-gray-500">
              <th className="px-4 py-3 text-left">ID</th>
              <th className="px-4 py-3 text-left">Title</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-left">Priority</th>
              <th className="px-4 py-3 text-left">Category</th>
            </tr>
          </thead>
          <tbody>
            {tickets.map(ticket => (
              <tr
                key={ticket.id}
                className="group border-b transition last:border-0 hover:bg-gray-50"
              >
                <td className="px-4 py-3">
                  <a
                    href={`/support/tickets/${ticket.id}`}
                    className="font-mono text-blue-600 underline underline-offset-2 transition hover:text-blue-800"
                  >
                    #{ticket.id.slice(0, 8)}
                  </a>
                </td>
                <td className="px-4 py-3 font-medium text-gray-900">{ticket.title}</td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${
                      ticket.status === 'OPEN'
                        ? 'bg-green-100 text-green-700'
                        : ticket.status === 'IN_PROGRESS'
                          ? 'bg-blue-100 text-blue-700'
                          : ticket.status === 'RESOLVED'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-gray-200 text-gray-700'
                    }`}
                  >
                    {ticket.status.replace('_', ' ')}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${
                      ticket.priority === 'URGENT'
                        ? 'bg-red-100 text-red-700'
                        : ticket.priority === 'HIGH'
                          ? 'bg-orange-100 text-orange-700'
                          : ticket.priority === 'MEDIUM'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {ticket.priority}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-700">{ticket.category}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
