import { getRootCategories } from '@/utils/documentation/markdown';
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        const categories = await getRootCategories();
        return NextResponse.json(categories);
    } catch (error) {
        console.error("Failed to fetch root categories:", error);
        return NextResponse.json({ error: "Failed to fetch categories" }, { status: 500 });
    }
}
