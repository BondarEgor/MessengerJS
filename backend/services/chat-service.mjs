import { SERVICES } from '../di/api.mjs';
import { diContainer } from '../di/di.mjs';

export function chatService() {
  const chatDao = diContainer.resolve(SERVICES.chatsDao);
  const eventEmitter = diContainer.resolve(SERVICES.events);

  async function createChat(chatData) {
    const chat = await chatDao.createChat(chatData);
    eventEmitter.emit('createChat', chat);

    return chat;
  }

  async function deleteChat(chatId) {
    const isDeleted = await chatDao.deleteChatById(chatId);
    eventEmitter.emit('deleteChat', isDeleted);

    return isDeleted;
  }

  async function updateChat(id, updateData) {
    const updatedChat = await chatDao.updateChat(id, updateData);
    eventEmitter('updateChat', updatedChat);

    return updatedChat;
  }

  async function getChatById(chatId) {
    return await chatDao.getChatById(chatId);
  }

  async function getAllChats() {
    return await chatDao.getAllChats();
  }

  return {
    createChat,
    deleteChat,
    updateChat,
    getChatById,
    getAllChats,
  };
}
