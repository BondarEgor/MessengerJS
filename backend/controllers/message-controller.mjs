import { SERVICES } from '../di/api.mjs';
import { diContainer } from '../di/di.mjs';
import { authMiddleware } from '../middlewares/authMiddleware.mjs';

export function createMessageController(app) {
  const messageService = diContainer.resolve(SERVICES.messages);

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

  app.get('/api/v1/messages/:chatId', authMiddleware, (req, res) => {
    const { chatId } = req.body;
    const messages = messageService.getMessages(chatId);

    res.json(messages);
  });
}
