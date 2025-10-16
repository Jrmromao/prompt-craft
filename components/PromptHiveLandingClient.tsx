'use client';
import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Script from 'next/script';
import Link from 'next/link';
import { useTheme } from 'next-themes';
import {
  Sparkles,
  Zap,
  Users,
  Target,
  ArrowRight,
  Check,
  Star,
  Play,
  Menu,
  X,
  Sun,
  Moon,
  Code,
  BarChart,
  Info,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Marquee } from '@/components/ui/marquee';
import { cn } from '@/lib/utils';
import { Switch } from "@/components/ui/switch";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useAuth } from '@/hooks/useAuth';
import { toast } from "@/components/ui/use-toast";

// SEO metadata
const metadata = {
  title: 'PromptHive - AI-Powered Prompt Generation Platform',
  description:  
    'Transform your ideas into detailed, effective prompts with our AI-powered platform. Perfect for content creators, marketers, and AI enthusiasts.',
  keywords: 'AI prompts, prompt engineering, content creation, marketing tools, AI assistance',
  ogImage: '/og-image.jpg',
  twitterCard: 'summary_large_image',
};

// Structured data for rich snippets
const structuredData = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'PromptHive',
  applicationCategory: 'BusinessApplication',
  operatingSystem: 'Web',
  offers: {
    '@type': 'Offer',
    price: '29.00',
    priceCurrency: 'USD',
  },
  aggregateRating: {
    '@type': 'AggregateRating',
    ratingValue: '4.9',
    ratingCount: '1000',
  },
};

interface PromptHiveLandingClientProps {
  user?: {
    id: string;
    name: string;
    email: string;
    imageUrl: string;
  } | null;
}

interface Plan {
  id: string;
  name: string;
  description: string;
  price: number;
  period: string;
  features: (string | { label: string; note: string })[];
  isEnterprise: boolean;
  stripeProductId: string;
  stripePriceId: string;
  stripeAnnualPriceId: string;
  popular: boolean;
}

// Helper to render features, underlining post-MVP ones
function renderFeature(feature: string, isPostMVP: boolean, index: number) {
  if (isPostMVP) {
    return (
      <li key={index} className="flex items-center gap-3">
        <Check className="h-5 w-5 text-green-500 flex-shrink-0" />
        <span
          className="underline decoration-dashed decoration-2 underline-offset-2 text-gray-500 cursor-help"
          title="Coming Soon"
        >
          {feature}
        </span>
      </li>
    );
  }
  return (
    <li key={index} className="flex items-center gap-3">
      <Check className="h-5 w-5 text-green-500 flex-shrink-0" />
      <span>{feature}</span>
    </li>
  );
}

// Define which features are post-MVP for each plan
const postMVPFeatures = [
  'Team Collaboration (up to 3 users)',
  'Team Collaboration (up to 10 users)',
  'Custom Integrations',
  'Custom Model Fine-tuning',
  'White-label Solutions',
  'Custom AI Model Fine-tuning',
  'Dedicated Account Manager',
  'Custom API Integration',
  'Advanced Security',
  'Compliance Features',
  'Custom Training',
  'Custom Development',
];

const ANNUAL_DISCOUNT = 0.15;
const subscriptionPlans = [
  {
    id: 'free',
    name: 'FREE',
    price: 0,
    period: 'month',
    description: 'Get started with the basics',
    features: [
      '100 credits/month (resets monthly, does not accumulate)',
      'Buy extra credits (never expire)',
      'Earn credits from upvotes (never expire)',
      {
        label: 'Up to 3 private prompts',
        note: 'If your prompts are large, your monthly credits may not cover all 3.'
      },
      'Create public prompts',
      'No version control',
      'Run prompt tests until credits are used',
    ],
    popular: false,
    isEnterprise: false,
    cta: 'Start Free',
    stripeProductId: '',
    stripePriceId: '',
    stripeAnnualPriceId: '',
  },
  {
    id: 'pro',
    name: 'PRO',
    price: 15.99,
    period: 'month',
    description: 'For professionals and creators',
    features: [
      '500 credits/month (resets monthly, does not accumulate)',
      'Buy extra credits at a lower rate (never expire)',
      'Earn bonus credits from upvotes (never expire)',
      {
        label: 'Up to 20 private prompts',
        note: 'More room for your best ideas—credit usage still applies.'
      },
      'Unlimited public prompts',
      'Prompt version control',
      'Advanced analytics',
      'Priority support',
      'Run prompt tests until credits are used',
    ],
    popular: true,
    isEnterprise: false,
    cta: 'Upgrade to Pro',
    stripeProductId: '',
    stripePriceId: '',
    stripeAnnualPriceId: '',
  },
];

const PricingSection = ({ 
  plans, 
  isAnnual, 
  setIsAnnual,
  user 
}: { 
  plans: Plan[], 
  isAnnual: boolean, 
  setIsAnnual: (value: boolean) => void,
  user?: {
    id: string;
    name: string;
    email: string;
    imageUrl: string;
  } | null;
}) => {
  const { isAuthenticated } = useAuth();

  const handleSubscribe = async (plan: Plan) => {
    try {
      if (!isAuthenticated) {
        // Redirect to sign up with return URL
        const returnUrl = encodeURIComponent('/pricing');
        window.location.href = `/sign-up?redirect_url=${returnUrl}`;
        return;
      }

      const priceId = isAnnual ? plan.stripeAnnualPriceId : plan.stripePriceId;
      
      const response = await fetch(`${window.location.origin}/api/billing/checkout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create checkout session');
      }

      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error('No checkout URL received');
      }
    } catch (error) {
      console.error('Error creating checkout session:', error);
      toast({
        title: 'Error',
        description: 'Failed to start subscription process. Please try again.',
        variant: 'destructive',
      });
    }
  };

  return (
    <section className="py-24 bg-gradient-to-b from-white to-gray-50 dark:from-black dark:to-gray-900">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">Simple, Transparent Pricing</h2>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            Choose the plan that best fits your needs
          </p>
          <div className="flex items-center justify-center gap-4 mt-8">
            <span className={cn("text-sm", !isAnnual && "text-blue-600 font-semibold")}>Monthly</span>
            <Switch
              checked={isAnnual}
              onCheckedChange={setIsAnnual}
              className="data-[state=checked]:bg-blue-600"
            />
            <span className={cn("text-sm", isAnnual && "text-blue-600 font-semibold")}>Annual <span className="text-green-500">(Save 15%)</span></span>
          </div>
        </div>

        {/* Subscription Plans */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto mb-32">
          {subscriptionPlans.map((plan) => (
            <div
              key={plan.name}
              className={cn(
                "relative rounded-2xl p-8 border transition-all duration-300 h-full flex flex-col",
                plan.popular
                  ? "ring-2 ring-blue-500 shadow-lg border-blue-400 bg-white/90"
                  : "border-gray-200 dark:border-gray-800 hover:border-blue-500 dark:hover:border-blue-500 bg-white/80"
              )}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
                  <span className="inline-block rounded-full bg-blue-100 px-3 py-1 text-sm font-semibold text-blue-700 dark:bg-blue-900/50 dark:text-blue-300 shadow-md border border-blue-200 dark:border-blue-800">
                    Most Popular
                  </span>
                </div>
              )}
              <div className="mb-8">
                <h3 className="text-2xl font-bold mb-2 text-center">{plan.name}</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4 text-center">{plan.description}</p>
                <div className="flex flex-col items-center justify-center gap-1">
                  {plan.price === null ? (
                    <>
                      <span className="text-4xl font-bold">Custom</span>
                    </>
                  ) : plan.name === 'FREE' ? (
                    <>
                      <span className="text-4xl font-bold">$0.00</span>
                      <span className="text-sm text-gray-500 dark:text-gray-400">/{isAnnual ? 'year' : 'month'}</span>
                    </>
                  ) : isAnnual ? (
                    <>
                      <span className="text-4xl font-bold">${((plan.price * 12 * (1 - ANNUAL_DISCOUNT)) / 12).toFixed(2)}/mo</span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">Billed ${(plan.price * 12 * (1 - ANNUAL_DISCOUNT)).toFixed(2)}/year (save 15%)</span>
                      <span className="text-xs text-gray-400">Original: ${(plan.price).toFixed(2)}/mo</span>
                    </>
                  ) : (
                    <>
                      <span className="text-4xl font-bold">${plan.price.toFixed(2)}/mo</span>
                    </>
                  )}
                </div>
              </div>
              <ul className="space-y-4 mb-8 flex-grow">
                {plan.features.map((feature, index) => {
                  if (typeof feature === 'string') {
                    return (
                      <li key={index} className="flex items-center gap-3">
                        <Check className="h-5 w-5 text-green-500 flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    );
                  }
                  // For features with a note (object)
                  return (
                    <li key={index} className="flex items-center gap-3">
                      <Check className="h-5 w-5 text-green-500 flex-shrink-0" />
                      <span>
                        {feature.label}
                        <span
                          className="ml-2 text-gray-400 cursor-help underline decoration-dashed decoration-2 underline-offset-2"
                          title={feature.note}
                        >
                          (i)
                        </span>
                      </span>
                    </li>
                  );
                })}
              </ul>
              <button
                onClick={() => handleSubscribe({ 
                  ...plans[0], 
                  name: plan.name,
                  price: plan.price || 0,
                  stripePriceId: plan.isEnterprise ? 'enterprise' : plans[0].stripePriceId,
                  stripeAnnualPriceId: plan.isEnterprise ? 'enterprise' : plans[0].stripeAnnualPriceId,
                  popular: plan.popular,
                  isEnterprise: plan.isEnterprise
                })}
                className={cn(
                  "w-full py-3 px-6 rounded-lg font-semibold transition-all duration-300 mt-auto",
                  plan.isEnterprise
                    ? "bg-blue-600 text-white hover:bg-blue-700"
                    : plan.name === 'FREE'
                    ? "bg-white text-blue-600 border-2 border-blue-600 hover:bg-blue-50 dark:bg-black dark:hover:bg-blue-950/20"
                    : "bg-blue-600 text-white hover:bg-blue-700"
                )}
              >
                {plan.isEnterprise 
                  ? "Contact Sales" 
                  : plan.name === 'FREE'
                  ? "Start Free Trial"
                  : "Start Free Trial"
                }
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const PromptHiveLandingClient = ({ user }: PromptHiveLandingClientProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const { theme, setTheme } = useTheme();
  const [featuredPrompts, setFeaturedPrompts] = useState<any[]>([]);
  const [loadingFeatured, setLoadingFeatured] = useState(true);
  const [featuredError, setFeaturedError] = useState<string | null>(null);
  const [livePreview, setLivePreview] = useState({
    input: "Create a detailed prompt for",
    output: "Create a detailed prompt for a professional product description that highlights key features, benefits, and unique selling points. Include specific tone, style, and target audience guidelines.",
    isEnhancing: false,
    context: {
      type: 'product',
      tone: 'professional',
      style: 'descriptive'
    }
  });
  const [isAnnual, setIsAnnual] = useState(false);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loadingPlans, setLoadingPlans] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial(prev => (prev + 1) % testimonials.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    async function fetchFeaturedPrompts() {
      setLoadingFeatured(true);
      setFeaturedError(null);
      try {
        const res = await fetch('/api/prompts/featured');
        const data = await res.json();
        setFeaturedPrompts(data.prompts || []);
      } catch (err) {
        setFeaturedError('Failed to load featured prompts.');
      } finally {
        setLoadingFeatured(false);
      }
    }
    fetchFeaturedPrompts();
  }, []);

  useEffect(() => {
    async function fetchPlans() {
      try {
        const response = await fetch('/api/plans');
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Failed to fetch plans');
        setPlans(data.plans);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load plans');
      } finally {
        setLoadingPlans(false);
      }
    }
    fetchPlans();
  }, []);

  const features = [
    {
      icon: <Sparkles className="h-6 w-6" />,
      title: 'Advanced Prompt Engineering',
      description: 'Leverage state-of-the-art AI models to craft precise, context-aware prompts that deliver exceptional results',
      highlight: 'Best-in-class AI models',
    },
    {
      icon: <Target className="h-6 w-6" />,
      title: 'Prompt Optimization',
      description: 'Fine-tune your prompts with real-time feedback and performance metrics to achieve optimal results',
      highlight: 'Performance analytics',
    },
    {
      icon: <BarChart className="h-6 w-6" />,
      title: 'Prompt Version Control',
      description: 'Track, manage, and revert changes to your prompts with robust version control tools.',
      highlight: 'Full history & rollback',
    },
    {
      icon: <Users className="h-6 w-6" />,
      title: 'Community-Powered Prompts',
      description: 'Access and contribute to a growing library of public prompts, and earn rewards for your contributions.',
      highlight: 'Earn credits & collaborate',
    },
  ];

  const getAnnualPrice = (price: string) => {
    const numericPrice = parseFloat(price.replace('$', ''));
    return `$${(numericPrice * 12 * 0.8).toFixed(2)}`; // 20% discount for annual
  };

  const pricingPlans = [
    {
      title: 'Pro',
      description: 'Perfect for individual prompt engineers and freelancers',
      price: '$15.99',
      period: 'month',
      features: [
        '500 Testing Runs/month',
        'Up to 20 Private Prompts',
        'Access to Community Prompts',
        'Advanced Analytics',
        'Priority Support',
      ],
      highlight: 'Most Popular',
      cta: 'Start Free Trial',
      popular: true,
    },
  ];

  const testimonials = [
    {
      name: 'Dr. Sarah Chen',
      role: 'AI Research Lead',
      company: 'OpenAI',
      content:
        "PromptHive has become an essential tool in our research workflow. The platform's ability to generate and optimize prompts has significantly improved our model training and evaluation processes.",
      avatar: 'SC',
      rating: 5,
      highlight: 'Research Essential',
    },
    {
      name: 'Michael Rodriguez',
      role: 'Senior Prompt Engineer',
      company: 'Anthropic',
      content:
        "PromptHive has transformed how we approach prompt engineering. The quality and consistency of the generated prompts are outstanding, and the API integration works flawlessly with our existing infrastructure. It's become an essential part of our development toolkit.",
      avatar: 'MR',
      rating: 5,
      highlight: 'Essential toolkit',
    },
    {
      name: 'Emma Thompson',
      role: 'AI Product Manager',
      company: 'Microsoft',
      content:
        "The collaborative features in PromptHive have revolutionized how our team works with prompts. The version control and analytics capabilities have made it much easier to maintain high-quality, consistent outputs across our applications.",
      avatar: 'ET',
      rating: 5,
      highlight: 'Team Collaboration',
    },
  ];

  const AnimatedBackground = () => (
    <div className="pointer-events-none fixed inset-0 overflow-hidden">
      <div
        className="absolute h-96 w-96 animate-pulse rounded-full bg-blue-500/10 blur-3xl"
        style={{
          left: mousePosition.x - 200,
          top: mousePosition.y - 200,
          transition: 'all 0.3s ease-out',
        }}
      />
      <div className="animate-bounce-slow absolute left-1/4 top-1/4 h-64 w-64 rounded-full bg-blue-500/5 blur-2xl" />
      <div className="animate-pulse-slow absolute bottom-1/4 right-1/4 h-80 w-80 rounded-full bg-blue-500/5 blur-3xl" />
    </div>
  );

  const FloatingCard = ({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) => (
    <div className="animate-float" style={{ animationDelay: `${delay}s` }}>
      {children}
    </div>
  );

  const GradientButton = ({ children, className = '', ...props }: any) => (
    <button
      className={`group relative transform overflow-hidden rounded-full bg-gradient-to-r from-blue-600 to-blue-500 px-8 py-3 font-semibold text-white transition-all duration-300 hover:scale-105 hover:from-blue-700 hover:to-blue-700 ${className}`}
      {...props}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-blue-500 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      <div className="relative flex items-center gap-2">{children}</div>
    </button>
  );

  const enhancePrompt = (input: string) => {
    setLivePreview(prev => ({ ...prev, isEnhancing: true }));
    
    setTimeout(() => {
      const enhancedOutput = `Create a detailed prompt for ${input} that:
• Maintains a professional and engaging tone
• Includes specific guidelines for structure and format
• Considers target audience and their needs
• Incorporates relevant industry best practices
• Optimizes for clarity and effectiveness`;
      
      setLivePreview(prev => ({
        ...prev,
        output: enhancedOutput,
        isEnhancing: false,
        context: {
          type: input.toLowerCase().includes('product') ? 'product' : 'content',
          tone: 'professional',
          style: 'descriptive'
        }
      }));
    }, 800);
  };

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      if (livePreview.input.length > 10) {
        enhancePrompt(livePreview.input);
      }
    }, 500);

    return () => clearTimeout(debounceTimer);
  }, [livePreview.input]);

  const handleSignOut = async () => {
    try {
      const response = await fetch('/api/auth/signout', {
        method: 'POST',
        credentials: 'include',
      });
      
      if (response.ok) {
        window.location.href = '/sign-in';
      } else {
        console.error('Sign out failed');
      }
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const handleSubscribe = async (plan: Plan) => {
    try {
      if (!isAuthenticated) {
        // Redirect to sign up with return URL
        const returnUrl = encodeURIComponent('/pricing');
        window.location.href = `/sign-up?redirect_url=${returnUrl}`;
        return;
      }

      const priceId = isAnnual ? plan.stripeAnnualPriceId : plan.stripePriceId;
      
      const response = await fetch(`${window.location.origin}/api/billing/checkout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create checkout session');
      }

      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error('No checkout URL received');
      }
    } catch (error) {
      console.error('Error creating checkout session:', error);
      toast({
        title: 'Error',
        description: 'Failed to start subscription process. Please try again.',
        variant: 'destructive',
      });
    }
  };

  return (
    <>
      <Head>
        <title>PromptHive - AI-Powered Prompt Generation Platform</title>
        <meta
          name="description"
          content="Transform your ideas into detailed, effective prompts with our AI-powered platform. Perfect for content creators, marketers, and AI enthusiasts."
        />
        <meta
          name="keywords"
          content="AI prompts, prompt engineering, content creation, marketing tools, AI assistance"
        />
        <link rel="canonical" href="http://prompthive.co/" />

        {/* PWA Meta Tags */}
        <meta name="application-name" content="PromptHive" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="PromptHive" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="theme-color" content="#9333ea" />

        {/* PWA Icons */}
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        <link rel="manifest" href="/manifest.json" />

        {/* Open Graph */}
        <meta property="og:title" content="PromptHive - AI-Powered Prompt Generation Platform" />
        <meta
          property="og:description"
          content="Transform your ideas into detailed, effective prompts with our AI-powered platform. Perfect for content creators, marketers, and AI enthusiasts."
        />
        <meta property="og:image" content="http://prompthive.co/og-image.jpg" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="http://prompthive.co/" />

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="PromptHive - AI-Powered Prompt Generation Platform" />
        <meta
          name="twitter:description"
          content="Transform your ideas into detailed, effective prompts with our AI-powered platform. Perfect for content creators, marketers, and AI enthusiasts."
        />
        <meta name="twitter:image" content="http://prompthive.co/og-image.jpg" />

        {/* Structured Data */}
        <Script
          id="structured-data"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </Head>

      <div
        className={`relative min-h-screen bg-white text-gray-900 transition-colors duration-300 dark:bg-black dark:text-white`}
      >

        <AnimatedBackground />

        {/* Navigation */}
        <header className="fixed top-0 z-50 w-full border-b border-gray-200 bg-white/90 backdrop-blur-xl dark:border-gray-800 dark:bg-black/90">
          <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between py-4">
              <div className="flex items-center space-x-3">
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-r from-blue-500 to-blue-500"
                  aria-label="PromptHive Logo"
                >
                  <Sparkles className="h-6 w-6 text-white" aria-hidden="true" />
                </div>
                <span className="bg-gradient-to-r from-blue-400 to-blue-400 bg-clip-text text-2xl font-bold text-transparent">
                  PromptHive
                </span>
              </div>
              <div className="hidden items-center space-x-8 md:flex">
                <div className="flex items-center space-x-6">
                  <a
                    href="#features"
                    className="text-sm font-medium text-gray-700 transition-colors hover:text-blue-600 dark:text-gray-200 dark:hover:text-blue-300"
                    aria-label="Features section"
                  >
                    Features
                  </a>
                  <a
                    href="#pricing"
                    className="text-sm font-medium text-gray-700 transition-colors hover:text-blue-600 dark:text-gray-200 dark:hover:text-blue-300"
                    aria-label="Pricing section"
                  >
                    Pricing
                  </a>
                  <a
                    href="#testimonials"
                    className="text-sm font-medium text-gray-700 transition-colors hover:text-blue-600 dark:text-gray-200 dark:hover:text-blue-300"
                    aria-label="Customer reviews"
                  >
                    Reviews
                  </a>
                </div>
                <div className="flex items-center space-x-4">
                  {user ? (
                    <>
                      <a 
                        href="/account" 
                        className="group flex items-center gap-2 text-sm font-medium text-gray-700 transition-colors hover:text-blue-600 dark:text-gray-200 dark:hover:text-blue-300"
                      >
                        <span>Go to App</span>
                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </a>
                      <div className="flex items-center gap-3">
                        <img
                          src={user.imageUrl}
                          alt={user.name}
                          className="h-8 w-8 rounded-full border-2 border-blue-500/20"
                        />
                        <button
                          onClick={handleSignOut}
                          className="text-sm font-medium text-gray-700 transition-colors hover:text-blue-600 dark:text-gray-200 dark:hover:text-blue-300"
                          aria-label="Sign out"
                        >
                          Sign Out
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <a
                        href="/sign-in"
                        className="text-sm font-medium text-gray-700 transition-colors hover:text-blue-600 dark:text-gray-200 dark:hover:text-blue-300"
                        aria-label="Sign in to your account"
                      >
                        Sign In
                      </a>
                      <a href="/sign-up">
                        <GradientButton className="px-6 py-2 text-sm" aria-label="Get started with PromptHive">
                          Sign Up
                        </GradientButton>
                      </a>
                    </>
                  )}
                </div>
              </div>
              <button
                className="md:hidden"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
                aria-expanded={isMenuOpen}
              >
                {isMenuOpen ? (
                  <X className="h-6 w-6" aria-hidden="true" />
                ) : (
                  <Menu className="h-6 w-6" aria-hidden="true" />
                )}
              </button>
            </div>
          </nav>
          {/* Mobile Menu */}
          {isMenuOpen && (
            <div
              className="border-t border-gray-200 bg-white/95 backdrop-blur-xl dark:border-gray-800 dark:bg-black/95 md:hidden"
              role="navigation"
              aria-label="Mobile menu"
            >
              <div className="space-y-4 px-4 py-6">
                <div className="space-y-3">
                  <a
                    href="#features"
                    className="block text-sm font-medium text-gray-700 transition-colors hover:text-blue-600 dark:text-gray-200 dark:hover:text-blue-300"
                    aria-label="Features section"
                  >
                    Features
                  </a>
                  <a
                    href="#pricing"
                    className="block text-sm font-medium text-gray-700 transition-colors hover:text-blue-600 dark:text-gray-200 dark:hover:text-blue-300"
                    aria-label="Pricing section"
                  >
                    Pricing
                  </a>
                  <a
                    href="#testimonials"
                    className="block text-sm font-medium text-gray-700 transition-colors hover:text-blue-600 dark:text-gray-200 dark:hover:text-blue-300"
                    aria-label="Customer reviews"
                  >
                    Reviews
                  </a>
                </div>
                <div className="border-t border-gray-200 pt-4 dark:border-gray-800">
                  {user ? (
                    <>
                      <a 
                        href="/account" 
                        className="group mb-4 flex items-center gap-2 text-sm font-medium text-gray-700 transition-colors hover:text-blue-600 dark:text-gray-200 dark:hover:text-blue-300"
                      >
                        <span>Go to App</span>
                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </a>
                      <div className="flex items-center gap-3">
                        <img
                          src={user.imageUrl}
                          alt={user.name}
                          className="h-8 w-8 rounded-full border-2 border-blue-500/20"
                        />
                        <button
                          onClick={handleSignOut}
                          className="text-sm font-medium text-gray-700 transition-colors hover:text-blue-600 dark:text-gray-200 dark:hover:text-blue-300"
                          aria-label="Sign out"
                        >
                          Sign Out
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <a
                        href="/sign-in"
                        className="mb-4 block text-sm font-medium text-gray-700 transition-colors hover:text-blue-600 dark:text-gray-200 dark:hover:text-blue-300"
                        aria-label="Sign in to your account"
                      >
                        Sign In
                      </a>
                      <a href="/sign-up" className="block">
                        <GradientButton className="w-full text-sm" aria-label="Get started with PromptHive">
                          Sign Up
                        </GradientButton>
                      </a>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}
        </header>

        {/* Hero Section */}
        <main>
          <section className="relative px-4 pb-20 pt-32 sm:px-6 lg:px-8" aria-labelledby="hero-heading">
            <div className="mx-auto max-w-7xl">
              <div className="grid gap-12 lg:grid-cols-2">
                {/* Left Column - Hero Content */}
                <div className="flex flex-col justify-center">
                  <FloatingCard>
                    <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-100/40 px-4 py-2 dark:border-blue-500/20 dark:bg-blue-500/10">
                      <Sparkles className="h-4 w-4 text-blue-400" aria-hidden="true" />
                      <span className="text-sm text-blue-700 dark:text-blue-300">
                        AI-Powered Prompt Engineering
                      </span>
                    </div>
                  </FloatingCard>

                  <FloatingCard delay={0.2}>
                    <h1 id="hero-heading" className="mb-6 text-5xl font-bold leading-tight md:text-7xl">
                      Craft
                      <span className="animate-gradient bg-300% ml-4 bg-gradient-to-r from-blue-400 via-blue-400 to-blue-400 bg-clip-text text-transparent">
                        Perfect Prompts
                      </span>
                      <br />
                      Like a Pro
                    </h1>
                  </FloatingCard>

                  <FloatingCard delay={0.4}>
                    <p className="mb-8 text-xl leading-relaxed text-gray-600 dark:text-gray-300">
                      Transform your ideas into detailed, effective prompts with PromptHive's AI-powered platform. 
                      Perfect for content creators, marketers, and AI enthusiasts.
                    </p>
                  </FloatingCard>

                  <FloatingCard delay={0.6}>
                    <div className="mb-12 flex flex-col gap-4 sm:flex-row sm:items-center">
                      {user ? (
                        <a href="/account">
                          <GradientButton className="px-12 py-4 text-lg">
                            Go to App <ArrowRight className="ml-2 h-5 w-5" />
                          </GradientButton>
                        </a>
                      ) : (
                        <>
                          <a href="/sign-up">
                            <GradientButton className="px-12 py-4 text-lg">
                              Get Started Free <ArrowRight className="ml-2 h-5 w-5" />
                            </GradientButton>
                          </a>
                          <a href="#demo" className="group flex items-center gap-2 text-lg font-semibold text-blue-600 transition-colors hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300">
                            <Play className="h-5 w-5" />
                            Watch Demo
                          </a>
                        </>
                      )}
                    </div>
                  </FloatingCard>

                  {/* Stats */}
                  <FloatingCard delay={0.8}>
                    <div className="grid grid-cols-3 gap-8">
                      {[
                        { number: '50K+', label: 'Prompts Generated' },
                        { number: '10K+', label: 'Happy Users' },
                        { number: '99.9%', label: 'Uptime' },
                      ].map((stat, index) => (
                        <div key={index} className="text-center">
                          <div className="mb-2 bg-gradient-to-r from-blue-400 to-blue-400 bg-clip-text text-4xl font-bold text-transparent">
                            {stat.number}
                          </div>
                          <div className="text-gray-600 dark:text-gray-400">{stat.label}</div>
                        </div>
                      ))}
                    </div>
                  </FloatingCard>
                </div>

                {/* Right Column - Live Preview */}
                <div className="relative">
                  <div className="sticky top-32">
                    <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-xl transition-all duration-300 hover:shadow-2xl dark:border-gray-800 dark:bg-gray-900">
                      <div className="mb-6 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-r from-blue-600 to-blue-500">
                            <Sparkles className="h-5 w-5 text-white" />
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Live Preview</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">See your prompt transform in real-time</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 rounded-full bg-green-50 px-3 py-1.5 dark:bg-green-900/20">
                          <span className="h-2 w-2 animate-pulse rounded-full bg-green-500"></span>
                          <span className="text-sm font-medium text-green-700 dark:text-green-400">Real-time</span>
                        </div>
                      </div>

                      <div className="mb-6">
                        <div className="mb-2 flex items-center justify-between">
                          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Your Input
                          </label>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {livePreview.input.length}/100 characters
                          </span>
                        </div>
                        <div className="relative">
                          <input
                            type="text"
                            value={livePreview.input}
                            onChange={(e) => setLivePreview(prev => ({ ...prev, input: e.target.value }))}
                            className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-gray-900 placeholder-gray-400 transition-all duration-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:placeholder-gray-500"
                            placeholder="Type your prompt idea..."
                            maxLength={100}
                          />
                          <div className="absolute right-3 top-1/2 -translate-y-1/2">
                            <Sparkles className={`h-5 w-5 ${livePreview.isEnhancing ? 'animate-pulse text-blue-500' : 'text-blue-500'}`} />
                          </div>
                        </div>
                      </div>

                      <div>
                        <div className="mb-2 flex items-center justify-between">
                          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Enhanced Prompt
                          </label>
                          <button 
                            className="text-xs font-medium text-blue-600 transition-colors hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                            onClick={() => navigator.clipboard.writeText(livePreview.output)}
                          >
                            Copy to clipboard
                          </button>
                        </div>
                        <div className="relative min-h-[120px] rounded-xl border border-gray-200 bg-gray-50 p-4 text-gray-900 transition-all duration-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white">
                          <div className="prose prose-sm dark:prose-invert max-w-none">
                            {livePreview.output}
                          </div>
                          <div className="absolute bottom-2 right-2">
                            <div className="flex items-center gap-1.5 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700 dark:bg-blue-900/50 dark:text-blue-300">
                              <Sparkles className={`h-3.5 w-3.5 ${livePreview.isEnhancing ? 'animate-pulse' : ''}`} />
                              {livePreview.isEnhancing ? 'Enhancing...' : 'AI-enhanced'}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="mt-6 space-y-3">
                        <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                          <div className="flex items-center gap-2">
                            <div className={`h-2 w-2 rounded-full ${livePreview.isEnhancing ? 'animate-pulse bg-blue-500' : 'bg-blue-500'}`}></div>
                            <span>Real-time enhancement</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                            <span>Context-aware</span>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <div className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700 dark:bg-blue-900/50 dark:text-blue-300">
                            Type: {livePreview.context.type}
                          </div>
                          <div className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700 dark:bg-blue-900/50 dark:text-blue-300">
                            Tone: {livePreview.context.tone}
                          </div>
                          <div className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700 dark:bg-blue-900/50 dark:text-blue-300">
                            Style: {livePreview.context.style}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Featured Community Prompts Section */}
          <section
            className="bg-gray-50 py-12 dark:bg-gray-900/40"
            aria-labelledby="featured-community-prompts-heading"
          >
            <div className="mx-auto max-w-7xl px-4">
              <h2
                id="featured-community-prompts-heading"
                className="mb-4 flex items-center gap-2 text-2xl font-bold text-gray-900 dark:text-white"
              >
                <Sparkles
                  className="h-5 w-5 text-blue-700 dark:text-blue-300"
                  aria-hidden="true"
                />
                Featured Community Prompts
              </h2>
              {loadingFeatured ? (
                <div className="py-8 text-center text-gray-600 dark:text-gray-400">Loading...</div>
              ) : featuredError ? (
                <div className="py-8 text-center text-red-600 dark:text-red-400">
                  {featuredError}
                </div>
              ) : featuredPrompts.length === 0 ? (
                <div className="py-8 text-center text-gray-600 dark:text-gray-400">
                  No featured prompts found.
                </div>
              ) : (
                <div className="grid gap-x-10 gap-y-8 md:grid-cols-3">
                  {featuredPrompts.map(prompt => (
                    <FloatingCard key={prompt.id}>
                      <div className="group relative rounded-2xl border-2 border-gray-200 bg-white p-6 pt-10 shadow-lg transition-all duration-300 focus-within:ring-2 focus-within:ring-blue-500 hover:-translate-y-2 hover:shadow-xl dark:border-gray-800 dark:bg-gray-900">
                        <div className="absolute -top-4 left-4 flex items-center gap-2">
                          <Badge className="rounded-full border border-white bg-gradient-to-r from-blue-700 to-blue-500 px-3 py-1 font-semibold text-white shadow dark:border-gray-900">
                            Featured
                          </Badge>
                        </div>
                        <h3 className="mb-2 bg-gradient-to-r from-blue-700 to-blue-500 bg-clip-text text-xl font-bold text-transparent dark:from-blue-300 dark:to-blue-300">
                          <Link href={`/community-prompts/${prompt.slug}`}>{prompt.name}</Link>
                        </h3>
                        <p className="mb-3 line-clamp-3 text-gray-800 dark:text-gray-100">
                          {prompt.description}
                        </p>
                        <div className="mb-3 flex flex-wrap gap-2">
                          {prompt.tags.map((tag: any) => (
                            <Badge
                              key={tag.id}
                              className="border border-blue-300 bg-blue-200 font-medium text-blue-900 dark:border-blue-700 dark:bg-blue-800 dark:text-blue-100"
                            >
                              {tag.name}
                            </Badge>
                          ))}
                        </div>
                        <div className="mt-2 flex items-center gap-2">
                          <span className="inline-flex items-center gap-1 text-base font-bold text-blue-800 dark:text-blue-200">
                            <Star className="h-4 w-4 fill-current text-yellow-400" />
                            {prompt.upvotes}
                          </span>
                          <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
                            upvotes
                          </span>
                        </div>
                      </div>
                    </FloatingCard>
                  ))}
                </div>
              )}
              <div className="mt-8 text-center">
                <Link
                  className="inline-block text-lg font-semibold text-blue-800 hover:underline dark:text-blue-200"
                >
                  See all community prompts &rarr;
                </Link>
              </div>
            </div>
          </section>

          {/* Features Section */}
          <section id="features" className="px-4 py-20 sm:px-6 lg:px-8" aria-labelledby="features-heading">
            <div className="mx-auto max-w-7xl">
              <div className="mb-12 text-center">
                <h2 id="features-heading" className="mb-4 text-3xl font-bold md:text-4xl">
                  Everything you need for
                  <span className="ml-3 bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text text-transparent">
                    Prompt Engineering
                  </span>
                </h2>
                <p className="mx-auto max-w-2xl text-lg text-gray-600 dark:text-gray-300">
                  Create, optimize, and deploy world-class prompts with PromptHive's all-in-one platform.
                </p>
              </div>
              <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
                {[
                  {
                    icon: <Sparkles className="h-6 w-6" />,
                    title: 'Advanced Prompt Engineering',
                    description: 'Leverage state-of-the-art AI models to craft precise, context-aware prompts that deliver exceptional results.',
                    highlight: 'Best-in-class AI models',
                  },
                  {
                    icon: <Target className="h-6 w-6" />,
                    title: 'Prompt Optimization',
                    description: 'Fine-tune your prompts with real-time feedback and performance metrics to achieve optimal results.',
                    highlight: 'Performance analytics',
                  },
                  {
                    icon: <BarChart className="h-6 w-6" />,
                    title: 'Prompt Version Control',
                    description: 'Track, manage, and revert changes to your prompts with robust version control tools.',
                    highlight: 'Full history & rollback',
                  },
                  {
                    icon: <Users className="h-6 w-6" />,
                    title: 'Community-Powered Prompts',
                    description: 'Access and contribute to a growing library of public prompts, and earn rewards for your contributions.',
                    highlight: 'Earn credits & collaborate',
                  },
                ].map((feature, index) => (
                  <div key={index} className="rounded-xl border border-gray-200 bg-white p-6 shadow-md transition-all duration-300 hover:-translate-y-1 hover:border-blue-500/50 hover:shadow-lg dark:border-gray-800 dark:bg-gray-900">
                    <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-r from-blue-600 to-blue-500">
                      {feature.icon}
                    </div>
                    <h3 className="mb-2 text-lg font-semibold">{feature.title}</h3>
                    <p className="mb-2 text-gray-600 dark:text-gray-300 text-sm">{feature.description}</p>
                    <span className="inline-block rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700 dark:bg-blue-900/50 dark:text-blue-300">
                      {feature.highlight}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Pricing Section */}
          <section id="pricing">
            <PricingSection 
              plans={plans} 
              isAnnual={isAnnual} 
              setIsAnnual={setIsAnnual} 
              user={user} 
            />
          </section>

          {/* Testimonials Section
          <section id="testimonials" className="px-4 py-20 sm:px-6 lg:px-8" aria-labelledby="testimonials-heading">
            <div className="mx-auto max-w-4xl">
              <div className="mb-12 text-center">
                <h2 id="testimonials-heading" className="mb-4 text-3xl font-bold md:text-4xl">
                  Loved by
                  <span className="ml-3 bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text text-transparent">
                    Industry Leaders
                  </span>
                </h2>
                <p className="mx-auto max-w-2xl text-lg text-gray-600 dark:text-gray-300">
                  Join thousands of prompt engineers already achieving better results with PromptHive.
                </p>
              </div>
              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                {testimonials.map((testimonial, index) => (
                  <div
                    key={index}
                    className="rounded-xl border border-gray-200 bg-white p-6 shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-lg dark:border-gray-800 dark:bg-gray-900"
                  >
                    <div className="mb-4 flex items-center gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-blue-600 to-blue-500 font-bold text-white">
                        {testimonial.avatar}
                      </div>
                      <div>
                        <div className="font-semibold">{testimonial.name}</div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">
                          {testimonial.role} at {testimonial.company}
                        </div>
                      </div>
                    </div>
                    <p className="mb-4 text-gray-600 dark:text-gray-300 text-sm">
                      {testimonial.content}
                    </p>
                    <div className="flex items-center gap-1">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="h-4 w-4 fill-current text-yellow-400" />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section> */}

          {/* CTA Section */}
          <section className="px-4 py-20 sm:px-6 lg:px-8" aria-labelledby="cta-heading">
            <div className="mx-auto max-w-3xl text-center">
              <div className="rounded-3xl border border-blue-200 bg-white p-10 shadow-xl dark:border-gray-800 dark:bg-gray-900">
                <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-4 py-2 dark:border-blue-500/20 dark:bg-blue-500/10">
                  <Sparkles className="h-4 w-4 text-blue-500" />
                  <span className="text-sm text-blue-700 dark:text-blue-300">
                    Start Building Better Prompts Today
                  </span>
                </div>
                <h2 id="cta-heading" className="mb-4 text-3xl font-bold md:text-4xl">
                  Get Started Free
                  <span className="ml-3 bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text text-transparent">
                    with PromptHive
                  </span>
                </h2>
                <p className="mx-auto mb-8 max-w-xl text-lg text-gray-600 dark:text-gray-300">
                  Unlock the power of advanced prompt engineering, version control, and a thriving community—all with our forever free plan. Upgrade anytime for even more features.
                </p>
                <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
                  <a href="/sign-up">
                    <GradientButton className="w-full px-8 py-4 text-lg sm:w-auto">
                      Try Free Plan <ArrowRight className="ml-2 h-5 w-5" />
                    </GradientButton>
                  </a>
                  <a href="#demo" className="group flex w-full items-center justify-center gap-2 text-lg font-semibold text-blue-600 transition-colors hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 sm:w-auto">
                    <Play className="h-5 w-5" />
                    Watch Demo
                  </a>
                </div>
                <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
                  No credit card required • Free forever plan available • 14-day Pro trial included
                </p>
              </div>
            </div>
          </section>
        </main>
      </div>
    </>
  );
};

export default PromptHiveLandingClient;