import { SERVICES } from '../di/api.mjs';
import { diContainer } from '../di/di.mjs';
import EventEmitter from 'node:events';

export class ChatService {
  constructor() {
    this.chatDao = diContainer.resolve(SERVICES.chatsDao);
    this.eventEmitter = new EventEmitter();
    this.subscribers = {};
  }

  async createChat(userId, chatData) {
    const newChat = await this.chatDao.createChat(userId, chatData);
    this.notifyAll(userId, newChat);

    return newChat;
  }

  createChatStream(userId, res) {
    if (!this.subscribers[userId]) {
      this.subscribers[userId] = new Set();
    }

    this.subscribers[userId].add(res);

    this.eventEmitter.on(userId, (chats) => {
      this.subscribers[userId].forEach((sub) => {
        sub.write(`data: ${JSON.stringify(chats)}\n\n`);
      });
    });
  }

  async canUserDeleteChat(userId, chatId) {
    return await this.chatDao.canUserDeleteChat(userId, chatId);
  }

  async deleteChat(userId, chatId) {
    const deletedChat = await this.chatDao.deleteChatById(userId, chatId);
    this.notifyAll(userId, deletedChat);

    return deletedChat;
  }

  async restoreChatById(userId, chatId) {
    const restoredChat = await this.chatDao.restoreChatById(userId, chatId);
    this.notifyAll(userId, restoredChat);

    return restoredChat;
  }

  async updateChat(userId, chatId, updateData) {
    const updatedChat = await this.chatDao.updateChat(
      userId,
      chatId,
      updateData
    );
    this.notifyAll(userId, updatedChat);

    return updatedChat;
  }

  async getChatById(userId, chatId) {
    return await this.chatDao.getChatByChatId(userId, chatId);
  }

  async getAllChats() {
    return await this.chatDao.getAllChats();
  }

  async notifyAll(userId, data) {
    this.eventEmitter.emit(userId, data);
  }

  unsubscribe(userId, res) {
    const isSubscribersEmpty = this.subscribers[userId].length === 0;

    if (!this.subscribers[userId]) {
      return;
    }

    this.subscribers[userId].delete(res);

    if (isSubscribersEmpty) {
      this.eventEmitter.removeAllListeners(userId);

      delete this.subscribers[userId];
    }

    res.end();
  }
}
