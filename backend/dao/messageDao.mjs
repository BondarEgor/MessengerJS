import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { PATHS } from '../constants.js';
import { v4 as uuid } from 'uuid';
import { messagesMapper } from '../dto/messagesDto.mjs';
import { messageStatusMapping } from '../dto/constants.mjs';

const _filename = fileURLToPath(import.meta.url);
const _dirname = path.dirname(_filename);

export class MessagesDao {
  #filePath = path.join(_dirname, '../data', PATHS.messages);

  async getMessagesByChatId(chatId) {
    const messages = await this.#readMessages();

    if (!(chatId in messages)) {
      throw new Error('Chat with this id does not exist');
    }

    return Object.values(messages[chatId]).map(messagesMapper);
  }

  async getMessageByMessageId(chatId, messageId) {
    const messages = await this.#readMessages();
    const isMessageExist = await this.#doesMessageExist(chatId, messageId);

    if (isMessageExist) {
      throw new Error('Message with this id does not exist');
    }

    return messagesMapper(messages[chatId][messageId]);
  }

  async updateMessageById(chatId, messageId, content) {
    const messages = await this.#readMessages();
    const isMessageExist = await this.#doesMessageExist(chatId, messageId);

    if (isMessageExist) {
      throw new Error('Message with this id does not exist');
    }

    messages[chatId][messageId] = {
      ...messages[chatId][messageId],
      content,
    };

    await this.#writeMessages(messages);

    return userMapper(messages[chatId][messageId], 'update');
  }

  async deleteMessageById(chatId, messageId) {
    const messages = await this.#readMessages();
    const isMessageExist = await this.#doesMessageExist(chatId, messageId);

    if (isMessageExist) {
      throw new Error('Message with this id does not exist');
    }

    return messagesMapper(
      messages[chatId][messageId],
      messageStatusMapping.delete
    );
  }

  async createMessage(chatId, messageData) {
    const messages = await this.#readMessages();

    const messageId = uuid();
    messages[chatId] = {
      [messageId]: {
        ...messageData,
        timeStamp: new Date(),
        id: messageId,
      },
    };

    await this.#writeMessages(messages);

    return messagesMapper(messages[chatId][messageId]);
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

  async #doesMessageExist(chatId, messageId) {
    const messages = await this.#readMessages();
    const isMessageExist =
      chatId in messages || !(messageId in messages[chatId]);

    return isMessageExist;
  }
}
