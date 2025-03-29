import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

const docsDirectory = path.join(process.cwd(), 'docs');

export interface DocMetadata {
    title: string;
    description: string;
    order?: number;
    section?: string;
}

export interface DocSection {
    id: string;
    title: string;
    pages: DocPageInfo[];
}

export interface DocPageInfo {
    title: string;
    description: string;
    slug: string;
    order: number;
    section: string;
    icon?: string;
}

export interface DocCategory {
    title: string;
    description: string;
    icon?: string;
    defaultOpen?: boolean;
    pages: DocPageInfo[];
    sections?: DocSection[];
    isRootCategory?: boolean;
    order?: number;
}

export interface CategoryMeta {
    title: string;
    description: string;
    icon?: string;
    defaultOpen?: boolean;
    pages: DocPageInfo[];
    sections?: DocSection[];
    isRootCategory?: boolean;
    order?: number;
}

export async function getDocBySlug(slug: string): Promise<{
    data: DocMetadata;
    content: string;
}> {
    const realSlug = slug.replace(/\.md$/, '');
    const fullPath = path.join(docsDirectory, `${realSlug}.md`);
    const fileContents = fs.readFileSync(fullPath, 'utf8');
    const { data, content } = matter(fileContents);

    return {
        data: data as DocMetadata,
        content,
    };
}

export async function getAllDocs(): Promise<DocPageInfo[]> {
    const files = fs.readdirSync(docsDirectory);

    const docs = await Promise.all(
        files
            .filter((fileName) => fileName.endsWith('.md'))
            .map(async (fileName) => {
                const slug = fileName.replace(/\.md$/, '');
                const { data } = await getDocBySlug(slug);

                return {
                    title: data.title,
                    description: data.description || '',
                    slug,
                    order: data.order || 999,
                    section: data.section || 'default',
                };
            })
    );

    return docs.sort((a, b) => a.order - b.order);
}

export async function getCategoryMeta(categoryDir: string): Promise<CategoryMeta> {
    const metaPath = path.join(docsDirectory, categoryDir, 'meta.json');
    const metaJson = JSON.parse(fs.readFileSync(metaPath, 'utf8')) as {
        title: string;
        description: string;
        icon?: string;
        defaultOpen?: boolean;
        pages: DocPageInfo[];
        sections?: DocSection[];
        isRootCategory?: boolean;
        order?: number;
    };

    return {
        title: metaJson.title,
        description: metaJson.description || '',
        icon: metaJson.icon,
        defaultOpen: metaJson.defaultOpen ?? false,
        pages: metaJson.pages || [],
        sections: metaJson.sections || [],
        isRootCategory: metaJson.isRootCategory ?? false,
        order: metaJson.order || 999,
    };
}

export async function getAllCategories(): Promise<DocCategory[]> {
    const categories: DocCategory[] = [];
    const categoryDirs = await fs.promises.readdir(docsDirectory);

    for (const dir of categoryDirs) {
        const categoryPath = path.join(docsDirectory, dir);
        const stat = await fs.promises.stat(categoryPath);

        if (stat.isDirectory()) {
            const category = await getCategoryMeta(dir);
            if (category) {
                categories.push(category);
            }
        }
    }

    return categories.sort((a, b) => (a.order || 999) - (b.order || 999));
}

export async function getRootDocs(): Promise<DocPageInfo[]> {
    const entries = fs.readdirSync(docsDirectory, { withFileTypes: true });
    const files = entries
        .filter(
            (entry) =>
                !entry.isDirectory() &&
                entry.name.endsWith('.md') &&
                entry.name !== 'README.md'
        )
        .map((entry) => entry.name.replace(/\.md$/, ''));

    const docs = await Promise.all(
        files.map(async (slug) => {
            const { data } = await getDocBySlug(slug);
            return {
                title: data.title,
                description: data.description || '',
                slug,
                order: data.order || 999,
                section: data.section || 'default',
            };
        })
    );

    return docs.sort((a, b) => a.order - b.order);
}

export async function getDocStructure(): Promise<{
    rootDocs: DocPageInfo[];
    categories: DocCategory[];
}> {
    const rootDocs = await getRootDocs();
    const categories = await getAllCategories();

    // Group root docs by section
    const pageSections: Record<string, DocPageInfo[]> = {};
    rootDocs.forEach((doc) => {
        const section = doc.section;
        if (!pageSections[section]) {
            pageSections[section] = [];
        }
        pageSections[section].push(doc);
    });

    // Sort docs within each section
    Object.values(pageSections).forEach((sectionPages) => {
        sectionPages.sort((a, b) => a.order - b.order);
    });

    // Create root category structure from sections
    const rootCategories = Object.keys(pageSections)
        .filter((key) => key !== 'default')
        .map((sectionKey) => ({
            title: sectionKey,
            description: '',
            pages: pageSections[sectionKey],
            isRootCategory: true,
        }));

    // Combine root categories with regular categories
    const allCategories = [...rootCategories, ...categories];

    return {
        rootDocs: pageSections.default || [],
        categories: allCategories,
    };
}
