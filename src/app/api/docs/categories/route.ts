import { NextResponse } from 'next/server';
import { getDocCategories } from '@/utils/documentation/markdown';

export async function GET() {
    try {
        const categories = await getDocCategories();
        // Move root category (Getting Started) to the top if not already
        const rootCategoryIndex = categories.findIndex(c => !c.title.includes('/'));
        if (rootCategoryIndex > 0) {
            const rootCategory = categories.splice(rootCategoryIndex, 1)[0];
            categories.unshift(rootCategory);
        }

        return NextResponse.json(categories);
    } catch (error) {
        console.error('Error fetching doc categories:', error);
        return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 });
    }
}
