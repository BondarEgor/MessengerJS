import { SERVICES } from '../di/api.mjs';
import { diContainer } from '../di/di.mjs';
import EventEmitter from 'node:events';

export function messageService() {
  const messagesDao = diContainer.resolve(SERVICES.messagesDao);
  const eventEmitter = new EventEmitter();

  async function createMessage(messageData) {
    notifyAll(messageData.chatId);

    return await messagesDao.createMessage(messageData);
  }

  async function getMessagesByChatId(chatId) {
    return await messagesDao.getMessagesByChatId(chatId);
  }

  async function getMessageById(chatId, messageId) {
    return await messagesDao.getMessageById(chatId, messageId);
  }

  async function updateMessageById(chatId, messageId, content) {
    notifyAll(chatId);

    return await messagesDao.updateMessageById(chatId, messageId, content);
  }

  async function notifyAll(chatId) {
    eventEmitter.emit('messages', await getMessagesByChatId(chatId));
  }

  async function deleteMessageById(chatId, messageId) {
    notifyAll(chatId);

    return await messagesDao.deleteMessageById(chatId, messageId);
  }

  return {
    createMessage,
    getMessagesByChatId,
    getMessageById,
    updateMessageById,
    deleteMessageById,
    subscribe: (handler) => {
      eventEmitter.on('messages', handler);
    },
  };
}
