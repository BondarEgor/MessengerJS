import { SERVICES } from '../di/api.mjs';
import { diContainer } from '../di/di.mjs';

export function messageService() {
  const messagesDao = diContainer.resolve(SERVICES.messagesDao);
  const eventEmitter = diContainer.resolve(SERVICES.events);

  async function createMessage(messageData) {
    const message = await messageData.createMessage(messageData);
    eventEmitter.emit(message);

    return message;
  }

  async function getMessagesByChatId(chatId) {
    return await messagesDao.getMessagesByChatId(chatId);
  }

  async function getMessageById(chatId, messageId) {
    return await messagesDao.getMessageById(chatId, messageId);
  }

  async function updateMessageById(chatId, messageId, content) {
    const updatedMessage = messagesDao.updateMessageById(
      chatId,
      messageId,
      content
    );
    eventEmitter.emit(updatedMessage);

    return updatedMessage;
  }

  async function deleteMessageById(chatId, messageId) {
    const deletedMessage = await messagesDao.deleteMessageById(
      chatId,
      messageId
    );
    eventEmitter.emit(deletedMessage);

    return deletedMessage;
  }

  return {
    createMessage,
    getMessagesByChatId,
    getMessageById,
    updateMessageById,
    deleteMessageById,
  };
}
