'use client'
import React, { useState, useEffect } from 'react';
import { ChevronRight, Sparkles, Zap, Users, Target, ArrowRight, Check, Star, Play, Menu, X } from 'lucide-react';
import Head from 'next/head';
import Script from 'next/script';

// SEO metadata
const metadata = {
  title: 'PromptCraft - AI-Powered Prompt Generation Platform',
  description: 'Transform your ideas into detailed, effective prompts with our AI-powered platform. Perfect for content creators, marketers, and AI enthusiasts.',
  keywords: 'AI prompts, prompt engineering, content creation, marketing tools, AI assistance',
  ogImage: '/og-image.jpg',
  twitterCard: 'summary_large_image',
};

// Structured data for rich snippets
const structuredData = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "PromptCraft",
  "applicationCategory": "BusinessApplication",
  "operatingSystem": "Web",
  "offers": {
    "@type": "Offer",
    "price": "9.00",
    "priceCurrency": "USD"
  },
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.9",
    "ratingCount": "1000"
  }
};

const PromptCraftLanding = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const features = [
    {
      icon: <Sparkles className="w-6 h-6" />,
      title: "AI-Powered Generation",
      description: "Advanced algorithms create contextually perfect prompts for any use case"
    },
    {
      icon: <Target className="w-6 h-6" />,
      title: "Precision Targeting",
      description: "Fine-tune your prompts for specific audiences and outcomes"
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: "Lightning Fast",
      description: "Generate detailed prompts in seconds, not hours"
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: "Team Collaboration",
      description: "Share and iterate on prompts with your entire team"
    }
  ];

  const pricingPlans = [
    {
      name: "Starter",
      price: "$9",
      period: "/month",
      description: "Perfect for individuals getting started",
      features: ["100 prompts/month", "Basic templates", "Email support", "Export options"],
      popular: false
    },
    {
      name: "Professional",
      price: "$29",
      period: "/month", 
      description: "Ideal for professionals and small teams",
      features: ["1,000 prompts/month", "Advanced templates", "Priority support", "Team collaboration", "Custom branding"],
      popular: true
    },
    {
      name: "Enterprise",
      price: "$99",
      period: "/month",
      description: "For large teams and organizations",
      features: ["Unlimited prompts", "Custom templates", "Dedicated support", "Advanced analytics", "API access", "White-label"],
      popular: false
    }
  ];

  const testimonials = [
    {
      name: "Sarah Chen",
      role: "Content Marketing Manager",
      company: "TechFlow",
      content: "PromptCraft transformed our content creation process. We're generating 10x better prompts in half the time.",
      avatar: "SC"
    },
    {
      name: "Michael Rodriguez",
      role: "AI Researcher",
      company: "InnovateLab",
      content: "The precision and quality of prompts generated is incredible. It's like having an expert prompt engineer on demand.",
      avatar: "MR"
    },
    {
      name: "Emma Thompson",
      role: "Marketing Director",
      company: "GrowthCorp",
      content: "Our team's productivity skyrocketed. PromptCraft is now essential to our daily workflow.",
      avatar: "ET"
    }
  ];

  const AnimatedBackground = () => (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      <div 
        className="absolute w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse"
        style={{
          left: mousePosition.x - 200,
          top: mousePosition.y - 200,
          transition: 'all 0.3s ease-out'
        }}
      />
      <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-pink-500/5 rounded-full blur-2xl animate-bounce-slow" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl animate-pulse-slow" />
    </div>
  );

  const FloatingCard = ({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) => (
    <div 
      className="animate-float"
      style={{ animationDelay: `${delay}s` }}
    >
      {children}
    </div>
  );

  const GradientButton = ({ children, className = "", ...props }: any) => (
    <button 
      className={`relative overflow-hidden bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-3 px-8 rounded-full transition-all duration-300 transform hover:scale-105 group ${className}`}
      {...props}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      <div className="relative flex items-center gap-2">
        {children}
      </div>
    </button>
  );

  return (
    <>
      <Head>
        <title>{metadata.title}</title>
        <meta name="description" content={metadata.description} />
        <meta name="keywords" content={metadata.keywords} />
        
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
        <meta property="og:title" content={metadata.title} />
        <meta property="og:description" content={metadata.description} />
        <meta property="og:image" content={metadata.ogImage} />
        <meta property="og:type" content="website" />
        
        {/* Twitter */}
        <meta name="twitter:card" content={metadata.twitterCard} />
        <meta name="twitter:title" content={metadata.title} />
        <meta name="twitter:description" content={metadata.description} />
        <meta name="twitter:image" content={metadata.ogImage} />
        
        {/* Structured Data */}
        <Script
          id="structured-data"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </Head>

      <div className="min-h-screen bg-black text-white relative">
        <AnimatedBackground />
        
        {/* Navigation */}
        <header className="fixed top-0 w-full z-50 bg-black/80 backdrop-blur-xl border-b border-gray-800/50">
          <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center" aria-label="PromptCraft Logo">
                  <Sparkles className="w-6 h-6 text-white" aria-hidden="true" />
                </div>
                <span className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  PromptCraft
                </span>
              </div>
              
              <div className="hidden md:flex items-center space-x-8">
                <a href="#features" className="hover:text-purple-400 transition-colors" aria-label="Features section">Features</a>
                <a href="#pricing" className="hover:text-purple-400 transition-colors" aria-label="Pricing section">Pricing</a>
                <a href="#testimonials" className="hover:text-purple-400 transition-colors" aria-label="Customer reviews">Reviews</a>
                <button className="text-gray-300 hover:text-white transition-colors" aria-label="Sign in to your account">Sign In</button>
                <GradientButton aria-label="Get started with PromptCraft">Get Started</GradientButton>
              </div>

              <button 
                className="md:hidden"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                aria-label={isMenuOpen ? "Close menu" : "Open menu"}
                aria-expanded={isMenuOpen}
              >
                {isMenuOpen ? <X className="w-6 h-6" aria-hidden="true" /> : <Menu className="w-6 h-6" aria-hidden="true" />}
              </button>
            </div>
          </nav>

          {/* Mobile Menu */}
          {isMenuOpen && (
            <div className="md:hidden bg-black/95 backdrop-blur-xl border-t border-gray-800" role="navigation" aria-label="Mobile menu">
              <div className="px-4 py-6 space-y-4">
                <a href="#features" className="block hover:text-purple-400 transition-colors" aria-label="Features section">Features</a>
                <a href="#pricing" className="block hover:text-purple-400 transition-colors" aria-label="Pricing section">Pricing</a>
                <a href="#testimonials" className="block hover:text-purple-400 transition-colors" aria-label="Customer reviews">Reviews</a>
                <button className="block text-gray-300 hover:text-white transition-colors" aria-label="Sign in to your account">Sign In</button>
                <GradientButton className="w-full" aria-label="Get started with PromptCraft">Get Started</GradientButton>
              </div>
            </div>
          )}
        </header>

        {/* Hero Section */}
        <main>
          <section className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8" aria-labelledby="hero-heading">
            <div className="max-w-7xl mx-auto text-center">
              <FloatingCard>
                <div className="inline-flex items-center gap-2 bg-purple-500/10 border border-purple-500/20 rounded-full px-4 py-2 mb-8">
                  <Sparkles className="w-4 h-4 text-purple-400" aria-hidden="true" />
                  <span className="text-sm text-purple-300">AI-Powered Prompt Generation</span>
                </div>
              </FloatingCard>

              <FloatingCard delay={0.2}>
                <h1 id="hero-heading" className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
                  Generate
                  <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent animate-gradient bg-300% ml-4">
                    Perfect Prompts
                  </span>
                  <br />
                  in Seconds
                </h1>
              </FloatingCard>

              <FloatingCard delay={0.4}>
                <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
                  Transform your ideas into detailed, effective prompts with our AI-powered platform. 
                  Perfect for content creators, marketers, and AI enthusiasts.
                </p>
              </FloatingCard>

              <FloatingCard delay={0.6}>
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
                  <GradientButton className="text-lg px-12 py-4">
                    Start Creating Free <ArrowRight className="w-5 h-5 ml-2" />
                  </GradientButton>
                  <button className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors">
                    <Play className="w-5 h-5" />
                    Watch Demo
                  </button>
                </div>
              </FloatingCard>

              {/* Stats */}
              <FloatingCard delay={0.8}>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
                  {[
                    { number: "50K+", label: "Prompts Generated" },
                    { number: "10K+", label: "Happy Users" },
                    { number: "99.9%", label: "Uptime" }
                  ].map((stat, index) => (
                    <div key={index} className="text-center">
                      <div className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
                        {stat.number}
                      </div>
                      <div className="text-gray-400">{stat.label}</div>
                    </div>
                  ))}
                </div>
              </FloatingCard>
            </div>
          </section>

          {/* Features Section */}
          <section id="features" className="py-20 px-4 sm:px-6 lg:px-8" aria-labelledby="features-heading">
            <div className="max-w-7xl mx-auto">
              <div className="text-center mb-16">
                <h2 id="features-heading" className="text-4xl md:text-5xl font-bold mb-6">
                  Powerful Features for
                  <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent ml-3">
                    Every Creator
                  </span>
                </h2>
                <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                  Everything you need to create, refine, and optimize your prompts for maximum impact
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {features.map((feature, index) => (
                  <FloatingCard key={index} delay={index * 0.1}>
                    <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-2xl p-6 hover:border-purple-500/50 transition-all duration-300 group hover:-translate-y-2">
                      <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        {feature.icon}
                      </div>
                      <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                      <p className="text-gray-400">{feature.description}</p>
                    </div>
                  </FloatingCard>
                ))}
              </div>
            </div>
          </section>

          {/* Pricing Section */}
          <section id="pricing" className="py-20 px-4 sm:px-6 lg:px-8" aria-labelledby="pricing-heading">
            <div className="max-w-7xl mx-auto">
              <div className="text-center mb-16">
                <h2 id="pricing-heading" className="text-4xl md:text-5xl font-bold mb-6">
                  Simple, Transparent
                  <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent ml-3">
                    Pricing
                  </span>
                </h2>
                <p className="text-xl text-gray-300">Choose the perfect plan for your needs</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                {pricingPlans.map((plan, index) => (
                  <FloatingCard key={index} delay={index * 0.1}>
                    <div className={`relative bg-gray-900/50 backdrop-blur-sm border rounded-2xl p-8 transition-all duration-300 hover:-translate-y-2 ${
                      plan.popular 
                        ? 'border-purple-500 ring-2 ring-purple-500/20' 
                        : 'border-gray-800 hover:border-purple-500/50'
                    }`}>
                      {plan.popular && (
                        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                          <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-1 rounded-full text-sm font-semibold">
                            Most Popular
                          </div>
                        </div>
                      )}
                      
                      <div className="text-center mb-6">
                        <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                        <div className="flex items-baseline justify-center mb-2">
                          <span className="text-5xl font-bold">{plan.price}</span>
                          <span className="text-gray-400 ml-1">{plan.period}</span>
                        </div>
                        <p className="text-gray-400">{plan.description}</p>
                      </div>

                      <ul className="space-y-3 mb-8">
                        {plan.features.map((feature, featureIndex) => (
                          <li key={featureIndex} className="flex items-center gap-3">
                            <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                            <span className="text-gray-300">{feature}</span>
                          </li>
                        ))}
                      </ul>

                      <GradientButton className="w-full">
                        Get Started
                      </GradientButton>
                    </div>
                  </FloatingCard>
                ))}
              </div>
            </div>
          </section>

          {/* Testimonials Section */}
          <section id="testimonials" className="py-20 px-4 sm:px-6 lg:px-8" aria-labelledby="testimonials-heading">
            <div className="max-w-4xl mx-auto text-center">
              <h2 id="testimonials-heading" className="text-4xl md:text-5xl font-bold mb-16">
                Loved by
                <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent ml-3">
                  Thousands
                </span>
              </h2>

              <div className="relative">
                <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-2xl p-8 mb-8">
                  <div className="flex justify-center mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <p className="text-xl text-gray-300 mb-6 leading-relaxed">
                    "{testimonials[currentTestimonial].content}"
                  </p>
                  <div className="flex items-center justify-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center font-bold">
                      {testimonials[currentTestimonial].avatar}
                    </div>
                    <div className="text-left">
                      <div className="font-semibold">{testimonials[currentTestimonial].name}</div>
                      <div className="text-gray-400 text-sm">
                        {testimonials[currentTestimonial].role} at {testimonials[currentTestimonial].company}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-center gap-2">
                  {testimonials.map((_, index) => (
                    <button
                      key={index}
                      className={`w-3 h-3 rounded-full transition-colors ${
                        index === currentTestimonial ? 'bg-purple-500' : 'bg-gray-600'
                      }`}
                      onClick={() => setCurrentTestimonial(index)}
                    />
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* CTA Section */}
          <section className="py-20 px-4 sm:px-6 lg:px-8" aria-labelledby="cta-heading">
            <div className="max-w-4xl mx-auto text-center">
              <div className="bg-gradient-to-r from-purple-900/50 to-pink-900/50 backdrop-blur-sm border border-purple-500/20 rounded-3xl p-12">
                <h2 id="cta-heading" className="text-4xl md:text-5xl font-bold mb-6">
                  Ready to Transform Your
                  <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent ml-3">
                    Prompt Game?
                  </span>
                </h2>
                <p className="text-xl text-gray-300 mb-8">
                  Join thousands of creators who are already generating better prompts with PromptCraft
                </p>
                <GradientButton className="text-lg px-12 py-4">
                  Start Your Free Trial <ChevronRight className="w-5 h-5 ml-2" />
                </GradientButton>
              </div>
            </div>
          </section>

          {/* Footer */}
          <footer className="border-t border-gray-800 py-12 px-4 sm:px-6 lg:px-8" role="contentinfo">
            <div className="max-w-7xl mx-auto">
              <div className="flex flex-col md:flex-row justify-between items-center">
                <div className="flex items-center space-x-3 mb-4 md:mb-0">
                  <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center" aria-label="PromptCraft Logo">
                    <Sparkles className="w-5 h-5 text-white" aria-hidden="true" />
                  </div>
                  <span className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                    PromptCraft
                  </span>
                </div>
                <nav className="flex items-center space-x-6 text-gray-400" aria-label="Footer navigation">
                  <a href="/privacy" className="hover:text-white transition-colors">Privacy</a>
                  <a href="/terms" className="hover:text-white transition-colors">Terms</a>
                  <a href="/support" className="hover:text-white transition-colors">Support</a>
                </nav>
              </div>
              <div className="mt-8 pt-8 border-t border-gray-800 text-center text-gray-400">
                <p>&copy; {new Date().getFullYear()} PromptCraft. All rights reserved.</p>
              </div>
            </div>
          </footer>
        </main>
      </div>
    </>
  );
};

export default PromptCraftLanding;