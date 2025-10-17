import Link from 'next/link';
// import Image from "next/image"; // Uncomment if you have a logo
import { Sparkles } from 'lucide-react';
import { FaTwitter, FaLinkedin, FaGithub } from 'react-icons/fa';

export function Footer() {
  return (
    <footer className="relative z-20 mt-16 w-full border-t border-border bg-gradient-to-b from-background to-muted/60 px-4 py-10 text-muted-foreground">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-8 md:flex-row md:items-start">
        {/* Left: Logo & Brand */}
        <div className="flex flex-col items-center gap-2 md:items-start">
          <div
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-r from-blue-500 to-blue-500"
            aria-label="CostLens Logo"
          >
            <Sparkles className="h-5 w-5 text-white" aria-hidden="true" />
          </div>
          <span className="bg-gradient-to-r from-blue-400 to-blue-400 bg-clip-text text-xl font-bold text-transparent">
            CostLens
          </span>
          <span className="text-xs text-muted-foreground">Create & share AI prompts</span>
        </div>
        {/* Center: Legal Links */}
        <div className="flex flex-col items-center gap-2">
          <div className="flex flex-wrap justify-center gap-4 text-sm font-medium">
            <Link href="/legal/terms-of-service" className="hover:underline">
              Terms of Service
            </Link>
            <span className="text-muted-foreground">|</span>
            <Link href="/legal/privacy-policy" className="hover:underline">
              Privacy Policy
            </Link>
          </div>
          <div className="mt-1 text-xs">
            &copy; {new Date().getFullYear()} CostLens. All rights reserved.
          </div>
        </div>
        {/* Right: Social & Contact */}
        <div className="flex flex-col items-center gap-2 md:items-end">
          <div className="flex gap-3 text-xl">
            <a
              href="https://twitter.com/"
              target="_blank"
              rel="noopener"
              aria-label="Twitter"
              className="transition-colors hover:text-blue-500"
            >
              <FaTwitter />
            </a>
            <a
              href="https://linkedin.com/"
              target="_blank"
              rel="noopener"
              aria-label="LinkedIn"
              className="transition-colors hover:text-blue-500"
            >
              <FaLinkedin />
            </a>
            <a
              href="https://github.com/"
              target="_blank"
              rel="noopener"
              aria-label="GitHub"
              className="transition-colors hover:text-blue-500"
            >
              <FaGithub />
            </a>
          </div>
          <div className="text-xs">
            Legal:{' '}
            <a href="mailto:egal@CostLens.co" className="underline">
              legal@CostLens.co
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
