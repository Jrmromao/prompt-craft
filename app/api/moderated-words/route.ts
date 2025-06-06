import { NextRequest, NextResponse } from 'next/server';
import {
  createModeratedWord,
  removeModeratedWord,
} from '@/app/admin/moderation/services/moderationService';

export async function POST(req: NextRequest) {
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

export async function DELETE(req: NextRequest) {
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
