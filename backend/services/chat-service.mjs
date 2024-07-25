import { SERVICES } from '../di/api.mjs';
import { diContainer } from '../di/di.mjs';

export function chatService() {
  const chatDao = diContainer.resolve(SERVICES.chatsDao);

  async function createChat(chatData) {
    return await chatDao.createChat(chatData);
  }

  async function deleteChat(chatId) {
    return chatDao.deleteChatById(chatId);
  }

  return {
    createChat,
    deleteChat,
  };
}
