import { SERVICES } from '../di/api.mjs';
import { diContainer } from '../di/di.mjs';
import { usersService } from '../services/users-service.mjs';

/**
 * openapi: 3.0.0
info:
  title: User API
  version: 1.0.0

paths:
  /api/v1/users:
    get:
      summary: Получение пользователя по ID
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                userId:
                  type: string
                  description: Уникальный идентификатор пользователя
      responses:
        200:
          description: Пользователь найден
          content:
            application/json:
              schema:
                type: object
                properties:
                  id:
                    type: string
                    description: Уникальный идентификатор пользователя
                  username:
                    type: string
                    description: Имя пользователя
                  email:
                    type: string
                    description: Email пользователя
                  avatar:
                    type: string
                    description: Аватар пользователя
        404:
          description: Пользователь не найден
        500:
          description: Внутренняя ошибка сервера

    delete:
      summary: Удаление пользователя по ID
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                userId:
                  type: string
                  description: Уникальный идентификатор пользователя
      responses:
        200:
          description: Пользователь успешно удален
          content:
            application/json:
              schema:
                type: object
                properties:
                  userId:
                    type: string
                    description: Уникальный идентификатор удаленного пользователя
        404:
          description: Пользователь не найден или не может быть удален
        500:
          description: Внутренняя ошибка сервера

    put:
      summary: Обновление информации о пользователе
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                userId:
                  type: string
                  description: Уникальный идентификатор пользователя
                updateInfo:
                  type: object
                  description: Объект с обновляемой информацией о пользователе
                  properties:
                    username:
                      type: string
                      description: Новое имя пользователя
                    email:
                      type: string
                      description: Новый email пользователя
                    avatar:
                      type: string
                      description: Новый аватар пользователя
      responses:
        200:
          description: Информация о пользователе успешно обновлена
          content:
            application/json:
              schema:
                type: object
                properties:
                  userId:
                    type: string
                    description: Уникальный идентификатор пользователя
                  username:
                    type: string
                    description: Новое имя пользователя
                  email:
                    type: string
                    description: Новый email пользователя
                  avatar:
                    type: string
                    description: Новый аватар пользователя
        400:
          description: Некорректные данные для обновления
        404:
          description: Пользователь не найден
        500:
          description: Внутренняя ошибка сервера

 */

export function createUsersController(app) {
  const userService = diContainer.resolve(SERVICES.users);
  const sessionService = diContainer.resolve(SERVICES.sessions);

  app.get('/api/v1/users', async (_, res) => {
    try {
      const users = await userService.getAllUsers();
      res.status(200).json(users);
    } catch (e) {
      res.status(500).json({ message: e.message });
    }
  });

  app.put('/api/v1/users/:userId', async (req, res) => {
    const token = req.headers['authorization'];
    const { userId } = req.params;

    if (!token || !userId) {
      res.status(401).json({ message: 'Token or userId not provided' });
    }

    try {
      const userData = req.body;
      const isUserValid = await sessionService.isTokenValid(userId, token);

      if (!isUserValid) {
        res.status(401).json({ message: 'Token is not valid' });
      }

      const updatedUserInfo = await userService.updateUser(userData, userId);

      res.status(200).json(updatedUserInfo);
    } catch (e) {
      console.error(`Faced error updating user: ${e}`);
      res.status(500).json({ message: e.message });
    }
  });

  app.delete('/api/v1/users/:userId', async (req, res) => {
    const token = req.headers['authorization'];
    const { userId } = req.params;
    if (!token || !userId) {
      res.status(401).json({ message: 'Token or id not provided' });
    }

    try {
      const isUserValid = await sessionService.isTokenValid(userId, token);

      if(!isUserValid){
        res.status(400).json({message: 'Token not valid'})
      }
      
      const deleteUserId = await userService.deleteUserById(userId);

      res.json(deleteUserId);
    } catch (e) {
      res.status(404).json(`User can't be deleted`);
    }
  });
}
