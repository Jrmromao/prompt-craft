"use client";
import { useUser } from '@clerk/nextjs';
import { motion, useScroll, useTransform } from "framer-motion";
import { Inter, Playfair_Display } from 'next/font/google';
import Image from "next/image";
import { FaRocket, FaLightbulb, FaUsers, FaChartLine, FaQuoteLeft, FaStar, FaHome } from "react-icons/fa";
import { useState } from "react";

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const playfair = Playfair_Display({ subsets: ['latin'], variable: '--font-playfair' });

export default function AboutPage() {
  const { user } = useUser();
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], [0, -100]);
  const [activeTestimonial, setActiveTestimonial] = useState(0);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1
    }
  };

  const features = [
    {
      icon: <FaRocket className="w-8 h-8" />,
      title: "Innovation First",
      description: "We're constantly pushing the boundaries of what's possible with AI, creating tools that empower creativity and productivity."
    },
    {
      icon: <FaLightbulb className="w-8 h-8" />,
      title: "Smart Solutions",
      description: "Our AI-powered platform helps you craft the perfect prompts, saving time and enhancing your creative output."
    },
    {
      icon: <FaUsers className="w-8 h-8" />,
      title: "Community Driven",
      description: "Join a thriving community of creators, developers, and innovators who are shaping the future of AI interaction."
    },
    {
      icon: <FaChartLine className="w-8 h-8" />,
      title: "Continuous Growth",
      description: "We're committed to constant improvement, regularly updating our platform with new features and capabilities."
    }
  ];

  const timeline = [
    {
      year: "2024",
      title: "The Beginning",
      description: "PromptHive was born from a vision to make AI more accessible and powerful for everyone."
    },
    {
      year: "2024",
      title: "Launch",
      description: "We're excited to introduce PromptHive to the world, starting our journey to revolutionize AI interaction."
    },
    {
      year: "Coming Soon",
      title: "Future Growth",
      description: "We're working on exciting features and improvements to enhance your AI experience."
    }
  ];

  const testimonials = [
    {
      quote: "I'm excited to be one of the first users of PromptHive. The potential is incredible!",
      author: "Early Adopter",
      role: "AI Enthusiast",
      rating: 5
    },
    {
      quote: "The interface is intuitive and the possibilities are endless. Can't wait to see where this goes!",
      author: "Beta Tester",
      role: "Developer",
      rating: 5
    },
    {
      quote: "A promising start to what could be a game-changing platform for AI interaction.",
      author: "First User",
      role: "Content Creator",
      rating: 5
    }
  ];

  const team = [
    {
      name: "Our Team",
      role: "Passionate Innovators",
      image: "/images/team/team.jpg"
    }
  ];

  const faqs = [
    {
      question: "What is PromptHive?",
      answer: "PromptHive is a new platform designed to make AI interaction more intuitive and powerful. We're just getting started and excited to grow with our community."
    },
    {
      question: "How can I get started?",
      answer: "Join us on our journey from day one! Sign up for an account and be among the first to experience the future of AI interaction."
    },
    {
      question: "What's coming next?",
      answer: "We have an exciting roadmap ahead! Stay tuned for new features, improvements, and community initiatives as we grow together."
    }
  ];

  return (
    <div className={`min-h-screen bg-gradient-to-b from-white to-gray-50 dark:from-black dark:to-gray-900 text-gray-900 dark:text-white ${inter.variable} ${playfair.variable}`}>
      {/* Hero Section with Parallax */}
      <motion.div 
        style={{ y }}
        className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden px-4"
      >
        <div className="absolute inset-0 bg-gradient-to-b from-purple-600/20 to-pink-600/20 dark:from-purple-900/20 dark:to-pink-900/20" />
        <div className="relative z-10 text-center w-full max-w-5xl mx-auto flex flex-col items-center justify-center">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="font-playfair font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600 tracking-tight text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl px-2"
          >
            Crafting the Future of AI
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="font-inter text-lg sm:text-xl md:text-2xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed px-2"
          >
            At PromptHive, we're revolutionizing how people interact with AI. Our mission is to empower creators, developers, and innovators with the tools they need to bring their ideas to life.
          </motion.p>
          {/* Hero Buttons - moved above scroll arrow */}
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center items-center">
            <a
              href="/"
              className="inline-flex items-center gap-2 px-8 py-3 rounded-full border-2 border-purple-600 text-purple-700 dark:text-purple-300 bg-transparent font-semibold shadow transition hover:bg-purple-50 dark:hover:bg-purple-900/30 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-purple-400"
            >
              <FaHome className="text-lg" />
              Go Home
            </a>
            <a
              href="/pricing"
              className="inline-flex items-center gap-2 px-8 py-3 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold shadow-lg transition transform hover:scale-105 hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-pink-400 relative overflow-hidden"
              style={{ position: 'relative' }}
            >
              <FaRocket className="text-lg" />
              Join PromptHive
              <span className="absolute left-0 top-0 w-full h-full pointer-events-none" style={{ background: 'linear-gradient(120deg,rgba(255,255,255,0.15) 0%,rgba(255,255,255,0.05) 100%)', mixBlendMode: 'overlay' }}></span>
            </a>
          </div>
          {/* Scroll Down Animation - reduced margin */}
          <motion.div
            initial={{ opacity: 0, y: 0 }}
            animate={{ opacity: [0, 1, 1, 0.7, 1], y: [0, 12, 6, 12, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, repeatType: 'loop', delay: 1, ease: 'easeInOut' }}
            className="mt-8 flex flex-col items-center"
            aria-label="Scroll down"
          >
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="url(#arrow-gradient)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="mx-auto">
              <defs>
                <linearGradient id="arrow-gradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#a21caf" />
                  <stop offset="100%" stopColor="#db2777" />
                </linearGradient>
              </defs>
              <path d="M12 5v14M19 12l-7 7-7-7" />
            </svg>
            <span className="sr-only">Scroll down</span>
          </motion.div>
        </div>
      </motion.div>

      <main className="max-w-6xl mx-auto px-4 py-16">
        {/* Mission Section */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-20"
        >
          <motion.div variants={itemVariants} className="relative h-[400px] rounded-2xl overflow-hidden">
            <Image
              src="/images/about-hero.jpg"
              alt="Team collaboration"
              fill
              className="object-cover"
              priority
            />
          </motion.div>
          <motion.div variants={itemVariants} className="flex flex-col justify-center">
            <h2 className="font-playfair text-4xl font-bold mb-6 tracking-tight">Our Mission</h2>
            <p className="font-inter text-lg text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
              We believe that AI should be accessible to everyone. Our platform bridges the gap between complex AI systems and human creativity, making it easier than ever to harness the power of artificial intelligence.
            </p>
            <p className="font-inter text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
              Through innovative tools and a user-friendly interface, we're helping people across the globe unlock their creative potential and achieve their goals.
            </p>
          </motion.div>
        </motion.div>

        {/* Timeline Section */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="mb-20"
        >
          <motion.h2 variants={itemVariants} className="font-playfair text-4xl font-bold mb-12 text-center tracking-tight">
            Our Journey
          </motion.h2>
          <div className="relative">
            <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-gradient-to-b from-purple-600 to-pink-600" />
            <div className="space-y-12">
              {timeline.map((item, index) => (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  className={`relative flex items-center ${index % 2 === 0 ? 'justify-start' : 'justify-end'}`}
                >
                  <div className={`w-1/2 ${index % 2 === 0 ? 'pr-12' : 'pl-12'}`}>
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-xl">
                      <div className="text-purple-600 dark:text-purple-400 font-bold mb-2">{item.year}</div>
                      <h3 className="font-playfair text-2xl font-bold mb-2">{item.title}</h3>
                      <p className="font-inter text-gray-600 dark:text-gray-300">{item.description}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20"
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-shadow"
            >
              <div className="text-purple-600 dark:text-purple-400 mb-4">
                {feature.icon}
              </div>
              <h3 className="font-playfair text-2xl font-bold mb-4 tracking-tight">{feature.title}</h3>
              <p className="font-inter text-gray-600 dark:text-gray-300">{feature.description}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Testimonials Section */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="mb-20"
        >
          <motion.h2 variants={itemVariants} className="font-playfair text-4xl font-bold mb-12 text-center tracking-tight">
            What Our Users Say
          </motion.h2>
          <div className="relative">
            <div className="flex justify-center mb-8">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setActiveTestimonial(index)}
                  className={`w-3 h-3 mx-2 rounded-full transition-colors ${
                    activeTestimonial === index
                      ? 'bg-purple-600'
                      : 'bg-gray-300 dark:bg-gray-700'
                  }`}
                />
              ))}
            </div>
            <motion.div
              key={activeTestimonial}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-xl max-w-3xl mx-auto"
            >
              <FaQuoteLeft className="text-purple-600 dark:text-purple-400 text-4xl mb-6" />
              <p className="font-inter text-xl text-gray-600 dark:text-gray-300 mb-6">
                {testimonials[activeTestimonial].quote}
              </p>
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-playfair text-xl font-bold">{testimonials[activeTestimonial].author}</h4>
                  <p className="font-inter text-gray-500 dark:text-gray-400">{testimonials[activeTestimonial].role}</p>
                </div>
                <div className="flex">
                  {[...Array(testimonials[activeTestimonial].rating)].map((_, i) => (
                    <FaStar key={i} className="text-yellow-400" />
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Team Section */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="mb-20"
        >
          <motion.h2 variants={itemVariants} className="font-playfair text-4xl font-bold mb-12 text-center tracking-tight">
            Meet Our Team
          </motion.h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {team.map((member, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-xl flex flex-col items-center"
              >
                <div className="relative h-64 w-full flex items-center justify-center bg-gray-100 dark:bg-gray-700">
                  {member.image ? (
                    <Image
                      src={member.image}
                      alt={member.name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <svg width="96" height="96" viewBox="0 0 24 24" fill="none" className="mx-auto">
                      <circle cx="12" cy="8" r="4" fill="#a21caf" />
                      <rect x="4" y="16" width="16" height="6" rx="3" fill="#db2777" />
                    </svg>
                  )}
                </div>
                <div className="p-6 text-center">
                  <h3 className="font-playfair text-2xl font-bold mb-2">{member.name}</h3>
                  <p className="font-inter text-gray-600 dark:text-gray-300">{member.role}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* FAQ Section */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="mb-20"
        >
          <motion.h2 variants={itemVariants} className="font-playfair text-4xl font-bold mb-12 text-center tracking-tight">
            Frequently Asked Questions
          </motion.h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-xl"
              >
                <h3 className="font-playfair text-2xl font-bold mb-4">{faq.question}</h3>
                <p className="font-inter text-gray-600 dark:text-gray-300">{faq.answer}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Stats Section */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
        >
          {[
            { number: "Day 1", label: "Just Launched" },
            { number: "100%", label: "Fresh Start" },
            { number: "∞", label: "Future Potential" }
          ].map((stat, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              className="text-center p-8 bg-white dark:bg-gray-800 rounded-2xl shadow-xl"
            >
              <div className="font-playfair text-5xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600">
                {stat.number}
              </div>
              <div className="font-inter text-gray-600 dark:text-gray-300 text-lg">
                {stat.label}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </main>
    </div>
  );
} 