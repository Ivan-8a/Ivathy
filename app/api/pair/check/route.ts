import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/app/lib/db';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    const user = await db.getUser(userId);
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Si el usuario tiene pareja, obtener sus datos
    if (user.partnerId) {
      const partner = await db.getUser(user.partnerId);
      if (partner) {
        return NextResponse.json({
          partner: {
            id: partner.id,
            name: partner.name
          }
        });
      }
    }

    // Si no tiene pareja, retornar null
    return NextResponse.json({ partner: null });

  } catch (error) {
    console.error('Error checking pair status:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}