import { getChatsSocketController } from './chats-socket-conrtoller.mjs';
import { getMessagesSocketController } from './messages-socket-conrtoller.mjs';

export function createWebSocketController(io) {
  io.on('connection', (socket) => {
    console.log('A user connected', socket.id);

    getChatsSocketController(socket);

    getMessagesSocketController(socket);

    socket.on('disconnect', () => {
      console.log('User disconnected');
    });
  });
}
