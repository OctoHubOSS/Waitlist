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
  FaLock
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
  description 
}: SettingsLayoutProps) {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const [activePath, setActivePath] = useState(pathname);
  
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
      ]
    },
    {
      name: "API Tokens",
      href: "/settings/tokens",
      icon: <FaKey />,
      items: [
        { name: "Manage Tokens", href: "/settings/tokens" },
        { name: "Usage Guide", href: "/settings/tokens/guide" }
      ]
    },
    {
      name: "Security",
      href: "/settings/security",
      icon: <FaShieldAlt />,
      items: [
        { name: "Password", href: "/settings/security/password" },
        { name: "Two-factor Authentication", href: "/settings/security/2fa" },
        { name: "Sessions", href: "/settings/security/sessions" }
      ]
    },
    {
      name: "Integrations",
      href: "/settings/integrations",
      icon: <FaGithub />,
      items: [
        { name: "GitHub", href: "/settings/integrations/github" },
        { name: "Other Services", href: "/settings/integrations/services" }
      ]
    },
    {
      name: "Notifications",
      href: "/settings/notifications",
      icon: <FaBell />
    },
    {
      name: "Appearance",
      href: "/settings/appearance",
      icon: <FaDesktop />
    },
    {
      name: "Developer Settings",
      href: "/settings/developer",
      icon: <FaCode />,
      items: [
        { name: "Webhooks", href: "/settings/developer/webhooks" },
        { name: "OAuth Apps", href: "/settings/developer/oauth" }
      ]
    },
    {
      name: "Privacy & Data",
      href: "/settings/privacy",
      icon: <FaLock />
    }
  ];
  
  // Check if current path is active or one of its subitems is active
  const isActive = (item: NavItem) => {
    if (activePath === item.href) return true;
    if (item.items?.some(subItem => activePath === subItem.href)) return true;
    return false;
  };
  
  // Check if current path matches a specific subitem
  const isSubItemActive = (href: string) => activePath === href;
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-github-dark to-github-dark-secondary">
      <main className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        <h1 className="sr-only">{title}</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Sidebar Navigation */}
          <div className="md:col-span-1">
            <div className="bg-github-dark-secondary/40 rounded-lg border border-github-border overflow-hidden">
              <div className="p-4 border-b border-github-border">
                <h2 className="text-lg font-medium text-white">Settings</h2>
                {session?.user?.email && (
                  <p className="text-sm text-github-text-secondary truncate">
                    {session.user.email}
                  </p>
                )}
              </div>
              
              <nav className="px-2 py-3 space-y-1">
                {navigation.map((item) => (
                  <div key={item.name} className="mb-2">
                    <Link
                      href={item.href}
                      className={`flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                        isActive(item)
                          ? "bg-github-dark text-github-link"
                          : "text-github-text-secondary hover:bg-github-dark/60 hover:text-white"
                      }`}
                    >
                      <span className="mr-3">{item.icon}</span>
                      {item.name}
                    </Link>
                    
                    {item.items && isActive(item) && (
                      <div className="ml-8 mt-2 space-y-1">
                        {item.items.map(subItem => (
                          <Link
                            key={subItem.href}
                            href={subItem.href}
                            className={`block px-3 py-2 text-sm rounded-md ${
                              isSubItemActive(subItem.href)
                                ? "bg-github-dark-secondary text-github-link"
                                : "text-github-text-secondary hover:bg-github-dark-secondary/60 hover:text-white"
                            }`}
                          >
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
          
          {/* Main Content */}
          <div className="md:col-span-3">
            <div className="bg-github-dark-secondary/40 rounded-lg border border-github-border p-6">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-white">{title}</h2>
                {description && (
                  <p className="mt-1 text-github-text-secondary">{description}</p>
                )}
              </div>
              
              <div>{children}</div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
