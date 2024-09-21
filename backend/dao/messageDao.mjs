import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { PATHS } from '../constants.js';
import { v4 as uuid } from 'uuid';
import { MessagesDto } from '../dto/messagesDto.mjs';

const _filename = fileURLToPath(import.meta.url);
const _dirname = path.dirname(_filename);

export class MessagesDao {
  #filePath = path.join(_dirname, '../data', PATHS.messages);

  async getMessagesByChatId(chatId) {
    const messages = await this.#readMessages();

    if (!messages[chatId]) {
      throw new Error('Chat with this id does not exist');
    }

    return messages[chatId];
  }

  async getMessageById(chatId, messageId) {
    const messages = await this.#readMessages();

    if (!messages[chatId][messageId]) {
      throw new Error('Message with this id does not exist');
    }

    return new MessagesDto(messages[chatId][messageId]);
  }
  async #doesMessageExist(chatId, messageId) {
    const messages = await this.#readMessages();

    if (!(chatId in messages)) {
      throw new Error('Chat not found');
    }

    if (!(messageId in messages[chatId])) {
      throw new Error('Message not found');
    }

    return true;
  }
  async updateMessageById(chatId, messageId, content) {
    const messages = await this.#readMessages();

    try {
      await this.#doesMessageExist(chatId, messageId);
      messages[chatId][messageId] = {
        ...messages[chatId][messageId],
        content,
      };

      await this.#writeMessages(messages);

      return new MessagesDto(messages[chatId][messageId], 'update');
    } catch (error) {
      throw error;
    }
  }

  async deleteMessageById(chatId, messageId) {
    const messages = await this.#readMessages();

    try {
      await this.#doesMessageExist(chatId, messageId);
      const currentMessage = messages[chatId][messageId];

      return new MessagesDto(currentMessage, 'delete');
    } catch (error) {
      throw error;
    }
  }

  async createMessage(chatId, messageData) {
    const messages = await this.#readMessages();

    if (!messages[chatId]) {
      messages[chatId] = {};
    }

    const timeStamp = new Date().getTime();
    const messageId = uuid();
    messages[chatId][messageId] = {
      ...messageData,
      timeStamp,
      id: messageId,
    };

    await this.#writeMessages(messages);

    return new MessagesDto(messages[chatId][messageId]);
  }

  async #readMessages() {
    try {
      const messages = await fs.readFile(this.#filePath, 'utf-8');

      return JSON.parse(messages);
    } catch (error) {
      const directoryPath = path.dirname(this.#filePath);

      await fs.mkdir(directoryPath, { recursive: true });
      await fs.writeFile(this.#filePath, JSON.stringify({}));

      throw error;
    }
  }

  async #writeMessages(messages) {
    try {
      await fs.writeFile(this.#filePath, JSON.stringify(messages, null, 2));

      return true;
    } catch (e) {
      console.error(e);
      return false;
    }
  }
}
