'use client';
import React, { useState, useEffect } from 'react';
import {
  ChevronRight,
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
} from 'lucide-react';
import Head from 'next/head';
import Script from 'next/script';
import { useTheme } from 'next-themes';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { ComingSoonDialog } from '@/components/ComingSoonDialog';

// SEO metadata
const metadata = {
  title: 'PromptCraft - AI-Powered Prompt Generation Platform',
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
  name: 'PromptCraft',
  applicationCategory: 'BusinessApplication',
  operatingSystem: 'Web',
  offers: {
    '@type': 'Offer',
    price: '9.00',
    priceCurrency: 'USD',
  },
  aggregateRating: {
    '@type': 'AggregateRating',
    ratingValue: '4.9',
    ratingCount: '1000',
  },
};

const PromptCraftLandingClient = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const { theme, setTheme } = useTheme();
  const [featuredPrompts, setFeaturedPrompts] = useState<any[]>([]);
  const [loadingFeatured, setLoadingFeatured] = useState(true);
  const [featuredError, setFeaturedError] = useState<string | null>(null);

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

  const features = [
    {
      icon: <Sparkles className="h-6 w-6" />,
      title: 'AI-Powered Generation',
      description: 'Advanced algorithms create contextually perfect prompts for any use case',
    },
    {
      icon: <Target className="h-6 w-6" />,
      title: 'Precision Targeting',
      description: 'Fine-tune your prompts for specific audiences and outcomes',
    },
    {
      icon: <Zap className="h-6 w-6" />,
      title: 'Lightning Fast',
      description: 'Generate detailed prompts in seconds, not hours',
    },
    {
      icon: <Users className="h-6 w-6" />,
      title: 'Team Collaboration',
      description: 'Share and iterate on prompts with your entire team',
    },
  ];

  const pricingPlans = [
    {
      name: 'Starter',
      price: '$9',
      period: '/month',
      description: 'Perfect for individuals getting started',
      features: ['100 prompts/month', 'Basic templates', 'Email support', 'Export options'],
      popular: false,
    },
    {
      name: 'Professional',
      price: '$29',
      period: '/month',
      description: 'Ideal for professionals and small teams',
      features: [
        '1,000 prompts/month',
        'Advanced templates',
        'Priority support',
        'Team collaboration',
        'Custom branding',
      ],
      popular: true,
    },
    {
      name: 'Enterprise',
      price: '$99',
      period: '/month',
      description: 'For large teams and organizations',
      features: [
        'Unlimited prompts',
        'Custom templates',
        'Dedicated support',
        'Advanced analytics',
        'API access',
        'White-label',
      ],
      popular: false,
    },
  ];

  const testimonials = [
    {
      name: 'Sarah Chen',
      role: 'Content Marketing Manager',
      company: 'TechFlow',
      content:
        "PromptCraft transformed our content creation process. We're generating 10x better prompts in half the time.",
      avatar: 'SC',
    },
    {
      name: 'Michael Rodriguez',
      role: 'AI Researcher',
      company: 'InnovateLab',
      content:
        "The precision and quality of prompts generated is incredible. It's like having an expert prompt engineer on demand.",
      avatar: 'MR',
    },
    {
      name: 'Emma Thompson',
      role: 'Marketing Director',
      company: 'GrowthCorp',
      content:
        "Our team's productivity skyrocketed. PromptCraft is now essential to our daily workflow.",
      avatar: 'ET',
    },
  ];

  const AnimatedBackground = () => (
    <div className="pointer-events-none fixed inset-0 overflow-hidden">
      <div
        className="absolute h-96 w-96 animate-pulse rounded-full bg-purple-500/10 blur-3xl"
        style={{
          left: mousePosition.x - 200,
          top: mousePosition.y - 200,
          transition: 'all 0.3s ease-out',
        }}
      />
      <div className="animate-bounce-slow absolute left-1/4 top-1/4 h-64 w-64 rounded-full bg-pink-500/5 blur-2xl" />
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
      className={`group relative transform overflow-hidden rounded-full bg-gradient-to-r from-purple-600 to-pink-600 px-8 py-3 font-semibold text-white transition-all duration-300 hover:scale-105 hover:from-purple-700 hover:to-pink-700 ${className}`}
      {...props}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      <div className="relative flex items-center gap-2">{children}</div>
    </button>
  );

  return (
    <>
      <Head>
        <title>PromptCraft - AI-Powered Prompt Generation Platform</title>
        <meta
          name="description"
          content="Transform your ideas into detailed, effective prompts with our AI-powered platform. Perfect for content creators, marketers, and AI enthusiasts."
        />
        <meta
          name="keywords"
          content="AI prompts, prompt engineering, content creation, marketing tools, AI assistance"
        />
        <link rel="canonical" href="http://PromptCraft.co/" />

        {/* PWA Meta Tags */}
        <meta name="application-name" content="PromptCraft" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="PromptCraft" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="theme-color" content="#9333ea" />

        {/* PWA Icons */}
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        <link rel="manifest" href="/manifest.json" />

        {/* Open Graph */}
        <meta property="og:title" content="PromptCraft - AI-Powered Prompt Generation Platform" />
        <meta
          property="og:description"
          content="Transform your ideas into detailed, effective prompts with our AI-powered platform. Perfect for content creators, marketers, and AI enthusiasts."
        />
        <meta property="og:image" content="http://PromptCraft.co/og-image.jpg" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="http://PromptCraft.co/" />

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="PromptCraft - AI-Powered Prompt Generation Platform" />
        <meta
          name="twitter:description"
          content="Transform your ideas into detailed, effective prompts with our AI-powered platform. Perfect for content creators, marketers, and AI enthusiasts."
        />
        <meta name="twitter:image" content="http://PromptCraft.co/og-image.jpg" />

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
        {/* Light/Dark Mode Toggle */}
        <div className="fixed right-4 top-4 z-50">
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="rounded-full bg-gradient-to-r from-purple-600 to-pink-600 p-2 text-white shadow-md transition-transform hover:scale-110"
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>
        </div>

        <AnimatedBackground />

        {/* Navigation */}
        <header className="fixed top-0 z-50 w-full border-b border-gray-200 bg-white/90 backdrop-blur-xl dark:border-gray-800 dark:bg-black/90">
          <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between py-4">
              <div className="flex items-center space-x-3">
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-r from-purple-500 to-pink-500"
                  aria-label="PromptCraft Logo"
                >
                  <Sparkles className="h-6 w-6 text-white" aria-hidden="true" />
                </div>
                <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-2xl font-bold text-transparent">
                  PromptCraft
                </span>
              </div>
              <div className="hidden items-center space-x-8 md:flex">
                <a
                  href="#features"
                  className="transition-colors hover:text-purple-500 dark:hover:text-purple-300"
                  aria-label="Features section"
                >
                  Features
                </a>
                <a
                  href="#pricing"
                  className="transition-colors hover:text-purple-500 dark:hover:text-purple-300"
                  aria-label="Pricing section"
                >
                  Pricing
                </a>
                <a
                  href="#testimonials"
                  className="transition-colors hover:text-purple-500 dark:hover:text-purple-300"
                  aria-label="Customer reviews"
                >
                  Reviews
                </a>
                <a
                  href="/sign-in"
                  className="font-semibold text-gray-700 transition-colors hover:text-purple-600 dark:text-gray-200 dark:hover:text-purple-300"
                  aria-label="Sign in to your account"
                >
                  Sign In
                </a>
                <a href="/sign-up" className="ml-2">
                  <GradientButton aria-label="Get started with PromptCraft">Sign Up</GradientButton>
                </a>
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
                <a
                  href="#features"
                  className="block transition-colors hover:text-purple-500 dark:hover:text-purple-300"
                  aria-label="Features section"
                >
                  Features
                </a>
                <a
                  href="#pricing"
                  className="block transition-colors hover:text-purple-500 dark:hover:text-purple-300"
                  aria-label="Pricing section"
                >
                  Pricing
                </a>
                <a
                  href="#testimonials"
                  className="block transition-colors hover:text-purple-500 dark:hover:text-purple-300"
                  aria-label="Customer reviews"
                >
                  Reviews
                </a>
                <a
                  href="/sign-in"
                  className="block font-semibold text-gray-700 transition-colors hover:text-purple-600 dark:text-gray-200 dark:hover:text-purple-300"
                  aria-label="Sign in to your account"
                >
                  Sign In
                </a>
                <a href="/sign-up" className="block">
                  <GradientButton className="w-full" aria-label="Get started with PromptCraft">
                    Sign Up
                  </GradientButton>
                </a>
              </div>
            </div>
          )}
        </header>

        {/* Hero Section */}
        <main>
          <section
            className="relative px-4 pb-20 pt-32 sm:px-6 lg:px-8"
            aria-labelledby="hero-heading"
          >
            <div className="mx-auto max-w-7xl text-center">
              <FloatingCard>
                <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-purple-200 bg-purple-100/40 px-4 py-2 dark:border-purple-500/20 dark:bg-purple-500/10">
                  <Sparkles className="h-4 w-4 text-purple-400" aria-hidden="true" />
                  <span className="text-sm text-purple-700 dark:text-purple-300">
                    AI-Powered Prompt Generation
                  </span>
                </div>
              </FloatingCard>

              <FloatingCard delay={0.2}>
                <h1 id="hero-heading" className="mb-6 text-5xl font-bold leading-tight md:text-7xl">
                  Generate
                  <span className="animate-gradient bg-300% ml-4 bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
                    Perfect Prompts
                  </span>
                  <br />
                  in Seconds
                </h1>
              </FloatingCard>

              <FloatingCard delay={0.4}>
                <p className="mx-auto mb-8 max-w-3xl text-xl leading-relaxed text-gray-600 dark:text-gray-300">
                  Transform your ideas into detailed, effective prompts with our AI-powered
                  platform. Perfect for content creators, marketers, and AI enthusiasts.
                </p>
              </FloatingCard>

              <FloatingCard delay={0.6}>
                <div className="mb-12 flex flex-col items-center justify-center gap-4 sm:flex-row">
                  <a href="/sign-up">
                    <GradientButton className="px-12 py-4 text-lg">
                      Get Started Free <ArrowRight className="ml-2 h-5 w-5" />
                    </GradientButton>
                  </a>
                  <a
                    href="/sign-in"
                    className="flex items-center gap-2 font-semibold text-gray-700 transition-colors hover:text-purple-600 dark:text-gray-200 dark:hover:text-purple-300"
                  >
                    <Play className="h-5 w-5" />
                    Sign In
                  </a>
                </div>
              </FloatingCard>

              {/* Stats */}
              <FloatingCard delay={0.8}>
                <div className="mx-auto grid max-w-4xl grid-cols-1 gap-8 md:grid-cols-3">
                  {[
                    { number: '50K+', label: 'Prompts Generated' },
                    { number: '10K+', label: 'Happy Users' },
                    { number: '99.9%', label: 'Uptime' },
                  ].map((stat, index) => (
                    <div key={index} className="text-center">
                      <div className="mb-2 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-4xl font-bold text-transparent">
                        {stat.number}
                      </div>
                      <div className="text-gray-600 dark:text-gray-400">{stat.label}</div>
                    </div>
                  ))}
                </div>
              </FloatingCard>
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
                  className="h-5 w-5 text-purple-700 dark:text-purple-300"
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
                <div className="grid gap-8 md:grid-cols-3">
                  {featuredPrompts.map(prompt => (
                    <FloatingCard key={prompt.id}>
                      <div className="group relative rounded-2xl border-2 border-gray-200 bg-white p-6 shadow-lg transition-all duration-300 focus-within:ring-2 focus-within:ring-purple-500 hover:-translate-y-2 hover:shadow-xl dark:border-gray-800 dark:bg-gray-900">
                        <div className="absolute -top-4 left-4 flex items-center gap-2">
                          <Badge className="rounded-full border border-white bg-gradient-to-r from-purple-700 to-pink-600 px-3 py-1 font-semibold text-white shadow dark:border-gray-900">
                            Featured
                          </Badge>
                        </div>
                        <h3 className="mb-2 bg-gradient-to-r from-purple-700 to-pink-600 bg-clip-text text-xl font-bold text-transparent dark:from-purple-300 dark:to-pink-300">
                          <Link href={`/community-prompts/${prompt.slug}`}>{prompt.name}</Link>
                        </h3>
                        <p className="mb-3 line-clamp-3 text-gray-800 dark:text-gray-100">
                          {prompt.description}
                        </p>
                        <div className="mb-3 flex flex-wrap gap-2">
                          {prompt.tags.map((tag: any) => (
                            <Badge
                              key={tag.id}
                              className="border border-purple-300 bg-purple-200 font-medium text-purple-900 dark:border-purple-700 dark:bg-purple-800 dark:text-purple-100"
                            >
                              {tag.name}
                            </Badge>
                          ))}
                        </div>
                        <div className="mt-2 flex items-center gap-2">
                          <span className="inline-flex items-center gap-1 text-base font-bold text-purple-800 dark:text-purple-200">
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
                  href="/community-prompts"
                  className="inline-block text-lg font-semibold text-purple-800 hover:underline dark:text-purple-200"
                >
                  See all community prompts &rarr;
                </Link>
              </div>
            </div>
          </section>

          {/* Features Section */}
          <section
            id="features"
            className="px-4 py-20 sm:px-6 lg:px-8"
            aria-labelledby="features-heading"
          >
            <div className="mx-auto max-w-7xl">
              <div className="mb-16 text-center">
                <h2 id="features-heading" className="mb-6 text-4xl font-bold md:text-5xl">
                  Powerful Features for
                  <span className="ml-3 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                    Every Creator
                  </span>
                </h2>
                <p className="mx-auto max-w-3xl text-xl text-gray-600 dark:text-gray-300">
                  Everything you need to create, refine, and optimize your prompts for maximum
                  impact
                </p>
              </div>

              <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
                {features.map((feature, index) => (
                  <FloatingCard key={index} delay={index * 0.1}>
                    <div className="group rounded-2xl border border-gray-200 bg-gray-100 p-6 backdrop-blur-sm transition-all duration-300 hover:-translate-y-2 hover:border-purple-500/50 dark:border-gray-800 dark:bg-gray-900/50">
                      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 transition-transform group-hover:scale-110">
                        {feature.icon}
                      </div>
                      <h3 className="mb-3 text-xl font-semibold text-gray-900 dark:text-white">
                        {feature.title}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-300">{feature.description}</p>
                    </div>
                  </FloatingCard>
                ))}
              </div>
            </div>
          </section>

          {/* Pricing Section */}
          <section
            id="pricing"
            className="px-4 py-20 sm:px-6 lg:px-8"
            aria-labelledby="pricing-heading"
          >
            <div className="mx-auto max-w-7xl">
              <div className="mb-16 text-center">
                <h2 id="pricing-heading" className="mb-6 text-4xl font-bold md:text-5xl">
                  Simple, Transparent
                  <span className="ml-3 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                    Pricing
                  </span>
                </h2>
                <p className="text-xl text-gray-600 dark:text-gray-300">
                  Choose the perfect plan for your needs
                </p>
              </div>

              <div className="mx-auto grid max-w-6xl grid-cols-1 gap-8 md:grid-cols-3">
                {pricingPlans.map((plan, index) => (
                  <FloatingCard key={index} delay={index * 0.1}>
                    <div
                      className={`relative rounded-2xl border bg-gray-100 p-8 backdrop-blur-sm transition-all duration-300 hover:-translate-y-2 dark:bg-gray-900/50 ${
                        plan.popular
                          ? 'border-purple-500 ring-2 ring-purple-500/20'
                          : 'border-gray-200 hover:border-purple-500/50 dark:border-gray-800'
                      }`}
                    >
                      {plan.popular && (
                        <div className="absolute -top-4 left-1/2 -translate-x-1/2 transform">
                          <div className="rounded-full bg-gradient-to-r from-purple-500 to-pink-500 px-4 py-1 text-sm font-semibold text-white">
                            Most Popular
                          </div>
                        </div>
                      )}

                      <div className="mb-6 text-center">
                        <h3 className="mb-2 text-2xl font-bold text-gray-900 dark:text-white">
                          {plan.name}
                        </h3>
                        <div className="mb-2 flex items-baseline justify-center">
                          <span className="text-5xl font-bold text-gray-900 dark:text-white">
                            {plan.price}
                          </span>
                          <span className="ml-1 text-gray-600 dark:text-gray-300">
                            {plan.period}
                          </span>
                        </div>
                        <p className="text-gray-600 dark:text-gray-300">{plan.description}</p>
                      </div>

                      <ul className="mb-8 space-y-3">
                        {plan.features.map((feature, featureIndex) => (
                          <li key={featureIndex} className="flex items-center gap-3">
                            <Check className="h-5 w-5 flex-shrink-0 text-green-500" />
                            <span className="text-gray-700 dark:text-gray-200">{feature}</span>
                          </li>
                        ))}
                      </ul>

                      <GradientButton className="w-full">Get Started</GradientButton>
                    </div>
                  </FloatingCard>
                ))}
              </div>
            </div>
          </section>

          {/* Testimonials Section */}
          <section
            id="testimonials"
            className="px-4 py-20 sm:px-6 lg:px-8"
            aria-labelledby="testimonials-heading"
          >
            <div className="mx-auto max-w-4xl text-center">
              <h2 id="testimonials-heading" className="mb-16 text-4xl font-bold md:text-5xl">
                Loved by
                <span className="ml-3 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  Thousands
                </span>
              </h2>

              <div className="relative">
                <div className="mb-8 rounded-2xl border border-gray-200 bg-gray-100 p-8 backdrop-blur-sm dark:border-gray-800 dark:bg-gray-900/50">
                  <div className="mb-4 flex justify-center">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 fill-current text-yellow-400" />
                    ))}
                  </div>
                  <p className="mb-6 text-xl leading-relaxed text-gray-600 dark:text-gray-300">
                    "{testimonials[currentTestimonial].content}"
                  </p>
                  <div className="flex items-center justify-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r from-purple-500 to-pink-500 font-bold">
                      {testimonials[currentTestimonial].avatar}
                    </div>
                    <div className="text-left">
                      <div className="font-semibold text-gray-900 dark:text-white">
                        {testimonials[currentTestimonial].name}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {testimonials[currentTestimonial].role} at{' '}
                        {testimonials[currentTestimonial].company}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-center gap-2">
                  {testimonials.map((_, index) => (
                    <button
                      key={index}
                      className={`h-3 w-3 rounded-full transition-colors ${
                        index === currentTestimonial
                          ? 'bg-purple-500'
                          : 'bg-gray-400 dark:bg-gray-600'
                      }`}
                      onClick={() => setCurrentTestimonial(index)}
                    />
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* CTA Section */}
          <section className="px-4 py-20 sm:px-6 lg:px-8" aria-labelledby="cta-heading">
            <div className="mx-auto max-w-4xl text-center">
              <div className="rounded-3xl border border-purple-500/20 bg-gradient-to-r from-purple-900/50 to-pink-900/50 p-12 backdrop-blur-sm dark:from-purple-900/80 dark:to-pink-900/80">
                <h2 id="cta-heading" className="mb-6 text-4xl font-bold md:text-5xl">
                  Ready to Transform Your
                  <span className="ml-3 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                    Prompt Game?
                  </span>
                </h2>
                <p className="mb-8 text-xl text-gray-600 dark:text-gray-300">
                  Join thousands of creators who are already generating better prompts with
                  PromptCraft
                </p>
                <ComingSoonDialog />
              </div>
            </div>
          </section>

          {/* Footer */}
          <footer
            className="border-t border-gray-200 px-4 py-12 dark:border-gray-800 sm:px-6 lg:px-8"
            role="contentinfo"
          >
            <div className="mx-auto max-w-7xl">
              <div className="flex flex-col items-center justify-between md:flex-row">
                <div className="mb-4 flex items-center space-x-3 md:mb-0">
                  <div
                    className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-r from-purple-500 to-pink-500"
                    aria-label="PromptCraft Logo"
                  >
                    <Sparkles className="h-5 w-5 text-white" aria-hidden="true" />
                  </div>
                  <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-xl font-bold text-transparent">
                    PromptCraft
                  </span>
                </div>
                <nav
                  className="flex items-center space-x-6 text-gray-600 dark:text-gray-400"
                  aria-label="Footer navigation"
                >
                  <a
                    href="/privacy"
                    className="transition-colors hover:text-purple-500 dark:hover:text-purple-300"
                  >
                    Privacy
                  </a>
                  <a
                    href="/terms"
                    className="transition-colors hover:text-purple-500 dark:hover:text-purple-300"
                  >
                    Terms
                  </a>
                  <a
                    href="/support"
                    className="transition-colors hover:text-purple-500 dark:hover:text-purple-300"
                  >
                    Support
                  </a>
                </nav>
              </div>
            
            </div>
          </footer>
        </main>
      </div>
    </>
  );
};

export default PromptCraftLandingClient;
