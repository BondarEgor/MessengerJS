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

export function registrationController(req, res) {
  const registrationService = diContainer.resolve(SERVICES.registration);
  const { username, password, email } = req.params;
  const isSuccess = registrationService.getRegisteredUser(
    username,
    password,
    email
  );
  res.json(isSuccess);
}
