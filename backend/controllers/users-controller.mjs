import { SERVICES } from '../di/api.mjs';
import { diContainer } from '../di/di.mjs';
import { authMiddleware } from '../middlewares/authMiddleware.mjs';

export function createUsersController(app) {
  const userService = diContainer.resolve(SERVICES.users);

  /**
   * @swagger
   * /api/v1/users:
   *   get:
   *     summary: Получение пользователя по ID
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               userId:
   *                 type: string
   *                 description: Уникальный идентификатор пользователя
   *     responses:
   *       200:
   *         description: Пользователь найден
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 id:
   *                   type: string
   *                   description: Уникальный идентификатор пользователя
   *                 username:
   *                   type: string
   *                   description: Имя пользователя
   *                 email:
   *                   type: string
   *                   description: Email пользователя
   *                 avatar:
   *                   type: string
   *                   description: Аватар пользователя
   *       404:
   *         description: Пользователь не найден
   *       500:
   *         description: Внутренняя ошибка сервера
   */

  app.get('/api/v1/users', authMiddleware, async (_, res) => {
    try {
      const users = await userService.getAllUsers();
      res.status(200).json(users);
    } catch (e) {
      console.error(e);
      res.status(500).json({ message: e.message });
    }
  });

  /**
   * @swagger
   * /api/v1/users/{userId}:
   *   put:
   *     summary: Обновление информации о пользователе
   *     parameters:
   *       - in: path
   *         name: userId
   *         required: true
   *         schema:
   *           type: string
   *         description: Уникальный идентификатор пользователя
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               updateInfo:
   *                 type: object
   *                 description: Объект с обновляемой информацией о пользователе
   *                 properties:
   *                   username:
   *                     type: string
   *                     description: Новое имя пользователя
   *                   email:
   *                     type: string
   *                     description: Новый email пользователя
   *                   avatar:
   *                     type: string
   *                     description: Новый аватар пользователя
   *     responses:
   *       200:
   *         description: Информация о пользователе успешно обновлена
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 userId:
   *                   type: string
   *                   description: Уникальный идентификатор пользователя
   *                 username:
   *                   type: string
   *                   description: Новое имя пользователя
   *                 email:
   *                   type: string
   *                   description: Новый email пользователя
   *                 avatar:
   *                   type: string
   *                   description: Новый аватар пользователя
   *       400:
   *         description: Некорректные данные для обновления
   *       404:
   *         description: Пользователь не найден
   *       500:
   *         description: Внутренняя ошибка сервера
   */

  app.put('/api/v1/users/:userId', authMiddleware, async (req, res) => {
    const { userId } = req.params;

    if (!userId) {
      res.status(401).json({ message: 'UserId not provided' });
    }

    try {
      const userData = req.body;
      const updatedUserInfo = await userService.updateUser(userData, userId);

      res.status(200).json(updatedUserInfo);
    } catch (e) {
      console.error(e);
      console.error(`Faced error updating user: ${e}`);
      res.status(500).json({ message: e.message });
    }
  });

  /**
   * @swagger
   * /api/v1/users/{userId}:
   *   delete:
   *     summary: Удаление пользователя по ID
   *     parameters:
   *       - in: path
   *         name: userId
   *         required: true
   *         schema:
   *           type: string
   *         description: Уникальный идентификатор пользователя
   *     responses:
   *       200:
   *         description: Пользователь успешно удален
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 userId:
   *                   type: string
   *                   description: Уникальный идентификатор удаленного пользователя
   *       404:
   *         description: Пользователь не найден или не может быть удален
   *       500:
   *         description: Внутренняя ошибка сервера
   */

  app.delete('/api/v1/users/:userId', authMiddleware, async (req, res) => {
    const { userId } = req.params;

    if (!userId) {
      res.status(401).json({ message: 'Token or id not provided' });
    }

    try {
      const deleteUserId = await userService.deleteUserById(userId);

      res.json(deleteUserId);
    } catch (e) {
      console.error(e);
      res.status(404).json(`User can't be deleted`);
    }
  });
}
