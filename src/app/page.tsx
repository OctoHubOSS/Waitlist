"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FaUser, FaBuilding, FaCode, FaStar, FaCodeBranch, FaChartArea } from 'react-icons/fa';
import { GoRepo } from 'react-icons/go';

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchType, setSearchType] = useState("users"); // users, orgs, repos
  const router = useRouter();
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      if (searchType === "users") {
        router.push(`/${searchQuery.trim()}`);
      } else if (searchType === "orgs") {
        router.push(`/org/${searchQuery.trim()}`);
      } else {
        router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}&type=${searchType}`);
      }
    }
  };
  
  return (
    <div className="flex flex-col items-center w-full">
      {/* Hero Section */}
      <section className="text-center w-full mb-12 md:mb-16">
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 md:mb-6 bg-clip-text text-transparent bg-gradient-to-r from-neon-purple via-neon-blue to-neon-cyan">
          Discover the GitHub Universe
        </h1>
        <p className="text-lg md:text-xl text-github-text-secondary mb-8 md:mb-10 max-w-4xl mx-auto">
          Find developers, organizations, and repositories with OctoSearch's powerful discovery platform.
        </p>
        
        {/* Search Form */}
        <form onSubmit={handleSearch} className="w-full max-w-2xl mx-auto">
          <div className="relative rounded-lg shadow-md bg-github-dark-secondary border border-github-border overflow-hidden">
            <div className="flex flex-wrap md:flex-nowrap">
              <select 
                value={searchType}
                onChange={(e) => setSearchType(e.target.value)}
                className="bg-github-dark-secondary border-r border-github-border text-github-text px-3 md:px-4 py-3 focus:outline-none w-full md:w-auto"
              >
                <option value="users">Users</option>
                <option value="orgs">Organizations</option>
                <option value="repos">Repositories</option>
              </select>
              
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={`Search for ${searchType}...`}
                className="flex-1 bg-github-dark-secondary text-github-text px-3 md:px-4 py-3 focus:outline-none w-full md:w-auto"
              />
              
              <button 
                type="submit" 
                className="bg-github-accent hover:bg-github-accent-hover text-white px-4 md:px-6 py-3 transition-colors w-full md:w-auto"
              >
                <svg 
                  className="h-5 w-5 mx-auto md:mx-0" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            </div>
          </div>
          <p className="text-sm text-github-text-secondary mt-2">
            Try searching for users like "therealtoxicdev" or organizations like "vercel"
          </p>
        </form>
      </section>
      
      {/* Features Section */}
      <section className="w-full mb-12 md:mb-16">
        <h2 className="text-xl md:text-2xl font-semibold mb-6 md:mb-8 text-center">What You Can Discover</h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          <div className="card card-hover">
            <div className="flex items-center gap-3 mb-3">
              <div className="bg-github-accent/20 p-3 rounded-full">
                <FaUser className="h-6 w-6 text-github-accent" />
              </div>
              <h3 className="text-lg font-medium">Developers</h3>
            </div>
            <p className="text-github-text-secondary">
              Find talented developers on GitHub based on location, programming languages, and contributions. Connect with the minds behind your favorite projects.
            </p>
            <Link href="/explore?type=users" className="link inline-flex items-center mt-4">
              <span>Explore developers</span>
              <svg className="ml-2 h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            </Link>
          </div>
          
          <div className="card card-hover">
            <div className="flex items-center gap-3 mb-3">
              <div className="bg-github-accent/20 p-3 rounded-full">
                <FaBuilding className="h-6 w-6 text-github-accent" />
              </div>
              <h3 className="text-lg font-medium">Organizations</h3>
            </div>
            <p className="text-github-text-secondary">
              Discover organizations pushing the boundaries of open source. From tech giants to emerging startups, explore their contributions to the developer community.
            </p>
            <Link href="/explore?type=orgs" className="link inline-flex items-center mt-4">
              <span>Find organizations</span>
              <svg className="ml-2 h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            </Link>
          </div>
          
          <div className="card card-hover">
            <div className="flex items-center gap-3 mb-3">
              <div className="bg-github-accent/20 p-3 rounded-full">
                <GoRepo className="h-6 w-6 text-github-accent" />
              </div>
              <h3 className="text-lg font-medium">Repositories</h3>
            </div>
            <p className="text-github-text-secondary">
              Search through millions of repositories to find code examples, tools, and frameworks that match your needs. Filter by language, stars, and activity.
            </p>
            <Link href="/explore?type=repos" className="link inline-flex items-center mt-4">
              <span>Search repositories</span>
              <svg className="ml-2 h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            </Link>
          </div>
          
          <div className="card card-hover">
            <div className="flex items-center gap-3 mb-3">
              <div className="bg-github-accent/20 p-3 rounded-full">
                <FaCode className="h-6 w-6 text-github-accent" />
              </div>
              <h3 className="text-lg font-medium">Programming Languages</h3>
            </div>
            <p className="text-github-text-secondary">
              Explore repositories by programming language to find projects that match your tech stack or discover new languages to learn through real-world examples.
            </p>
            <Link href="/languages" className="link inline-flex items-center mt-4">
              <span>Browse languages</span>
              <svg className="ml-2 h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            </Link>
          </div>
          
          <div className="card card-hover">
            <div className="flex items-center gap-3 mb-3">
              <div className="bg-github-accent/20 p-3 rounded-full">
                <FaChartArea className="h-6 w-6 text-github-accent" />
              </div>
              <h3 className="text-lg font-medium">Trending Projects</h3>
            </div>
            <p className="text-github-text-secondary">
              Stay updated with the hottest projects on GitHub. See what developers are starring, forking, and contributing to across different timeframes.
            </p>
            <Link href="/trending" className="link inline-flex items-center mt-4">
              <span>View trending</span>
              <svg className="ml-2 h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            </Link>
          </div>
          
          <div className="card card-hover">
            <div className="flex items-center gap-3 mb-3">
              <div className="bg-github-accent/20 p-3 rounded-full">
                <FaStar className="h-6 w-6 text-github-accent" />
              </div>
              <h3 className="text-lg font-medium">Collections</h3>
            </div>
            <p className="text-github-text-secondary">
              Discover curated collections of repositories organized by topics, use cases, and technologies. Find everything from beginner-friendly projects to advanced developer tools.
            </p>
            <Link href="/collections" className="link inline-flex items-center mt-4">
              <span>Explore collections</span>
              <svg className="ml-2 h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* Trending Section */}
      <section className="w-full mb-12 md:mb-16">
        <div className="flex items-center justify-between mb-6 md:mb-8">
          <h2 className="text-xl md:text-2xl font-semibold">Trending Repositories</h2>
          <Link href="/trending" className="link flex items-center text-sm md:text-base">
            <span>View all trending</span>
            <svg className="ml-2 h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
          </Link>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
          {/* Placeholder for trending repositories - would be populated from API in real app */}
          {[1, 2, 3, 4].map((item) => (
            <div key={item} className="card card-hover glow-effect flex flex-col p-4 md:p-5 overflow-hidden">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-2 gap-2">
                <h3 className="text-lg font-medium text-github-link truncate">
                  organization/repository-name-{item}
                </h3>
                <span className="badge badge-primary text-xs whitespace-nowrap">JavaScript</span>
              </div>
              <p className="text-github-text-secondary text-sm mb-4 flex-grow line-clamp-2">
                A really awesome repository that does amazing things and is currently trending on GitHub.
              </p>
              <div className="flex flex-wrap items-center gap-4 text-xs text-github-text-secondary">
                <div className="flex items-center gap-1.5">
                  <svg className="h-4 w-4 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                  </svg>
                  <span>{1000 * item} stars</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <svg className="h-4 w-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                  </svg>
                  <span>{Math.floor(400 * item)} forks</span>
                </div>
                <div className="flex items-center gap-1.5 sm:ml-auto">
                  <span className="text-github-text-secondary">Updated today</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}