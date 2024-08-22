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
  socket.on('getChats', async () => {
    const service = diContainer.resolve(SERVICES.chats);
    const chats = await service.getAllChats();

    socket.emit(chats);
  });
}
