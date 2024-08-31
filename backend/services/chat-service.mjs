import { SERVICES } from '../di/api.mjs';
import { diContainer } from '../di/di.mjs';
import EventEmitter from 'node:events';

export function chatService() {
  const chatDao = diContainer.resolve(SERVICES.chatsDao);
  const eventEmitter = new EventEmitter();

  async function createChat(chatData) {
    const newChat = await chatDao.createChat(chatData);
    notifyAll();

    return newChat;
  }

  async function deleteChat(chatId) {
    const deletedChat = await chatDao.deleteChatById(chatId);
    notifyAll();

    return deletedChat;
  }

  async function updateChat(id, updateData) {
    const updatedChat = await chatDao.updateChat(id, updateData);
    notifyAll();

    return updatedChat;
  }

  async function getChatById(chatId) {
    return await chatDao.getChatById(chatId);
  }

  async function getAllChats() {
    return await chatDao.getAllChats();
  }

  async function notifyAll() {
    eventEmitter.emit('chats', await getAllChats());
  }

  return {
    createChat,
    deleteChat,
    updateChat,
    getChatById,
    subscribe: (handler) => {
      eventEmitter.on('chats', handler);
    },
  };
}
