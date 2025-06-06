import { getReportedContent } from "./services/moderationService";
import { ModerationTables } from "./components/ModerationTables";

export default async function ModerationPage() {
  const { reportedPrompts, reportedComments } = await getReportedContent();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Content Moderation</h1>
        <p className="mt-1 text-sm text-gray-500">
          Review and manage reported content
        </p>
      </div>

      <ModerationTables
        reportedPrompts={reportedPrompts}
        reportedComments={reportedComments}
      />
    </div>
  );
} 