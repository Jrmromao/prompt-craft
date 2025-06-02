// import { NextResponse } from 'next/server';
// import { prisma } from '@/lib/prisma';

// export async function GET(
//   req: Request,
//   //@ts-ignore
//   { params }: { params: { promptId: string } } // This is the line to correct
// ) {
//   try {
//     const prompt = await prisma.promptTemplate.findFirst({
//       where: {
//         id: params.promptId,
//         isPublic: true
//       }
//     });

//     if (!prompt) {
//       return new NextResponse('Prompt not found', { status: 404 });
//     }

//     return NextResponse.json(prompt);
//   } catch (error) {
//     console.error('[PROMPT_GET]', error);
//     return new NextResponse('Internal Error', { status: 500 });
//   }
// }

// export async function PUT(
//   req: Request,
//   { params }: { params: { promptId: string } }
// ) {
//   try {
//     const body = await req.json();
//     const { name, description, content, isPublic, tags } = body;

//     if (!name || !content) {
//       return new NextResponse('Missing required fields', { status: 400 });
//     }

//     const prompt = await prisma.promptTemplate.findFirst({
//       where: {
//         id: params.promptId,
//         userId: 'public-user'
//       }
//     });

//     if (!prompt) {
//       return new NextResponse('Prompt not found', { status: 404 });
//     }

//     const updatedPrompt = await prisma.promptTemplate.update({
//       where: {
//         id: params.promptId
//       },
//       data: {
//         name,
//         description,
//         content,
//         isPublic: isPublic || false,
//         tags: tags || []
//       }
//     });

//     return NextResponse.json(updatedPrompt);
//   } catch (error) {
//     console.error('[PROMPT_PUT]', error);
//     return new NextResponse('Internal Error', { status: 500 });
//   }
// }

// export async function DELETE(
//   req: Request,
//   { params }: { params: { promptId: string } }
// ) {
//   try {
//     const prompt = await prisma.promptTemplate.findFirst({
//       where: {
//         id: params.promptId,
//         userId: 'public-user'
//       }
//     });

//     if (!prompt) {
//       return new NextResponse('Prompt not found', { status: 404 });
//     }

//     await prisma.promptTemplate.delete({
//       where: {
//         id: params.promptId
//       }
//     });

//     return new NextResponse(null, { status: 204 });
//   } catch (error) {
//     console.error('[PROMPT_DELETE]', error);
//     return new NextResponse('Internal Error', { status: 500 });
//   }
// }

import { NextResponse } from 'next/server';

export async function GET(req: Request ) {
  return NextResponse.json({ message: 'Prompt GET handler works!' });
}