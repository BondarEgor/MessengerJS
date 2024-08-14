import { SERVICES } from '../di/api.mjs';
import { diContainer } from '../di/di.mjs';

export function chatService() {
  const chatDao = diContainer.resolve(SERVICES.chatsDao);

  async function createChat(chatData) {
    return await chatDao.createChat(chatData);
  }

  async function deleteChat(chatId) {
    return await chatDao.deleteChatById(chatId);
  }

  async function updateChat(id, updateData) {
    return await chatDao.updateChat(id, updateData);
  }

  async function getChatById(chatId){
    return await chatDao.getChatById(chatId)
  }

  async function getAllChats() {
    return await chatDao.getAllChats()
  }

  return {
    createChat,
    deleteChat,
    updateChat,
    getChatById,
    getAllChats
  };
}
