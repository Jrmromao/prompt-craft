import Link from "next/link";
// import Image from "next/image"; // Uncomment if you have a logo
import { FaTwitter, FaLinkedin, FaGithub } from "react-icons/fa";

export function Footer() {
  return (
    <footer className="w-full border-t border-border bg-gradient-to-b from-background to-muted/60 py-10 px-4 mt-16 text-muted-foreground">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center md:items-start justify-between gap-8">
        {/* Left: Logo & Brand */}
        <div className="flex flex-col items-center md:items-start gap-2">
          {/* Uncomment and add your logo if available */}
          {/* <Image src="/logo.svg" alt="PromptCraft Logo" width={36} height={36} className="mb-1" /> */}
          <span className="text-lg font-bold tracking-tight text-foreground">PromptCraft</span>
          <span className="text-xs text-muted-foreground">Create & share AI prompts</span>
        </div>
        {/* Center: Business & Legal Links */}
        <div className="flex flex-col items-center gap-2">
          <div className="flex flex-wrap justify-center gap-4 text-sm font-medium">
            <Link href="/about" className="hover:underline">About</Link>
            <Link href="/careers" className="hover:underline">Careers</Link>
            <Link href="/blog" className="hover:underline">Blog</Link>
            <Link href="/contact" className="hover:underline">Contact</Link>
            <span className="text-muted-foreground">|</span>
            <Link href="/legal/terms" className="hover:underline">Terms of Service</Link>
            <Link href="/legal/privacy" className="hover:underline">Privacy Policy</Link>
          </div>
          <div className="text-xs mt-1">&copy; {new Date().getFullYear()} PromptCraft. All rights reserved.</div>
        </div>
        {/* Right: Social & Contact */}
        <div className="flex flex-col items-center md:items-end gap-2">
          <div className="flex gap-3 text-xl">
            <a href="https://twitter.com/" target="_blank" rel="noopener" aria-label="Twitter" className="hover:text-purple-500 transition-colors"><FaTwitter /></a>
            <a href="https://linkedin.com/" target="_blank" rel="noopener" aria-label="LinkedIn" className="hover:text-purple-500 transition-colors"><FaLinkedin /></a>
            <a href="https://github.com/" target="_blank" rel="noopener" aria-label="GitHub" className="hover:text-purple-500 transition-colors"><FaGithub /></a>
          </div>
          <div className="text-xs">
            Legal: <a href="mailto:legal@promptcraft.com" className="underline">legal@promptcraft.com</a>
          </div>
        </div>
      </div>
    </footer>
  );
} 