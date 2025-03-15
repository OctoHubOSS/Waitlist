"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import {
  FaBars,
  FaGithub,
  FaTimes,
  FaUser,
  FaSignOutAlt,
  FaCog,
  FaChevronDown,
} from "react-icons/fa";
import { useSession } from "next-auth/react";

// Navigation link structures for easy maintenance
const mainNavLinks = [
  { name: "Home", href: "/" },
  { name: "Explore", href: "/explore" },
  { name: "Trending", href: "/trending" },
];

const docsLinks = [
  { name: "Introduction", href: "/docs/introduction" },
  { name: "API Reference", href: "/docs/api/overview" },
];

const extrasLinks = [
  { name: "About Us", href: "/about" },
  { name: "Changelogs", href: "/changes" },
];

const legalLinks = [
  { name: "Terms", href: "/legal/terms" },
  { name: "Privacy", href: "/legal/privacy" },
  { name: "Security", href: "/legal/security" },
];

type DropdownProps = {
  isOpen: boolean;
  toggle: () => void;
  title: string;
  links: Array<{ name: string; href: string }>;
  onLinkClick?: () => void;
};

const NavDropdown = ({
  isOpen,
  toggle,
  title,
  links,
  onLinkClick,
}: DropdownProps) => {
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        if (isOpen) toggle();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, toggle]);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={toggle}
        className="flex items-center whitespace-nowrap text-github-text-secondary transition-colors hover:text-github-text gap-1"
        aria-expanded={isOpen}
      >
        {title}
        <FaChevronDown
          className={`h-3 w-3 transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {isOpen && (
        <div className="absolute left-0 top-full mt-2 z-20 w-48 origin-top-left rounded-md bg-github-dark shadow-lg ring-1 ring-github-border border border-github-border overflow-hidden">
          <div className="py-1">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="block px-4 py-2 text-sm text-github-text-secondary hover:bg-github-btn-hover"
                onClick={onLinkClick}
              >
                {link.name}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default function Navigation() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [docsDropdownOpen, setDocsDropdownOpen] = useState(false);
  const [extrasDropdownOpen, setExtrasDropdownOpen] = useState(false);
  const [legalDropdownOpen, setLegalDropdownOpen] = useState(false);

  const { data: session, status } = useSession();
  const isLoggedIn = status === "authenticated";
  const router = useRouter();

  const userDropdownRef = useRef<HTMLDivElement>(null);

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

  // Close user dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        userDropdownRef.current &&
        !userDropdownRef.current.contains(event.target as Node)
      ) {
        setUserDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
    // Close all dropdowns when toggling mobile menu
    setUserDropdownOpen(false);
    setDocsDropdownOpen(false);
    setExtrasDropdownOpen(false);
    setLegalDropdownOpen(false);
  };

  const toggleUserDropdown = () => {
    setUserDropdownOpen(!userDropdownOpen);
  };

  return (
    <header className="z-10 flex w-full min-w-screen items-center justify-between overflow-visible border-b border-github-border py-5 px-4 bg-github-dark">
      <Link
        className="z-10 flex shrink-0 items-center gap-2 text-xl font-bold"
        href="/"
      >
        <div className="relative h-8 w-8 sm:h-10 sm:w-10">
          <Image
            alt="OctoSearch Logo"
            className="object-contain"
            fill
            priority
            src="/logo.webp"
          />
        </div>
        <span>OctoSearch</span>
      </Link>

      {/* Mobile menu button */}
      <button
        aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
        className="z-20 shrink-0 p-2 text-github-text transition-transform duration-300 md:hidden"
        onClick={toggleMobileMenu}
        type="button"
      >
        {mobileMenuOpen ? (
          <FaTimes className="h-6 w-6" />
        ) : (
          <FaBars className="h-6 w-6" />
        )}
      </button>

      {/* Desktop Navigation */}
      <nav className="hidden md:flex items-center">
        <ul className="flex flex-nowrap items-center gap-4 lg:gap-6 mr-4">
          {mainNavLinks.map((link) => (
            <li key={link.href}>
              <Link
                className="whitespace-nowrap text-github-text-secondary transition-colors hover:text-github-text"
                href={link.href}
              >
                {link.name}
              </Link>
            </li>
          ))}

          <li>
            <NavDropdown
              isOpen={docsDropdownOpen}
              toggle={() => setDocsDropdownOpen(!docsDropdownOpen)}
              title="Documentation"
              links={docsLinks}
            />
          </li>

          <li>
            <NavDropdown
              isOpen={extrasDropdownOpen}
              toggle={() => setExtrasDropdownOpen(!extrasDropdownOpen)}
              title="Extras"
              links={extrasLinks}
            />
          </li>

          <li>
            <NavDropdown
              isOpen={legalDropdownOpen}
              toggle={() => setLegalDropdownOpen(!legalDropdownOpen)}
              title="Legal"
              links={legalLinks}
            />
          </li>
        </ul>

        <div className="ml-4 flex items-center space-x-3 relative">
          {isLoggedIn ? (
            <div className="relative" ref={userDropdownRef}>
              <button
                onClick={toggleUserDropdown}
                className="flex items-center rounded-full overflow-hidden transition-transform hover:ring-2 hover:ring-github-accent focus:outline-none focus:ring-2 focus:ring-github-accent"
                aria-label="User menu"
                aria-expanded={userDropdownOpen}
              >
                <Image
                  src={session?.user?.image || "https://github.com/github.png"}
                  alt="User Avatar"
                  width={36}
                  height={36}
                  className="rounded-full"
                />
              </button>

              {userDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 z-20 origin-top-right rounded-md bg-github-dark shadow-lg ring-1 ring-github-border border border-github-border overflow-hidden">
                  <div className="p-2 border-b border-github-border">
                    <p className="text-sm font-semibold">
                      {session?.user?.name}
                    </p>
                    <p className="text-xs text-github-text-secondary">
                      {session?.user?.email}
                    </p>
                  </div>
                  <div className="py-1">
                    <Link
                      href={`/user/${session?.user?.name}`}
                      className="flex items-center px-4 py-2 text-sm text-github-text-secondary hover:bg-github-btn-hover"
                      onClick={() => setUserDropdownOpen(false)}
                    >
                      <FaUser className="mr-2 h-4 w-4" />
                      Your Profile
                    </Link>
                    <Link
                      href="/settings"
                      className="flex items-center px-4 py-2 text-sm text-github-text-secondary hover:bg-github-btn-hover"
                      onClick={() => setUserDropdownOpen(false)}
                    >
                      <FaCog className="mr-2 h-4 w-4" />
                      Settings
                    </Link>
                    <button
                      onClick={() => router.push("/auth/signout")}
                      className="flex w-full items-center px-4 py-2 text-sm text-github-text-secondary hover:bg-github-btn-hover"
                    >
                      <FaSignOutAlt className="mr-2 h-4 w-4" />
                      Sign out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => router.push("/auth/signin")}
              className="btn btn-primary flex items-center gap-2"
            >
              <FaGithub className="h-4 w-4" />
              Sign in
            </button>
          )}
        </div>
      </nav>

      {/* Mobile Navigation */}
      {mobileMenuOpen ? (
        <div className="fixed inset-0 z-10 flex flex-col items-center justify-start overflow-y-auto bg-github-dark bg-opacity-95 pt-20 transition-transform duration-300 md:hidden">
          <nav className="w-full px-6 pb-20">
            <ul className="flex flex-col items-center gap-6 text-xl">
              {mainNavLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    className="rounded-md px-4 py-2 text-github-text-secondary transition-colors hover:text-github-text"
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {link.name}
                  </Link>
                </li>
              ))}

              <li className="w-full border-t border-github-border pt-4 mt-2">
                <p className="px-4 text-sm font-medium text-github-text-secondary uppercase">
                  Documentation
                </p>
                <ul className="mt-2">
                  {docsLinks.map((link) => (
                    <li key={link.href}>
                      <Link
                        className="block rounded-md px-6 py-2 text-github-text-secondary transition-colors hover:text-github-text"
                        href={link.href}
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        {link.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </li>

              <li className="w-full border-t border-github-border pt-4">
                <p className="px-4 text-sm font-medium text-github-text-secondary uppercase">
                  Extras
                </p>
                <ul className="mt-2">
                  {extrasLinks.map((link) => (
                    <li key={link.href}>
                      <Link
                        className="block rounded-md px-6 py-2 text-github-text-secondary transition-colors hover:text-github-text"
                        href={link.href}
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        {link.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </li>

              <li className="w-full border-t border-github-border pt-4">
                <p className="px-4 text-sm font-medium text-github-text-secondary uppercase">
                  Legal
                </p>
                <ul className="mt-2">
                  {legalLinks.map((link) => (
                    <li key={link.href}>
                      <Link
                        className="block rounded-md px-6 py-2 text-github-text-secondary transition-colors hover:text-github-text"
                        href={link.href}
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        {link.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </li>

              {isLoggedIn ? (
                <li className="w-full border-t border-github-border pt-5 mt-2">
                  <div className="flex items-center gap-3 mb-4 px-4">
                    <Image
                      src={
                        session?.user?.image || "https://github.com/github.png"
                      }
                      alt="User Avatar"
                      width={40}
                      height={40}
                      className="rounded-full"
                    />
                    <div className="text-left">
                      <p className="font-medium">{session?.user?.name}</p>
                      <p className="text-sm text-github-text-secondary">
                        {session?.user?.email}
                      </p>
                    </div>
                  </div>

                  <Link
                    className="flex w-full items-center rounded-md px-4 py-2 text-github-text-secondary transition-colors hover:text-github-text"
                    href={`/user/${session?.user?.name}`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <FaUser className="mr-2 h-4 w-4" />
                    Your Profile
                  </Link>
                  <Link
                    className="flex w-full items-center rounded-md px-4 py-2 text-github-text-secondary transition-colors hover:text-github-text"
                    href="/settings"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <FaCog className="mr-2 h-4 w-4" />
                    Settings
                  </Link>
                  <button
                    className="flex w-full items-center rounded-md px-4 py-2 text-github-text-secondary transition-colors hover:text-github-text"
                    onClick={() => {
                      router.push("/auth/signout");
                      setMobileMenuOpen(false);
                    }}
                  >
                    <FaSignOutAlt className="mr-2 h-4 w-4" />
                    Sign out
                  </button>
                </li>
              ) : (
                <li className="mt-6 w-full">
                  <button
                    onClick={() => {
                      router.push("/auth/signin");
                      setMobileMenuOpen(false);
                    }}
                    className="btn btn-primary w-full flex items-center justify-center gap-2"
                  >
                    <FaGithub className="h-4 w-4" />
                    Sign in with GitHub
                  </button>
                </li>
              )}
            </ul>
          </nav>
        </div>
      ) : null}
    </header>
  );
}
