'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

const TOUR_STEPS = [
  {
    title: 'Welcome to CostLens! 🎉',
    content: 'You start with 100 free credits. Each prompt generation costs 5-15 credits depending on complexity.',
    target: 'credits',
  },
  {
    title: 'Create Your First Prompt',
    content: 'Click here to create a prompt. Use {variables} like {topic} or {audience} for dynamic content.',
    target: 'create-prompt',
  },
  {
    title: 'Explore Community',
    content: 'Browse prompts created by others. Upvote helpful prompts to reward creators with 5 credits!',
    target: 'community',
  },
  {
    title: 'Test in Playground',
    content: 'Test your prompts with different AI models (GPT-4, Claude, etc.) before using them in production.',
    target: 'playground',
  },
  {
    title: 'Upgrade Anytime',
    content: 'Need more? Upgrade to PRO for 1,000 credits/month and access to advanced models.',
    target: 'upgrade',
  },
];

export function OnboardingTour() {
  const [step, setStep] = useState(0);
  const [show, setShow] = useState(false);

  useEffect(() => {
    const hasSeenTour = localStorage.getItem('hasSeenTour');
    if (!hasSeenTour) {
      setTimeout(() => setShow(true), 1000);
    }
  }, []);

  const handleNext = () => {
    if (step < TOUR_STEPS.length - 1) {
      setStep(step + 1);
    } else {
      handleComplete();
    }
  };

  const handleSkip = () => {
    localStorage.setItem('hasSeenTour', 'true');
    setShow(false);
  };

  const handleComplete = () => {
    localStorage.setItem('hasSeenTour', 'true');
    setShow(false);
  };

  if (!show) return null;

  const currentStep = TOUR_STEPS[step];

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/50" onClick={handleSkip} />
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 bg-white rounded-lg p-6 shadow-2xl max-w-md w-full mx-4">
        <button
          onClick={handleSkip}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="mb-4">
          <div className="flex gap-1 mb-4">
            {TOUR_STEPS.map((_, i) => (
              <div
                key={i}
                className={`h-1 flex-1 rounded ${
                  i <= step ? 'bg-purple-600' : 'bg-gray-200'
                }`}
              />
            ))}
          </div>
        </div>

        <h3 className="text-xl font-bold mb-2">{currentStep.title}</h3>
        <p className="text-gray-600 mb-6">{currentStep.content}</p>

        <div className="flex justify-between items-center">
          <button
            onClick={handleSkip}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            Skip Tour
          </button>
          <button
            onClick={handleNext}
            className="px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:opacity-90 transition-opacity"
          >
            {step < TOUR_STEPS.length - 1 ? 'Next' : 'Get Started'}
          </button>
        </div>

        <div className="mt-3 text-center text-sm text-gray-500">
          Step {step + 1} of {TOUR_STEPS.length}
        </div>
      </div>
    </>
  );
}
