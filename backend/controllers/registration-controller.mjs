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
  const userService = diContainer.resolve(SERVICES.users);
  app.post('/api/v1/registration', (req, res) => {
    const { username, password, email } = req.body;
    const isSuccess = userService.registerNewUser(username, password, email);

    res.json(isSuccess);
  });
}
