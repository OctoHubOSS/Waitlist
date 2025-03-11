"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { FaBars, FaGithub, FaTimes } from "react-icons/fa";

export default function Navigation() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Prevent scrolling when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [mobileMenuOpen]);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <header className="z-10 mb-4 flex w-full items-center justify-between overflow-hidden border-b border-github-border py-5">
      <Link className="z-10 flex shrink-0 items-center gap-2 text-xl font-bold" href="/">
        <div className="relative h-8 w-8 sm:h-10 sm:w-10">
          <Image
            alt="OctoSearch Logo"
            className="object-contain"
            fill
            priority
            src="/logo.webp"
          />
        </div>
        <span className="bg-gradient-to-r from-neon-purple via-neon-blue to-neon-cyan bg-clip-text text-transparent">
          OctoSearch
        </span>
      </Link>

      {/* Mobile menu button */}
      <button
        aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
        className="z-20 shrink-0 p-2 text-github-text transition-transform duration-300 md:hidden"
        onClick={toggleMobileMenu}
        type="button"
      >
        {mobileMenuOpen ? <FaTimes className="h-6 w-6" /> : <FaBars className="h-6 w-6" />}
      </button>

      {/* Desktop Navigation */}
      <nav className="hidden md:block">
        <ul className="flex flex-nowrap items-center gap-4 lg:gap-6">
          <li>
            <Link
              className="whitespace-nowrap text-github-text-secondary transition-colors hover:text-github-text"
              href="/"
            >
              Home
            </Link>
          </li>
          <li>
            <Link
              className="whitespace-nowrap text-github-text-secondary transition-colors hover:text-github-text"
              href="/explore"
            >
              Explore
            </Link>
          </li>
          <li>
            <Link
              className="whitespace-nowrap text-github-text-secondary transition-colors hover:text-github-text"
              href="/trending"
            >
              Trending
            </Link>
          </li>
          <li>
            <a
              className="btn btn-primary inline-flex shrink-0 items-center"
              href="https://github.com"
              rel="noopener noreferrer"
              target="_blank"
            >
              <FaGithub className="mr-2 h-4 w-4 shrink-0" />
              <span className="whitespace-nowrap">GitHub</span>
            </a>
          </li>
        </ul>
      </nav>

      {/* Mobile Navigation */}
      {mobileMenuOpen ? (
        <div className="fixed inset-0 z-10 flex flex-col items-center justify-start overflow-hidden bg-github-dark bg-opacity-95 pt-20 transition-transform duration-300 md:hidden">
          <nav className="w-full px-6">
            <ul className="flex flex-col items-center gap-6 text-xl">
              <li>
                <Link
                  className="rounded-md px-4 py-2 text-github-text-secondary transition-colors hover:text-github-text"
                  href="/"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  className="rounded-md px-4 py-2 text-github-text-secondary transition-colors hover:text-github-text"
                  href="/explore"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Explore
                </Link>
              </li>
              <li>
                <Link
                  className="rounded-md px-4 py-2 text-github-text-secondary transition-colors hover:text-github-text"
                  href="/trending"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Trending
                </Link>
              </li>
              <li>
                <a
                  className="btn btn-primary flex rounded-md px-4 py-2"
                  href="https://github.com"
                  onClick={() => setMobileMenuOpen(false)}
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  <FaGithub className="mr-2 h-4 w-4" />
                  GitHub
                </a>
              </li>
            </ul>
          </nav>
        </div>
      ) : null}
    </header>
  );
}