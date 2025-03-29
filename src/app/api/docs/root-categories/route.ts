import { getDocStructure } from '@/utils/documentation/markdown';
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        const { categories } = await getDocStructure();
        const rootCategories = categories.filter(c => c.isRootCategory);
        return NextResponse.json(rootCategories);
    } catch (error) {
        console.error("Failed to fetch root categories:", error);
        return NextResponse.json({ error: "Failed to fetch categories" }, { status: 500 });
    }
}
