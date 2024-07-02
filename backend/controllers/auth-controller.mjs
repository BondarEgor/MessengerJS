/**
 * @swagger
 * /login:
 *   post:
 *     summary: Авторизация пользователя
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *                 description: Имя пользователя
 *               password:
 *                 type: string
 *                 description: Пароль пользователя
 *     responses:
 *       200:
 *         description: Успешная авторизация
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   description: JWT токен доступа
 *       401:
 *         description: Неправильные учётные данные
 *       500:
 *         description: Внутренняя ошибка сервера
 */

import { SERVICES } from '../di/api.mjs';
import { diContainer } from '../di/di.mjs';

export function createAuthController(app) {
  const authService = diContainer.resolve(SERVICES.authorization);
  const sessionService = diContainer.resolve(SERVICES.sessions);

  app.post('/api/v1/login', async (req, res) => {
    const { username, password } = req.body;

    const sessionInfo = await sessionService.generateSessionInfo(
      username,
      password
    );

    res.status(201).json(sessionInfo);
  });
}
