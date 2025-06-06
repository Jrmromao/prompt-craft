"use client";
import { useUser } from '@clerk/nextjs';
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { FaTwitter, FaLinkedin, FaGithub, FaEnvelope, FaPhone, FaMapMarkerAlt } from "react-icons/fa";
import { motion } from "framer-motion";
import { Inter, Playfair_Display } from 'next/font/google';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const playfair = Playfair_Display({ subsets: ['latin'], variable: '--font-playfair' });

export default function ContactPage() {
  const { user } = useUser();
  const [form, setForm] = useState({
    name: user?.fullName || "",
    email: user?.primaryEmailAddress?.emailAddress || "",
    message: ""
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [submitted, setSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  function validate() {
    const newErrors: { [key: string]: string } = {};
    if (!form.name.trim()) newErrors.name = "Name is required.";
    if (!form.email.trim()) newErrors.email = "Email is required.";
    else if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email)) newErrors.email = "Enter a valid email.";
    if (!form.message.trim()) newErrors.message = "Message is required.";
    return newErrors;
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
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
      name: user?.fullName || "",
      email: user?.primaryEmailAddress?.emailAddress || "",
      message: ""
    });
  }

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

  return (
    <div className={`min-h-screen bg-gradient-to-b from-white to-gray-50 dark:from-black dark:to-gray-900 text-gray-900 dark:text-white ${inter.variable} ${playfair.variable}`}>
      <main className="max-w-6xl mx-auto px-4 py-16 w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h1 className="font-playfair text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600 tracking-tight">
            Get in Touch
          </h1>
          <p className="font-inter text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto leading-relaxed">
            Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-8"
          >
            <motion.div variants={itemVariants} className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
              <h2 className="font-playfair text-3xl font-bold mb-8 tracking-tight">Contact Information</h2>
              <div className="space-y-8">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-full">
                    <FaEnvelope className="text-purple-600 dark:text-purple-400 text-xl" />
                  </div>
                  <div>
                    <p className="font-inter text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Email</p>
                    <a href="mailto:support@promptcraft.ai" className="font-inter text-gray-900 dark:text-white hover:text-purple-600 dark:hover:text-purple-400 transition text-lg">
                      support@promptcraft.ai
                    </a>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-pink-100 dark:bg-pink-900 rounded-full">
                    <FaPhone className="text-pink-600 dark:text-pink-400 text-xl" />
                  </div>
                  <div>
                    <p className="font-inter text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Phone</p>
                    <a href="tel:+1234567890" className="font-inter text-gray-900 dark:text-white hover:text-pink-600 dark:hover:text-pink-400 transition text-lg">
                      +1 (234) 567-890
                    </a>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-full">
                    <FaMapMarkerAlt className="text-blue-600 dark:text-blue-400 text-xl" />
                  </div>
                  <div>
                    <p className="font-inter text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Location</p>
                    <p className="font-inter text-gray-900 dark:text-white text-lg">San Francisco, CA</p>
                  </div>
                </div>
              </div>

              <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
                <h3 className="font-playfair text-2xl font-bold mb-6 tracking-tight">Follow Us</h3>
                <div className="flex space-x-4">
                  <a
                    href="https://twitter.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 bg-gray-100 dark:bg-gray-700 rounded-full hover:bg-purple-100 dark:hover:bg-purple-900 transition group"
                  >
                    <FaTwitter className="text-xl text-gray-600 dark:text-gray-300 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition" />
                  </a>
                  <a
                    href="https://linkedin.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 bg-gray-100 dark:bg-gray-700 rounded-full hover:bg-blue-100 dark:hover:bg-blue-900 transition group"
                  >
                    <FaLinkedin className="text-xl text-gray-600 dark:text-gray-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition" />
                  </a>
                  <a
                    href="https://github.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 bg-gray-100 dark:bg-gray-700 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition group"
                  >
                    <FaGithub className="text-xl text-gray-600 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white transition" />
                  </a>
                </div>
              </div>
            </motion.div>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8"
          >
            {submitted ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center space-y-4"
              >
                <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div className="font-playfair text-3xl font-bold text-green-600 dark:text-green-400 tracking-tight">Thank you!</div>
                <div className="font-inter text-gray-600 dark:text-gray-300 text-lg">Your message has been sent. We'll get back to you soon.</div>
                <button
                  className="mt-6 px-6 py-3 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold shadow-lg hover:from-purple-700 hover:to-pink-700 transition transform hover:scale-105 font-inter"
                  onClick={() => setSubmitted(false)}
                >
                  Send another message
                </button>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-8">
                <motion.div variants={itemVariants}>
                  <label htmlFor="name" className="font-inter block text-sm font-medium mb-2 uppercase tracking-wide text-gray-500 dark:text-gray-400">Name</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    className={`font-inter w-full px-4 py-3 rounded-lg border transition-colors text-lg ${
                      errors.name 
                        ? 'border-red-500 focus:border-red-500 focus:ring-red-500' 
                        : 'border-gray-300 dark:border-gray-700 focus:border-purple-500 focus:ring-purple-500'
                    } bg-white dark:bg-gray-900 focus:outline-none focus:ring-2`}
                    autoComplete="name"
                    disabled={!!user?.fullName}
                    aria-invalid={!!errors.name}
                    aria-describedby={errors.name ? "name-error" : undefined}
                  />
                  {errors.name && (
                    <p id="name-error" className="font-inter mt-1 text-sm text-red-500">{errors.name}</p>
                  )}
                </motion.div>

                <motion.div variants={itemVariants}>
                  <label htmlFor="email" className="font-inter block text-sm font-medium mb-2 uppercase tracking-wide text-gray-500 dark:text-gray-400">Email</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    className={`font-inter w-full px-4 py-3 rounded-lg border transition-colors text-lg ${
                      errors.email 
                        ? 'border-red-500 focus:border-red-500 focus:ring-red-500' 
                        : 'border-gray-300 dark:border-gray-700 focus:border-purple-500 focus:ring-purple-500'
                    } bg-white dark:bg-gray-900 focus:outline-none focus:ring-2`}
                    autoComplete="email"
                    disabled={!!user?.primaryEmailAddress?.emailAddress}
                    aria-invalid={!!errors.email}
                    aria-describedby={errors.email ? "email-error" : undefined}
                  />
                  {errors.email && (
                    <p id="email-error" className="font-inter mt-1 text-sm text-red-500">{errors.email}</p>
                  )}
                </motion.div>

                <motion.div variants={itemVariants}>
                  <label htmlFor="message" className="font-inter block text-sm font-medium mb-2 uppercase tracking-wide text-gray-500 dark:text-gray-400">Message</label>
                  <textarea
                    id="message"
                    name="message"
                    value={form.message}
                    onChange={handleChange}
                    rows={5}
                    className={`font-inter w-full px-4 py-3 rounded-lg border transition-colors text-lg ${
                      errors.message 
                        ? 'border-red-500 focus:border-red-500 focus:ring-red-500' 
                        : 'border-gray-300 dark:border-gray-700 focus:border-purple-500 focus:ring-purple-500'
                    } bg-white dark:bg-gray-900 focus:outline-none focus:ring-2`}
                    placeholder="How can we help you?"
                    aria-invalid={!!errors.message}
                    aria-describedby={errors.message ? "message-error" : undefined}
                  />
                  {errors.message && (
                    <p id="message-error" className="font-inter mt-1 text-sm text-red-500">{errors.message}</p>
                  )}
                </motion.div>

                <motion.div variants={itemVariants}>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className={`font-inter w-full py-3 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold shadow-lg hover:from-purple-700 hover:to-pink-700 transition transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed text-lg ${
                      isLoading ? 'animate-pulse' : ''
                    }`}
                  >
                    {isLoading ? (
                      <span className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
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