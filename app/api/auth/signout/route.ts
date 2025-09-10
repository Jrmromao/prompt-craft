import { NextResponse } from 'next/server';

export async function POST() {
  try {
    // Since we're using server-side authentication with Clerk,
    // we need to clear the session cookie
    const response = NextResponse.json({ success: true });
    
    // Clear the session cookie
    response.cookies.set('__session', '', {
      expires: new Date(0),
      path: '/',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax'
    });

    // Also clear any Clerk-specific cookies
    response.cookies.set('__clerk_db_jwt', '', {
      expires: new Date(0),
      path: '/',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax'
    });

    return response;
  } catch (error) {
    console.error('Sign out error:', error);
    return NextResponse.json(
      { error: 'Failed to sign out' },
      { status: 500 }
    );
  }
}
