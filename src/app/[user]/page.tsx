import {Suspense} from "react";
import { FaStar, FaCodeBranch, FaUsers } from "react-icons/fa";
import { FiUser } from "react-icons/fi";

export interface Repository {
  name: string;
  description: string;
  url: string;
  id: string;
  stargazers_count: number;
  forks_count: number;
}

export interface Owner {
  name: string;
  login: string;
  avatar_url: string;
  followers: number;
  following: number;
  bio: string;
}

export interface User {
  name: string;
  login: string;
  avatar_url: string;
  followers: number;
  following: number;
  bio: string;
}

const REPO_COUNT = 3;

function RepositoriesLoading() {
  return (
    <div className="space-y-4">
      <div className="animate-pulse space-y-4 rounded-lg border border-github-border p-4 bg-github-dark-secondary">
        <div className="h-4 w-3/4 rounded bg-github-border" />
        <div className="h-4 w-1/2 rounded bg-github-border" />
        <div className="h-4 w-2/3 rounded bg-github-border" />
      </div>
      <div className="animate-pulse space-y-4 rounded-lg border border-github-border p-4 bg-github-dark-secondary">
        <div className="h-4 w-3/4 rounded bg-github-border" />
        <div className="h-4 w-1/2 rounded bg-github-border" />
        <div className="h-4 w-2/3 rounded bg-github-border" />
      </div>
      <div className="animate-pulse space-y-4 rounded-lg border border-github-border p-4 bg-github-dark-secondary">
        <div className="h-4 w-3/4 rounded bg-github-border" />
        <div className="h-4 w-1/2 rounded bg-github-border" />
        <div className="h-4 w-2/3 rounded bg-github-border" />
      </div>
    </div>
  );
}

async function StarredRepositories({user}: {user: string}) {
  const stars = await fetch(`https://api.github.com/users/${user}/starred?per_page=${REPO_COUNT}`, {
    next: {revalidate: 60 * 60},
  }).then((res) => res.json() as Promise<Repository[]>);

  return (
    <div className="space-y-4">
      {stars.map((repository) => (
        <a key={repository.id} className="block" href={repository.url} target="_blank" rel="noopener noreferrer">
          <div className="card card-hover glow-effect">
            <h3 className="text-lg font-bold text-github-link">{repository.name}</h3>
            <p className="text-github-text-secondary mt-1">{repository.description}</p>
            <div className="mt-4 flex flex-wrap items-center gap-4">
              <div className="badge badge-primary">
                JavaScript
              </div>
              <div className="flex items-center space-x-2 text-github-text-secondary">
                <FaStar className="h-4 w-4 text-yellow-500" />
                <span>{repository.stargazers_count} stars</span>
              </div>
              <div className="flex items-center space-x-2 text-github-text-secondary">
                <FaCodeBranch className="h-4 w-4 text-blue-500" />
                <span>{repository.forks_count} forks</span>
              </div>
            </div>
          </div>
        </a>
      ))}
    </div>
  );
}

async function TopRepositories({user}: {user: string}) {
  const repositories = await fetch(
    `https://api.github.com/search/repositories?q=org:${user}&sort=stars&order=desc&per_page=${REPO_COUNT}`,
    {next: {revalidate: 60 * 60 * 24}},
  )
    .then((res) => res.json() as Promise<{items: Repository[]}>)
    .then((data) => data.items);

  return (
    <div className="space-y-4">
      {repositories.map((repository) => (
        <a key={repository.id} className="block" href={repository.url} target="_blank" rel="noopener noreferrer">
          <div className="card card-hover glow-effect">
            <h3 className="text-lg font-bold text-github-link">{repository.name}</h3>
            <p className="text-github-text-secondary mt-1">{repository.description}</p>
            <div className="mt-4 flex flex-wrap items-center gap-4">
              <div className="badge badge-primary">
                JavaScript
              </div>
              <div className="flex items-center space-x-2 text-github-text-secondary">
                <FaStar className="h-4 w-4 text-yellow-500" />
                <span>{repository.stargazers_count} stars</span>
              </div>
              <div className="flex items-center space-x-2 text-github-text-secondary">
                <FaCodeBranch className="h-4 w-4 text-blue-500" />
                <span>{repository.forks_count} forks</span>
              </div>
            </div>
          </div>
        </a>
      ))}
    </div>
  );
}

export default async function UserPage({params: {user}}: {params: {user: string}}) {
  const owner = await fetch(`https://api.github.com/users/${user}`).then(
    (res) => res.json() as Promise<User>,
  );

  return (
    <div className="w-full">
      <div className="card mb-8">
        <div className="flex flex-col md:flex-row md:items-start gap-6">
          <span className="relative flex h-24 w-24 shrink-0 overflow-hidden rounded-full">
            <img alt={owner.name || owner.login} className="h-full w-full object-cover" src={owner.avatar_url} />
          </span>
          <div className="space-y-3">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">{owner.name || owner.login}</h1>
              <p className="text-github-text-secondary">@{owner.login}</p>
            </div>
            {owner.bio && <p className="text-sm max-w-3xl">{owner.bio}</p>}
            
            <div className="flex flex-wrap items-center gap-6">
              <div className="flex items-center space-x-2 text-github-text-secondary">
                <FaUsers className="h-4 w-4" />
                <span>{owner.followers} followers</span>
              </div>
              <div className="flex items-center space-x-2 text-github-text-secondary">
                <FiUser className="h-4 w-4" />
                <span>{owner.following} following</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="space-y-10">
        <section>
          <h2 className="section-title">
            <FaStar className="text-yellow-500" />
            Top repositories
          </h2>
          <Suspense fallback={<RepositoriesLoading />}>
            <TopRepositories user={user} />
          </Suspense>
        </section>
        
        <div className="divider"></div>
        
        <section>
          <h2 className="section-title">
            <FaStar className="text-yellow-500" />
            Starred repositories
          </h2>
          <Suspense fallback={<RepositoriesLoading />}>
            <StarredRepositories user={user} />
          </Suspense>
        </section>
      </div>
    </div>
  );
}
