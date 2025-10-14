'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Sparkles, ArrowRight, CheckCircle, Zap } from 'lucide-react';
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
  action: string;
  href: string;
}

const onboardingSteps: OnboardingStep[] = [
  {
    id: 'create',
    title: 'Create Your First Prompt',
    description: 'Start with our AI-powered prompt builder and see the magic happen',
    icon: Sparkles,
    action: 'Create Prompt',
    href: '/prompts/create?welcome=true',
  },
  {
    id: 'explore',
    title: 'Explore Community',
    description: 'Discover thousands of prompts created by our community',
    icon: Zap,
    action: 'Browse Prompts',
    href: '/community',
  },
];

export const WelcomeModal = ({ user }: WelcomeModalProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);
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

  const handleStepAction = async (step: OnboardingStep) => {
    // Track onboarding progress
    try {
      await fetch('/api/user/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          step: step.id,
          completed: true,
        }),
      });
    } catch (error) {
      console.error('Failed to track onboarding:', error);
    }

    // Navigate to the step's destination
    router.push(step.href);
    setIsOpen(false);
  };

  const handleSkip = () => {
    if (user) {
      localStorage.setItem(`onboarding-completed-${user.id}`, 'true');
    }
    setIsOpen(false);
  };

  const handleNext = () => {
    if (currentStep < onboardingSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  if (!isNewUser || hasCompletedOnboarding) {
    return null;
  }

  const currentStepData = onboardingSteps[currentStep];

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-md p-0 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-500 p-6 text-white text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-white/20 rounded-full flex items-center justify-center">
            <Sparkles className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold mb-2">
            Welcome to PromptCraft, {user?.name?.split(' ')[0]}!
          </h2>
          <p className="text-blue-100">
            Let's get you started with creating amazing AI prompts
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
                    ? "bg-blue-600 text-white"
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
              className="bg-gradient-to-r from-blue-600 to-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentStep + 1) / onboardingSteps.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Step Content */}
        <div className="px-6 pb-6">
          <div className="text-center mb-6">
            <div className="w-12 h-12 mx-auto mb-4 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
              <currentStepData.icon className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">{currentStepData.title}</h3>
            <p className="text-gray-600 dark:text-gray-400">
              {currentStepData.description}
            </p>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <Button
              onClick={() => handleStepAction(currentStepData)}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-700 min-h-[44px]"
            >
              {currentStepData.action}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>

            <div className="flex gap-2">
              {currentStep > 0 && (
                <Button
                  variant="outline"
                  onClick={handlePrevious}
                  className="flex-1 min-h-[44px]"
                >
                  Previous
                </Button>
              )}
              
              {currentStep < onboardingSteps.length - 1 ? (
                <Button
                  variant="outline"
                  onClick={handleNext}
                  className="flex-1 min-h-[44px]"
                >
                  Next
                </Button>
              ) : (
                <Button
                  variant="ghost"
                  onClick={handleSkip}
                  className="flex-1 min-h-[44px]"
                >
                  Skip for now
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 dark:bg-gray-800 px-6 py-4 text-center">
          <p className="text-sm text-gray-500">
            Step {currentStep + 1} of {onboardingSteps.length} • Takes less than 2 minutes
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};
