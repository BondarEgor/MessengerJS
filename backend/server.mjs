import bodyParser from 'body-parser';
import cors from 'cors';
import express from 'express';
import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { createAuthController } from './controllers/auth-controller.mjs';
import { createMessageController } from './controllers/message-controller.mjs';
import { createRegistrationController } from './controllers/registration-controller.mjs';
import { createUsersController } from './controllers/users-controller.mjs';
import { SessionDao } from './dao/sessionDao.mjs';
import { UserDao } from './dao/userDao.mjs';
import { SERVICES } from './di/api.mjs';
import { diContainer } from './di/di.mjs';
import { authService } from './services/auth-service.mjs';
import { MessageService } from './services/message-service.mjs';
import { registrationService } from './services/registration-service.mjs';
import { sessionService } from './services/session-service.mjs';
import { UsersService } from './services/users-service.mjs';
import { createChatController } from './controllers/chat-controller.mjs';
import { ChatService } from './services/chat-service.mjs';
import { ChatDao } from './dao/chatDao.mjs';
import { MessagesDao } from './dao/messageDao.mjs';

const app = express();
// Использование CORS middleware для разрешения кросс-доменных запросов
app.use(cors());
app.use(bodyParser.json());
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
diContainer.register(SERVICES.messagesDao, new MessagesDao());
diContainer.register(SERVICES.registration, registrationService);
diContainer.register(SERVICES.authorization, authService);
diContainer.register(SERVICES.sessionsDao, new SessionDao());
diContainer.register(SERVICES.sessions, sessionService);
diContainer.register(SERVICES.chatsDao, new ChatDao());
diContainer.register(SERVICES.chats, new ChatService());
diContainer.register(SERVICES.messages, new MessageService());
diContainer.register(SERVICES.users, new UsersService());

createRegistrationController(app);
createAuthController(app);

createUsersController(app);
createChatController(app);
createMessageController(app);

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
