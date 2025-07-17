// app/page.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import AuthForm from './components/AuthForm';
import PairForm from './components/PairForm';
import NotifyButton from './components/NotifyButton';
import { requestNotificationPermission, subscribeUser } from '@/app/lib/pushClient';

interface User {
  id: string;
  name: string;
  partnerId?: string;
}

interface Partner {
  id: string;
  name: string;
}

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [partner, setPartner] = useState<Partner | null>(null);
  const [loading, setLoading] = useState(true);

  const saveSubscription = useCallback(async (subscription: PushSubscription) => {
    try {
      await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user?.id,
          subscription
        })
      });
    } catch (error) {
      console.error('Error saving subscription:', error);
    }
  }, [user?.id]);

  const registerServiceWorker = useCallback(async () => {
    if (!('serviceWorker' in navigator)) {
      alert('Tu navegador no soporta notificaciones push');
      return;
    }

    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      console.log('Service Worker registered:', registration);
      
      const subscription = await subscribeUser();
      if (subscription && user) {
        await saveSubscription(subscription);
        console.log('Notificaciones activadas correctamente');
      }
    } catch (error) {
      console.error('Error al registrar notificaciones:', error);
      alert('Error al activar las notificaciones. Por favor, intenta de nuevo.');
    }
  }, [user, saveSubscription]);

  useEffect(() => {
    if (user && !user.partnerId) {
      registerServiceWorker();
    }
  }, [user, registerServiceWorker]);

  const handleAuth = (userData: User) => {
    setUser(userData);
    localStorage.setItem('ivathy_user', JSON.stringify(userData));
  };

  const handlePaired = async (partnerData: Partner) => {
    setPartner(partnerData);
    localStorage.setItem('ivathy_partner', JSON.stringify(partnerData));
    
    // Actualizar usuario con partnerId
    const updatedUser = { ...user!, partnerId: partnerData.id };
    setUser(updatedUser);
    localStorage.setItem('ivathy_user', JSON.stringify(updatedUser));
    
    // Solicitar permiso inmediatamente después del emparejamiento
    const hasPermission = await requestNotificationPermission();
    if (hasPermission) {
      await registerServiceWorker();
    } else {
      alert('Para recibir notificaciones de tu pareja, necesitas permitir las notificaciones.');
    }
  };

  useEffect(() => {
    // Cargar usuario desde localStorage
    const savedUser = localStorage.getItem('ivathy_user');
    if (savedUser) {
      const userData = JSON.parse(savedUser);
      setUser(userData);
      
      // Si tiene pareja, cargar datos de la pareja
      if (userData.partnerId) {
        const savedPartner = localStorage.getItem('ivathy_partner');
        if (savedPartner) {
          setPartner(JSON.parse(savedPartner));
        }
      }
    }
    
    setLoading(false);
  }, []);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null; // o un loading skeleton
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-100 to-purple-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 to-purple-100">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2"></h1>
          <p className="text-gray-600"></p>
        </div>

        <div className="flex justify-center">
          {!user ? (
            <AuthForm onAuth={handleAuth} />
          ) : !partner ? (
            <PairForm userId={user.id} onPaired={handlePaired} />
          ) : (
            <NotifyButton userId={user.id} partnerName={partner.name} />
          )}
        </div>

        {user && partner && (
          <div className="mt-8 text-center">
            <button
              onClick={() => {
                localStorage.removeItem('ivathy_user');
                localStorage.removeItem('ivathy_partner');
                setUser(null);
                setPartner(null);
              }}
              className="text-sm text-gray-500 hover:text-gray-700 underline"
            >
              Desconectar
            </button>
          </div>
        )}
      </div>
    </div>
  );
}