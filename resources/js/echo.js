import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

window.Pusher = Pusher;

// echo.js
const echo = new Echo({
    broadcaster: 'pusher',
    key: import.meta.env.VITE_PUSHER_APP_KEY,
    cluster: import.meta.env.VITE_PUSHER_APP_CLUSTER,
    forceTLS: true,  // Ensure TLS for secure connection
    enabledTransports: ['ws', 'wss'],  // Use WebSocket and secure WebSocket
});

export default echo;
