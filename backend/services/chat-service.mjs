import { SERVICES } from '../di/api.mjs';
import { diContainer } from '../di/di.mjs';

export function chatService() {
  const chatDao = diContainer.resolve(SERVICES.chatsDao);
  const eventEmitter = diContainer.resolve(SERVICES.events)

  async function createChat(chatData) {
    const chat = await chatDao.createChat(chatData)
    eventEmitter.emit(chat)

    return chat
  }

  async function deleteChat(chatId) {
    const deletedChat = await chatDao.deleteChatById(chatId);
    eventEmitter.emit(deletedChat)

    return deletedChat
  }

  async function updateChat(id, updateData) {
    const updatedChat = await chatDao.updateChat(id, updateData); 
    eventEmitter(updatedChat)

    return updatedChat
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
