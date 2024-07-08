import { diContainer } from '../di/di.mjs';
import { SERVICES } from '../di/api.mjs';

/**
 * @swagger
 * /messages/{chatId}:
 *   get:
 *     summary: Получение массива случайных сообщений по chatId
 *     parameters:
 *       - in: path
 *         name: chatId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Массив случайных сообщений
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                   author:
 *                     type: string
 *                     description: Автор сообщения
 *                   message:
 *                     type: string
 *                     description: Текст сообщения
 */

export function createChatController(app) {
  const chatService = diContainer.resolve(SERVICES.messages);
  app.get('/api/v1/messages/:chatId', (req, res) => {
    const { chatId } = req.body;
    const messages = chatService.getMessages(chatId);

    res.json(messages);
  });
}
