import { Metadata } from "next";
import { fetchRepositoryData } from "@/lib/API";
import { generateRepoMetadata } from "@/utils/metadata";

export async function generateMetadata({
    params
}: {
    params: { name: string[] }
}): Promise<Metadata> {
    try {
        // Await params before accessing name
        const paramsData = await params;
        const [owner, repo] = paramsData.name;

        const repoData = await fetchRepositoryData(owner, repo);
        return generateRepoMetadata(repo, owner, repoData.description);
    } catch (error) {
        // Await params in catch block as well
        const paramsData = await params;
        return generateRepoMetadata(
            paramsData.name[1] || "Repository",
            paramsData.name[0] || "Owner",
            "GitHub repository information"
        );
    }
}