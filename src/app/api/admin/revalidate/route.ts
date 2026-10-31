import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath, revalidateTag } from 'next/cache';
import { requireAdmin } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    await requireAdmin(req);
    const body = await req.json();
    const { path, tag } = body;

    if (!path && !tag) {
      return NextResponse.json(
        { error: 'Must provide either a path or a tag to revalidate' },
        { status: 400 }
      );
    }

    if (path) {
      revalidatePath(path);
    }

    if (tag) {
      revalidateTag(tag);
    }

    return NextResponse.json({
      success: true,
      revalidated: { path, tag, timestamp: new Date().toISOString() },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Unauthorized revalidation request' },
      { status: error.status || 401 }
    );
  }
}
