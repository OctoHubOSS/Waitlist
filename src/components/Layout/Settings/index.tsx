"use client";

import { ReactNode, useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { useSession } from "next-auth/react";
import {
  FaUser,
  FaKey,
  FaShieldAlt,
  FaBell,
  FaDesktop,
  FaCode,
  FaGithub,
  FaLock,
  FaChevronRight,
  FaBars,
  FaTimes,
} from "react-icons/fa";

interface SettingsLayoutProps {
  children: ReactNode;
  title: string;
  description?: string;
}

interface NavItem {
  name: string;
  href: string;
  icon: React.ReactNode;
  items?: { name: string; href: string }[];
}

export default function SettingsLayout({
  children,
  title,
  description,
}: SettingsLayoutProps) {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const [activePath, setActivePath] = useState(pathname);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    setActivePath(pathname);
  }, [pathname]);

  // Navigation groups
  const navigation: NavItem[] = [
    {
      name: "Account",
      href: "/settings/account",
      icon: <FaUser />,
      items: [
        { name: "Profile", href: "/settings/account/profile" },
        { name: "Preferences", href: "/settings/account/preferences" },
        { name: "Authentication", href: "/settings/account/auth" },
      ],
    },
    {
      name: "API Tokens",
      href: "/settings/tokens",
      icon: <FaKey />,
      items: [{ name: "Manage Tokens", href: "/settings/tokens" }],
    },
    {
      name: "Security",
      href: "/settings/security",
      icon: <FaShieldAlt />,
      items: [
        { name: "Password", href: "/settings/security/password" },
        { name: "Two-factor Authentication", href: "/settings/security/2fa" },
        { name: "Sessions", href: "/settings/security/sessions" },
      ],
    },
    {
      name: "Integrations",
      href: "/settings/integrations",
      icon: <FaGithub />,
      items: [
        { name: "GitHub", href: "/settings/integrations/github" },
        { name: "Other Services", href: "/settings/integrations/services" },
      ],
    },
    {
      name: "Notifications",
      href: "/settings/notifications",
      icon: <FaBell />,
    },
    {
      name: "Appearance",
      href: "/settings/appearance",
      icon: <FaDesktop />,
    },
    {
      name: "Developer Settings",
      href: "/settings/developer",
      icon: <FaCode />,
      items: [
        { name: "Webhooks", href: "/settings/developer/webhooks" },
        { name: "OAuth Apps", href: "/settings/developer/oauth" },
      ],
    },
    {
      name: "Privacy & Data",
      href: "/settings/privacy",
      icon: <FaLock />,
    },
  ];

  // Check if current path is active or one of its subitems is active
  const isActive = (item: NavItem) => {
    if (activePath === item.href) return true;
    if (item.items?.some((subItem) => activePath === subItem.href)) return true;
    return false;
  };

  // Check if current path matches a specific subitem
  const isSubItemActive = (href: string) => activePath === href;

  // Toggle mobile menu
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <div className="min-h-screen bg-github-dark text-github-text">
      {/* Mobile Menu Button */}
      <div className="md:hidden fixed top-4 right-4 z-50">
        <button
          onClick={toggleMobileMenu}
          className="p-2 rounded-full bg-github-accent text-white shadow-lg focus:outline-none"
        >
          {isMobileMenuOpen ? <FaTimes /> : <FaBars />}
        </button>
      </div>

      <div className="flex flex-col md:flex-row min-h-screen w-full">
        {/* Sidebar - Desktop */}
        <div className="hidden md:block w-64 bg-github-dark-secondary border-r border-github-border h-screen sticky top-0 overflow-y-auto">
          <div className="p-5 border-b border-github-border">
            <h2 className="text-lg font-bold text-white flex items-center">
              <FaUser className="mr-2 text-github-accent" />
              Settings
            </h2>
            {session?.user?.email && (
              <p className="text-sm text-github-text-secondary mt-1 truncate">
                {session.user.email}
              </p>
            )}
          </div>

          <nav className="py-4">
            {navigation.map((item) => (
              <div key={item.name} className="mb-1 px-3">
                <Link
                  href={item.href}
                  className={`flex items-center justify-between px-3 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
                    isActive(item)
                      ? "bg-github-accent/20 text-github-accent border-l-4 border-github-accent pl-2"
                      : "text-github-text-secondary hover:bg-github-dark-secondary/50 hover:text-white"
                  }`}
                >
                  <span className="flex items-center">
                    <span className="mr-3 text-lg">{item.icon}</span>
                    {item.name}
                  </span>
                  {item.items && (
                    <FaChevronRight
                      className={`transition-transform duration-200 ${isActive(item) ? "rotate-90" : ""}`}
                    />
                  )}
                </Link>

                {item.items && isActive(item) && (
                  <div className="ml-7 mt-1 overflow-hidden">
                    {item.items.map((subItem) => (
                      <Link
                        key={subItem.href}
                        href={subItem.href}
                        className={`flex items-center px-3 py-2 text-sm rounded-md transition-colors duration-200 ${
                          isSubItemActive(subItem.href)
                            ? "bg-github-dark-secondary/50 text-github-accent font-medium"
                            : "text-github-text-secondary hover:bg-github-dark-secondary/30 hover:text-white"
                        }`}
                      >
                        <div className="w-1 h-1 rounded-full bg-github-border mr-2"></div>
                        {subItem.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>
        </div>

        {/* Mobile Sidebar */}
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-40 md:hidden">
            <div
              className="absolute inset-0 bg-black/80"
              onClick={toggleMobileMenu}
            ></div>
            <div className="relative z-50 w-64 h-full bg-github-dark-secondary overflow-y-auto">
              <div className="p-5 border-b border-github-border">
                <h2 className="text-lg font-bold text-white flex items-center">
                  <FaUser className="mr-2 text-github-accent" />
                  Settings
                </h2>
                {session?.user?.email && (
                  <p className="text-sm text-github-text-secondary mt-1 truncate">
                    {session.user.email}
                  </p>
                )}
              </div>

              <nav className="py-4">
                {navigation.map((item) => (
                  <div key={item.name} className="mb-1 px-3">
                    <Link
                      href={item.href}
                      onClick={() => {
                        if (!item.items) setIsMobileMenuOpen(false);
                      }}
                      className={`flex items-center justify-between px-3 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
                        isActive(item)
                          ? "bg-github-accent/20 text-github-accent border-l-4 border-github-accent pl-2"
                          : "text-github-text-secondary hover:bg-github-dark-secondary/50 hover:text-white"
                      }`}
                    >
                      <span className="flex items-center">
                        <span className="mr-3 text-lg">{item.icon}</span>
                        {item.name}
                      </span>
                      {item.items && (
                        <FaChevronRight
                          className={`transition-transform duration-200 ${isActive(item) ? "rotate-90" : ""}`}
                        />
                      )}
                    </Link>

                    {item.items && isActive(item) && (
                      <div className="ml-7 mt-1 overflow-hidden">
                        {item.items.map((subItem) => (
                          <Link
                            key={subItem.href}
                            href={subItem.href}
                            onClick={() => setIsMobileMenuOpen(false)}
                            className={`flex items-center px-3 py-2 text-sm rounded-md transition-colors duration-200 ${
                              isSubItemActive(subItem.href)
                                ? "bg-github-dark-secondary/50 text-github-accent font-medium"
                                : "text-github-text-secondary hover:bg-github-dark-secondary/30 hover:text-white"
                            }`}
                          >
                            <div className="w-1 h-1 rounded-full bg-github-border mr-2"></div>
                            {subItem.name}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </nav>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="flex-1 p-6 md:p-8">
          <div className="bg-github-dark-secondary border border-github-border rounded-xl overflow-hidden shadow-xl">
            <div className="border-b border-github-border bg-github-dark p-5 md:p-6">
              <h2 className="text-2xl font-bold text-white flex items-center">
                {title}
              </h2>
              {description && (
                <p className="mt-2 text-github-text-secondary">{description}</p>
              )}
            </div>

            <div className="p-5 md:p-8">{children}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
