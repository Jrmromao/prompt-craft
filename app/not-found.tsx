'use client';
import { Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-purple-100 via-yellow-50 to-white">
      <motion.div
        initial={{ scale: 0.8, rotate: -10, opacity: 0 }}
        animate={{ scale: 1, rotate: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 10 }}
        className="mb-6"
      >
        <Sparkles className="h-16 w-16 text-purple-500 drop-shadow-lg" />
      </motion.div>
      <motion.h1
        initial={{ y: -40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, type: 'spring', stiffness: 120 }}
        className="text-5xl font-extrabold mb-4 bg-gradient-to-r from-purple-600 via-yellow-500 to-pink-500 bg-clip-text text-transparent"
      >
        404 - Prompt Not Found
      </motion.h1>
      <motion.p
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="mb-4 text-lg text-purple-900 text-center max-w-md"
      >
        Oops! Even our AI couldn't dream up this page. Maybe you were looking for a prompt that doesn't exist yet? 🤖✨
      </motion.p>
      <motion.a
        href="/"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.6, type: 'spring', stiffness: 200 }}
        className="text-lg font-semibold px-6 py-2 rounded-full bg-gradient-to-r from-purple-500 via-yellow-400 to-pink-400 text-white shadow-lg hover:from-purple-600 hover:to-pink-500 transition"
      >
        Return to PromptHive Home
      </motion.a>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="mt-8 text-sm text-purple-700"
      >
        Tip: Try asking our AI for a new prompt idea!
      </motion.p>
    </div>
  );
}
