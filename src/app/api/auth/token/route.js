// import { getAccessToken } from '@auth0/nextjs-auth0';
// import { NextResponse } from 'next/server';

// export async function GET() {
//   try {
//     // First, check if there's a session
//     const session = await getSession();
//     console.log('=== Token Route Debug ===');
//     console.log('Session exists:', !!session);
//     console.log('Session user:', session?.user?.email || 'No user');
    
//     if (!session) {
//       console.log('❌ No session found');
//       return NextResponse.json({ error: 'No session found' }, { status: 401 });
//     }

//     // Try to get access token
//     console.log('Attempting to get access token...');
//     const { accessToken } = await getAccessToken();
//     console.log('✅ Access token retrieved:', accessToken ? 'Yes' : 'No');
    
//     return NextResponse.json({ accessToken });
//   } catch (error) {
//     console.error('❌ getAccessToken error:', error);
//     return NextResponse.json({ 
//       error: 'Not authenticated',
//       message: error instanceof Error ? error.message : 'Unknown error'
//     }, { status: 401 });
//   }
// }

import { auth0 } from '@/lib/auth0';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const session = await auth0.getSession();
    
    if (!session) {
      console.log('Not authenticated, nosession found');
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    console.log('Authenticated, session found. ', session.tokenSet.accessToken);

    return NextResponse.json({ 
      accessToken: session.tokenSet.accessToken,
      expiresAt: session.tokenSet.expires_at
    });
  } catch (error) {
    console.error('Error getting token:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}