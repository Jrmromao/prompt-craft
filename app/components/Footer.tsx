import Link from 'next/link';
// import Image from "next/image"; // Uncomment if you have a logo
import { FaTwitter, FaLinkedin, FaGithub } from 'react-icons/fa';

export function Footer() {
  return (
    <footer className="mt-16 w-full border-t border-border bg-gradient-to-b from-background to-muted/60 px-4 py-10 text-muted-foreground">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-8 md:flex-row md:items-start">
        {/* Left: Logo & Brand */}
        <div className="flex flex-col items-center gap-2 md:items-start">
          {/* Uncomment and add your logo if available */}
          {/* <Image src="/logo.svg" alt="PromptCraft Logo" width={36} height={36} className="mb-1" /> */}
          <span className="text-lg font-bold tracking-tight text-foreground">PromptCraft</span>
          <span className="text-xs text-muted-foreground">Create & share AI prompts</span>
        </div>
        {/* Center: Business & Legal Links */}
        <div className="flex flex-col items-center gap-2">
          <div className="flex flex-wrap justify-center gap-4 text-sm font-medium">
            <Link href="/about" className="hover:underline">
              About
            </Link>
            <Link href="/careers" className="hover:underline">
              Careers
            </Link>
            <Link href="/blog" className="hover:underline">
              Blog
            </Link>
            <Link href="/contact" className="hover:underline">
              Contact
            </Link>
            <Link href="/support" className="hover:underline">
              Support
            </Link>
            <span className="text-muted-foreground">|</span>
            <Link href="/legal/terms" className="hover:underline">
              Terms of Service
            </Link>
            <Link href="/legal/privacy" className="hover:underline">
              Privacy Policy
            </Link>
          </div>
          <div className="mt-1 text-xs">
            &copy; {new Date().getFullYear()} PromptCraft. All rights reserved.
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
              className="transition-colors hover:text-purple-500"
            >
              <FaTwitter />
            </a>
            <a
              href="https://linkedin.com/"
              target="_blank"
              rel="noopener"
              aria-label="LinkedIn"
              className="transition-colors hover:text-purple-500"
            >
              <FaLinkedin />
            </a>
            <a
              href="https://github.com/"
              target="_blank"
              rel="noopener"
              aria-label="GitHub"
              className="transition-colors hover:text-purple-500"
            >
              <FaGithub />
            </a>
          </div>
          <div className="text-xs">
            Legal:{' '}
            <a href="mailto:egal@PromptCraft.co" className="underline">
              egal@PromptCraft.co
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
