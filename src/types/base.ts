import { RawData } from "./repos";
import { GitHubUser } from "./users";

export interface GitHubRepoApiResponse {
    items: RawData[];
}

export interface GitHubUserApiResponse {
    total_count: number;
    incomplete_results: boolean;
    items: GitHubUser[];
}