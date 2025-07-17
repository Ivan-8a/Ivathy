import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/app/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, action, code } = body;

    console.log('Pair request:', { userId, action, code }); // Debug log

    if (action === 'join') {
      if (!code) {
        return NextResponse.json(
          { error: 'Código requerido' },
          { status: 400 }
        );
      }

      if (!userId) {
        return NextResponse.json(
          { error: 'ID de usuario requerido' },
          { status: 400 }
        );
      }

      const partnerUserId = db.getUserByPairCode(code);
      
      if (!partnerUserId) {
        console.log('No partner found for code:', code); // Debug log
        return NextResponse.json(
          { error: 'Código inválido o expirado' },
          { status: 404 }
        );
      }

      const partner = await db.getUser(partnerUserId);
      
      if (!partner) {
        console.log('No user found for id:', partnerUserId); // Debug log
        return NextResponse.json(
          { error: 'Usuario no encontrado' },
          { status: 404 }
        );
      }

      try {
        await db.createCouple(userId, partnerUserId);
        db.clearPairCode(code);
        
        return NextResponse.json({
          partner: {
            id: partner.id,
            name: partner.name
          },
          message: 'Emparejamiento exitoso'
        });
      } catch (error) {
        console.error('Error creating couple:', error);
        return NextResponse.json(
          { error: 'Error al crear pareja' },
          { status: 500 }
        );
      }
    }

    if (action === 'generate') {
      const pairCode = db.generatePairCode();
      console.log('Generated code:', pairCode); // Debug log
      
      db.setPairCode(userId, pairCode);
      
      return NextResponse.json({
        pairCode,
        message: 'Código generado exitosamente'
      });
    }

  } catch (error) {
    // Enhanced error logging
    console.error('Detailed error in pair route:', {
      name: error instanceof Error ? error.name : 'Unknown',
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    });
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}