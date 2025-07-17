import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/app/lib/db';
import { PushService } from '@/app/lib/pushServer';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    // Añadir await aquí
    const user = await db.getUser(userId);
    console.log('User found:', user); // Debug log

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (!user.partnerId) {
      return NextResponse.json({ error: 'No partner found' }, { status: 400 });
    }

    // Añadir await aquí también
    const partner = await db.getUser(user.partnerId);
    console.log('Partner found:', partner); // Debug log

    if (!partner) {
      return NextResponse.json({ error: 'Partner not found' }, { status: 404 });
    }

    if (!partner.pushSubscription) {
      return NextResponse.json({ error: 'Partner has no push subscription' }, { status: 400 });
    }

    await PushService.sendNotification(partner.pushSubscription, {
      title: '💕 Ivathy',
      body: `${user.name} está pensando en ti`,
      icon: '/icons/icon-192x192.png',
      data: {
        fromUser: user.name,
        timestamp: new Date().toISOString()
      }
    });

    return NextResponse.json({ message: `Notificación enviada a ${partner.name}` });
  } catch (error) {
    console.error('Error sending notification:', error);
    return NextResponse.json({ error: 'Failed to send notification' }, { status: 500 });
  }
}