import Echo from 'laravel-echo';
import Pusher from 'pusher-js/react-native';
import {API_URL, REVERB_KEY } from '@/config';
// @ts-ignore
(global as unknown as Record<string, unknown>).Pusher = Pusher;

export const createEcho = (token: string) =>
  new Echo({
    broadcaster: 'reverb',
    key:REVERB_KEY,
    wsHost: API_URL,
    wsPort: 8080,
    wssPort: 8080,
    forceTLS: false,
    enabledTransports: ['ws'],

    // ⚠️  Must be /api/broadcasting/auth so auth:api middleware applies
    authEndpoint: `${API_URL}/api/broadcasting/auth`,
    auth: {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
      },
    },
  });