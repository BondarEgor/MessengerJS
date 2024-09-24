import { SERVICES } from '../di/api.mjs';
import { diContainer } from '../di/di.mjs';
import { usernamePasswordValidate } from '../services/validate-service.mjs';

export function createAuthController(app) {
  const authService = diContainer.resolve(SERVICES.authorization);
  const sessionService = diContainer.resolve(SERVICES.sessions);

  /**
   * @swagger
   * /api/v1/login:
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
   *                 userId:
   *                   type: string
   *                   description: JWT токен доступа
   *                 authToken:
   *                   type: string
   *       401:
   *         description: Неправильные учётные данные
   *       500:
   *         description: Внутренняя ошибка сервера
   */

  app.post('/api/v1/login', usernamePasswordValidate(), async (req, res) => {
    const { username, password } = req.body;

    try {
      const user = await authService.authorizeUser(username, password);

      const userSessionInfo = await sessionService.generateSessionInfo(user);

      return res.status(200).json(userSessionInfo);
    } catch (error) {
      console.error(error);

      return res.status(401).json({ error: error.message });
    }
  });
}
