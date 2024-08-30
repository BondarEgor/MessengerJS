import { SERVICES } from '../di/api.mjs';
import { diContainer } from '../di/di.mjs';
import EventEmitter from 'node:events';

export function chatService() {
  const chatDao = diContainer.resolve(SERVICES.chatsDao);
  const chatEvents = new EventEmitter();

  async function createChat(chatData) {
    const newChat = await chatDao.createChat(chatData);
    chatEvents.emit('newChat', newChat);

    return newChat;
  }

  async function deleteChat(chatId) {
    const deletedChat = await chatDao.deleteChatById(chatId);
    chatEvents.emit('deleteChat', deletedChat);

    return deletedChat;
  }

  async function updateChat(id, updateData) {
    const updatedChat = await chatDao.updateChat(id, updateData);
    chatEvents.emit('updateChat', updatedChat);

    return updatedChat;
  }

  async function getChatById(chatId) {
    return await chatDao.getChatById(chatId);
  }

  async function getAllChats() {
    return await chatDao.getAllChats();
  }

  function subscribeToChatEvents(listener) {
    chatEvents.on('newChat', listener);
    chatEvents.on('deleteChat', listener);
    chatEvents.on('updateChat', listener);
  }

  function unsubscribeFromChatEvents() {
    chatEvents.removeAllListeners()
  }

  return {
    createChat,
    deleteChat,
    updateChat,
    getChatById,
    getAllChats,
    subscribeToChatEvents,
    unsubscribeFromChatEvents,
  };
}
