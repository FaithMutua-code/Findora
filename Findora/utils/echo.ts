import Echo from 'laravel-echo';
import Pusher from 'pusher-js/react-native';

// @ts-ignore
(global as unknown as Record<string, unknown>).Pusher = Pusher;

export const createEcho = (token: string) =>
  new Echo({
    broadcaster: 'reverb',
    key:'dfqzog5uagtqbd3tm46f',
    wsHost: '192.168.100.129',
    wsPort: 8080,
    wssPort: 8080,
    forceTLS: false,
    enabledTransports: ['ws'],

    // ⚠️  Must be /api/broadcasting/auth so auth:api middleware applies
    authEndpoint: 'http://192.168.100.129:8000/api/broadcasting/auth',
    auth: {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
      },
    },
  });