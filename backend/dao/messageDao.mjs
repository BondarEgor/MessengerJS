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

    return messages[chatId][messageId];
  }

  async updateMessageById(chatId, messageId, content) {
    const messages = await this.#readMessages();

    if (!messages[chatId][messageId]) {
      throw new Error('Message with this id does not exist');
    }

    messages[chatId][messageId] = {
      ...messages[chatId][messageId],
      content,
    };

    await this.#writeMessages(messages);

    return messages[chatId][messageId];
  }

  async deleteMessageById(chatId, messageId) {
    const messages = await this.#readMessages();

    if (!(chatId in messages)) {
      throw new Error('Chat not found');
    }

    if (!(messageId in messages[chatId])) {
      throw new Error('Message not found');
    }

    const currentMessage = messages[chatId][messageId]

    return new MessagesDto(currentMessage, true)
  }

  async createMessage(chatId, messageData) {
    const messages = await this.#readMessages();

    if (!messages[chatId]) {
      messages[chatId] = {};
    }

    const timeStamp = new Date();
    const messageId = uuid();
    messages[chatId][messageId] = {
      ...messageData,
      timeStamp,
      id: messageId,
    };

    await this.#writeMessages(messages);

    return messages[chatId][messageId];
  }
}
