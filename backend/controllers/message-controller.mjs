import { SERVICES } from '../di/api.mjs';
import { diContainer } from '../di/di.mjs';
import { authMiddleware } from '../middlewares/authMiddleware.mjs';

export function createMessageController(app) {
  const messageService = diContainer.resolve(SERVICES.messages);
  const subscribers = {};

  messageService.subscribe(({ chatId, messages }) => {
    if (subscribers[chatId]) {
      subscribers[chatId].forEach((client) => {
        client.write(`data: ${JSON.stringify(messages)}\n\n`);
      });
    }
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

  app.post('/api/v1/:chatId/messages', authMiddleware, async (req, res) => {
    const { author, content, timeStamp } = req.body;
    const { chatId } = req.params;

    if (!chatId || !content || !author || timeStamp) {
      return res.status(400).json({ error: 'Provide all required fields' });
    }

    const newMessage = await messageService.createMessage(req.body);
    res.status(201).json(newMessage);

    req.on('close', () => {});
  });

  app.post('/api/v1/messages-stream', authMiddleware, async (req, res) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    const sendUpdate = async () => {
      const { chatId } = req.body;
      try {
        const messages = await getMessagesByChatId(chatId);
        res.write(JSON.stringify(messages));
      } catch (error) {
        console.error(error);
        res.status(400).json({ error: error.message });
      }
    };

    messageService.subscribe(sendUpdate);

    req.on('close', () => {
      console.log('Connection closed');
      messageService.unsubscribe(sendUpdate);
    });
  });

  app.get('/api/v1/subscribe/:chatId/messages', (res, req) => {
    const { chatId } = req.params;

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    if (!subscribers[chatId]) {
      subscribers[chatId] = [];
    }

    subscribers[chatId].push(res);

    req.on('close', () => {
      subscribers[chatId] = subscribers[chatId].filter((sub) => sub !== res);
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

    if (!chatId) {
      return res.status(400).json({
        message: 'Provide chatId',
      });
    }

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
          message: 'no content',
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
        console.error(e);
        return res.status(404).json({
          message: e.message,
        });
      }
    }
  );

  app.put('/api/v1/:chatId/messages/:messageId', (req, res) => {});
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
          id: deletedMessageId,
        });
      } catch (error) {
        console.error(error);
        res.status(400).json(error.message);
      }
    }
  );
}
