"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";

export default function Navigation() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Prevent scrolling when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [mobileMenuOpen]);
  
  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <header className="z-10 py-5 border-b border-github-border flex items-center justify-between w-full overflow-hidden">
      <Link href="/" className="flex items-center gap-2 text-xl font-bold z-10 shrink-0">
        <div className="relative h-8 w-8 sm:h-10 sm:w-10">
          <Image 
            src="/logo.png" 
            alt="OctoSearch Logo" 
            fill 
            className="object-contain"
            priority
          />
        </div>
        <span className="bg-clip-text text-transparent bg-gradient-to-r from-neon-purple via-neon-blue to-neon-cyan">
          OctoSearch
        </span>
      </Link>
      
      {/* Mobile menu button */}
      <button 
        className="md:hidden z-10 p-2 shrink-0"
        onClick={toggleMobileMenu}
        aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
      >
        {mobileMenuOpen ? (
          <svg className="h-6 w-6 text-github-text" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="h-6 w-6 text-github-text" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        )}
      </button>
      
      {/* Desktop Navigation */}
      <nav className="hidden md:block">
        <ul className="flex items-center gap-4 lg:gap-6 flex-nowrap">
          <li>
            <Link href="/" className="text-github-text-secondary hover:text-github-text transition-colors whitespace-nowrap">
              Home
            </Link>
          </li>
          <li>
            <Link href="/explore" className="text-github-text-secondary hover:text-github-text transition-colors whitespace-nowrap">
              Explore
            </Link>
          </li>
          <li>
            <Link href="/trending" className="text-github-text-secondary hover:text-github-text transition-colors whitespace-nowrap">
              Trending
            </Link>
          </li>
          <li>
            <a 
              href="https://github.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="btn btn-primary inline-flex items-center shrink-0"
            >
              <svg 
                className="mr-2 h-4 w-4 shrink-0" 
                fill="currentColor" 
                viewBox="0 0 24 24"
              >
                <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
              </svg>
              <span className="whitespace-nowrap">GitHub</span>
            </a>
          </li>
        </ul>
      </nav>
      
      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-0 bg-github-dark bg-opacity-95 flex items-center justify-center overflow-hidden">
          <nav className="py-5 w-full px-6">
            <ul className="flex flex-col items-center gap-8 text-xl">
              <li>
                <Link 
                  href="/" 
                  className="text-github-text-secondary hover:text-github-text transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Home
                </Link>
              </li>
              <li>
                <Link 
                  href="/explore" 
                  className="text-github-text-secondary hover:text-github-text transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Explore
                </Link>
              </li>
              <li>
                <Link 
                  href="/trending" 
                  className="text-github-text-secondary hover:text-github-text transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Trending
                </Link>
              </li>
              <li>
                <a 
                  href="https://github.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="btn btn-primary flex items-center"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <svg 
                    className="mr-2 h-4 w-4" 
                    fill="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                  </svg>
                  GitHub
                </a>
              </li>
            </ul>
          </nav>
        </div>
      )}
    </header>
  );
}
