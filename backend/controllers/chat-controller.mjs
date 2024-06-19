import {diContainer} from '../di/di.mjs';
import {SERVICES} from '../di/api.mjs';

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
export function  chatController(req, res) {
    const messageService = diContainer.resolve(SERVICES.messages);
    const {chatId} = req.params;
    const messages = messageService.getMessages(chatId);
    res.json(messages);
}