'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useTheme } from '@/components/ThemeProvider';
import {
  Sparkles,
  ArrowRight,
  Check,
  Menu,
  X,
  Sun,
  Moon,
  Zap,
  Users,
  Target,
} from 'lucide-react';
import { useClerk } from '@clerk/nextjs';

interface CleanPromptHiveLandingProps {
  user?: {
    id: string;
    name: string;
    email: string;
    imageUrl: string;
  } | null;
}

const CleanPromptHiveLanding = ({ user }: CleanPromptHiveLandingProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { resolvedTheme, toggleTheme } = useTheme();
  const { signOut } = useClerk();

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
      {/* Navigation */}
      <header className="fixed top-0 z-50 w-full bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800">
        <nav className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                PromptHive
              </span>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 transition-colors">
                Features
              </a>
              <a href="#pricing" className="text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 transition-colors">
                Pricing
              </a>
              
              {user ? (
                <div className="flex items-center space-x-4">
                  <Link href="/dashboard" className="text-purple-600 dark:text-purple-400 font-medium hover:text-purple-700 dark:hover:text-purple-300">
                    Dashboard
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                  >
                    Sign Out
                  </button>
                </div>
              ) : (
                <div className="flex items-center space-x-4">
                  <Link href="/sign-in" className="text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400">
                    Sign In
                  </Link>
                  <Link href="/sign-up" className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors">
                    Get Started
                  </Link>
                </div>
              )}
              
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                {resolvedTheme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>
            </div>

            {/* Mobile menu button */}
            <button
              className="md:hidden p-2"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Mobile Menu */}
          {isMenuOpen && (
            <div className="md:hidden border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
              <div className="px-4 py-6 space-y-4">
                <a href="#features" className="block text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400">
                  Features
                </a>
                <a href="#pricing" className="block text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400">
                  Pricing
                </a>
                {user ? (
                  <>
                    <Link href="/dashboard" className="block text-purple-600 dark:text-purple-400 font-medium">
                      Dashboard
                    </Link>
                    <button onClick={handleSignOut} className="block text-gray-600 dark:text-gray-300">
                      Sign Out
                    </button>
                  </>
                ) : (
                  <>
                    <Link href="/sign-in" className="block text-gray-600 dark:text-gray-300">
                      Sign In
                    </Link>
                    <Link href="/sign-up" className="block bg-purple-600 text-white px-4 py-2 rounded-lg text-center">
                      Get Started
                    </Link>
                  </>
                )}
                <button
                  onClick={toggleTheme}
                  className="flex items-center gap-2 text-gray-600 dark:text-gray-300"
                >
                  {resolvedTheme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                  {resolvedTheme === 'dark' ? 'Light Mode' : 'Dark Mode'}
                </button>
              </div>
            </div>
          )}
        </nav>
      </header>

      {/* Hero Section */}
      <section className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 px-4 py-2 rounded-full text-sm font-medium mb-8">
              <Sparkles className="w-4 h-4" />
              AI-Powered Prompt Engineering
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              Transform Ideas Into
              <span className="block bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Perfect Prompts
              </span>
            </h1>
            
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
              Let AI optimize your prompt ideas into professional, effective prompts. 
              No more guesswork—just results.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              {user ? (
                <Link href="/prompts/create" className="bg-purple-600 text-white px-8 py-4 rounded-lg font-semibold hover:bg-purple-700 transition-colors flex items-center gap-2">
                  Create Your First Prompt
                  <ArrowRight className="w-5 h-5" />
                </Link>
              ) : (
                <>
                  <Link href="/sign-up" className="bg-purple-600 text-white px-8 py-4 rounded-lg font-semibold hover:bg-purple-700 transition-colors flex items-center gap-2">
                    Start Free
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                  <Link href="#demo" className="text-purple-600 dark:text-purple-400 font-semibold hover:text-purple-700 dark:hover:text-purple-300 flex items-center gap-2">
                    See How It Works
                  </Link>
                </>
              )}
            </div>

            {/* Simple Stats */}
            <div className="grid grid-cols-3 gap-8 max-w-md mx-auto">
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">10K+</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Prompts Created</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">5K+</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Happy Users</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">99%</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Success Rate</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Simple Demo Section */}
      <section id="demo" className="py-16 bg-gray-50 dark:bg-gray-800/50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">See It In Action</h2>
            <p className="text-gray-600 dark:text-gray-300">Watch how AI transforms your ideas into professional prompts</p>
          </div>
          
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-8">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <h3 className="text-lg font-semibold mb-4 text-gray-500 dark:text-gray-400">Your Input:</h3>
                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border">
                  <p className="text-gray-700 dark:text-gray-300">
                    "I want to write better product descriptions"
                  </p>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-4 text-purple-600 dark:text-purple-400">AI-Optimized Prompt:</h3>
                <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg border border-purple-200 dark:border-purple-800">
                  <p className="text-gray-700 dark:text-gray-300 text-sm">
                    "Create compelling product descriptions that highlight key features, benefits, and unique selling points. 
                    Use persuasive language, include technical specifications when relevant, and optimize for both 
                    search engines and customer conversion. Target audience: [specify]. Tone: [professional/casual]. 
                    Length: [150-300 words]."
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Why Choose PromptHive?</h2>
            <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Everything you need to create, optimize, and manage professional prompts
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="text-xl font-semibold mb-3">AI-Powered Optimization</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Transform simple ideas into detailed, effective prompts using advanced AI
              </p>
            </div>
            
            <div className="text-center p-6">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Target className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Version Control</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Track changes, compare versions, and never lose your best prompts
              </p>
            </div>
            
            <div className="text-center p-6">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Users className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Community Library</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Access thousands of community prompts and share your best creations
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Simple Pricing */}
      <section id="pricing" className="py-16 bg-gray-50 dark:bg-gray-800/50 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Simple Pricing</h2>
            <p className="text-gray-600 dark:text-gray-300">Start free, upgrade when you need more</p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
            {/* Free Plan */}
            <div className="bg-white dark:bg-gray-900 rounded-xl p-8 border border-gray-200 dark:border-gray-800">
              <h3 className="text-2xl font-bold mb-2">Free</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6">Perfect for getting started</p>
              <div className="text-3xl font-bold mb-6">$0<span className="text-lg text-gray-500">/month</span></div>
              
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-green-500" />
                  <span>100 credits/month</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-green-500" />
                  <span>3 private prompts</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-green-500" />
                  <span>Community access</span>
                </li>
              </ul>
              
              <Link href="/sign-up" className="block w-full text-center bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white py-3 rounded-lg font-semibold hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                Start Free
              </Link>
            </div>
            
            {/* Pro Plan */}
            <div className="bg-white dark:bg-gray-900 rounded-xl p-8 border-2 border-purple-500 relative">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <span className="bg-purple-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                  Most Popular
                </span>
              </div>
              
              <h3 className="text-2xl font-bold mb-2">Pro</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6">For serious prompt engineers</p>
              <div className="text-3xl font-bold mb-6">$16<span className="text-lg text-gray-500">/month</span></div>
              
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-green-500" />
                  <span>500 credits/month</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-green-500" />
                  <span>20 private prompts</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-green-500" />
                  <span>Version control</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-green-500" />
                  <span>Priority support</span>
                </li>
              </ul>
              
              <Link href="/sign-up" className="block w-full text-center bg-purple-600 text-white py-3 rounded-lg font-semibold hover:bg-purple-700 transition-colors">
                Start Free Trial
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Simple CTA */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Create Better Prompts?</h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
            Join thousands of creators using AI to optimize their prompts
          </p>
          
          <Link href="/sign-up" className="inline-flex items-center gap-2 bg-purple-600 text-white px-8 py-4 rounded-lg font-semibold hover:bg-purple-700 transition-colors">
            Get Started Free
            <ArrowRight className="w-5 h-5" />
          </Link>
          
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">
            No credit card required • Free forever plan available
          </p>
        </div>
      </section>

      {/* Simple Footer */}
      <footer className="border-t border-gray-200 dark:border-gray-800 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <div className="w-6 h-6 bg-gradient-to-r from-purple-600 to-pink-600 rounded flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                PromptHive
              </span>
            </div>
            
            <div className="flex space-x-6 text-sm text-gray-600 dark:text-gray-400">
              <Link href="/legal/privacy" className="hover:text-purple-600 dark:hover:text-purple-400">
                Privacy
              </Link>
              <Link href="/legal/terms" className="hover:text-purple-600 dark:hover:text-purple-400">
                Terms
              </Link>
              <Link href="/support" className="hover:text-purple-600 dark:hover:text-purple-400">
                Support
              </Link>
            </div>
          </div>
          
          <div className="text-center text-sm text-gray-500 dark:text-gray-400 mt-4">
            © 2024 PromptHive. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default CleanPromptHiveLanding;
