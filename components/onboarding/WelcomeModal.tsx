'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Sparkles, ArrowRight, CheckCircle, Zap, AlertCircle, Copy, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface WelcomeModalProps {
  user: {
    id: string;
    name: string;
    email: string;
    createdAt: Date;
  } | null;
}

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}

const onboardingSteps: OnboardingStep[] = [
  {
    id: 'generate-key',
    title: 'Get Your API Key',
    description: 'One click to start tracking and optimizing your AI costs',
    icon: Sparkles,
  },
  {
    id: 'integrate',
    title: 'Install & Save Money',
    description: 'Copy your key, install the SDK, and start saving 50-80% immediately',
    icon: Zap,
  },
];

export const WelcomeModal = ({ user }: WelcomeModalProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [generatingKey, setGeneratingKey] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Check if user is new (created within last 24 hours)
  const isNewUser = user && new Date(user.createdAt).getTime() > Date.now() - 24 * 60 * 60 * 1000;

  useEffect(() => {
    if (!user || !isNewUser) return;

    // Check if user has completed onboarding
    const completed = localStorage.getItem(`onboarding-completed-${user.id}`);
    if (completed) {
      setHasCompletedOnboarding(true);
      return;
    }

    // Show welcome modal after a short delay
    const timer = setTimeout(() => {
      setIsOpen(true);
    }, 1000);

    return () => clearTimeout(timer);
  }, [user, isNewUser]);

  const handleGenerateKey = async () => {
    setGeneratingKey(true);
    setError(null);
    
    try {
      const res = await fetch('/api/keys/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'My First Key' }),
      });
      
      const data = await res.json();
      
      if (data.apiKey) {
        setApiKey(data.apiKey);
        setCurrentStep(1); // Move to step 2
        
        // Track onboarding progress
        await fetch('/api/user/onboarding', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ step: 'api-key-generated', completed: true }),
        });
      } else {
        setError(data.error || 'Failed to generate API key');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setGeneratingKey(false);
    }
  };

  const handleCopyKey = () => {
    if (apiKey) {
      navigator.clipboard.writeText(apiKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleComplete = async () => {
    if (user) {
      localStorage.setItem(`onboarding-completed-${user.id}`, 'true');
      
      // Track completion
      await fetch('/api/user/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ step: 'completed', completed: true }),
      });
    }
    setIsOpen(false);
  };

  const handleSkip = () => {
    if (user) {
      localStorage.setItem(`onboarding-completed-${user.id}`, 'true');
    }
    setIsOpen(false);
  };

  if (!isNewUser || hasCompletedOnboarding) {
    return null;
  }

  const currentStepData = onboardingSteps[currentStep];

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-md p-0 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-emerald-500 p-6 text-white text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-white/20 rounded-full flex items-center justify-center">
            <Sparkles className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold mb-2">
            Welcome, {user?.name?.split(' ')[0]}! 🎉
          </h2>
          <p className="text-green-100">
            You're about to save 50-80% on AI costs
          </p>
        </div>

        {/* Progress Indicator */}
        <div className="px-6 pt-4">
          <div className="flex items-center justify-between mb-4">
            {onboardingSteps.map((_, index) => (
              <div
                key={index}
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors",
                  index <= currentStep
                    ? "bg-green-600 text-white"
                    : "bg-gray-200 text-gray-500"
                )}
              >
                {index < currentStep ? (
                  <CheckCircle className="w-4 h-4" />
                ) : (
                  index + 1
                )}
              </div>
            ))}
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
            <div
              className="bg-gradient-to-r from-green-600 to-emerald-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentStep + 1) / onboardingSteps.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Step Content */}
        <div className="px-6 pb-6">
          <div className="text-center mb-6">
            <div className="w-12 h-12 mx-auto mb-4 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
              <currentStepData.icon className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">{currentStepData.title}</h3>
            <p className="text-gray-600 dark:text-gray-400">
              {currentStepData.description}
            </p>
          </div>

          {/* Step 1: Generate API Key */}
          {currentStep === 0 && (
            <div className="space-y-4">
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  {error}
                </div>
              )}
              
              <Button
                onClick={handleGenerateKey}
                disabled={generatingKey}
                className="w-full bg-gradient-to-r from-green-600 to-emerald-500 hover:from-green-700 hover:to-emerald-600 min-h-[48px] text-lg"
              >
                {generatingKey ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 mr-2" />
                    Generate My API Key
                  </>
                )}
              </Button>

              <Button
                variant="ghost"
                onClick={handleSkip}
                className="w-full"
              >
                Skip for now
              </Button>
            </div>
          )}

          {/* Step 2: Copy Key & Integrate */}
          {currentStep === 1 && apiKey && (
            <div className="space-y-4">
              {/* API Key Display */}
              <div className="p-4 bg-yellow-50 border-2 border-yellow-300 rounded-lg">
                <div className="flex items-start gap-2 mb-3">
                  <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-yellow-800">
                    <strong>Save this key!</strong> It's shown only once for security.
                  </div>
                </div>
                
                <div className="flex items-center gap-2 p-3 bg-white rounded border border-yellow-200">
                  <code className="flex-1 text-xs font-mono break-all">{apiKey}</code>
                  <Button
                    size="sm"
                    onClick={handleCopyKey}
                    className="flex-shrink-0"
                  >
                    {copied ? (
                      <>
                        <Check className="w-4 h-4 mr-1" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4 mr-1" />
                        Copy
                      </>
                    )}
                  </Button>
                </div>
              </div>

              {/* Integration Instructions */}
              <div className="p-4 bg-gray-50 rounded-lg space-y-3">
                <div className="font-medium text-sm">Quick Start (2 minutes):</div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex items-start gap-2">
                    <div className="w-6 h-6 rounded-full bg-green-600 text-white flex items-center justify-center text-xs flex-shrink-0">1</div>
                    <div>
                      <div className="font-medium">Install SDK</div>
                      <code className="block mt-1 p-2 bg-gray-900 text-green-400 rounded text-xs">
                        npm install optirelay-sdk
                      </code>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <div className="w-6 h-6 rounded-full bg-green-600 text-white flex items-center justify-center text-xs flex-shrink-0">2</div>
                    <div>
                      <div className="font-medium">Wrap your OpenAI client</div>
                      <code className="block mt-1 p-2 bg-gray-900 text-green-400 rounded text-xs">
                        promptCraft.wrapOpenAI(openai)
                      </code>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <div className="w-6 h-6 rounded-full bg-green-600 text-white flex items-center justify-center text-xs flex-shrink-0">3</div>
                    <div className="font-medium">Start saving money! 💰</div>
                  </div>
                </div>
              </div>

              <Button
                onClick={handleComplete}
                className="w-full bg-gradient-to-r from-green-600 to-emerald-500 hover:from-green-700 hover:to-emerald-600 min-h-[48px] text-lg"
              >
                Start Saving Money
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>

              <div className="text-center">
                <a
                  href="/docs/quickstart"
                  target="_blank"
                  className="text-sm text-green-600 hover:underline"
                >
                  View full documentation →
                </a>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 dark:bg-gray-800 px-6 py-4 text-center">
          <p className="text-sm text-gray-500">
            Step {currentStep + 1} of {onboardingSteps.length} • Takes less than 2 minutes ⚡
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};
