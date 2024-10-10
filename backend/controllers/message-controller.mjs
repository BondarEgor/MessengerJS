import { SERVICES } from '../di/api.mjs';
import { diContainer } from '../di/di.mjs';
import { authMiddleware } from '../middlewares/authMiddleware.mjs';
import {
  authorContentValidator,
  contentValidator,
} from '../services/validate-service.mjs';

export function createMessageController(app) {
  const messageService = diContainer.resolve(SERVICES.messages);
  const chatService = diContainer.resolve(SERVICES.chats);
  const sessionService = diContainer.resolve(SERVICES.sessions);

  /**
   * @swagger
   * /api/v1/:chatId/messages:
   *   post:
   *     summary: Создание нового сообщения
   *     description: Создает новое сообщение в указанном чате. Требует авторизацию.
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               chatId:
   *                 type: string
   *                 description: Уникальный идентификатор чата, в который отправляется сообщение
   *               author:
   *                 type: string
   *                 description: Имя автора сообщения
   *               content:
   *                 type: string
   *                 description: Текст сообщения
   *               timeStamp:
   *                 type: string
   *                 format: date-time
   *                 description: Временная метка сообщения в формате ISO 8601
   *             required:
   *               - chatId
   *               - author
   *               - content
   *               - timeStamp
   *     responses:
   *       201:
   *         description: Сообщение успешно создано
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 id:
   *                   type: string
   *                   description: Уникальный идентификатор созданного сообщения
   *                 chatId:
   *                   type: string
   *                   description: Уникальный идентификатор чата, в который отправлено сообщение
   *                 author:
   *                   type: string
   *                   description: Имя автора сообщения
   *                 content:
   *                   type: string
   *                   description: Текст сообщения
   *                 timeStamp:
   *                   type: string
   *                   format: date-time
   *                   description: Временная метка сообщения в формате ISO 8601
   *       400:
   *         description: Ошибка запроса из-за отсутствия обязательных полей
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 error:
   *                   type: string
   *                   description: Сообщение об ошибке
   *       401:
   *         description: Ошибка авторизации
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 error:
   *                   type: string
   *                   description: Сообщение об ошибке авторизации
   */

  app.post(
    '/api/v1/:chatId/messages/',
    authorContentValidator,
    authMiddleware,
    async (req, res) => {
      const { chatId } = req.params;

      try {
        const { userId } = await sessionService.getSessionByToken(
          req.headers['authorization']
        );
        const chat = await chatService.getChatById(userId, chatId);

        if (!chat) {
          return res.status(404).json({ error: 'Chat not found' });
        }

        const newMessage = await messageService.createMessage(chatId, req.body);
        return res.status(201).json(newMessage);
      } catch (error) {
        console.error(error);
        return res.status(400).json({ error: error.message });
      }
    }
  );

  app.get('/api/v1/:chatId/messages', authMiddleware, async (req, res) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    const { chatId } = req.params;
    messageService.createMessageStream(res, chatId);

    req.on('close', () => {
      console.log('Connection closed');
      messageService.unsubscribe(chatId, res);
    });
  });

  /**
   * @swagger
   * /api/v1/{chatId}/messages:
   *   get:
   *     summary: Получение всех сообщений по chatId
   *     parameters:
   *       - in: path
   *         name: chatId
   *         required: true
   *         schema:
   *           type: string
   *         description: Уникальный идентификатор чата
   *     responses:
   *       200:
   *         description: Успешное получение сообщений
   *         content:
   *           application/json:
   *             schema:
   *               type: array
   *               items:
   *                 $ref: '#/components/schemas/Message'
   *       400:
   *         description: Ошибка в запросе
   */

  app.get('/api/v1/:chatId/messages', authMiddleware, async (req, res) => {
    const { chatId } = req.params;

    try {
      const messagesByChatId = await messageService.getMessagesByChatId(chatId);

      return res.status(200).json(messagesByChatId);
    } catch (e) {
      console.error(e);
      return res.status(404).json({
        message: e.message,
      });
    }
  });

  /**
   * @swagger
   * /api/v1/{chatId}/messages/{messageId}:
   *   get:
   *     summary: Получение сообщения по chatId и messageId
   *     parameters:
   *       - in: path
   *         name: chatId
   *         required: true
   *         schema:
   *           type: string
   *         description: Уникальный идентификатор чата
   *       - in: path
   *         name: messageId
   *         required: true
   *         schema:
   *           type: string
   *         description: Уникальный идентификатор сообщения
   *     responses:
   *       200:
   *         description: Успешное получение сообщения
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Message'
   *       404:
   *         description: Сообщение не найдено
   */

  app.get(
    '/api/v1/:chatId/messages/:messageId',
    authMiddleware,
    async (req, res) => {
      const { chatId, messageId } = req.params;
      try {
        const messagesById = await messageService.getMessageByMessageId(
          chatId,
          messageId
        );

        return res.status(200).json(messagesById);
      } catch (e) {
        console.error(e);
        return res.status(404).json({
          message: e.message,
        });
      }
    }
  );

  /**
   * @swagger
   * /api/v1/{chatId}/messages/{messageId}:
   *   put:
   *     summary: Обновление сообщения по chatId и messageId
   *     parameters:
   *       - in: path
   *         name: chatId
   *         required: true
   *         schema:
   *           type: string
   *         description: Уникальный идентификатор чата
   *       - in: path
   *         name: messageId
   *         required: true
   *         schema:
   *           type: string
   *         description: Уникальный идентификатор сообщения
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               content:
   *                 type: string
   *                 description: Обновленный текст сообщения
   *     responses:
   *       200:
   *         description: Сообщение успешно обновлено
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Message'
   *       404:
   *         description: Сообщение не найдено
   */

  app.put(
    '/api/v1/:chatId/messages/:messageId',
    contentValidator,
    authMiddleware,
    async (req, res) => {
      const { chatId, messageId } = req.params;
      const { content } = req.body;

      try {
        const updatedMessage = await messageService.updateMessageById(
          chatId,
          messageId,
          content
        );

        return res.status(200).json(updatedMessage);
      } catch (e) {
        console.error(e);
        return res.status(404).json({
          message: e.message,
        });
      }
    }
  );

  /**
   * @swagger
   * /api/v1/{chatId}/messages/{messageId}/restore:
   *   put:
   *     summary: Restore a deleted message in a chat
   *     description: Restores a message by its ID within a specific chat.
   *     parameters:
   *       - in: path
   *         name: chatId
   *         required: true
   *         description: The ID of the chat containing the message.
   *         schema:
   *           type: string
   *       - in: path
   *         name: messageId
   *         required: true
   *         description: The ID of the message to restore.
   *         schema:
   *           type: string
   *     responses:
   *       '200':
   *         description: Message successfully restored.
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 chatId:
   *                   type: string
   *                   description: The ID of the chat where the message was restored.
   *                   example: "123"
   *                 messageId:
   *                   type: string
   *                   description: The ID of the restored message.
   *                   example: "456"
   *                 author:
   *                   type: string
   *                   description: The author of the message.
   *                   example: "John Doe"
   *                 content:
   *                   type: string
   *                   description: The content of the restored message.
   *                   example: "This is a restored message."
   *                 timeStamp:
   *                   type: string
   *                   format: date-time
   *                   description: The timestamp when the message was restored.
   *                   example: "2024-10-03T10:00:00Z"
   *       '404':
   *         description: Message not found or unable to restore.
   *       '500':
   *         description: Internal server error.
   */

  app.put(
    '/api/v1/:chatId/messages/:messageId/restore',
    contentValidator,
    authMiddleware,
    async (req, res) => {
      const { chatId, messageId } = req.params;

      try {
        const restoredMessage = await messageService.restoreMessageById(
          chatId,
          messageId
        );

        return res.status(200).json(restoredMessage);
      } catch (e) {
        console.error(e);
        return res.status(404).json({
          message: e.message,
        });
      }
    }
  );

  /**
   * @swagger
   * /api/v1/{chatId}/messages/{messageId}:
   *   delete:
   *     summary: Удаление сообщения по chatId и messageId
   *     parameters:
   *       - in: path
   *         name: chatId
   *         required: true
   *         schema:
   *           type: string
   *         description: Уникальный идентификатор чата
   *       - in: path
   *         name: messageId
   *         required: true
   *         schema:
   *           type: string
   *         description: Уникальный идентификатор сообщения
   *     responses:
   *       200:
   *         description: Сообщение успешно удалено
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 id:
   *                   type: string
   *                   description: Уникальный идентификатор удаленного сообщения
   *       404:
   *         description: Сообщение не найдено
   */

  app.delete(
    '/api/v1/:chatId/messages/:messageId',
    authMiddleware,
    async (req, res) => {
      const { chatId, messageId } = req.params;

      try {
        const deletedMessageId = await messageService.softDeleteMessageById(
          chatId,
          messageId
        );

        return res.status(200).json(deletedMessageId);
      } catch (error) {
        console.error(error);

        return res.status(400).json({
          error: error.message,
        });
      }
    }
  );
}
