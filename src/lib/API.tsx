import { RepoPage } from "@/types/repos";

// Fetch repository data using our API
export async function fetchRepositoryData(owner: string, repo: string): Promise<RepoPage> {
    const response = await fetch(`/api/repo?owner=${owner}&repo=${repo}`);

    if (!response.ok) {
        throw new Error(`Repository not found: ${response.status}`);
    }

    return await response.json();
}