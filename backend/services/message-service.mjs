import { SERVICES } from '../di/api.mjs';
import { diContainer } from '../di/di.mjs';

export function messageService() {
  const messagesDao = diContainer.resolve(SERVICES.messagesDao);

  function generateMockMessages(chatId) {
    const messages = messagesDao.getMessages(chatId);
    return messages;
  }

  async function createMessage(messageData) {
    return await messagesDao.createMessage(messageData);
  }

  async function getMessagesByChatId(chatId) {
    return await messagesDao.getMessagesByChatId(chatId);
  }

  async function getMessageById(chatId, messageId) {
    return await messagesDao.getMessageById(chatId, messageId);
  }

  async function updateMessageById(chatId, messageId, content) {
    return await messagesDao.updateMessageById(chatId, messageId, content);
  }  
  
  async function deleteMessageById(chatId, messageId, ) {
    return await messagesDao.deleteMessageById(chatId, messageId);
  }

  return {
    getMessages: generateMockMessages,
    createMessage,
    getMessagesByChatId,
    getMessageById,
    updateMessageById,
    deleteMessageById
  };
}
