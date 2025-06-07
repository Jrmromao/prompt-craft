'use client';
import { useUser } from '@clerk/nextjs';
import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  FaTwitter,
  FaLinkedin,
  FaGithub,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
} from 'react-icons/fa';
import { motion } from 'framer-motion';
import { Inter, Playfair_Display } from 'next/font/google';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
});

export default function ContactPage() {
  const { user } = useUser();
  const [form, setForm] = useState({
    name: user?.fullName || '',
    email: user?.primaryEmailAddress?.emailAddress || '',
    message: '',
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [submitted, setSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  function validate() {
    const newErrors: { [key: string]: string } = {};
    if (!form.name.trim()) newErrors.name = 'Name is required.';
    if (!form.email.trim()) newErrors.email = 'Email is required.';
    else if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email))
      newErrors.email = 'Enter a valid email.';
    if (!form.message.trim()) newErrors.message = 'Message is required.';
    return newErrors;
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: '' });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const validation = validate();
    if (Object.keys(validation).length > 0) {
      setErrors(validation);
      return;
    }
    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    setSubmitted(true);
    setIsLoading(false);
    setForm({
      name: user?.fullName || '',
      email: user?.primaryEmailAddress?.emailAddress || '',
      message: '',
    });
  }

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

  return (
    <div
      className={`min-h-screen bg-gradient-to-b from-white to-gray-50 text-gray-900 dark:from-black dark:to-gray-900 dark:text-white ${inter.variable} ${playfair.variable}`}
    >
      <main className="mx-auto w-full max-w-6xl px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-16 text-center"
        >
          <h1 className="font-playfair mb-6 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-6xl font-bold tracking-tight text-transparent">
            Get in Touch
          </h1>
          <p className="font-inter mx-auto max-w-2xl text-xl leading-relaxed text-gray-600 dark:text-gray-300">
            Have questions? We'd love to hear from you. Send us a message and we'll respond as soon
            as possible.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-8"
          >
            <motion.div
              variants={itemVariants}
              className="rounded-2xl bg-white p-8 shadow-xl dark:bg-gray-800"
            >
              <h2 className="font-playfair mb-8 text-3xl font-bold tracking-tight">
                Contact Information
              </h2>
              <div className="space-y-8">
                <div className="flex items-center space-x-4">
                  <div className="rounded-full bg-purple-100 p-3 dark:bg-purple-900">
                    <FaEnvelope className="text-xl text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <p className="font-inter text-sm font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
                      Email
                    </p>
                    <a
                      href="mailto:support@promptcraft.ai"
                      className="font-inter text-lg text-gray-900 transition hover:text-purple-600 dark:text-white dark:hover:text-purple-400"
                    >
                      support@promptcraft.ai
                    </a>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="rounded-full bg-pink-100 p-3 dark:bg-pink-900">
                    <FaPhone className="text-xl text-pink-600 dark:text-pink-400" />
                  </div>
                  <div>
                    <p className="font-inter text-sm font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
                      Phone
                    </p>
                    <a
                      href="tel:+1234567890"
                      className="font-inter text-lg text-gray-900 transition hover:text-pink-600 dark:text-white dark:hover:text-pink-400"
                    >
                      +1 (234) 567-890
                    </a>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="rounded-full bg-blue-100 p-3 dark:bg-blue-900">
                    <FaMapMarkerAlt className="text-xl text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="font-inter text-sm font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
                      Location
                    </p>
                    <p className="font-inter text-lg text-gray-900 dark:text-white">
                      San Francisco, CA
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-12 border-t border-gray-200 pt-8 dark:border-gray-700">
                <h3 className="font-playfair mb-6 text-2xl font-bold tracking-tight">Follow Us</h3>
                <div className="flex space-x-4">
                  <a
                    href="https://twitter.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group rounded-full bg-gray-100 p-3 transition hover:bg-purple-100 dark:bg-gray-700 dark:hover:bg-purple-900"
                  >
                    <FaTwitter className="text-xl text-gray-600 transition group-hover:text-purple-600 dark:text-gray-300 dark:group-hover:text-purple-400" />
                  </a>
                  <a
                    href="https://linkedin.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group rounded-full bg-gray-100 p-3 transition hover:bg-blue-100 dark:bg-gray-700 dark:hover:bg-blue-900"
                  >
                    <FaLinkedin className="text-xl text-gray-600 transition group-hover:text-blue-600 dark:text-gray-300 dark:group-hover:text-blue-400" />
                  </a>
                  <a
                    href="https://github.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group rounded-full bg-gray-100 p-3 transition hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600"
                  >
                    <FaGithub className="text-xl text-gray-600 transition group-hover:text-gray-900 dark:text-gray-300 dark:group-hover:text-white" />
                  </a>
                </div>
              </div>
            </motion.div>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="rounded-2xl bg-white p-8 shadow-xl dark:bg-gray-800"
          >
            {submitted ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-4 text-center"
              >
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
                  <svg
                    className="h-8 w-8 text-green-600 dark:text-green-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <div className="font-playfair text-3xl font-bold tracking-tight text-green-600 dark:text-green-400">
                  Thank you!
                </div>
                <div className="font-inter text-lg text-gray-600 dark:text-gray-300">
                  Your message has been sent. We'll get back to you soon.
                </div>
                <button
                  className="font-inter mt-6 transform rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-3 font-semibold text-white shadow-lg transition hover:scale-105 hover:from-purple-700 hover:to-pink-700"
                  onClick={() => setSubmitted(false)}
                >
                  Send another message
                </button>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-8">
                <motion.div variants={itemVariants}>
                  <label
                    htmlFor="name"
                    className="font-inter mb-2 block text-sm font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400"
                  >
                    Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    className={`font-inter w-full rounded-lg border px-4 py-3 text-lg transition-colors ${
                      errors.name
                        ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                        : 'border-gray-300 focus:border-purple-500 focus:ring-purple-500 dark:border-gray-700'
                    } bg-white focus:outline-none focus:ring-2 dark:bg-gray-900`}
                    autoComplete="name"
                    disabled={!!user?.fullName}
                    aria-invalid={!!errors.name}
                    aria-describedby={errors.name ? 'name-error' : undefined}
                  />
                  {errors.name && (
                    <p id="name-error" className="font-inter mt-1 text-sm text-red-500">
                      {errors.name}
                    </p>
                  )}
                </motion.div>

                <motion.div variants={itemVariants}>
                  <label
                    htmlFor="email"
                    className="font-inter mb-2 block text-sm font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400"
                  >
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    className={`font-inter w-full rounded-lg border px-4 py-3 text-lg transition-colors ${
                      errors.email
                        ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                        : 'border-gray-300 focus:border-purple-500 focus:ring-purple-500 dark:border-gray-700'
                    } bg-white focus:outline-none focus:ring-2 dark:bg-gray-900`}
                    autoComplete="email"
                    disabled={!!user?.primaryEmailAddress?.emailAddress}
                    aria-invalid={!!errors.email}
                    aria-describedby={errors.email ? 'email-error' : undefined}
                  />
                  {errors.email && (
                    <p id="email-error" className="font-inter mt-1 text-sm text-red-500">
                      {errors.email}
                    </p>
                  )}
                </motion.div>

                <motion.div variants={itemVariants}>
                  <label
                    htmlFor="message"
                    className="font-inter mb-2 block text-sm font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400"
                  >
                    Message
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={form.message}
                    onChange={handleChange}
                    rows={5}
                    className={`font-inter w-full rounded-lg border px-4 py-3 text-lg transition-colors ${
                      errors.message
                        ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                        : 'border-gray-300 focus:border-purple-500 focus:ring-purple-500 dark:border-gray-700'
                    } bg-white focus:outline-none focus:ring-2 dark:bg-gray-900`}
                    placeholder="How can we help you?"
                    aria-invalid={!!errors.message}
                    aria-describedby={errors.message ? 'message-error' : undefined}
                  />
                  {errors.message && (
                    <p id="message-error" className="font-inter mt-1 text-sm text-red-500">
                      {errors.message}
                    </p>
                  )}
                </motion.div>

                <motion.div variants={itemVariants}>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className={`font-inter w-full transform rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 py-3 text-lg font-semibold text-white shadow-lg transition hover:scale-105 hover:from-purple-700 hover:to-pink-700 disabled:cursor-not-allowed disabled:opacity-50 ${
                      isLoading ? 'animate-pulse' : ''
                    }`}
                  >
                    {isLoading ? (
                      <span className="flex items-center justify-center">
                        <svg
                          className="-ml-1 mr-3 h-5 w-5 animate-spin text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        Sending...
                      </span>
                    ) : (
                      'Send Message'
                    )}
                  </button>
                </motion.div>
              </form>
            )}
          </motion.div>
        </div>
      </main>
    </div>
  );
}
