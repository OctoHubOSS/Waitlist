import { NextResponse, NextRequest } from "next/server";
import { getOctokitClient } from "@/utils/github";

export async function GET(req: NextRequest) {
    try {
        // Extract query parameters
        const searchParams = req.nextUrl.searchParams;
        const owner = searchParams.get('owner');
        const repo = searchParams.get('repo');

        // Validate required parameters
        if (!owner || !repo) {
            return NextResponse.json(
                { error: "Missing required parameters: 'owner' and 'repo'" },
                { status: 400 }
            );
        }

        const octokit = getOctokitClient();

        // Fetch the languages data
        const { data: languages } = await octokit.rest.repos.listLanguages({
            owner,
            repo
        });

        // Calculate total bytes to determine percentages
        const totalBytes = Object.values(languages).reduce((acc: number, bytes: any) => acc + bytes, 0);

        // Format languages with percentages and colors
        const formattedLanguages = Object.entries(languages).map(([name, bytes]) => {
            const percentage = totalBytes > 0 ? ((bytes as number) / totalBytes * 100).toFixed(1) : '0';
            return {
                name,
                bytes,
                percentage: `${percentage}%`,
                color: getLanguageColor(name)
            };
        })
            .sort((a, b) => (b.bytes as number) - (a.bytes as number));

        return NextResponse.json({
            languages: formattedLanguages,
            totalBytes
        });
    } catch (err: any) {
        // Handle specific GitHub error status codes
        if (err.status === 404) {
            return NextResponse.json({ error: "Repository not found" }, { status: 404 });
        }

        console.error("Error fetching repository languages:", err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

// Function to get colors for common languages (you can expand this or use a library)
function getLanguageColor(language: string): string {
    const colors: Record<string, string> = {
        "JavaScript": "#f1e05a",
        "TypeScript": "#3178c6",
        "Python": "#3572A5",
        "Java": "#b07219",
        "C#": "#178600",
        "PHP": "#4F5D95",
        "C++": "#f34b7d",
        "C": "#555555",
        "Ruby": "#701516",
        "Go": "#00ADD8",
        "Rust": "#dea584",
        "Swift": "#F05138",
        "Kotlin": "#A97BFF",
        "HTML": "#e34c26",
        "CSS": "#563d7c"
    };

    return colors[language] || "#858585"; // Default color for unlisted languages
}
