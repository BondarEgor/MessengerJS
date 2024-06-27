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

export function authorizationController(req, res) {
  const authService = diContainer.resolve(SERVICES.authorization);
  const { username, password } = req.params;
  const isSuccess = authService.isAuthenticated(username, password);
  res.json(isSuccess);
}
