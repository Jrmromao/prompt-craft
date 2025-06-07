import { NextResponse } from 'next/server';
import {
  createModeratedWord,
  removeModeratedWord,
} from '@/app/admin/moderation/services/moderationService';
import { dynamicRouteConfig, withDynamicRoute } from '@/lib/utils/dynamicRoute';

// Export dynamic configuration
export const { dynamic, revalidate, runtime } = dynamicRouteConfig;

// Define the main handler
async function moderatedWordsHandler(req: Request) {
  try {
    const { word, severity, category, status } = await req.json();
    if (!word || !severity || !category || !status) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    const newWord = await createModeratedWord(word, severity, category, status);
    return NextResponse.json(newWord, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to add word' }, { status: 500 });
  }
}

// Define the DELETE handler
async function deleteWordHandler(req: Request) {
  try {
    const { id } = await req.json();
    if (!id) {
      return NextResponse.json({ error: 'Missing id' }, { status: 400 });
    }
    await removeModeratedWord(id);
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to remove word' }, { status: 500 });
  }
}

// Export the handlers
export const POST = moderatedWordsHandler;
export const DELETE = deleteWordHandler;
