import { Suspense } from 'react';
import { PremiumPromptEditor } from '@/components/prompts/PremiumPromptEditor';
import { PromptTestingSuite } from '@/components/prompts/PromptTestingSuite';
import { SmartTemplateSelector } from '@/components/prompts/SmartTemplateSelector';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Code, 
  TestTube, 
  FileText, 
  Sparkles,
  Loader2
} from 'lucide-react';

export default function CreatePromptPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6">
        {/* Hero Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-full text-sm font-medium mb-6">
            <Sparkles className="w-4 h-4" />
            AI-Powered Prompt Engineering
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
            Create Amazing Prompts
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Build, test, and optimize AI prompts with our advanced editor. 
            Get real-time suggestions, performance analytics, and professional templates.
          </p>
        </div>

        {/* Main Interface */}
        <Tabs defaultValue="editor" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="editor" className="flex items-center gap-2">
              <Code className="w-4 h-4" />
              Editor
            </TabsTrigger>
            <TabsTrigger value="templates" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Templates
            </TabsTrigger>
            <TabsTrigger value="testing" className="flex items-center gap-2">
              <TestTube className="w-4 h-4" />
              Testing
            </TabsTrigger>
          </TabsList>

          <TabsContent value="editor" className="space-y-6">
            <Suspense fallback={
              <Card>
                <CardContent className="flex items-center justify-center h-64">
                  <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
                </CardContent>
              </Card>
            }>
              <PremiumPromptEditor />
            </Suspense>
          </TabsContent>

          <TabsContent value="templates" className="space-y-6">
            <Suspense fallback={
              <Card>
                <CardContent className="flex items-center justify-center h-64">
                  <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
                </CardContent>
              </Card>
            }>
              <SmartTemplateSelector 
                onSelectTemplate={(template) => {
                  console.log('Selected template:', template);
                  // Handle template selection
                }}
                onCustomizeTemplate={(template) => {
                  console.log('Customize template:', template);
                  // Handle template customization
                }}
              />
            </Suspense>
          </TabsContent>

          <TabsContent value="testing" className="space-y-6">
            <Suspense fallback={
              <Card>
                <CardContent className="flex items-center justify-center h-64">
                  <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
                </CardContent>
              </Card>
            }>
              <PromptTestingSuite 
                prompt=""
                onResults={(results) => {
                  console.log('Test results:', results);
                }}
              />
            </Suspense>
          </TabsContent>
        </Tabs>

        {/* Features Showcase */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card className="text-center">
            <CardHeader>
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Code className="w-8 h-8 text-white" />
              </div>
              <CardTitle>Advanced Editor</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                AI-powered writing assistance, real-time suggestions, and intelligent autocomplete.
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-teal-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <TestTube className="w-8 h-8 text-white" />
              </div>
              <CardTitle>Real Testing</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Test your prompts with real LLM calls, get performance metrics, and optimize costs.
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="w-8 h-8 text-white" />
              </div>
              <CardTitle>Smart Templates</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Professional templates for every use case, with intelligent customization options.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}