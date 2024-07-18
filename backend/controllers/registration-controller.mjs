import { SERVICES } from '../di/api.mjs';
import { diContainer } from '../di/di.mjs';

/**
 * @swagger
 * /register:
 *   post:
 *     summary: Регистрация нового пользователя
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
 *               email:
 *                 type: string
 *                 description: Email пользователя
 *     responses:
 *       201:
 *         description: Пользователь успешно зарегистрирован
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
 *       400:
 *         description: Некорректные данные
 *       500:
 *         description: Внутренняя ошибка сервера
 */

export function createRegistrationController(app) {
  const registrationService = diContainer.resolve(SERVICES.registration);

  app.post('/api/v1/registration', async (req, res) => {
    try {
      const isSuccess = await registrationService.registerNewUser(req.body);

      if (isSuccess) {
        res.status(200).json({ message: 'User registererd successfully' });
      } else {
        res.status(400).json({ message: 'User registration failed' });
      }
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });
}
