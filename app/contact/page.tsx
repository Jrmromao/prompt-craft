"use client";
import { useUser } from '@clerk/nextjs';
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { FaTwitter, FaLinkedin, FaGithub } from "react-icons/fa";
import { NavBar } from "@/components/layout/NavBar";

export default function ContactPage() {
  const { user, isSignedIn } = useUser();
  const navUser = isSignedIn
    ? {
        name: [user.firstName, user.lastName].filter(Boolean).join(' ') || user.username || 'User',
        email: user.emailAddresses?.[0]?.emailAddress || '',
        imageUrl: user.imageUrl,
      }
    : undefined;

  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [submitted, setSubmitted] = useState(false);

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

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const validation = validate();
    if (Object.keys(validation).length > 0) {
      setErrors(validation);
      return;
    }
    // Here you would send the form to your backend
    setSubmitted(true);
    setForm({ name: "", email: "", message: "" });
  }

  return (
    <>
      <NavBar user={navUser} />
      <main className="min-h-[70vh] flex flex-col items-center justify-center px-4 py-16 bg-background text-foreground">
        {/* Logo */}
        <div className="mb-6 flex justify-center">
          <Image src="/geometric.svg" alt="PromptCraft Logo" width={56} height={56} className="rounded-xl shadow" priority />
        </div>
        {/* Hero Section */}
        <section className="w-full max-w-2xl text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent mb-4">Contact Us</h1>
          <p className="text-lg text-muted-foreground mb-2">
            We'd love to hear from you! Reach out with questions, feedback, or partnership ideas.
          </p>
        </section>
        {/* Contact Form & Info */}
        <section className="w-full max-w-3xl bg-card border border-border rounded-2xl shadow-lg p-8 flex flex-col md:flex-row gap-10">
          {/* Contact Form */}
          <form className="flex-1 flex flex-col gap-4" onSubmit={handleSubmit} noValidate>
            <label className="text-sm font-medium text-foreground" htmlFor="name">Name</label>
            <input
              id="name"
              name="name"
              type="text"
              value={form.name}
              onChange={handleChange}
              required
              className={`px-3 py-2 rounded border ${errors.name ? "border-red-500" : "border-border"} bg-background text-sm focus:outline-none focus:ring-2 focus:ring-purple-500`}
              placeholder="Your name"
              aria-invalid={!!errors.name}
              aria-describedby="name-error"
            />
            {errors.name && <span id="name-error" className="text-xs text-red-500">{errors.name}</span>}

            <label className="text-sm font-medium text-foreground" htmlFor="email">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              required
              className={`px-3 py-2 rounded border ${errors.email ? "border-red-500" : "border-border"} bg-background text-sm focus:outline-none focus:ring-2 focus:ring-purple-500`}
              placeholder="you@email.com"
              aria-invalid={!!errors.email}
              aria-describedby="email-error"
            />
            {errors.email && <span id="email-error" className="text-xs text-red-500">{errors.email}</span>}

            <label className="text-sm font-medium text-foreground" htmlFor="message">Message</label>
            <textarea
              id="message"
              name="message"
              value={form.message}
              onChange={handleChange}
              required
              rows={5}
              className={`px-3 py-2 rounded border ${errors.message ? "border-red-500" : "border-border"} bg-background text-sm focus:outline-none focus:ring-2 focus:ring-purple-500`}
              placeholder="How can we help you?"
              aria-invalid={!!errors.message}
              aria-describedby="message-error"
            />
            {errors.message && <span id="message-error" className="text-xs text-red-500">{errors.message}</span>}

            <button type="submit" className="mt-2 px-6 py-2 rounded bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold shadow hover:from-purple-700 hover:to-pink-700 transition">Send Message</button>
            {submitted && <div className="text-green-600 text-sm mt-2">Thank you for reaching out! We'll get back to you soon.</div>}
          </form>
          {/* Contact Info */}
          <div className="flex-1 flex flex-col gap-4 justify-center items-center md:items-start">
            <div>
              <span className="font-semibold">Email:</span> <a href="mailto:hello@PromptCraft.com" className="underline">hello@PromptCraft.com</a>
            </div>
            <div>
              <span className="font-semibold">Legal:</span> <a href="mailto:egal@PromptCraft.co" className="underline">egal@PromptCraft.co</a>
            </div>
            <div>
              <span className="font-semibold">Follow us:</span>
              <div className="flex gap-3 mt-1 text-xl">
                <a href="https://twitter.com/" target="_blank" rel="noopener" aria-label="Twitter" className="hover:text-purple-500 transition-colors"><FaTwitter /></a>
                <a href="https://linkedin.com/" target="_blank" rel="noopener" aria-label="LinkedIn" className="hover:text-purple-500 transition-colors"><FaLinkedin /></a>
                <a href="https://github.com/" target="_blank" rel="noopener" aria-label="GitHub" className="hover:text-purple-500 transition-colors"><FaGithub /></a>
              </div>
            </div>
            <div className="text-xs text-muted-foreground mt-4">
              PromptCraft, Inc.<br />
              Lisbon, Portugal
            </div>
          </div>
        </section>
      </main>
    </>
  );
} 