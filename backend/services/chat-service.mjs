import { SERVICES } from '../di/api.mjs';
import { diContainer } from '../di/di.mjs';
import EventEmitter from 'node:events';

export class ChatService {
  constructor(){
    this.chatDao = diContainer.resolve(SERVICES.chatsDao);
    this.eventEmitter = new EventEmitter();
    this.subscribers = {}
  }

  async createChat(chatData, userId) {
    const newChat = await this.chatDao.createChat(chatData);
    this.notifyAll(userId);

    return newChat;
  }

  createChatStream(userId, res) {
    if (!this.subscribers[userId]) {
      this.subscribers[userId] = []
    }

    this.subscribers[userId].push(res)

    this.eventEmitter.on(`chats-${userId}`, (chats) => {
      subscribers[userId].forEach(sub => {
        sub.write(chats)
      });
    })
  }

  async deleteChat(userId, chatId) {
    const deletedChat = await this.chatDao.deleteChatById(chatId);
    this.notifyAll(userId);

    return deletedChat;
  }

  async updateChat(userId, chatId, updateData) {
    const updatedChat = await this.chatDao.updateChat(userId, chatId, updateData);
    this.notifyAll(userId);

    return updatedChat;
  }

  async getChatById(chatId) {
    return await this.chatDao.getChatById(chatId);
  }

  async getAllChats() {
    return await this.chatDao.getAllChats();
  }

  async notifyAll(userId) {
    this.eventEmitter.emit(`chats-${userId}`, await getAllChats());
  }

   unsubscribe(userId, res) {
    if (!this.subscribers[userId]) {
      return
    }
   this.subscribers[userId] = this.subscribers[userId].filter(sub => sub !== res)

    if (this.subscribers[userId].length === 0) {
      this.eventEmitter.removeAllListeners(`chats-${userId}`)

      delete this.subscribers[userId]
    }
  }
}
