import { SERVICES } from '../di/api.mjs';
import { diContainer } from '../di/di.mjs';
import { authMiddleware } from '../middlewares/authMiddleware.mjs';

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
 *                   description: Identifier of the chat creator
 *                   example: "user1"
 *       '400':
 *         description: Validation error
 *       '500':
 *         description: Internal server error
 */

export function createChatController(app) {
  const chatService = diContainer.resolve(SERVICES.chats);

  app.post('/api/v1/chats', authMiddleware, async (req, res) => {
    try {
      const newChat = await chatService.createChat(req.body);

      if (!newChat) {
        res.status(400).json({ error: 'Error while creating chat' });
      }

      res
        .status(201)
        .json({ message: 'Chat successfully created', chat: newChat });
    } catch (e) {
      res.status(400).json({ error: e.message });
    }
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

  app.delete('/api/v1/chats/:id', authMiddleware, async (req, res) => {
    try {
      const { id } = req.params;
      const deletedChat = await chatService.deleteChat(id);

      res.status(200).json(deletedChat);
    } catch (e) {
      res.status(400).json({ error: e.message });
    }
  });
}
