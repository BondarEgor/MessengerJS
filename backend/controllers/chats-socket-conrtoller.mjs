import { diContainer } from '../di/di.mjs';
import { SERVICES } from '../di/api.mjs';

/**
 * @swagger
 * tags:
 *   name: WebSocket
 *   description: Операции WebSocket API
 */

/**
 * @swagger
 * /ws/getChats:
 *   get:
 *     summary: Получение списка чатов через WebSocket
 *     tags: [WebSocket]
 *     description: >
 *       Соединитесь с WebSocket сервером и отправьте сообщение с событием `getChats`. Сервер ответит списком чатов.
 *     responses:
 *       200:
 *         description: Список чатов успешно получен
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     description: ID чата
 *                   name:
 *                     type: string
 *                     description: Название чата
 */

export function getChatsSocketController(socket) {
  const eventEmitter = diContainer.resolve(SERVICES.events);
  const service = diContainer.resolve(SERVICES.chats);

  socket.on('chats', async () => {
    try {
      const chats = await service.getAllChats();

      socket.emit('chats', chats);
    } catch (exception) {
      socket.emit('exception', exception);
    }

    socket.emit(chats);
  });

  socket.on('deleteChat', (id) => {
    // Тут наверное я должен сначала удалить чат, потом проверить, если успешно, то на клиент сэмитить по сокету обновленный список чатов?
  });

  const handleCreateChat = (chat) => {
    socket.emit('createChat', chat);
  };

  const handleDeleteChat = (isSuccess) => {
    socket.emit('deleteChat', isSuccess);
  };

  const handleUpdateChat = (chat) => {
    socket.emit('updateChat', chat);
  };

  eventEmitter.on('createChat', handleCreateChat);
  eventEmitter.on('deleteChat', handleDeleteChat);
  eventEmitter.on('updateChat', handleUpdateChat);
}
