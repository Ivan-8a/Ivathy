import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/app/lib/db';

export async function POST(request: NextRequest) {
  try {
    const { userId, subscription } = await request.json();

    if (!userId || !subscription) {
      return NextResponse.json({ error: 'User ID and subscription are required' }, { status: 400 });
    }

    // Añade await aquí
    const user = await db.updateUser(userId, { pushSubscription: subscription });
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Subscription saved successfully' });
  } catch (error) {
    console.error('Error saving subscription:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
