'use client';
import { useUser } from '@clerk/nextjs';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Inter, Playfair_Display } from 'next/font/google';
import Image from 'next/image';
import {
  FaRocket,
  FaLightbulb,
  FaUsers,
  FaChartLine,
  FaQuoteLeft,
  FaStar,
  FaHome,
} from 'react-icons/fa';
import { useState } from 'react';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
});

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
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
    },
  };

  const features = [
    {
      icon: <FaRocket className="h-8 w-8" />,
      title: 'Innovation First',
      description:
        "We're constantly pushing the boundaries of what's possible with AI, creating tools that empower creativity and productivity.",
    },
    {
      icon: <FaLightbulb className="h-8 w-8" />,
      title: 'Smart Solutions',
      description:
        'Our AI-powered platform helps you craft the perfect prompts, saving time and enhancing your creative output.',
    },
    {
      icon: <FaUsers className="h-8 w-8" />,
      title: 'Community Driven',
      description:
        'Join a thriving community of creators, developers, and innovators who are shaping the future of AI interaction.',
    },
    {
      icon: <FaChartLine className="h-8 w-8" />,
      title: 'Continuous Growth',
      description:
        "We're committed to constant improvement, regularly updating our platform with new features and capabilities.",
    },
  ];

  const timeline = [
    {
      year: '2024',
      title: 'The Beginning',
      description:
        'PromptHive was born from a vision to make AI more accessible and powerful for everyone.',
    },
    {
      year: '2024',
      title: 'Launch',
      description:
        "We're excited to introduce PromptHive to the world, starting our journey to revolutionize AI interaction.",
    },
    {
      year: 'Coming Soon',
      title: 'Future Growth',
      description:
        "We're working on exciting features and improvements to enhance your AI experience.",
    },
  ];

  const testimonials = [
    {
      quote: "I'm excited to be one of the first users of PromptHive. The potential is incredible!",
      author: 'Early Adopter',
      role: 'AI Enthusiast',
      rating: 5,
    },
    {
      quote:
        "The interface is intuitive and the possibilities are endless. Can't wait to see where this goes!",
      author: 'Beta Tester',
      role: 'Developer',
      rating: 5,
    },
    {
      quote: 'A promising start to what could be a game-changing platform for AI interaction.',
      author: 'First User',
      role: 'Content Creator',
      rating: 5,
    },
  ];

  const team = [
    {
      name: 'Our Team',
      role: 'Passionate Innovators',
      image: '/images/team/team.jpg',
    },
  ];

  const faqs = [
    {
      question: 'What is PromptHive?',
      answer:
        "PromptHive is a new platform designed to make AI interaction more intuitive and powerful. We're just getting started and excited to grow with our community.",
    },
    {
      question: 'How can I get started?',
      answer:
        'Join us on our journey from day one! Sign up for an account and be among the first to experience the future of AI interaction.',
    },
    {
      question: "What's coming next?",
      answer:
        'We have an exciting roadmap ahead! Stay tuned for new features, improvements, and community initiatives as we grow together.',
    },
  ];

  return (
    <div
      className={`min-h-screen bg-gradient-to-b from-white to-gray-50 text-gray-900 dark:from-black dark:to-gray-900 dark:text-white ${inter.variable} ${playfair.variable}`}
    >
      {/* Hero Section with Parallax */}
      <motion.div
        style={{ y }}
        className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-4"
      >
        <div className="absolute inset-0 bg-gradient-to-b from-blue-600/20 to-blue-500/20 dark:from-blue-900/20 dark:to-blue-900/20" />
        <div className="relative z-10 mx-auto flex w-full max-w-5xl flex-col items-center justify-center text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="font-playfair mb-6 bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text px-2 text-4xl font-bold tracking-tight text-transparent sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl"
          >
            Crafting the Future of AI
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="font-inter mx-auto max-w-3xl px-2 text-lg leading-relaxed text-gray-600 dark:text-gray-300 sm:text-xl md:text-2xl"
          >
            At PromptHive, we're revolutionizing how people interact with AI. Our mission is to
            empower creators, developers, and innovators with the tools they need to bring their
            ideas to life.
          </motion.p>
          {/* Hero Buttons - moved above scroll arrow */}
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <a
              href="/"
              className="inline-flex items-center gap-2 rounded-full border-2 border-blue-600 bg-transparent px-8 py-3 font-semibold text-blue-700 shadow transition hover:scale-105 hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-400 dark:text-blue-300 dark:hover:bg-blue-900/30"
            >
              <FaHome className="text-lg" />
              Go Home
            </a>
            <a
              href="/pricing"
              className="relative inline-flex transform items-center gap-2 overflow-hidden rounded-full bg-gradient-to-r from-blue-600 to-blue-500 px-8 py-3 font-semibold text-white shadow-lg transition hover:scale-105 hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-blue-400"
              style={{ position: 'relative' }}
            >
              <FaRocket className="text-lg" />
              Join PromptHive
              <span
                className="pointer-events-none absolute left-0 top-0 h-full w-full"
                style={{
                  background:
                    'linear-gradient(120deg,rgba(255,255,255,0.15) 0%,rgba(255,255,255,0.05) 100%)',
                  mixBlendMode: 'overlay',
                }}
              ></span>
            </a>
          </div>
          {/* Scroll Down Animation - reduced margin */}
          <motion.div
            initial={{ opacity: 0, y: 0 }}
            animate={{ opacity: [0, 1, 1, 0.7, 1], y: [0, 12, 6, 12, 0] }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              repeatType: 'loop',
              delay: 1,
              ease: 'easeInOut',
            }}
            className="mt-8 flex flex-col items-center"
            aria-label="Scroll down"
          >
            <svg
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="url(#arrow-gradient)"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="mx-auto"
            >
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

      <main className="mx-auto max-w-6xl px-4 py-16">
        {/* Mission Section */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="mb-20 grid grid-cols-1 gap-12 lg:grid-cols-2"
        >
          <motion.div
            variants={itemVariants}
            className="relative h-[400px] overflow-hidden rounded-2xl"
          >
            <Image
              src="/images/about-hero.jpg"
              alt="Team collaboration"
              fill
              className="object-cover"
              priority
            />
          </motion.div>
          <motion.div variants={itemVariants} className="flex flex-col justify-center">
            <h2 className="font-playfair mb-6 text-4xl font-bold tracking-tight">Our Mission</h2>
            <p className="font-inter mb-6 text-lg leading-relaxed text-gray-600 dark:text-gray-300">
              We believe that AI should be accessible to everyone. Our platform bridges the gap
              between complex AI systems and human creativity, making it easier than ever to harness
              the power of artificial intelligence.
            </p>
            <p className="font-inter text-lg leading-relaxed text-gray-600 dark:text-gray-300">
              Through innovative tools and a user-friendly interface, we're helping people across
              the globe unlock their creative potential and achieve their goals.
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
          <motion.h2
            variants={itemVariants}
            className="font-playfair mb-12 text-center text-4xl font-bold tracking-tight"
          >
            Our Journey
          </motion.h2>
          <div className="relative">
            <div className="absolute left-1/2 h-full w-1 -translate-x-1/2 transform bg-gradient-to-b from-blue-600 to-blue-500" />
            <div className="space-y-12">
              {timeline.map((item, index) => (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  className={`relative flex items-center ${index % 2 === 0 ? 'justify-start' : 'justify-end'}`}
                >
                  <div className={`w-1/2 ${index % 2 === 0 ? 'pr-12' : 'pl-12'}`}>
                    <div className="rounded-2xl bg-white p-6 shadow-xl dark:bg-gray-800">
                      <div className="mb-2 font-bold text-blue-600 dark:text-blue-400">
                        {item.year}
                      </div>
                      <h3 className="font-playfair mb-2 text-2xl font-bold">{item.title}</h3>
                      <p className="font-inter text-gray-600 dark:text-gray-300">
                        {item.description}
                      </p>
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
          className="mb-20 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4"
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              className="rounded-2xl bg-white p-8 shadow-xl transition-shadow hover:shadow-2xl dark:bg-gray-800"
            >
              <div className="mb-4 text-blue-600 dark:text-blue-400">{feature.icon}</div>
              <h3 className="font-playfair mb-4 text-2xl font-bold tracking-tight">
                {feature.title}
              </h3>
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
          <motion.h2
            variants={itemVariants}
            className="font-playfair mb-12 text-center text-4xl font-bold tracking-tight"
          >
            What Our Users Say
          </motion.h2>
          <div className="relative">
            <div className="mb-8 flex justify-center">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setActiveTestimonial(index)}
                  className={`mx-2 h-3 w-3 rounded-full transition-colors ${
                    activeTestimonial === index ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-700'
                  }`}
                />
              ))}
            </div>
            <motion.div
              key={activeTestimonial}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mx-auto max-w-3xl rounded-2xl bg-white p-8 shadow-xl dark:bg-gray-800"
            >
              <FaQuoteLeft className="mb-6 text-4xl text-blue-600 dark:text-blue-400" />
              <p className="font-inter mb-6 text-xl text-gray-600 dark:text-gray-300">
                {testimonials[activeTestimonial].quote}
              </p>
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-playfair text-xl font-bold">
                    {testimonials[activeTestimonial].author}
                  </h4>
                  <p className="font-inter text-gray-500 dark:text-gray-400">
                    {testimonials[activeTestimonial].role}
                  </p>
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
          <motion.h2
            variants={itemVariants}
            className="font-playfair mb-12 text-center text-4xl font-bold tracking-tight"
          >
            Meet Our Team
          </motion.h2>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {team.map((member, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                className="flex flex-col items-center overflow-hidden rounded-2xl bg-white shadow-xl dark:bg-gray-800"
              >
                <div className="relative flex h-64 w-full items-center justify-center bg-gray-100 dark:bg-gray-700">
                  {member.image ? (
                    <Image src={member.image} alt={member.name} fill className="object-cover" />
                  ) : (
                    <svg width="96" height="96" viewBox="0 0 24 24" fill="none" className="mx-auto">
                      <circle cx="12" cy="8" r="4" fill="#a21caf" />
                      <rect x="4" y="16" width="16" height="6" rx="3" fill="#db2777" />
                    </svg>
                  )}
                </div>
                <div className="p-6 text-center">
                  <h3 className="font-playfair mb-2 text-2xl font-bold">{member.name}</h3>
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
          <motion.h2
            variants={itemVariants}
            className="font-playfair mb-12 text-center text-4xl font-bold tracking-tight"
          >
            Frequently Asked Questions
          </motion.h2>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                className="rounded-2xl bg-white p-8 shadow-xl dark:bg-gray-800"
              >
                <h3 className="font-playfair mb-4 text-2xl font-bold">{faq.question}</h3>
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
          className="grid grid-cols-1 gap-8 md:grid-cols-3"
        >
          {[
            { number: 'Day 1', label: 'Just Launched' },
            { number: '100%', label: 'Fresh Start' },
            { number: '∞', label: 'Future Potential' },
          ].map((stat, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              className="rounded-2xl bg-white p-8 text-center shadow-xl dark:bg-gray-800"
            >
              <div className="font-playfair mb-2 bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text text-5xl font-bold text-transparent">
                {stat.number}
              </div>
              <div className="font-inter text-lg text-gray-600 dark:text-gray-300">
                {stat.label}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </main>
    </div>
  );
}
