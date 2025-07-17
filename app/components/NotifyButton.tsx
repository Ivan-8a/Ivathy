// app/components/NotifyButton.tsx
'use client';

import { useState, useEffect } from 'react';
import { checkNotificationPermission, requestNotificationPermission } from '@/app/lib/pushClient';

interface NotifyButtonProps {
  userId: string;
  partnerName: string;
}

export default function NotifyButton({ userId, partnerName }: NotifyButtonProps) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [notificationState, setNotificationState] = useState<{
    enabled: boolean;
    blocked: boolean;
  }>({
    enabled: false,
    blocked: false
  });

  useEffect(() => {
    checkPermissionStatus();
  }, []);

  const checkPermissionStatus = async () => {
    const { status, blocked } = await checkNotificationPermission();
    setNotificationState({
      enabled: status === 'granted',
      blocked
    });
  };

  const enableNotifications = async () => {
    const permitted = await requestNotificationPermission();
    if (permitted) {
      setNotificationState(prev => ({ ...prev, enabled: true }));
      // Recargar la página para asegurar que todo se registre correctamente
      window.location.reload();
    }
  };

  const handleNotify = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/notify', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          // Asegúrate de incluir las credenciales si es necesario
          'credentials': 'include'
        },
        body: JSON.stringify({ userId })
      });

      if (response.status === 403) {
        throw new Error('No tienes permiso para realizar esta acción');
      }

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Error al enviar notificación');
      }

      setMessage(data.message);
    } catch (error) {
      console.error('Error:', error);
      alert(error instanceof Error ? error.message : 'Error al enviar notificación');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg text-center">
      <h2 className="text-2xl font-bold mb-4">Conectado con {partnerName}</h2>
      
      {notificationState.blocked ? (
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-yellow-800 mb-2">
            Las notificaciones están bloqueadas en tu navegador
          </p>
          <button
            onClick={() => requestNotificationPermission()}
            className="text-blue-600 underline hover:text-blue-800"
          >
            Ver instrucciones para desbloquear
          </button>
        </div>
      ) : !notificationState.enabled && (
        <div className="mb-6">
          <p className="text-gray-600 mb-2">
            Activa las notificaciones para recibir mensajes de {partnerName}
          </p>
          <button
            onClick={() => requestNotificationPermission()}
            className="bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600"
          >
            Activar notificaciones
          </button>
        </div>
      )}

      {notificationState.enabled && (
        <>
          <p className="text-gray-600 mb-6">
            Presiona el botón para enviar una notificación a tu pareja
          </p>
          
          <button
            onClick={handleNotify}
            disabled={loading}
            className="w-full bg-gradient-to-r from-pink-500 to-purple-500 text-white py-4 px-6 rounded-full text-lg font-semibold hover:from-pink-600 hover:to-purple-600 disabled:opacity-50 transform hover:scale-105 transition-all duration-200"
          >
            {loading ? 'Enviando...' : '💕 Estoy pensando en ti'}
          </button>
        </>
      )}
      
      {message && (
        <p className="mt-4 text-green-600 font-medium">{message}</p>
      )}
    </div>
  );
}