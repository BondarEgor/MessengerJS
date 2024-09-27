import { SERVICES } from '../di/api.mjs';
import { diContainer } from '../di/di.mjs';
import EventEmitter from 'node:events';

export class MessageService {
  constructor() {
    this.messagesDao = diContainer.resolve(SERVICES.messagesDao);
    this.chatsDao = diContainer.resolve(SERVICES.chatsDao);
    this.eventEmitter = new EventEmitter();
    this.subscribers = {};
  }

  async createMessage(userId, chatId, messageData) {
    const isChatExist = this.chatsDao.doesChatExist(userId, chatId);

    if (!isChatExist) {
      throw new Error('Chat not found');
    }

    const newMessage = await this.messagesDao.createMessage(
      chatId,
      messageData
    );
    this.notifyAll(chatId, newMessage);

    return newMessage;
  }

  createMessageStream(chatId, sub) {
    if (!subscribers[chatId]) {
      subscribers[chatId] = new Set();
    }

    subscribers[chatId].add(sub);

    this.eventEmitter.on(chatId, (messages) => {
      subscribers[chatId].forEach((sub) => {
        sub.write(`data: ${JSON.stringify(messages)}`);
      });
    });
  }

  async getMessagesByChatId(chatId) {
    return await messagesDao.getMessagesByChatId(chatId);
  }

  async getMessageByMessageId(chatId, messageId) {
    return await messagesDao.getMessageByMessageId(chatId, messageId);
  }

  async updateMessageById(chatId, messageId, content) {
    const updatedMessage = await messagesDao.updateMessageById(
      chatId,
      messageId,
      content
    );
    this.notifyAll(chatId, updatedMessage);

    return updatedMessage;
  }

  notifyAll(chatId, data) {
    this.eventEmitter.emit(chatId, data);
  }

  async deleteMessageById(chatId, messageId) {
    const deletedMessage = await this.messagesDao.deleteMessageById(
      chatId,
      messageId
    );

    this.notifyAll(chatId, deletedMessage);

    return deletedMessage;
  }

  unsubscribe(chatId, res) {
    if (!subscribers[chatId]) {
      return;
    }

    subscribers[chatId] = subscribers[chatId].delete(res);

    if (subscribers[chatId].length === 0) {
      delete subscribers[chatId];
    }
  }
}
