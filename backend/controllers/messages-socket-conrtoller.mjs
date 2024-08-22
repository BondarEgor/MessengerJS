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
 * /ws/getMessages:
 *   get:
 *     summary: Получение сообщений чата через WebSocket
 *     tags: [WebSocket]
 *     description: >
 *       Соединитесь с WebSocket сервером и отправьте сообщение с событием `getMessages`, передав ID чата (`chatId`). Сервер ответит списком сообщений для указанного чата.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               chatId:
 *                 type: integer
 *                 description: ID чата для получения сообщений
 *                 example: 1
 *     responses:
 *       200:
 *         description: Список сообщений успешно получен
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     description: ID сообщения
 *                   content:
 *                     type: string
 *                     description: Текст сообщения
 *                   timestamp:
 *                     type: string
 *                     format: date-time
 *                     description: Время отправки сообщения
 */

export function getMessagesSocketController(socket) {
  socket.on('getMessages', async (response) => {
    const { chatId } = response;
    const service = diContainer.resolve(SERVICES.messages);
    const messages = await service.getMessagesByChatId(chatId);

    socket.emit(messages);
  });
}
