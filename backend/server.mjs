import cors from 'cors';
import express from 'express';
import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { chatController } from './controllers/chat-controller.mjs';
import { registrationController } from './controllers/registration-controller.mjs';
import { UserDao } from './dao/userDao.mjs';
import { SERVICES } from './di/api.mjs';
import { diContainer } from './di/di.mjs';
import { messageService } from './services/message-service.mjs';
import { userService } from './services/registration-service.mjs';
import { authService } from './services/auth-service.mjs';
import { authorizationController } from './controllers/auth-controller.mjs';
const app = express();

// Использование CORS middleware для разрешения кросс-доменных запросов
app.use(cors());

// Загрузка документации Swagger
const swaggerOptions = {
  swaggerDefinition: {
    openapi: '3.0.0',
    info: {
      title: 'Random Message API',
      version: '1.0.0',
      description: 'API для возврата массива случайных сообщений по chatId',
    },
  },
  apis: ['./controllers/*'], // Путь к файлам, содержащим документацию JSDoc
};

const swaggerSpec = swaggerJSDoc(swaggerOptions);
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

diContainer.register(SERVICES.userDao, new UserDao());
diContainer.register(SERVICES.messages, messageService);
diContainer.register(SERVICES.users, userService);
diContainer.register(SERVICES.authorization, authService);

// Метод GET возвращает массив случайных сообщений для chatId
app.get('/api/v1/messages/:chatId', chatController);
app.get('/api/v1/registration', registrationController);
app.get('/api/v1/authorize', authorizationController);

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
