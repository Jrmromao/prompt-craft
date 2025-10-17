'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Zap, Target, Sparkles, CreditCard } from 'lucide-react';

const ONBOARDING_STEPS = [
  {
    id: 'welcome',
    title: 'Welcome to OptiRelay',
    description: 'Transform your ideas into optimized AI prompts',
    icon: Sparkles
  },
  {
    id: 'credits',
    title: 'Understanding Credits',
    description: 'Learn how our credit system works',
    icon: CreditCard
  },
  {
    id: 'optimization',
    title: 'AI-Powered Optimization',
    description: 'See how we enhance your prompts',
    icon: Target
  },
  {
    id: 'ready',
    title: 'You\'re Ready!',
    description: 'Start creating amazing prompts',
    icon: Zap
  }
];

export function OnboardingFlow({ onComplete }: { onComplete: () => void }) {
  const [currentStep, setCurrentStep] = useState(0);
  
  const nextStep = () => {
    if (currentStep < ONBOARDING_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };
  
  const step = ONBOARDING_STEPS[currentStep];
  const Icon = step.icon;
  
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-full max-w-md mx-4">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <Icon className="w-6 h-6 text-primary" />
          </div>
          <CardTitle>{step.title}</CardTitle>
          <p className="text-muted-foreground">{step.description}</p>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {currentStep === 1 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <span>Free Plan</span>
                <Badge variant="secondary">10 credits</Badge>
              </div>
              <div className="text-sm text-muted-foreground">
                • 5 credits for prompt optimization<br/>
                • 2 credits per variation<br/>
                • Upgrade anytime for more credits
              </div>
            </div>
          )}
          
          {currentStep === 2 && (
            <div className="space-y-3">
              <div className="p-3 bg-muted rounded-lg">
                <div className="font-medium mb-2">Optimization Process:</div>
                <div className="text-sm space-y-1">
                  <div>1. Analyze your idea</div>
                  <div>2. Apply AI best practices</div>
                  <div>3. Generate variations</div>
                  <div>4. Refine for clarity</div>
                </div>
              </div>
            </div>
          )}
          
          <div className="flex items-center justify-between">
            <div className="flex space-x-1">
              {ONBOARDING_STEPS.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full ${
                    index <= currentStep ? 'bg-primary' : 'bg-muted'
                  }`}
                />
              ))}
            </div>
            
            <Button onClick={nextStep}>
              {currentStep === ONBOARDING_STEPS.length - 1 ? 'Get Started' : 'Next'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
