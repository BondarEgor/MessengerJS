import { SERVICES } from '../di/api.mjs';
import { diContainer } from '../di/di.mjs';
import { authMiddleware } from '../middlewares/authMiddleware.mjs';
import { typeDescNameValidator } from '../services/validate-service.mjs';

export function createChatController(app) {
  const chatService = diContainer.resolve(SERVICES.chats);
  const sessionService = diContainer.resolve(SERVICES.sessions);

  /**
   * @swagger
   * /chats:
   *   post:
   *     summary: Create a new chat
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               name:
   *                 type: string
   *                 description: The name of the chat
   *                 example: "Project Discussion"
   *               description:
   *                 type: string
   *                 description: The description of the chat
   *                 example: "This chat is for discussing the current project."
   *               type:
   *                 type: string
   *                 enum: [private, group]
   *                 description: The type of chat
   *                 example: "group"
   *               members:
   *                 type: array
   *                 items:
   *                   type: string
   *                 description: List of user identifiers
   *                 example: ["user1", "user2", "user3"]
   *               creator:
   *                 type: string
   *                 description: Identifier of the chat creator
   *                 example: "user1"
   *     responses:
   *       '201':
   *         description: Chat successfully created
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 id:
   *                   type: string
   *                   description: Identifier of the created chat
   *                   example: "chat1"
   *                 name:
   *                   type: string
   *                   description: The name of the chat
   *                   example: "Project Discussion"
   *                 description:
   *                   type: string
   *                   description: The description of the chat
   *                   example: "This chat is for discussing the current project."
   *                 type:
   *                   type: string
   *                   enum: [private, group]
   *                   description: The type of chat
   *                   example: "group"
   *                 members:
   *                   type: array
   *                   items:
   *                     type: string
   *                   description: List of user identifiers
   *                   example: ["user1", "user2", "user3"]
   *                 creator:
   *                   type: string
   *                   description: Identifier of        the chat creator
   *                   example: "user1"
   *       '400':
   *         description: Validation error
   *       '500':
   *         description: Internal server error
   */

  app.post(
    '/api/v1/chats',
    authMiddleware,
    typeDescNameValidator,
    async (req, res) => {
      const token = res.locals.authToken || req.headers['authorization'];

      try {
        const { userId } = await sessionService.getSessionByToken(token);
        const newChat = await chatService.createChat(userId, req.body);

        if (!newChat) {
          res.status(400).json({ error: 'Error while creating chat' });
        }

        res
          .status(201)
          .json({ message: 'Chat successfully created', chat: newChat });
      } catch (e) {
        console.error(e);
        res.status(400).json({ error: e.message });
      }
    }
  );

  app.get('/api/v1/chats-stream/', authMiddleware, async (req, res) => {
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    });
    const token = res.locals.authToken || req.headers['authorization'];

    try {
      const { userId } = await sessionService.getSessionByToken(token);

      chatService.createChatStream(userId, res);
    } catch (error) {
      console.error({ error: error.message });
      return res.status(404).json({ error: error.message });
    }

    req.on('close', () => {
      chatService.unsubscribe(userId, res);
    });
  });

  /**
   * @swagger
   * /chats/{id}:
   *   delete:
   *     summary: Delete a chat by ID
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: The ID of the chat to delete
   *     responses:
   *       '200':
   *         description: Chat successfully deleted
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 id:
   *                   type: string
   *                   description: The ID of the deleted chat
   *                   example: "chat1"
   *                 name:
   *                   type: string
   *                   description: The name of the deleted chat
   *                   example: "Project Discussion"
   *                 description:
   *                   type: string
   *                   description: The description of the deleted chat
   *                   example: "This chat is for discussing the current project."
   *                 type:
   *                   type: string
   *                   enum: [private, group]
   *                   description: The type of the deleted chat
   *                   example: "group"
   *                 members:
   *                   type: array
   *                   items:
   *                     type: string
   *                   description: List of user identifiers
   *                   example: ["user1", "user2", "user3"]
   *                 creator:
   *                   type: string
   *                   description: Identifier of the chat creator
   *                   example: "user1"
   *       '400':
   *         description: Validation error
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 error:
   *                   type: string
   *                   description: Error message
   *                   example: "Invalid chat ID"
   *       '500':
   *         description: Internal server error
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 error:
   *                   type: string
   *                   description: Error message
   *                   example: "Internal server error"
   */

  app.delete('/api/v1/chats/:chatId', authMiddleware, async (req, res) => {
    const { chatId } = req.params;
    const token = res.locals.authToken || req.headers['authorization'];

    try {
      const { userId } = await sessionService.getSessionByToken(token);
      const isChatDeleteAllowed = await chatService.canUserDeleteChat(
        userId,
        chatId
      );

      if (isChatDeleteAllowed) {
        const deletedChat = await chatService.deleteChat(userId, chatId);

        return res.status(200).json(deletedChat);
      }

      return res.status(400).json('You cant delete this chat');
    } catch (e) {
      console.error(e);

      return res.status(400).json({ error: e.message });
    }
  });

  /**
   * @swagger
   * /api/v1/chats/{chatId}/restore:
   *   put:
   *     summary: Restore a deleted chat
   *     description: Restores a chat by its ID.
   *     parameters:
   *       - in: path
   *         name: chatId
   *         required: true
   *         description: The ID of the chat to restore.
   *         schema:
   *           type: string
   *     responses:
   *       '200':
   *         description: Chat successfully restored.
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 chatId:
   *                   type: string
   *                   description: The ID of the restored chat.
   *                   example: "123"
   *                 name:
   *                   type: string
   *                   description: The name of the restored chat.
   *                   example: "Project Discussion"
   *                 members:
   *                   type: array
   *                   items:
   *                     type: string
   *                   description: The members of the chat.
   *                   example: ["user1", "user2"]
   *       '404':
   *         description: Chat not found or unable to restore.
   *       '500':
   *         description: Internal server error.
   */

  app.put('/api/v1/chats/:chatId/restore', authMiddleware, async (req, res) => {
    const { chatId } = req.params;
    const token = res.locals.authToken || req.headers['authorization'];

    try {
      const { userId } = await sessionService.getSessionByToken(token);
      const restoredChat = await chatService.restoreChatById(userId, chatId);

      return res.status(200).json(restoredChat);
    } catch (error) {
      console.error(error);

      return res.status(404).json({ error: error.message });
    }
  });

  /**
   * @swagger
   * /chats/{id}:
   *   put:
   *     summary: Update an existing chat
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         description: Identifier of the chat to update
   *         schema:
   *           type: string
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               name:
   *                 type: string
   *                 description: The name of the chat
   *                 example: "Project Discussion Updated"
   *               description:
   *                 type: string
   *                 description: The description of the chat
   *                 example: "Updated description for the current project discussion."
   *               type:
   *                 type: string
   *                 enum: [private, group]
   *                 description: The type of chat
   *                 example: "private"
   *               members:
   *                 type: array
   *                 items:
   *                   type: string
   *                 description: List of user identifiers
   *                 example: ["user1", "user2", "user4"]
   *     responses:
   *       '200':
   *         description: Chat successfully updated
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 id:
   *                   type: string
   *                   description: Identifier of the updated chat
   *                   example: "chat1"
   *                 name:
   *                   type: string
   *                   description: The name of the chat
   *                   example: "Project Discussion Updated"
   *                 description:
   *                   type: string
   *                   description: The description of the chat
   *                   example: "Updated description for the current project discussion."
   *                 type:
   *                   type: string
   *                   enum: [private, group]
   *                   description: The type of chat
   *                   example: "private"
   *                 members:
   *                   type: array
   *                   items:
   *                     type: string
   *                   description: List of user identifiers
   *                   example: ["user1", "user2", "user4"]
   *       '400':
   *         description: Validation error
   *       '404':
   *         description: Chat not found
   *       '500':
   *         description: Internal server error
   */

  app.put('/api/v1/chats/:chatId', authMiddleware, async (req, res) => {
    const { chatId } = req.params;
    const token = res.locals.authToken || req.headers['authorization'];

    try {
      const { userId } = await sessionService.getSessionByToken(token);
      const updatedChat = await chatService.updateChat(
        userId,
        chatId,
        req.body
      );

      res.status(200).json({ updatedChat });
    } catch (e) {
      console.error(e);
      res.status(400).json({ error: e.message });
    }
  });

  /**
   * @swagger
   * /chats/{id}:
   *   get:
   *     summary: Retrieve a chat by its ID
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         description: Identifier of the chat to retrieve
   *         schema:
   *           type: string
   *     responses:
   *       '200':
   *         description: Chat successfully retrieved
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 id:
   *                   type: string
   *                   description: Identifier of the chat
   *                   example: "chat1"
   *                 name:
   *                   type: string
   *                   description: The name of the chat
   *                   example: "Project Discussion"
   *                 description:
   *                   type: string
   *                   description: The description of the chat
   *                   example: "This chat is for discussing the current project."
   *                 type:
   *                   type: string
   *                   enum: [private, group]
   *                   description: The type of chat
   *                   example: "group"
   *                 members:
   *                   type: array
   *                   items:
   *                     type: string
   *                   description: List of user identifiers
   *                   example: ["user1", "user2", "user3"]
   *                 creator:
   *                   type: string
   *                   description: Identifier of the chat creator
   *                   example: "user1"
   *       '400':
   *         description: Validation error
   *       '404':
   *         description: Chat not found
   *       '500':
   *         description: Internal server error
   */

  app.get('/api/v1/chats/:chatId', authMiddleware, async (req, res) => {
    const { chatId } = req.params;
    const token = res.locals.authToken || req.headers['authorization'];

    try {
      const { userId } = await sessionService.getSessionByToken(token);
      const chatByChatId = await chatService.getChatById(userId, chatId);

      return res.status(200).json(chatByChatId);
    } catch ({ message }) {
      console.error(message);
      return res.status(400).json({ error: message });
    }
  });
}
