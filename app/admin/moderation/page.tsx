import { getReportedContent, getModeratedWords } from "./services/moderationService";
import { ModerationTables } from "./components/ModerationTables";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ModeratedWordsTable } from "./components/ModeratedWordsTable";
import { ModeratedWordsSection } from "@/app/admin/moderation/components/ModeratedWordsSection";

export default async function ModerationPage() {
  const { reportedPrompts, reportedComments } = await getReportedContent();
  const moderatedWords = await getModeratedWords();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Content Moderation</h1>
        <p className="mt-1 text-sm text-gray-500">
          Review and manage reported content
        </p>
      </div>

      <Tabs defaultValue="reported">
        <TabsList>
          <TabsTrigger value="reported">Reported Content</TabsTrigger>
          <TabsTrigger value="monthly">Monthly Feature Prompts</TabsTrigger>
          <TabsTrigger value="words">Moderated Words</TabsTrigger>
        </TabsList>
        <TabsContent value="reported">
          <ModerationTables
            reportedPrompts={reportedPrompts}
            reportedComments={reportedComments}
          />
        </TabsContent>
        <TabsContent value="monthly">
          <div className="p-4">
            <h2 className="text-lg font-semibold">Monthly Feature Prompts</h2>
            <p className="text-sm text-gray-500">Review and manage monthly feature prompts.</p>
            {/* Add your monthly feature prompts table or component here */}
          </div>
        </TabsContent>
        <TabsContent value="words">
          <ModeratedWordsSection initialWords={moderatedWords} />
        </TabsContent>
      </Tabs>
    </div>
  );
} 