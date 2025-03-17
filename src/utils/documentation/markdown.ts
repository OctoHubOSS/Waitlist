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
    sections?: Array<{
        id: string;
        title: string;
        pages: DocPageInfo[];
    }>;
    order?: number;
    isRootCategory?: boolean;
}

export interface CategoryMeta {
    title: string;
    description: string;
    icon?: string;
    defaultOpen?: boolean;
    pages: string[];
    isRootCategory?: boolean;
    order?: number;
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
            pages: metaJson.pages || [],
            isRootCategory: metaJson.isRootCategory === true,
            order: metaJson.order || 999
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

        // Prepare arrays for both root categories and subcategories
        const rootCategories: DocCategory[] = [];
        const subCategories: DocCategory[] = [];

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
                rootCategories.push({
                    title: rootMeta?.title || "Base Documentation",
                    description: rootMeta?.description || "Core documentation",
                    icon: rootMeta?.icon || "BookOpen",
                    defaultOpen: true, // Always open by default
                    pages: rootPages,
                    order: 0, // Always show first
                    isRootCategory: rootMeta?.isRootCategory === true
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

            // Group pages by section if they have a section property in frontmatter
            const pageSections: { [key: string]: DocPageInfo[] } = {};

            // Process each page in the category
            for (const pageSlug of meta.pages) {
                const doc = await getDocBySlug(`${dir}/${pageSlug}`);

                if (doc) {
                    const pageInfo = {
                        slug: `${dir}/${pageSlug}`,
                        title: doc.metadata.title,
                        description: doc.metadata.description,
                        icon: doc.metadata.icon,
                        order: doc.metadata.order || 999,
                        section: doc.metadata.section || 'default'
                    };

                    // Group by section
                    if (!pageSections[pageInfo.section]) {
                        pageSections[pageInfo.section] = [];
                    }
                    pageSections[pageInfo.section].push(pageInfo);

                    // Also add to main pages array
                    pages.push(pageInfo);
                }
            }

            // Sort pages by order within each section
            Object.values(pageSections).forEach(sectionPages => {
                sectionPages.sort((a, b) => (a.order || 999) - (b.order || 999));
            });

            // Sort main pages by order
            pages.sort((a, b) => (a.order || 999) - (b.order || 999));

            // Add section information to the category
            const sectionsArray = Object.keys(pageSections)
                .filter(key => key !== 'default')
                .map(sectionKey => ({
                    id: sectionKey,
                    title: sectionKey, // You can enhance this by storing section metadata
                    pages: pageSections[sectionKey]
                }));

            const category = {
                title: meta.title,
                description: meta.description,
                icon: meta.icon,
                defaultOpen: meta.defaultOpen !== undefined ? meta.defaultOpen : false,
                pages,
                sections: sectionsArray.length > 0 ? sectionsArray : undefined,
                order: meta.order || 999,
                isRootCategory: meta.isRootCategory === true
            };

            // Sort the category into the appropriate array
            if (meta.isRootCategory) {
                rootCategories.push(category);
            } else {
                subCategories.push(category);
            }
        }

        // Sort both arrays by order property
        rootCategories.sort((a, b) => a.order! - b.order!);
        subCategories.sort((a, b) => a.order! - b.order!);

        // Return root categories followed by subcategories
        return [...rootCategories, ...subCategories];
    } catch (error) {
        console.error("Error in getDocCategories:", error);
        return [];
    }
}

// Add a new function to get only root categories for the dropdown
export async function getRootCategories(): Promise<DocCategory[]> {
    const allCategories = await getDocCategories();
    return allCategories.filter(category => category.isRootCategory === true);
}
