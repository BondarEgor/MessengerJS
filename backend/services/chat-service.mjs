import { SERVICES } from '../di/api.mjs';
import { diContainer } from '../di/di.mjs';
import EventEmitter from 'node:events';

export class ChatService {
  constructor() {
    this.chatDao = diContainer.resolve(SERVICES.chatsDao);
    this.eventEmitter = new EventEmitter();
    this.subscribers = {};
  }

  async createChat(chatData, userId) {
    const newChat = await this.chatDao.createChat(chatData);
    this.notifyAll(userId, newChat);

    return newChat;
  }

  createChatStream(userId, res) {
    if (!this.subscribers[userId]) {
      this.subscribers[userId] = new Set();
    }

    this.subscribers[userId].add(res);

    this.eventEmitter.on(`${userId}`, (chats) => {
      subscribers[userId].forEach((sub) => {
        sub.write(chats);
      });
    });
  }

  async deleteChat(userId, chatId) {
    const deletedChat = await this.chatDao.deleteChatById(userId, chatId);
    this.notifyAll(userId, deletedChat);

    return deletedChat;
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
    return await this.chatDao.getChatById(userId, chatId);
  }

  async getAllChats() {
    return await this.chatDao.getAllChats();
  }

  async notifyAll(userId, data) {
    this.eventEmitter.emit(`${userId}`, data);
  }

  unsubscribe(userId, res) {
    if (!this.subscribers[userId]) {
      return;
    }
    this.subscribers[userId] = this.subscribers[userId].delete(res)

    if (this.subscribers[userId].length === 0) {
      this.eventEmitter.removeAllListeners(`${userId}`);

      delete this.subscribers[userId];
    }
  }
}
