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

  /**
   * @swagger
   * /api/v1/messages:
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

  app.post('/api/v1/messages', authMiddleware, async (req, res) => {
    const { chatId, author, content, timeStamp } = req.body;

    if (!chatId || !content || !author || timeStamp) {
      return res.status(400).json({ error: 'Provide all required fields' });
    }

    const newMessage = await messageService.createMessage(req.body);

    res.status(201).json(newMessage);
  });

  app.get('/api/v1/:chatId/messages', authMiddleware, async (req, res) => {
    const { chatId } = req.params;

    if (!chatId) {
      return res.status(400).json({
        message: 'Provide chatId',
      });
    }
    try {
      const messagesByChatId = await messageService.getMessagesByChatId(chatId);

      return res.status(200).json(messagesByChatId);
    } catch (e) {
      return res.status(404).json({
        message: e.message,
      });
    }
  });

  app.get(
    '/api/v1/:chatId/messages/:messageId',
    authMiddleware,
    async (req, res) => {
      const { chatId, messageId } = req.params;

      if (!messageId || !chatId) {
        return res.status(400).json({
          message: 'Provide messageId',
        });
      }
      try {
        const messagesById = await messageService.getMessageById(
          chatId,
          messageId
        );

        return res.status(200).json(messagesById);
      } catch (e) {
        return res.status(404).json({
          message: e.message,
        });
      }
    }
  );

  app.put(
    '/api/v1/:chatId/messages/:messageId',
    authMiddleware,
    async (req, res) => {
      const { chatId, messageId } = req.params;
      const { content } = req.body;

      if (!messageId || !chatId) {
        return res.status(400).json({
          message: 'Provide messageId or chatId',
        });
      }

      if (!content) {
        return res.status(400).json({
          message: 'To update - provide message content',
        });
      }

      try {
        const updatedMessage = await messageService.updateMessageById(
          chatId,
          messageId,
          content
        );

        return res.status(200).json(updatedMessage);
      } catch (e) {
        return res.status(404).json({
          message: e.message,
        });
      }
    }
  );

  app.delete(
    '/api/v1/:chatId/messages/:messageId',
    authMiddleware,
    async (req, res) => {
      const { chatId, messageId } = req.params;

      if (!messageId || !chatId) {
        return res.status(400).json({
          message: 'Provide messageId or chatId',
        });
      }

      try {
        const deletedMessageId = await messageService.deleteMessageById(
          chatId,
          messageId
        );

        res.status(200).json({
          id: deletedMessageId
        });
      } catch (error) {
        res.status(400).json(error.message);
      }
    }
  );
}
