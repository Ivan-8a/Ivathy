function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export const checkNotificationPermission = async (): Promise<{
  status: NotificationPermission;
  blocked: boolean;
}> => {
  if (!('Notification' in window)) {
    return { status: 'denied', blocked: true };
  }

  const permission = Notification.permission;
  const blocked = permission === 'denied';

  return { status: permission, blocked };
};

export const requestNotificationPermission = async (): Promise<boolean> => {
  try {
    const { status, blocked } = await checkNotificationPermission();

    if (blocked) {
      // Mostrar instrucciones específicas para desbloquear
      const browserName = detectBrowser();
      showUnblockInstructions(browserName);
      return false;
    }

    if (status === 'granted') {
      return true;
    }

    const result = await Notification.requestPermission();
    return result === 'granted';
  } catch (error) {
    console.error('Error requesting notification permission:', error);
    return false;
  }
};

export const subscribeUser = async (): Promise<PushSubscription | null> => {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    console.log('Push messaging is not supported');
    return null;
  }

  try {
    // Primero, verificar si ya tenemos permiso
    if (Notification.permission !== 'granted') {
      // Solicitar permiso
      const permitted = await requestNotificationPermission();
      if (!permitted) {
        console.log('Permiso de notificaciones denegado');
        return null;
      }
    }

    const registration = await navigator.serviceWorker.ready;
    const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

    if (!vapidPublicKey) {
      console.error('VAPID public key is missing');
      return null;
    }

    console.log('Subscribing to push notifications...');
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(vapidPublicKey)
    });

    console.log('Push subscription successful:', subscription);
    return subscription;
  } catch (error) {
    if (error instanceof Error) {
      console.error('Push subscription error:', error.message);
    }
    return null;
  }
};

const detectBrowser = (): string => {
  if (navigator.userAgent.indexOf("Chrome") !== -1) return 'chrome';
  if (navigator.userAgent.indexOf("Firefox") !== -1) return 'firefox';
  if (navigator.userAgent.indexOf("Edge") !== -1) return 'edge';
  return 'unknown';
};

const showUnblockInstructions = (browser: string) => {
  const instructions = {
    chrome: `Para habilitar las notificaciones en Chrome:
1. Haz clic en el icono del candado 🔒 junto a la URL
2. Busca "Notificaciones" en el menú
3. Cambia el estado a "Permitir"`,
    firefox: `Para habilitar las notificaciones en Firefox:
1. Haz clic en el icono de información (i) junto a la URL
2. Encuentra "Notificaciones" en los permisos
3. Elimina el bloqueo o selecciona "Permitir"`,
    edge: `Para habilitar las notificaciones en Edge:
1. Haz clic en el icono del candado 🔒 junto a la URL
2. Busca "Notificaciones" en los permisos
3. Cambia a "Permitir"`
  };

  const message = instructions[browser as keyof typeof instructions] || 
    'Por favor, habilita las notificaciones en la configuración de tu navegador.';

  // Usar un modal o dialog personalizado en lugar de alert
  showCustomDialog(message);
};

const showCustomDialog = (message: string) => {
  // Crear un elemento modal si no existe
  let modal = document.getElementById('notification-instructions');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'notification-instructions';
    modal.innerHTML = `
      <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
        <div class="bg-white rounded-lg p-6 max-w-md w-full">
          <h3 class="text-lg font-bold mb-4">Notificaciones Bloqueadas</h3>
          <p class="whitespace-pre-line text-gray-600 mb-4">${message}</p>
          <button class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
            Entendido
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    // Añadir evento al botón
    const button = modal.querySelector('button');
    if (button) {
      button.onclick = () => {
        modal?.remove();
      };
    }
  }
};