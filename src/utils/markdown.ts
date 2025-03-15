import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

const docsDirectory = path.join(process.cwd(), 'docs');

export interface DocMetadata {
    title: string;
    description: string;
    category?: string;
    order?: number;
    icon?: string;
    [key: string]: any;
}

export interface DocContent {
    slug: string;
    metadata: DocMetadata;
    content: string;
}

export interface DocPageInfo {
    slug: string;
    title: string;
    description: string;
    icon?: string;
    order?: number;
}

export interface DocCategory {
    title: string;
    description: string;
    icon?: string;
    defaultOpen: boolean;
    pages: DocPageInfo[];
}

export interface CategoryMeta {
    title: string;
    description: string;
    icon?: string;
    defaultOpen?: boolean;
    pages: string[];
}

export async function getDocBySlug(slug: string): Promise<DocContent | null> {
    try {
        const realSlug = slug.replace(/\.md$/, '');

        // Handle both root files and categorized files
        let filePath: string;

        if (realSlug.includes('/')) {
            // This is a categorized file
            filePath = path.join(docsDirectory, `${realSlug}.md`);
        } else {
            // This is a root file
            filePath = path.join(docsDirectory, `${realSlug}.md`);
        }

        // Check if file exists
        if (!fs.existsSync(filePath)) {
            console.error(`Markdown file not found: ${filePath}`);
            return null;
        }

        const fileContents = fs.readFileSync(filePath, 'utf8');

        // Parse frontmatter metadata
        const { data, content } = matter(fileContents);

        // Return raw markdown content (no HTML conversion)
        // The renderer component will handle the conversion
        return {
            slug: realSlug,
            metadata: data as DocMetadata,
            content: content,
        };
    } catch (error) {
        console.error("Error in getDocBySlug:", error);
        return null;
    }
}

export async function getAllDocs(): Promise<DocContent[]> {
    try {
        // Get all .md files in the docs directory
        const fileNames = fs.readdirSync(docsDirectory);
        const allDocs = await Promise.all(
            fileNames
                .filter((fileName) => fileName.endsWith('.md'))
                .map(async (fileName) => {
                    const slug = fileName.replace(/\.md$/, '');
                    const doc = await getDocBySlug(slug);
                    return doc;
                })
        );

        // Filter out null values
        return allDocs.filter((doc): doc is DocContent => doc !== null);
    } catch (error) {
        console.error("Error in getAllDocs:", error);
        return [];
    }
}

export async function getDocsSlugs(): Promise<string[]> {
    try {
        const fileNames = fs.readdirSync(docsDirectory);
        return fileNames
            .filter((fileName) => fileName.endsWith('.md'))
            .map((fileName) => fileName.replace(/\.md$/, ''));
    } catch (error) {
        console.error("Error in getDocsSlugs:", error);
        return [];
    }
}

export async function getCategoryMeta(categoryDir: string): Promise<CategoryMeta | null> {
    try {
        const metaPath = path.join(docsDirectory, categoryDir, 'meta.json');

        if (!fs.existsSync(metaPath)) {
            return null;
        }

        const metaJson = JSON.parse(fs.readFileSync(metaPath, 'utf8'));
        return {
            title: metaJson.title || categoryDir,
            description: metaJson.description || '',
            icon: metaJson.icon,
            defaultOpen: metaJson.defaultOpen !== undefined ? metaJson.defaultOpen : false,
            pages: metaJson.pages || []
        };
    } catch (error) {
        console.error(`Error reading meta.json for ${categoryDir}:`, error);
        return null;
    }
}

export async function getDocCategories(): Promise<DocCategory[]> {
    try {
        // Get all directories in the docs folder
        const entries = fs.readdirSync(docsDirectory, { withFileTypes: true });
        const directories = entries
            .filter(entry => entry.isDirectory())
            .map(dir => dir.name);

        // Also identify root markdown files (not in any category)
        const rootFiles = entries
            .filter(entry => !entry.isDirectory() && entry.name.endsWith('.md') && entry.name !== 'README.md')
            .map(entry => entry.name.replace(/\.md$/, ''));

        const categories: DocCategory[] = [];

        // First handle root files as a special category (always first)
        if (rootFiles.length > 0) {
            const rootPages: DocPageInfo[] = [];

            // Get root meta if exists
            const rootMeta = await getCategoryMeta('');

            for (const slug of rootFiles) {
                const doc = await getDocBySlug(slug);

                if (doc) {
                    rootPages.push({
                        slug,
                        title: doc.metadata.title,
                        description: doc.metadata.description,
                        icon: doc.metadata.icon,
                        order: doc.metadata.order || 999
                    });
                }
            }

            // Sort pages by order if available
            rootPages.sort((a, b) => (a.order || 999) - (b.order || 999));

            if (rootPages.length > 0) {
                categories.push({
                    title: rootMeta?.title || "Getting Started",
                    description: rootMeta?.description || "Introduction and basic guides",
                    icon: rootMeta?.icon,
                    defaultOpen: rootMeta?.defaultOpen !== false,
                    pages: rootPages
                });
            }
        }

        // Process each directory as a category
        for (const dir of directories) {
            const meta = await getCategoryMeta(dir);

            if (!meta) {
                continue;
            }

            const pages: DocPageInfo[] = [];

            // Process each page in the category
            for (const pageSlug of meta.pages) {
                const doc = await getDocBySlug(`${dir}/${pageSlug}`);

                if (doc) {
                    pages.push({
                        slug: `${dir}/${pageSlug}`,
                        title: doc.metadata.title,
                        description: doc.metadata.description,
                        icon: doc.metadata.icon,
                        order: doc.metadata.order || 999
                    });
                }
            }

            // Sort pages by order if available
            pages.sort((a, b) => (a.order || 999) - (b.order || 999));

            categories.push({
                title: meta.title,
                description: meta.description,
                icon: meta.icon,
                defaultOpen: meta.defaultOpen !== undefined ? meta.defaultOpen : false,
                pages
            });
        }

        return categories;
    } catch (error) {
        console.error("Error in getDocCategories:", error);
        return [];
    }
}
