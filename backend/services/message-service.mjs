import { SERVICES } from '../di/api.mjs';
import { diContainer } from '../di/di.mjs';
import EventEmitter from 'node:events';

export function messageService() {
  const messagesDao = diContainer.resolve(SERVICES.messagesDao);
  const messages = new EventEmitter();

  function generateMockMessages(chatId) {
    const messages = messagesDao.getMessages(chatId);
    return messages;
  }

  async function createMessage(messageData) {
    const message = await messagesDao.createMessage(messageData);

    return message;
  }

  async function createMessagesStream() {
    const messages = messageService.getMessagesByChatId()
    messages.emit('messages', )
  }

  async function getMessagesByChatId(chatId) {
    return await messagesDao.getMessagesByChatId(chatId);
  }

  async function getMessageById(chatId, messageId) {
    return await messagesDao.getMessageById(chatId, messageId);
  }

  async function updateMessageById(chatId, messageId, content) {
    const updatedMessage =  await messagesDao.updateMessageById(chatId, messageId, content);
    messages.emit('chats', updatedMessage)

    return updatedMessage
  }

  async function deleteMessageById(chatId, messageId) {
    const deletedMessage = await messagesDao.deleteMessageById(chatId, messageId);
    messages.emit(deletedMessage)
    
    return deletedMessage
  }

  function subscribe(callback){
    messages.on('chats', callback)
  }

  function unsubscribe(callback){
    messages.off('chats',callback)
  }

  return {
    getMessages: generateMockMessages,
    createMessage,
    getMessagesByChatId,
    getMessageById,
    updateMessageById,
    deleteMessageById,
    subscribe,
    unsubscribe
  };
}
