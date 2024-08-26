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
import { messageService } from './services/message-service.mjs';
import { registrationService } from './services/registration-service.mjs';
import { sessionService } from './services/session-service.mjs';
import { usersService } from './services/users-service.mjs';
import { createChatController } from './controllers/chat-controller.mjs';
import { chatService } from './services/chat-service.mjs';
import { ChatDao } from './dao/chatDao.mjs';
import { MessagesDao } from './dao/messageDao.mjs';
import { Server as SocketIOServer } from 'socket.io';
import http from 'http';
import { createWebSocketController } from './controllers/websocket-controller.mjs';
import EventEmitter from 'node:events';

const app = express();
const server = http.createServer(app);
const io = new SocketIOServer(server, {
  serverClient: false,
});

// Использование CORS middleware для разрешения кросс-доменных запросов
app.use(cors());
app.use(bodyParser.json());

//Настройка сокета
createWebSocketController(io)

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

diContainer.register(SERVICES.events, new EventEmitter())
diContainer.register(SERVICES.userDao, new UserDao());
diContainer.register(SERVICES.messages, messageService);
diContainer.register(SERVICES.messagesDao, new MessagesDao());
diContainer.register(SERVICES.registration, registrationService);
diContainer.register(SERVICES.authorization, authService);
diContainer.register(SERVICES.sessionsDao, new SessionDao());
diContainer.register(SERVICES.sessions, sessionService);
diContainer.register(SERVICES.users, usersService);
diContainer.register(SERVICES.chats, chatService);
diContainer.register(SERVICES.chatsDao, new ChatDao());

createRegistrationController(app);
createAuthController(app);

createMessageController(app);
createUsersController(app);
createChatController(app);

const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
